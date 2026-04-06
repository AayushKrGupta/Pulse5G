const BASE_URL = "http://172.16.0.17:8000";

export const getLatestAlert = async () => {
  const res = await fetch(`${BASE_URL}/`);
  return res.json();
};

export const getVideoStreamUrl = () => {
  return `${BASE_URL}/video`;
};
