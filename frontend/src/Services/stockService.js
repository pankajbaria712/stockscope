import axios from 'axios';
import api from './api';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const stockApi = axios.create({
  baseURL: `${apiBaseUrl}/stocks`,
});

export async function searchStocks(query) {
  const response = await stockApi.get('/search', {
    params: { q: query },
  });

  return response.data;
}

export async function getCompanyDetails(symbol, options = {}) {
  const config = {};
  if (options.signal) {
    config.signal = options.signal;
  }

  const response = await stockApi.get(`/company/${encodeURIComponent(symbol)}`, config);
  return response.data;
}

export async function getStockQuote(symbol, options = {}) {
  const config = {};
  if (options.signal) {
    config.signal = options.signal;
  }

  const response = await stockApi.get(`/quote/${encodeURIComponent(symbol)}`, config);
  return response.data;
}

export async function getStockChart(symbol, options = {}) {
  const config = {
    params: {
      ...(options.range ? { range: options.range } : {}),
      ...(options.interval ? { interval: options.interval } : {}),
    },
  };
  if (options.signal) {
    config.signal = options.signal;
  }

  const response = await stockApi.get(`/chart/${encodeURIComponent(symbol)}`, config);

  return response.data;
}

export async function getCompanyHubData(symbol, options = {}) {
  const config = {};
  if (options.signal) {
    config.signal = options.signal;
  }

  const response = await stockApi.get(`/company/${encodeURIComponent(symbol)}/hub`, config);
  return response.data;
}

export async function addToWatchlist(payload) {
  const response = await api.post('/watchlist', payload);
  return response.data;
}
