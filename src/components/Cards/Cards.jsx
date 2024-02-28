import { shuffle } from "lodash";
import { useContext, useEffect, useState } from "react";
import { generateDeck } from "../../utils/cards";
import styles from "./Cards.module.css";
import { EndGameModal } from "../../components/EndGameModal/EndGameModal";
import { Button } from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";
import { GameContext } from "../../Context/Context";
import { Link } from "react-router-dom";

// Игра закончилась
const STATUS_LOST = "STATUS_LOST";
const STATUS_WON = "STATUS_WON";
// Идет игра: карты закрыты, игрок может их открыть
const STATUS_IN_PROGRESS = "STATUS_IN_PROGRESS";
// Начало игры: игрок видит все карты в течении нескольких секунд
const STATUS_PREVIEW = "STATUS_PREVIEW";

function getTimerValue(startDate, endDate) {
  if (!startDate && !endDate) {
    return {
      minutes: 0,
      seconds: 0,
    };
  }

  if (endDate === null) {
    endDate = new Date();
  }

  const diffInSecconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
  const minutes = Math.floor(diffInSecconds / 60);
  const seconds = diffInSecconds % 60;
  return {
    minutes,
    seconds,
  };
}

/**
 * Основной компонент игры, внутри него находится вся игровая механика и логика.
 * pairsCount - сколько пар будет в игре
 * previewSeconds - сколько секунд пользователь будет видеть все карты открытыми до начала игры
 */
