import { useContext, useState } from "react";
import styles from "./SelectLevelPage.module.css";
import { Link, useNavigate } from "react-router-dom";
import { GameContext } from "../../Context/Context";
import classNames from "classnames";
// import { router } from "../../router";
// import { LeaderBoard } from "../LeaderBoard/LeaderBoard";

export function SelectLevelPage() {
  const [level, setLevel] = useState("3");
  const navigate = useNavigate();
  const { easyMode, setEasyMode } = useContext(GameContext);
  const startGame = () => {
    navigate(`/game/${level}`);
  };
  return (
    <div className={styles.container}>
      <div className={styles.modal}>
        <h1 className={styles.title}>Выбери сложность</h1>
        {level === "3" && <p className={styles.hiddenParagraph}>На этом уровне Вам необходимо угадать 3 пары карт</p>}
        {level === "6" && <p className={styles.hiddenParagraph}>На этом уровне Вам необходимо угадать 6 пар карт</p>}
        {level === "9" && <p className={styles.hiddenParagraph}>На этом уровне Вам необходимо угадать 9 пар карт</p>}
        <ul className={styles.levels}>
          <li className={classNames(styles.level, { [styles.active]: level === "3" })}>
            <label className={styles.label}>
              <input
                className={styles.inputLevel}
                checked={level === "3"}
                value={3}
                onChange={e => setLevel(e.target.value)}
                type="radio"
              />
              <p className={styles.numberGame}>1</p>
            </label>
          </li>
          <li className={classNames(styles.level, { [styles.active]: level === "6" })}>
            <label className={styles.label}>
              <input
                className={styles.inputLevel}
                checked={level === "6"}
                value={6}
                onChange={e => setLevel(e.target.value)}
                type="radio"
              />
              <p className={styles.numberGame}>2</p>
            </label>
          </li>
          <li className={classNames(styles.level, { [styles.active]: level === "9" })}>
            <label className={styles.label}>
              <input
                className={styles.inputLevel}
                checked={level === "9"}
                value={9}
                onChange={e => setLevel(e.target.value)}
                type="radio"
              />
              <p className={styles.numberGame}>3</p>
            </label>
          </li>
        </ul>
        <div>
          <label className={styles.label}>
            <input
              defaultChecked={easyMode}
              onChange={() => setEasyMode(!easyMode)}
              className={styles.inputMode}
              type="checkbox"
            />
            <span className={styles.checkbox}></span>
            <p className={styles.easyGame}>Легкий режим игры</p>
          </label>
          {easyMode && <p className={styles.hiddenParagraph}>Теперь у Вас есть 3 попытки</p>}
        </div>
        <button onClick={startGame} className={styles.buttonGame}>
          Начать игру
        </button>
        <Link to={"/LeaderBoard"}>
          <p className={styles.linkp}>Посмотреть рейтинг лидеров</p>
        </Link>
      </div>
    </div>
  );
}
