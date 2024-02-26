import styles from "./EndGameModal.module.css";

import { Button } from "../Button/Button";

import deadImageUrl from "./images/dead.png";
import celebrationImageUrl from "./images/celebration.png";
import { addLeader } from "../../API";
import { useState } from "react";
import { Link } from "react-router-dom";

export function EndGameModal({
  isWon,
  gameDurationSeconds,
  gameDurationMinutes,
  onClick,
  isLeader,
  isTwinsOpen,
  isOpenAllCards,
}) {
  const [name, setName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const time = gameDurationMinutes * 60 + gameDurationSeconds;
  const title = isLeader ? (
    <p className={styles.leader}>
      Вы попали
      <br /> на лидерборд
    </p>
  ) : isWon ? (
    "Вы победили!"
  ) : (
    "Вы проиграли!"
  );

  const imgSrc = isWon ? celebrationImageUrl : deadImageUrl;

  const imgAlt = isWon ? "celebration emodji" : "dead emodji";
  const achievements = () => {
    let arrAchievements = [1, 2];
    if (isOpenAllCards) {
      arrAchievements.shift();
    }
    if (isTwinsOpen) {
      arrAchievements.pop();
    }
    return arrAchievements;
  };

  const handleSubmitButton = () => {
    if (!name || !name.trim()) {
      setError(<p className={styles.p}>Вы не написали ваше имя</p>);
    } else {
      addLeader({ name, time, achievements })
        .then(() => {
          setIsSubmitted(!isSubmitted);
          setError(null);
        })
        .catch(err => {
          setError(err);
        });
    }
  };

  return (
    <div className={styles.modal}>
      <img className={styles.image} src={imgSrc} alt={imgAlt} />
      <h2 className={styles.title}>{title}</h2>
      {isLeader && !isSubmitted ? (
        <>
          <input
            className={styles.input}
            onChange={event => setName(event.target.value)}
            value={name}
            type="text"
            placeholder="Введите имя"
          />
          <button className={styles.button} onClick={handleSubmitButton}>
            Записаться в лидеры
          </button>
        </>
      ) : isLeader && isSubmitted ? (
        <p className={styles.p}>Ваш результат записан</p>
      ) : null}
      <p>{error}</p>
      <p className={styles.description}>Затраченное время:</p>
      <div className={styles.time}>
        {gameDurationMinutes.toString().padStart("2", "0")}.{gameDurationSeconds.toString().padStart("2", "0")}
      </div>
      <Button onClick={onClick}>Начать сначала</Button>
      <Link className={styles.link} to={"/LeaderBoard"}>
        Посмотреть рейтинг лидеров
      </Link>
    </div>
  );
}
