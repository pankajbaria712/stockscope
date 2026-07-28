const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
const { AppError } = require('../utils/errors');

const CACHE_TTL_MS = 20 * 1000;
const cache = new Map();

const INDEX_SYMBOLS = [
  { symbol: '^NSEI', label: 'NIFTY 50' },
  { symbol: '^BSESN', label: 'SENSEX' },
  { symbol: '^NSEBANK', label: 'BANK NIFTY' },
  { symbol: '^FINNIFTY', label: 'FINNIFTY' },
];

const TRENDING_SYMBOLS = ['RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 'ICICIBANK.NS'];
const POPULAR_COMPANIES = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
  { symbol: 'INFY.NS', name: 'Infosys' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
];

const MARKET_MOVERS_SYMBOLS = [
  'RELIANCE.NS',
  'TCS.NS',
  'INFY.NS',
  'HDFCBANK.NS',
  'ICICIBANK.NS',
  'SBIN.NS',
  'BHARTIARTL.NS',
  'LT.NS',
  'ITC.NS',
  'ADANIENT.NS',
  'AXISBANK.NS',
  'KOTAKBANK.NS',
  'BAJFINANCE.NS',
  'MARUTI.NS',
  'HINDUNILVR.NS',
  'SUNPHARMA.NS',
  'ONGC.NS',
  'TITAN.NS',
  'WIPRO.NS',
  'ULTRACEMCO.NS',
];

function getCachedValue(key) {
  const entry = cache.get(key);
  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }

  return entry.value;
}

function setCacheValue(key, value, ttl = CACHE_TTL_MS) {
  cache.set(key, {
    value,
    expires: Date.now() + ttl,
  });
}

function toMarketStateLabel(state) {
  if (!state) {
    return 'Market Closed';
  }

  const normalized = String(state).toUpperCase();
  if (normalized === 'REGULAR') {
    return 'Market Open';
  }

  if (normalized.startsWith('PRE')) {
    return 'Pre Market';
  }

  if (normalized.startsWith('POST')) {
    return 'Post Market';
  }

  return 'Market Closed';
}

function normalizeQuote(quote) {
  if (!quote || typeof quote !== 'object') {
    return null;
  }

  const currentPrice = Number(quote.regularMarketPrice ?? 0);
  const previousClose = Number(quote.regularMarketPreviousClose ?? 0);
  const change = Number(quote.regularMarketChange ?? 0);
  const changePercent = Number(quote.regularMarketChangePercent ?? 0);
  const marketState = quote.marketState || quote.market || '';

  return {
    symbol: quote.symbol || '',
    name: quote.shortName || quote.longName || quote.symbol || '',
    exchange: quote.exchange || quote.fullExchangeName || '',
    currency: quote.currency || 'INR',
    currentPrice: Number.isFinite(currentPrice) ? currentPrice : null,
    previousClose: Number.isFinite(previousClose) ? previousClose : null,
    change: Number.isFinite(change) ? change : null,
    changePercent: Number.isFinite(changePercent) ? changePercent : null,
    marketState,
    marketStatus: toMarketStateLabel(marketState),
    lastUpdated: quote.regularMarketTime ? new Date(quote.regularMarketTime).toISOString() : null,
  };
}

async function fetchQuote(symbol) {
  if (!symbol) {
    return null;
  }

  try {
    const quote = await yahooFinance.quote(symbol);
    return normalizeQuote(quote);
  } catch (error) {
    return null;
  }
}

function normalizeHistoricalData(history = []) {
  return Array.isArray(history)
    ? history
        .map((entry) => {
          if (!entry || !entry.date || entry.close === undefined || entry.close === null) {
            return null;
          }

          const date = new Date(entry.date);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return {
            time: `${year}-${month}-${day}`,
            value: Number(entry.close),
          };
        })
        .filter(Boolean)
    : [];
}

async function fetchHistoricalData(symbol, periodDays = 30) {
  if (!symbol) {
    return [];
  }

  try {
    const period1 = Math.floor((Date.now() - periodDays * 24 * 60 * 60 * 1000) / 1000);
    const period2 = Math.floor(Date.now() / 1000);
    const history = await yahooFinance.historical(symbol, {
      period1,
      period2,
      interval: '1d',
    });

    return normalizeHistoricalData(history.slice(-periodDays));
  } catch (error) {
    return [];
  }
}

