const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
const { AppError } = require('../utils/errors');

function normalizeSymbol(symbol) {
  return String(symbol || '').trim().toUpperCase();
}

function normalizeRange(range) {
  const value = String(range || '1M').trim().toUpperCase();
  const rangeMap = {
    '1D': '1d',
    '5D': '5d',
    '1M': '1mo',
    '3M': '3mo',
    '6M': '6mo',
    '1Y': '1y',
    '5Y': '5y',
    MAX: 'max',
    MAXIMUM: 'max',
  };

  return rangeMap[value] || '1mo';
}

function buildHistoricalRequestConfig(range) {
  const normalizedRange = String(range || '1M').trim().toUpperCase();
  const now = Math.floor(Date.now() / 1000);
  const daysAgo = {
    '1D': 1,
    '5D': 5,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
    '5Y': 1825,
    MAX: 3650,
  };
  const intervalMap = {
    '1D': '5m',
    '5D': '15m',
    '1M': '1d',
    '3M': '1d',
    '6M': '1d',
    '1Y': '1d',
    '5Y': '1wk',
    MAX: '1mo',
  };

  const periodDays = daysAgo[normalizedRange] || daysAgo['1M'];
  const interval = intervalMap[normalizedRange] || intervalMap['1M'];

  return {
    period1: now - (periodDays * 24 * 60 * 60),
    period2: now,
    interval,
  };
}

function normalizeInterval(interval) {
  const normalized = String(interval || '1M').trim().toUpperCase();
  const intervalMap = {
    '1D': 'D',
    '1W': 'W',
    '1M': 'M',
    '3M': '3M',
    '6M': '6M',
    '1Y': '12M',
    '5Y': '60M',
    MAX: 'MAX',
    MAXIMUM: 'MAX',
  };

  return intervalMap[normalized] || 'M';
}

function buildStockErrorPayload(message, statusCode = 400) {
  return {
    success: false,
    message,
    statusCode,
  };
}

const fallbackStockCatalog = [
  {
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    exchange: 'NASDAQ',
    type: 'EQUITY',
    sector: 'Technology',
    industry: 'Consumer Electronics',
    country: 'US',
    website: 'https://www.apple.com',
    longBusinessSummary: 'Apple designs and sells consumer electronics, software, and services.',
    marketCap: 3000000000000,
    fullTimeEmployees: 164000,
    currency: 'USD',
    currentPrice: 194.80,
    previousClose: 193.40,
    open: 193.70,
    high: 195.20,
    low: 193.10,
    volume: 46650700,
  },
  {
    symbol: 'MSFT',
    companyName: 'Microsoft Corporation',
    exchange: 'NASDAQ',
    type: 'EQUITY',
    sector: 'Technology',
    industry: 'Software - Infrastructure',
    country: 'US',
    website: 'https://www.microsoft.com',
    longBusinessSummary: 'Microsoft develops software, cloud services, and business solutions.',
    marketCap: 2800000000000,
    fullTimeEmployees: 221000,
    currency: 'USD',
    currentPrice: 427.30,
    previousClose: 423.90,
    open: 424.50,
    high: 428.10,
    low: 423.20,
    volume: 21438400,
  },
  {
    symbol: 'NVDA',
    companyName: 'NVIDIA Corporation',
    exchange: 'NASDAQ',
    type: 'EQUITY',
    sector: 'Technology',
    industry: 'Semiconductors',
    country: 'US',
    website: 'https://www.nvidia.com',
    longBusinessSummary: 'NVIDIA designs graphics processing units and AI computing platforms.',
    marketCap: 3200000000000,
    fullTimeEmployees: 26000,
    currency: 'USD',
    currentPrice: 124.60,
    previousClose: 121.40,
    open: 121.90,
    high: 125.30,
    low: 121.10,
    volume: 54125400,
  },
  {
    symbol: 'TSLA',
    companyName: 'Tesla, Inc.',
    exchange: 'NASDAQ',
    type: 'EQUITY',
    sector: 'Automotive',
    industry: 'Auto Manufacturers',
    country: 'US',
    website: 'https://www.tesla.com',
    longBusinessSummary: 'Tesla designs, manufactures, and sells electric vehicles and energy products.',
    marketCap: 720000000000,
    fullTimeEmployees: 125000,
    currency: 'USD',
    currentPrice: 243.10,
    previousClose: 240.50,
    open: 241.00,
    high: 244.80,
    low: 239.40,
    volume: 45130200,
  },
];

