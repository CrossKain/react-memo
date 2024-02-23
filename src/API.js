export const leaderBordApi = async () => {
  const mneyjepohyi = await fetch("https://wedev-api.sky.pro/api/leaderboard");
  const data = await mneyjepohyi.json();
  return data.leaders;
};

export const addLeader = async ({ name, time }) => {
  const response = await fetch("https://wedev-api.sky.pro/api/leaderboard", {
    method: "POST",
    body: JSON.stringify({ name, time }),
  });
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    const error = await response.json();
    throw new Error(error.message);
  }
};
