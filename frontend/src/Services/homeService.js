import api from './api';

export async function getHomeOverview(options = {}) {
  const response = await api.get('/home/overview', options);
  return response.data?.data;
}

export async function getHomeTrending(options = {}) {
  const response = await api.get('/home/trending', options);
  return response.data?.data;
}

export async function getHomePopular(options = {}) {
  const response = await api.get('/home/popular', options);
  return response.data?.data;
}

export async function getHomeGainers(options = {}) {
  const response = await api.get('/home/gainers', options);
  return response.data?.data;
}

export async function getHomeLosers(options = {}) {
  const response = await api.get('/home/losers', options);
  return response.data?.data;
}

export async function getHomeMarketStatus(options = {}) {
  const response = await api.get('/home/market-status', options);
  return response.data?.data;
}

export async function getFeaturedCompany(options = {}) {
  const response = await api.get('/home/featured', options);
  return response.data?.data;
}