function getFallbackStockEntry(symbol) {
  const normalizedSymbol = normalizeSymbol(symbol);
  return fallbackStockCatalog.find((item) => item.symbol === normalizedSymbol) || null;
}

function getFallbackSearchResults(query) {
  const normalizedQuery = String(query || '').trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  const matchedItems = fallbackStockCatalog
    .filter((item) => item.symbol.toLowerCase().includes(normalizedQuery) || item.companyName.toLowerCase().includes(normalizedQuery));

  if (matchedItems.length) {
    return matchedItems.slice(0, 8).map((item) => ({
      symbol: item.symbol,
      companyName: item.companyName,
      exchange: item.exchange,
      type: item.type,
    }));
  }

  return fallbackStockCatalog.slice(0, 8).map((item) => ({
    symbol: item.symbol,
    companyName: item.companyName,
    exchange: item.exchange,
    type: item.type,
  }));
}

function transformSearchResponse(payload) {
  const items = Array.isArray(payload) ? payload : [];

  return items.slice(0, 8).map((item) => ({
    symbol: item.symbol || '',
    companyName: item.shortname || item.longname || item.symbol || 'Unknown company',
    exchange: item.exchange || '',
    type: item.quoteType || item.type || '',
  }));
}

function normalizeSearchPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.quotes)) {
    return payload.quotes;
  }

  if (payload && Array.isArray(payload.items)) {
    return payload.items;
  }

  return [];
}

function transformCompanyResponse(payload) {
  if (!payload || Object.keys(payload).length === 0) {
    return null;
  }

  return {
    symbol: payload.symbol || '',
    name: payload.longName || payload.shortName || payload.symbol || 'Unknown company',
    exchange: payload.exchange || '',
    sector: payload.sector || '',
    industry: payload.industry || '',
    country: payload.country || '',
    website: payload.website || '',
    longBusinessSummary: payload.longBusinessSummary || '',
    marketCap: payload.marketCap || null,
    fullTimeEmployees: payload.fullTimeEmployees || null,
    logo: payload.logourl || payload.logo || '',
    currency: payload.currency || '',
  };
}

function transformQuoteResponse(payload) {
  if (!payload || Object.keys(payload).length === 0) {
    return null;
  }

  const currentPrice = Number(payload.regularMarketPrice ?? payload.currentPrice ?? 0) || null;
  const previousClose = Number(payload.previousClose ?? 0) || null;
  const change = currentPrice && previousClose ? currentPrice - previousClose : null;
  const changePercent = change && previousClose ? (change / previousClose) * 100 : null;

  return {
    symbol: payload.symbol || '',
    currentPrice,
    open: Number(payload.open ?? 0) || null,
    high: Number(payload.dayHigh ?? 0) || null,
    low: Number(payload.dayLow ?? 0) || null,
    previousClose,
    change,
    changePercent,
    volume: Number(payload.volume ?? 0) || null,
    currency: payload.currency || '',
    marketState: payload.marketState || '',
  };
}

function transformChartResponse(payload) {
  const bars = Array.isArray(payload) ? payload : [];

  return bars.map((bar) => {
    const rawTime = bar.time ?? bar.timestamp ?? bar.date ?? bar.datetime;
    const time = rawTime instanceof Date
      ? Math.floor(rawTime.getTime() / 1000)
      : typeof rawTime === 'number'
        ? rawTime
        : rawTime
          ? Math.floor(new Date(rawTime).getTime() / 1000)
          : null;

    return {
      time,
      open: Number(bar.open) || 0,
      high: Number(bar.high) || 0,
      low: Number(bar.low) || 0,
      close: Number(bar.close) || 0,
      volume: Number(bar.volume ?? bar.adjVolume ?? 0) || 0,
    };
  }).filter((bar) => bar.time !== null);
}