export function Cards({ pairsCount = 3, previewSeconds = 5 }) {
  const { easyMode } = useContext(GameContext);
  const [lives, setLives] = useState(easyMode ? 3 : 1);
  // В cards лежит игровое поле - массив карт и их состояние открыта\закрыта
  const [cards, setCards] = useState([]);
  // Текущий статус игры
  const [status, setStatus] = useState(STATUS_PREVIEW);
  const [correctPairsCount, setCorrectPairsCount] = useState(0);
  // Дата начала игры
  const [gameStartDate, setGameStartDate] = useState(null);
  // Дата конца игры
  const [gameEndDate, setGameEndDate] = useState(null);
  const [isTimerStop, setIsTimerStop] = useState(false);
  const [isOpenAllCards, setIsOpenAllCards] = useState(false);
  const [isTwinsOpen, setIsTwinsOpen] = useState(false);

  let isLeader = !easyMode && pairsCount === 3 && status === STATUS_WON;

  const openAllCards = () => {
    setIsTimerStop(true);
    if (isOpenAllCards) {
      return;
    }

    setCards(prevCards => {
      return prevCards.map(card => {
        return {
          ...card,
          open: true,
        };
      });
    });

    setTimeout(() => {
      setCards(prevCards => {
        return prevCards.map(card => {
          if (card.guessed) {
            return {
              ...card,
              open: true,
            };
          }

          return {
            ...card,
            open: false,
          };
        });
      });
      setIsOpenAllCards(true);
      setIsTimerStop(false);
      let newDate = new Date(gameStartDate);
      newDate.setSeconds(newDate.getSeconds() + 5);
      console.log(newDate);
      setGameStartDate(newDate);
    }, 5000);
  };

  useEffect(() => {
    if (cards && status === STATUS_IN_PROGRESS) {
      const pairs = cards.filter(elem => elem.guessed).length;
      if (pairs % 2 === 0) {
        setCorrectPairsCount(pairs / 2);
      }
    }
  }, [cards, status]);

  // Стейт для таймера, высчитывается в setInteval на основе gameStartDate и gameEndDate
  const [timer, setTimer] = useState({
    seconds: 0,
    minutes: 0,
  });

  function finishGame(status = STATUS_LOST) {
    setGameEndDate(new Date());
    setStatus(status);
    setCorrectPairsCount(0);
  }
  function startGame() {
    const startDate = new Date();
    setGameEndDate(null);
    setGameStartDate(startDate);
    setTimer(getTimerValue(startDate, null));
    setStatus(STATUS_IN_PROGRESS);
    setCorrectPairsCount(0);
    setIsOpenAllCards(false);
    setIsTwinsOpen(false);
  }
  function resetGame() {
    setGameStartDate(null);
    setGameEndDate(null);
    setTimer(getTimerValue(null, null));
    setStatus(STATUS_PREVIEW);
    setLives(easyMode ? 3 : 0);
    setCorrectPairsCount(0);
  }
  const randomTwinsCads = () => {
    const cardsNotGuessed = cards.filter(cards => !cards.guessed);
    let randomIndex = Math.floor(cardsNotGuessed.length * Math.random());
    let firstCard = cardsNotGuessed[randomIndex];
    let secondCard = cardsNotGuessed.find(card => card.rank === firstCard.rank && card.suit === firstCard.suit);
    let nextCards = cards.map(card => {
      if (secondCard.id === card.id || firstCard.id === card.id) {
        return {
          ...card,
          open: true,
          guessed: true,
        };
      }
      return card;
    });
    setCards(nextCards);
    setIsTwinsOpen(true);
  };

  /**
   * Обработка основного действия в игре - открытие карты.
   * После открытия карты игра может пепереходит в следующие состояния
   * - "Игрок выиграл", если на поле открыты все карты
   * - "Игрок проиграл", если на поле есть две открытые карты без пары
   * - "Игра продолжается", если не случилось первых двух условий
   */
  const openCard = clickedCard => {
    // Если карта уже открыта, то ничего не делаем

    if (clickedCard.open) {
      return;
    }
    let openCardsNew = cards.filter(card => card.open && !card.guessed);

    if (openCardsNew.length === 2) {
      return;
    }
    // Игровое поле после открытия кликнутой карты
    const nextCards = cards.map(card => {
      if (card.id !== clickedCard.id) {
        return card;
      }

      return {
        ...card,
        open: true,
      };
    });

    setCards(nextCards);

    const isPlayerWon = nextCards.every(card => card.open);

    // Победа - все карты на поле открыты
    if (isPlayerWon) {
      finishGame(STATUS_WON);
      return;
    }

    // Открытые карты на игровом поле
    const openCards = nextCards.filter(card => card.open);

    // Ищем открытые карты, у которых нет пары среди других открытых
    const openCardsWithoutPair = openCards.filter(card => {
      const sameCards = openCards.filter(openCard => card.suit === openCard.suit && card.rank === openCard.rank);
      if (sameCards.length < 2) {
        return true;
      }

      if (!easyMode) {
        if (openCards.length > 1) {
          const openedCards = nextCards.map(elem => {
            if (elem.open) {
              return {
                ...elem,
                open: true,
                guessed: true,
              };
            } else {
              return elem;
            }
          });
          setCards(openedCards);
        }
      }

      return false;
    });

    if (easyMode) {
      setTimeout(() => {
        const opened = cards.filter(elem => elem.open && !elem.guessed);
        if (opened.length > 0) {
          const resetCards = nextCards.map(card => {
            if (openCardsWithoutPair.some(openCard => openCard.id === card.id)) {
              return {
                ...card,
                open: false,
              };
            }
            if (card.open) {
              return {
                ...card,
                guessed: true,
              };
            }
            return {
              ...card,
            };
          });
          setCards(resetCards);
        }
      }, 1000);
    }

    const playerLost = openCardsWithoutPair.length >= 2;
    // Если игрок открыл неверную карту, то открываем соседнюю правильную карту

    // Функция для открытия соседней правильной карты, если она еще не открыта

    // "Игрок проиграл", т.к на поле есть две открытые карты без пары
    if (easyMode) {
      if (playerLost) {
        setLives(lives => lives - 1);
        if (lives === 1) {
          finishGame(STATUS_LOST);
        }
      }
    } else {
      if (playerLost) {
        finishGame(STATUS_LOST);
      }
    }
  };

  const isGameEnded = status === STATUS_LOST || status === STATUS_WON;

  // Игровой цикл
  useEffect(() => {
    // В статусах кроме превью доп логики не требуется
    if (status !== STATUS_PREVIEW) {
      return;
    }

    // В статусе превью мы
    if (pairsCount > 36) {
      alert("Столько пар сделать невозможно");
      return;
    }

    setCards(() => {
      return shuffle(generateDeck(pairsCount, 10));
    });

    const timerId = setTimeout(() => {
      startGame();
    }, previewSeconds * 1000);

    return () => {
      clearTimeout(timerId);
    };
  }, [status, pairsCount, previewSeconds]);

  // Обновляем значение таймера в интервале
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isTimerStop) {
        return;
      }
      setTimer(getTimerValue(gameStartDate, gameEndDate));
    }, 300);
    return () => {
      clearInterval(intervalId);
    };
  }, [gameStartDate, gameEndDate, isTimerStop]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.timer}>
          {status === STATUS_PREVIEW ? (
            <div>
              <p className={styles.previewText}>Запоминайте пары!</p>
              <p className={styles.previewDescription}>Игра начнется через {previewSeconds} секунд</p>
            </div>
          ) : (
            <>
              <div className={styles.timerValue}>
                <div className={styles.timerDescription}>min</div>
                <div>{timer.minutes.toString().padStart("2", "0")}</div>
              </div>
              .
              <div className={styles.timerValue}>
                <div className={styles.timerDescription}>sec</div>
                <div>{timer.seconds.toString().padStart("2", "0")}</div>
              </div>
            </>
          )}
        </div>
        <button
          title="Алохомора: Открывается случайная пара карт."
          disabled={isTwinsOpen}
          onClick={randomTwinsCads}
          className={styles.image}
        >
          <svg viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="68" height="68" rx="34" fill="#C2F5FF" />
            <rect
              x="31.7295"
              y="9"
              width="24.9566"
              height="34.761"
              rx="2"
              transform="rotate(15 31.7295 9)"
              fill="url(#paint0_linear_2501_2)"
              stroke="#E4E4E4"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M38.5302 33.4852C38.4143 33.3327 38.2972 33.1797 38.1797 33.0262C36.5408 30.8843 34.8288 28.6471 35.3027 26.6581C35.8981 24.6731 37.4389 24.3711 38.6234 24.6885C39.3167 24.8742 40.0048 25.4818 40.4186 26.3021C41.1243 25.7818 41.9569 25.5817 42.6502 25.7675C43.8346 26.0849 45.1365 27.1485 44.6596 29.1653C44.0534 31.1989 41.3849 32.3165 38.8199 33.3908C38.7345 33.4265 38.6492 33.4622 38.5641 33.4979C38.558 33.5006 38.552 33.5032 38.5459 33.5058C38.5458 33.5057 38.5458 33.5057 38.5458 33.5056C38.5457 33.5057 38.5456 33.5057 38.5455 33.5057C38.5404 33.4989 38.5352 33.492 38.5302 33.4852Z"
              fill="#FF4545"
            />
            <rect
              x="9.80664"
              y="24.6251"
              width="24.9566"
              height="34.761"
              rx="2"
              transform="rotate(-15 9.80664 24.6251)"
              fill="white"
              stroke="#E4E4E4"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M25.1215 35.4952C24.353 34.9918 23.4534 34.8097 22.7601 34.9955C21.5757 35.3129 20.3923 36.3448 20.8692 38.3615C21.4533 40.321 24.0545 41.4026 26.5447 42.438C26.7244 42.5127 26.9035 42.5872 27.0812 42.6617C27.0879 42.6646 27.0945 42.6675 27.1012 42.6703C27.1013 42.6702 27.1013 42.6702 27.1013 42.6701C27.1014 42.6702 27.1015 42.6702 27.1016 42.6703C27.1076 42.6624 27.1135 42.6545 27.1193 42.6466C27.1732 42.5756 27.2272 42.5046 27.2813 42.4335C28.9656 40.2207 30.7177 37.9186 30.2259 35.8543C29.6306 33.8693 27.9713 33.5991 26.7868 33.9164C26.0935 34.1022 25.4725 34.6918 25.1215 35.4952Z"
              fill="#FF4545"
            />
            <defs>
              <linearGradient
                id="paint0_linear_2501_2"
                x1="41.9795"
                y1="17.0218"
                x2="32.1751"
                y2="25.0435"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="white" />
                <stop offset="1" stop-color="#F0F0F0" />
              </linearGradient>
            </defs>
          </svg>
        </button>
        <button
          disabled={isOpenAllCards}
          title="Прозрение: Откроет все неоткрытые карты"
          className={styles.img}
          onClick={openAllCards}
        >
          <svg viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="68" height="68" rx="34" fill="#C2F5FF" />
            <path
              d="M6.06365 35.2703L6.06519 35.273C11.8167 45.1958 22.5591 51.3889 34 51.3889C45.4394 51.3889 56.1832 45.2593 61.9355 35.2718L61.9363 35.2703L62.4341 34.3992L62.5759 34.1511L62.4341 33.903L61.9364 33.0319L61.9348 33.0293C56.1833 23.1064 45.4409 16.9133 34 16.9133C22.5591 16.9133 11.8167 23.1064 6.06519 33.0293L6.06518 33.0293L6.06366 33.0319L5.56588 33.903L5.42412 34.1511L5.56588 34.3992L6.06366 35.2703L6.06365 35.2703Z"
              fill="white"
              stroke="#E4E4E4"
            />
            <mask id="mask0_3_5610" maskUnits="userSpaceOnUse" x="6" y="17" width="56" height="34">
              <path
                d="M34 50.8889C22.7378 50.8889 12.16 44.7911 6.49778 35.0222L6 34.1511L6.49778 33.28C12.16 23.5111 22.7378 17.4133 34 17.4133C45.2622 17.4133 55.84 23.5111 61.5022 33.28L62 34.1511L61.5022 35.0222C55.84 44.8533 45.2622 50.8889 34 50.8889Z"
                fill="white"
              />
            </mask>
            <g mask="url(#mask0_3_5610)">
              <g filter="url(#filter0_i_3_5610)">
                <path
                  d="M34 50.8889C22.7378 50.8889 12.16 44.7911 6.49778 35.0222L6 34.1511L6.49778 33.28C12.16 23.5111 22.7378 17.4133 34 17.4133C45.2622 17.4133 55.84 23.5111 61.5022 33.28L62 34.1511L61.5022 35.0222C55.84 44.8533 45.2622 50.8889 34 50.8889Z"
                  fill="white"
                />
              </g>
              <circle cx="34.3108" cy="26.1867" r="17.1111" fill="url(#paint0_linear_3_5610)" />
              <path
                d="M39.2891 26.3733C36.3646 26.3733 34.0002 24.0089 34.0002 21.0844C34.0002 20.0267 34.3113 18.9689 34.8713 18.16C34.5602 18.0978 34.2491 18.0978 34.0002 18.0978C29.3957 18.0978 25.7246 21.8311 25.7246 26.3733C25.7246 30.9778 29.4579 34.6489 34.0002 34.6489C38.6046 34.6489 42.2757 30.9156 42.2757 26.3733C42.2757 26.0622 42.2757 25.7511 42.2135 25.5022C41.4046 26.0622 40.4091 26.3733 39.2891 26.3733Z"
                fill="url(#paint1_linear_3_5610)"
              />
            </g>
            <defs>
              <filter
                id="filter0_i_3_5610"
                x="6"
                y="17.4133"
                width="60"
                height="35.4756"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
              >
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dx="4" dy="2" />
                <feGaussianBlur stdDeviation="3" />
                <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
                <feBlend mode="normal" in2="shape" result="effect1_innerShadow_3_5610" />
              </filter>
              <linearGradient
                id="paint0_linear_3_5610"
                x1="34.3108"
                y1="9.07556"
                x2="34.3108"
                y2="43.2978"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#004980" />
                <stop offset="1" stop-color="#C2F5FF" />
              </linearGradient>
              <linearGradient
                id="paint1_linear_3_5610"
                x1="34.0002"
                y1="18.0978"
                x2="34.0002"
                y2="34.6489"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#161616" />
                <stop offset="1" stop-color="#0B004B" />
              </linearGradient>
            </defs>
          </svg>
        </button>
        {status === STATUS_IN_PROGRESS ? <Button onClick={resetGame}>Начать заново</Button> : null}
      </div>

      <div className={styles.cards}>
        {cards.map(card => (
          <Card
            key={card.id}
            onClick={() => openCard(card)}
            open={status !== STATUS_IN_PROGRESS ? true : card.open}
            suit={card.suit}
            rank={card.rank}
            disabled={card.disabled}
          />
        ))}
      </div>

      {easyMode ? <p className={styles.lives}>Осталось {lives} попытки</p> : null}
      <p className={styles.lives}>Отгаданно правильно пар: {correctPairsCount}</p>
      <Link to={"/"}>НАЗАД</Link>
      {isGameEnded ? (
        <div className={styles.modalContainer}>
          <EndGameModal
            easyMode={easyMode}
            isOpenAllCards={isOpenAllCards}
            isTwinsOpen={isTwinsOpen}
            isLeader={isLeader}
            isWon={status === STATUS_WON}
            gameDurationSeconds={timer.seconds}
            gameDurationMinutes={timer.minutes}
            onClick={resetGame}
          />
        </div>
      ) : null}
    </div>
  );
}
