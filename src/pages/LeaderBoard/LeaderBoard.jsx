import styles from "./LeaderBoard.module.css";
import { useEffect, useState } from "react";
import { LeaderItem } from "../../components/LeaderItem/LeaderItem";
import { leaderBordApi } from "../../API";
import { Link } from "react-router-dom";

export const LeaderBoard = () => {
  const [leader, setLeader] = useState([]);
  useEffect(() => {
    leaderBordApi().then(data => {
      const dataSort = [...data];
      dataSort.sort((a, b) => a.time - b.time);
      setLeader(dataSort);
    });
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.block}>
        <p className={styles.text}>Лидерборд</p>
        <Link className={styles.button} to={"/"}>
          Начать игру
        </Link>
      </div>
      <div className={styles.vaflya}>
        <div className={styles.leader}>
          <p className={styles.p}>Позиция</p>
          <p className={styles.p}>Имя</p>
          <p className={styles.p}>Достижения</p>
          <p className={styles.p}>Время</p>
        </div>
        {leader.map(
          (elem, index) => (
            console.log(elem),
            (
              <LeaderItem
                key={elem.id}
                index={`# ${index + 1}`}
                name={elem.name}
                achievements={elem.achievements}
                time={elem.time}
              />
            )
          ),
        )}
      </div>

      <Link className={styles.back} to={"/"}>
        Назад
      </Link>
    </div>
  );
};
