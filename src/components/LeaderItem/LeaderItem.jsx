import styles from "./LeaderItem.module.css";
export const LeaderItem = ({ index, name, time }) => {
  const minutes = (time / 60) << 0;
  let minutesText;
  if (minutes < 0) {
    minutesText = "0 минут";
  } else if (minutes === 1) {
    minutesText = "1 минута";
  } else if (minutes === 2 || minutes === 3 || minutes === 4) {
    minutesText = `${minutes} минуты`;
  } else {
    minutesText = `${minutes} минут`;
  }
  const seconds = time % 60;
  const formattedSeconds = seconds.toString().padStart(2, "0");
  const summary = `${minutesText} : ${formattedSeconds}сек`;
  return (
    <div className={styles.main}>
      <p className={styles.p}>{index}</p>
      <p>{name}</p>
      <p>{summary}</p>
    </div>
  );
};