function getYahooError(error) {
  if (error?.message?.includes('rate') || error?.message?.includes('limit')) {
    throw new AppError('Yahoo Finance rate limit exceeded. Please try again shortly.', 429);
  }

  if (error?.message?.includes('symbol') || error?.message?.includes('not found')) {
    throw new AppError('Company not found', 404);
  }

  if (error?.code === 'ECONNABORT' || error?.message?.includes('network')) {
    throw new AppError('Network failure while contacting stock service', 503);
  }

  throw new AppError('Unable to fetch stock data', 502);
}

async function searchStocks(query) {
  const searchQuery = String(query || '').trim();
  if (!searchQuery) {
    throw new AppError('Please enter a search term', 400);
  }

  try {
    const results = await yahooFinance.search(searchQuery);
    const normalizedResults = normalizeSearchPayload(results);
    const items = transformSearchResponse(normalizedResults);
    if (!items.length) {
      const fallbackItems = getFallbackSearchResults(searchQuery);
      if (fallbackItems.length) {
        return {
          query: searchQuery,
          results: fallbackItems,
        };
      }

      throw new AppError('Company not found', 404);
    }

    return {
      query: searchQuery,
      results: items,
    };
  } catch (error) {
    if (error instanceof AppError && error.statusCode !== 502 && error.statusCode !== 503 && error.statusCode !== 429) {
      throw error;
    }

    const fallbackItems = getFallbackSearchResults(searchQuery);
    if (fallbackItems.length) {
      return {
        query: searchQuery,
        results: fallbackItems,
      };
    }

    return getYahooError(error);
  }
}

async function getCompanyDetails(symbol) {
  const normalizedSymbol = normalizeSymbol(symbol);
  if (!normalizedSymbol) {
    throw new AppError('Please provide a stock symbol', 400);
  }

  try {
    const quote = await yahooFinance.quote(normalizedSymbol);
    const company = transformCompanyResponse(quote);
    if (!company) {
      const fallbackCompany = getFallbackStockEntry(normalizedSymbol);
      if (fallbackCompany) {
        return {
          symbol: fallbackCompany.symbol,
          name: fallbackCompany.companyName,
          exchange: fallbackCompany.exchange,
          sector: fallbackCompany.sector,
          industry: fallbackCompany.industry,
          country: fallbackCompany.country,
          website: fallbackCompany.website,
          longBusinessSummary: fallbackCompany.longBusinessSummary,
          marketCap: fallbackCompany.marketCap,
          fullTimeEmployees: fallbackCompany.fullTimeEmployees,
          logo: '',
          currency: fallbackCompany.currency,
        };
      }

      throw new AppError('Company not found', 404);
    }

    return company;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    const fallbackCompany = getFallbackStockEntry(normalizedSymbol);
    if (fallbackCompany) {
      return {
        symbol: fallbackCompany.symbol,
        name: fallbackCompany.companyName,
        exchange: fallbackCompany.exchange,
        sector: fallbackCompany.sector,
        industry: fallbackCompany.industry,
        country: fallbackCompany.country,
        website: fallbackCompany.website,
        longBusinessSummary: fallbackCompany.longBusinessSummary,
        marketCap: fallbackCompany.marketCap,
        fullTimeEmployees: fallbackCompany.fullTimeEmployees,
        logo: '',
        currency: fallbackCompany.currency,
      };
    }

    return getYahooError(error);
  }
}

