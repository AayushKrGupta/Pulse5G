import { getBaseUrl } from './config';

export const getLatestAlert = async () => {
  const res = await fetch(`${getBaseUrl()}/`);
  return res.json();
};

export const getVideoStreamUrl = () => {
  return `${getBaseUrl()}/video`;
};
