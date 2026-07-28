import api from './api';

export async function getHomeOverview() {
  const response = await api.get('/home/overview');
  return response.data;
}

export async function getHomeTrending() {
  const response = await api.get('/home/trending');
  return response.data;
}

export async function getHomePopular() {
  const response = await api.get('/home/popular');
  return response.data;
}

export async function getHomeGainers() {
  const response = await api.get('/home/gainers');
  return response.data;
}

export async function getHomeLosers() {
  const response = await api.get('/home/losers');
  return response.data;
}

export async function getHomeMarketStatus() {
  const response = await api.get('/home/market-status');
  return response.data;
}

export async function getFeaturedCompany() {
  const response = await api.get('/home/featured');
  return response.data;
}
