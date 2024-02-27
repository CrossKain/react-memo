export const leaderBordApi = async () => {
  const response = await fetch("https://wedev-api.sky.pro/api/v2/leaderboard");
  const data = await response.json();
  return data.leaders;
};

export const addLeader = async ({ name, achievements, time }) => {
  const response = await fetch("https://wedev-api.sky.pro/api/v2/leaderboard", {
    method: "POST",
    body: JSON.stringify({ name, achievements, time }),
  });
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    const error = await response.json();
    throw new Error(error.message);
  }
};