async function fetchQuoteSummary(symbol) {
  if (!symbol) {
    return null;
  }

  try {
    const data = await yahooFinance.quoteSummary(symbol, {
      modules: ['assetProfile', 'price'],
    });

    const assetProfile = data.assetProfile || {};
    const price = data.price || {};
    const currentPrice = Number(price.regularMarketPrice ?? 0);
    const change = Number(price.regularMarketChange ?? 0);
    const changePercent = Number(price.regularMarketChangePercent ?? 0);

    return {
      symbol,
      name: price.shortName || assetProfile.longBusinessSummary?.split(' ')[0] || symbol,
      industry: assetProfile.industry || '',
      description: assetProfile.longBusinessSummary || '',
      marketCap: Number(price.marketCap ?? 0),
      currency: price.currency || 'INR',
      currentPrice: Number.isFinite(currentPrice) ? currentPrice : null,
      change: Number.isFinite(change) ? change : null,
      changePercent: Number.isFinite(changePercent) ? changePercent : null,
      exchange: price.exchange || '',
      marketState: price.marketState || '',
      lastUpdated: price.regularMarketTime ? new Date(price.regularMarketTime).toISOString() : null,
      fiftyTwoWeekHigh: Number(price.fiftyTwoWeekHigh ?? 0) || null,
      fiftyTwoWeekLow: Number(price.fiftyTwoWeekLow ?? 0) || null,
    };
  } catch (error) {
    return null;
  }
}

async function getHomeOverview() {
  const cacheKey = 'homeOverview';
  const cached = getCachedValue(cacheKey);
  if (cached) {
    return cached;
  }

  const quotes = await Promise.all(INDEX_SYMBOLS.map((index) => fetchQuote(index.symbol)));
  const validQuotes = quotes.filter(Boolean);
  const overview = INDEX_SYMBOLS.map((index) => {
    const quote = validQuotes.find((item) => item && item.symbol === index.symbol);
    return {
      name: index.label,
      symbol: index.symbol,
      currentPrice: quote?.currentPrice ?? null,
      change: quote?.change ?? null,
      changePercent: quote?.changePercent ?? null,
      marketStatus: quote?.marketStatus ?? 'Market Closed',
      marketState: quote?.marketState ?? '',
      lastUpdated: quote?.lastUpdated ?? null,
      currency: quote?.currency ?? 'INR',
    };
  });

  const niftyQuote = overview.find((item) => item.symbol === '^NSEI') || null;
  const hero = {
    nifty: niftyQuote,
    sensex: overview.find((item) => item.symbol === '^BSESN') || null,
    bankNifty: overview.find((item) => item.symbol === '^NSEBANK') || null,
    marketStatus: niftyQuote?.marketStatus || 'Market Closed',
    lastUpdated: niftyQuote?.lastUpdated || null,
    chart: await fetchHistoricalData('^NSEI', 30),
  };

  const payload = {
    hero,
    marketOverview: overview,
  };

  setCacheValue(cacheKey, payload);
  return payload;
}

async function getHomeTrending() {
  const cacheKey = 'homeTrending';
  const cached = getCachedValue(cacheKey);
  if (cached) {
    return cached;
  }

  const quotes = await Promise.all(TRENDING_SYMBOLS.map((symbol) => fetchQuote(symbol)));
  const results = quotes
    .filter(Boolean)
    .map((quote) => ({
      symbol: quote.symbol,
      name: quote.name,
      currentPrice: quote.currentPrice,
      change: quote.change,
      changePercent: quote.changePercent,
      marketState: quote.marketState,
      marketStatus: quote.marketStatus,
      currency: quote.currency,
      volume: quote.volume ?? null,
      positive: quote.change >= 0,
    }))
    .slice(0, 5);

  const payload = { stocks: results };
  setCacheValue(cacheKey, payload);
  return payload;
}

