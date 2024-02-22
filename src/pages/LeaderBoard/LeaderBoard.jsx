import { useEffect, useState } from "react";
import { LeaderItem } from "../../components/LeaderItem/LeaderItem";
import { leaderBordApi } from "../../API";

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
    <div>
      <p>Лидерборд</p>
      <button>начать игру</button>
      <div>
        <div>
          <p></p>
          <p></p>
          <p></p>
        </div>
        {leader.map((elem, index) => (
          <LeaderItem key={elem.id} index={index} name={elem.name} time={elem.time} />
        ))}
      </div>
    </div>
  );
};
