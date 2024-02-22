import styles from "./EndGameModal.module.css";

import { Button } from "../Button/Button";

import deadImageUrl from "./images/dead.png";
import celebrationImageUrl from "./images/celebration.png";
import { addLeader } from "../../API";

export function EndGameModal({ isWon, gameDurationSeconds, gameDurationMinutes, onClick, isLeader }) {
  const title = isLeader ? "Вы попали на лидерборд" : isWon ? "Вы победили!" : "Вы проиграли!";

  const imgSrc = isWon ? celebrationImageUrl : deadImageUrl;

  const imgAlt = isWon ? "celebration emodji" : "dead emodji";
  // сделать стейт для name
  // превратить gameDurationMinutes gameDurationSeconds в секунды
  // отправить на сервер в переменной time
  return (
    <div className={styles.modal}>
      <img className={styles.image} src={imgSrc} alt={imgAlt} />
      <h2 className={styles.title}>{title}</h2>
      <input type="text" placeholder="Введите имя" />
      <button onClick={() => addLeader({name, time})}>Записать в лидеры</button>
      <p className={styles.description}>Затраченное время:</p>

      <div className={styles.time}>
        {gameDurationMinutes.toString().padStart("2", "0")}.{gameDurationSeconds.toString().padStart("2", "0")}
      </div>

      <Button onClick={onClick}>Начать сначала</Button>
    </div>
  );
}