async function getHomePopular() {
  const cacheKey = 'homePopular';
  const cached = getCachedValue(cacheKey);
  if (cached) {
    return cached;
  }

  const summaries = await Promise.all(
    POPULAR_COMPANIES.map(async (company) => {
      const summary = await fetchQuoteSummary(company.symbol);
      return {
        symbol: company.symbol,
        name: company.name,
        industry: summary?.industry || '',
        description:
          summary?.description || `Track ${company.name} with live market pricing, industry momentum, and trusted performance context.`,
        marketCap: summary?.marketCap || null,
        currency: summary?.currency || 'INR',
        currentPrice: summary?.currentPrice || null,
        change: summary?.change || null,
        changePercent: summary?.changePercent || null,
        marketState: summary?.marketState || '',
        lastUpdated: summary?.lastUpdated || null,
      };
    }),
  );

  const payload = { companies: summaries.filter(Boolean).slice(0, 4) };
  setCacheValue(cacheKey, payload);
  return payload;
}

async function getHomeGainers() {
  const cacheKey = 'homeGainers';
  const cached = getCachedValue(cacheKey);
  if (cached) {
    return cached;
  }

  const quotes = await Promise.all(MARKET_MOVERS_SYMBOLS.map((symbol) => fetchQuote(symbol)));
  const sorted = quotes
    .filter(Boolean)
    .sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0))
    .slice(0, 5)
    .map((quote) => ({
      symbol: quote.symbol,
      name: quote.name,
      currentPrice: quote.currentPrice,
      change: quote.change,
      changePercent: quote.changePercent,
      marketState: quote.marketState,
      marketStatus: quote.marketStatus,
      currency: quote.currency,
      positive: quote.change >= 0,
      lastUpdated: quote.lastUpdated,
    }));

  const payload = { gainers: sorted };
  setCacheValue(cacheKey, payload);
  return payload;
}

async function getHomeLosers() {
  const cacheKey = 'homeLosers';
  const cached = getCachedValue(cacheKey);
  if (cached) {
    return cached;
  }

  const quotes = await Promise.all(MARKET_MOVERS_SYMBOLS.map((symbol) => fetchQuote(symbol)));
  const sorted = quotes
    .filter(Boolean)
    .sort((a, b) => (a.changePercent ?? 0) - (b.changePercent ?? 0))
    .slice(0, 5)
    .map((quote) => ({
      symbol: quote.symbol,
      name: quote.name,
      currentPrice: quote.currentPrice,
      change: quote.change,
      changePercent: quote.changePercent,
      marketState: quote.marketState,
      marketStatus: quote.marketStatus,
      currency: quote.currency,
      positive: quote.change >= 0,
      lastUpdated: quote.lastUpdated,
    }));

  const payload = { losers: sorted };
  setCacheValue(cacheKey, payload);
  return payload;
}

async function getMarketStatus() {
  const cacheKey = 'marketStatus';
  const cached = getCachedValue(cacheKey);
  if (cached) {
    return cached;
  }

  const quote = await fetchQuote('^NSEI');
  if (!quote) {
    throw new AppError('Unable to fetch market status', 502);
  }

  const payload = {
    marketState: quote.marketState,
    marketStatus: quote.marketStatus,
    lastUpdated: quote.lastUpdated,
    symbol: quote.symbol,
    currentPrice: quote.currentPrice,
  };

  setCacheValue(cacheKey, payload);
  return payload;
}

async function getFeaturedCompany() {
  const cacheKey = 'featuredCompany';
  const cached = getCachedValue(cacheKey);
  if (cached) {
    return cached;
  }

  const symbol = 'RELIANCE.NS';
  const summary = await fetchQuoteSummary(symbol);
  const quote = await fetchQuote(symbol);

  if (!summary || !quote) {
    throw new AppError('Unable to fetch featured company details', 502);
  }

  const payload = {
    symbol,
    name: summary.name,
    description: summary.description,
    currentPrice: quote.currentPrice,
    change: quote.change,
    changePercent: quote.changePercent,
    currency: quote.currency,
    marketCap: summary.marketCap,
    fiftyTwoWeekHigh: summary.fiftyTwoWeekHigh,
    fiftyTwoWeekLow: summary.fiftyTwoWeekLow,
    marketState: quote.marketState,
    marketStatus: quote.marketStatus,
    lastUpdated: quote.lastUpdated,
  };

  setCacheValue(cacheKey, payload);
  return payload;
}

module.exports = {
  getHomeOverview,
  getHomeTrending,
  getHomePopular,
  getHomeGainers,
  getHomeLosers,
  getMarketStatus,
  getFeaturedCompany,
};
