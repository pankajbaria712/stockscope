const dotenv = require('dotenv');

dotenv.config();

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || null;
const FINNHUB_BASE_URL = process.env.FINNHUB_BASE_URL || 'https://finnhub.io/api/v1';

module.exports = {
  FINNHUB_API_KEY,
  FINNHUB_BASE_URL,
};
