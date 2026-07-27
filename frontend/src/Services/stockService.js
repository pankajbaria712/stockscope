import axios from 'axios';

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

export async function getCompanyDetails(symbol) {
  const response = await stockApi.get(`/company/${encodeURIComponent(symbol)}`);
  return response.data;
}

export async function getStockQuote(symbol) {
  const response = await stockApi.get(`/quote/${encodeURIComponent(symbol)}`);
  return response.data;
}

export async function getStockChart(symbol, options = {}) {
  const response = await stockApi.get(`/chart/${encodeURIComponent(symbol)}`, {
    params: options,
  });

  return response.data;
}