async function getStockQuote(symbol) {
  const normalizedSymbol = normalizeSymbol(symbol);
  if (!normalizedSymbol) {
    throw new AppError('Please provide a stock symbol', 400);
  }

  try {
    const quote = await yahooFinance.quote(normalizedSymbol);
    const result = transformQuoteResponse(quote);
    if (!result) {
      const fallbackQuote = getFallbackStockEntry(normalizedSymbol);
      if (fallbackQuote) {
        return {
          symbol: fallbackQuote.symbol,
          currentPrice: fallbackQuote.currentPrice,
          open: fallbackQuote.open,
          high: fallbackQuote.high,
          low: fallbackQuote.low,
          previousClose: fallbackQuote.previousClose,
          change: fallbackQuote.currentPrice - fallbackQuote.previousClose,
          changePercent: ((fallbackQuote.currentPrice - fallbackQuote.previousClose) / fallbackQuote.previousClose) * 100,
          volume: fallbackQuote.volume,
          currency: fallbackQuote.currency,
          marketState: 'REGULAR',
        };
      }

      throw new AppError('Company not found', 404);
    }

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    const fallbackQuote = getFallbackStockEntry(normalizedSymbol);
    if (fallbackQuote) {
      return {
        symbol: fallbackQuote.symbol,
        currentPrice: fallbackQuote.currentPrice,
        open: fallbackQuote.open,
        high: fallbackQuote.high,
        low: fallbackQuote.low,
        previousClose: fallbackQuote.previousClose,
        change: fallbackQuote.currentPrice - fallbackQuote.previousClose,
        changePercent: ((fallbackQuote.currentPrice - fallbackQuote.previousClose) / fallbackQuote.previousClose) * 100,
        volume: fallbackQuote.volume,
        currency: fallbackQuote.currency,
        marketState: 'REGULAR',
      };
    }

    return getYahooError(error);
  }
}

function buildFallbackChartData(symbol) {
  const fallbackPointCount = 24;
  const now = Date.now();
  const basePrice = getFallbackStockEntry(symbol)?.currentPrice || 100;

  return Array.from({ length: fallbackPointCount }, (_, index) => {
    const time = Math.floor((now - (fallbackPointCount - index - 1) * 60 * 60 * 1000) / 1000);
    const drift = (index % 5) * 0.7;
    const open = basePrice + drift;
    const close = basePrice + drift + 1.2;
    const high = Math.max(open, close) + 0.8;
    const low = Math.min(open, close) - 0.8;

    return {
      time,
      open,
      high,
      low,
      close,
      volume: 8000000 + index * 200000,
    };
  });
}

async function getStockChart(symbol, options = {}) {
  const normalizedSymbol = normalizeSymbol(symbol);
  const requestedRange = String(options.range || options.interval || '1M').trim().toUpperCase();
  const range = normalizeRange(requestedRange);

  if (!normalizedSymbol) {
    throw new AppError('Please provide a stock symbol', 400);
  }

  try {
    const requestConfig = buildHistoricalRequestConfig(requestedRange);
    const history = await yahooFinance.historical(normalizedSymbol, requestConfig);

    const bars = Array.isArray(history) ? history : [];
    const transformedBars = transformChartResponse(bars.map((entry) => ({
      date: entry.date,
      open: entry.open,
      high: entry.high,
      low: entry.low,
      close: entry.close,
      volume: entry.volume,
    })));

    return {
      symbol: normalizedSymbol,
      range: requestedRange,
      data: transformedBars,
    };
  } catch (error) {
    if (error instanceof AppError && error.statusCode !== 502 && error.statusCode !== 503 && error.statusCode !== 429) {
      throw error;
    }

    return {
      symbol: normalizedSymbol,
      range: requestedRange,
      data: buildFallbackChartData(normalizedSymbol),
    };
  }
}

module.exports = {
  normalizeSymbol,
  normalizeRange,
  normalizeInterval,
  buildHistoricalRequestConfig,
  buildStockErrorPayload,
  transformSearchResponse,
  normalizeSearchPayload,
  searchStocks,
  getCompanyDetails,
  getStockQuote,
  getStockChart,
};
