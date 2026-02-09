const BASE_URL = "http://EDGE_SERVER_IP:8000/api";

export const getIncidents = async () => {
  const res = await fetch(`${BASE_URL}/incidents`);
  return res.json();
};

export const getAnalytics = async () => {
  const res = await fetch(`${BASE_URL}/analytics`);
  return res.json();
};

export const getCameras = async () => {
  const res = await fetch(`${BASE_URL}/cameras`);
  return res.json();
};
