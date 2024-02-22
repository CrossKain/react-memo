import { method } from "lodash";

export const leaderBordApi = async () => {
  const mneyjepohyi = await fetch("https://wedev-api.sky.pro/api/leaderboard");
  const data = await mneyjepohyi.json();
  return data.leaders;
};

export const addLeader = async ({ name, time }) => {
  const leaderAdd = await fetch("https://wedev-api.sky.pro/api/leaderboard", {
    method: "POST",
    body: JSON.stringify({ name, time }),
  });
};
