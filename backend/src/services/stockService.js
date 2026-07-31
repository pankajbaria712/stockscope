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

function buildHistoricalRequestConfig(range, interval) {
  const normalizedRange = String(range || '1M').trim().toUpperCase();
  const finalInterval = chooseChartInterval(normalizedRange, interval);
  const rangeMap = {
    '1D': 1,
    '5D': 5,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
    '5Y': 1825,
    MAX: 3650,
  };

  const periodDays = rangeMap[normalizedRange] || rangeMap['1M'];
  return {
    period1: Math.max(0, Math.floor(Date.now() / 1000) - periodDays * 24 * 60 * 60),
    period2: Math.floor(Date.now() / 1000),
    interval: finalInterval,
  };
}

const SUPPORTED_INTERVALS = ['1m', '2m', '5m', '15m', '30m', '60m', '1d', '1wk', '1mo', 'D', 'W', 'M', '3M', '6M', '12M'];

function normalizeInterval(interval) {
  if (!interval) {
    return null;
  }

  const rawValue = String(interval || '').trim();
  if (['1M', 'M', '1mo', 'mo', 'm'].includes(rawValue)) {
    return '1mo';
  }

  const normalized = rawValue.toLowerCase();
  const intervalMap = {
    '1m': '1m',
    '2m': '2m',
    '5m': '5m',
    '15m': '15m',
    '30m': '30m',
    '60m': '60m',
    '1h': '60m',
    '1d': '1d',
    'd': '1d',
    '1w': '1wk',
    'wk': '1wk',
    '1wk': '1wk',
    '3m': '1mo',
    '6m': '1mo',
    '1y': '1mo',
    '12m': '1mo',
  };

  return intervalMap[normalized] || null;
}

function chooseChartInterval(range, interval) {
  const normalizedRange = String(range || '1M').trim().toUpperCase();
  const requested = normalizeInterval(interval);
  const defaultIntervalMap = {
    '1D': '1m',
    '5D': '5m',
    '1M': '1d',
    '3M': '1d',
    '6M': '1d',
    '1Y': '1wk',
    '5Y': '1wk',
    'MAX': '1mo',
  };
  const supportedByRange = {
    '1D': ['1m', '2m', '5m', '15m', '30m', '60m'],
    '5D': ['5m', '15m', '30m', '60m'],
    '1M': ['5m', '15m', '30m', '60m', '1d'],
    '3M': ['15m', '30m', '60m', '1d'],
    '6M': ['30m', '60m', '1d'],
    '1Y': ['1d', '1wk'],
    '5Y': ['1d', '1wk'],
    'MAX': ['1d', '1wk', '1mo'],
  };

  const allowed = supportedByRange[normalizedRange] || supportedByRange['1M'];
  if (requested && allowed.includes(requested)) {
    return requested;
  }
  if (!requested) {
    return defaultIntervalMap[normalizedRange] || defaultIntervalMap['1M'];
  }

  const requestedIndex = SUPPORTED_INTERVALS.indexOf(requested);
  if (requestedIndex === -1) {
    return defaultIntervalMap[normalizedRange] || defaultIntervalMap['1M'];
  }

  return allowed.reduce((nearest, candidate) => {
    const candidateIndex = SUPPORTED_INTERVALS.indexOf(candidate);
    if (candidateIndex === -1) return nearest;
    if (!nearest) return candidate;
    return Math.abs(candidateIndex - requestedIndex) < Math.abs(SUPPORTED_INTERVALS.indexOf(nearest) - requestedIndex) ? candidate : nearest;
  }, null) || defaultIntervalMap[normalizedRange] || defaultIntervalMap['1M'];
}

function buildStockErrorPayload(message, statusCode = 400) {
  return {
    success: false,
    message,
    statusCode,
  };
}

function deriveMarketCapCategory(marketCap) {
  const amount = Number(marketCap);
  if (!Number.isFinite(amount)) {
    return null;
  }

  if (amount >= 2e12) {
    return 'Large Cap';
  }

  if (amount >= 2e11) {
    return 'Mid Cap';
  }

  return 'Small Cap';
}

function buildCompanyHeaderPayload(payload = {}) {
  const symbol = normalizeSymbol(payload.symbol);
  const name = payload.name || payload.companyName || payload.shortName || payload.longName || symbol || 'Unknown company';
  const marketCap = payload.marketCap ?? payload.market_cap ?? null;
  const marketCapCategory = payload.marketCapCategory || deriveMarketCapCategory(marketCap);

  return {
    symbol,
    name,
    exchange: payload.exchange || null,
    country: payload.country || payload.defaultCountry || null,
    marketCapCategory,
    indexMembership: payload.indexMembership || payload.index || null,
    sector: payload.sector || null,
    industry: payload.industry || null,
    website: payload.website || payload.websiteUrl || null,
    logo: payload.logo || payload.logourl || null,
    currentPrice: payload.currentPrice ?? payload.regularMarketPrice ?? payload.price ?? null,
    dayChange: payload.dayChange ?? payload.change ?? null,
    dayChangePercent: payload.dayChangePercent ?? payload.changePercent ?? null,
    marketCap,
    fiftyTwoWeekHigh: payload.fiftyTwoWeekHigh ?? payload.week52High ?? null,
    fiftyTwoWeekLow: payload.fiftyTwoWeekLow ?? payload.week52Low ?? null,
    volume: payload.volume ?? null,
    beta: payload.beta ?? null,
    currency: payload.currency || 'USD',
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
    website: payload.website || payload.websiteUrl || '',
    longBusinessSummary: payload.longBusinessSummary || payload.description || '',
    marketCap: payload.marketCap || null,
    fullTimeEmployees: payload.fullTimeEmployees || payload.employees || null,
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
    currency: payload.currency || payload.currencySymbol || '',
    marketState: payload.marketState || payload.marketState || '',
    lastUpdated: payload.regularMarketTime ? new Date(payload.regularMarketTime * 1000).toISOString() : (payload.tradeTime ? new Date(payload.tradeTime).toISOString() : null),
    peRatio: payload.trailingPE ?? payload.peRatio ?? null,
    eps: payload.trailingEps ?? null,
    fiftyTwoWeekHigh: payload.fiftyTwoWeekHigh ?? payload.week52High ?? null,
    fiftyTwoWeekLow: payload.fiftyTwoWeekLow ?? payload.week52Low ?? null,
    averageVolume: payload.averageVolume ?? null,
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

function formatCurrencyValue(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return 'N/A';
  }

  const amount = Number(value);
  if (amount >= 1e12) {
    return `$${(amount / 1e12).toFixed(2)}T`;
  }
  if (amount >= 1e9) {
    return `$${(amount / 1e9).toFixed(2)}B`;
  }
  if (amount >= 1e6) {
    return `$${(amount / 1e6).toFixed(2)}M`;
  }

  return `$${amount.toFixed(2)}`;
}

function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return 'N/A';
  }

  return `${(Number(value) * 100).toFixed(2)}%`;
}

function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return 'N/A';
  }
  return Number(value).toLocaleString();
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

function buildCompanyHubData({ symbol, quote, company, summary = {} }) {
  const companyOfficers = company?.companyOfficers || summary?.summaryProfile?.companyOfficers || [];
  const summaryProfile = summary?.summaryProfile || {};
  const defaultKeyStatistics = summary?.defaultKeyStatistics || {};
  const financialData = summary?.financialData || {};
  const overview = {
    companyName: company?.name || company?.companyName || 'Unknown company',
    symbol: symbol || quote?.symbol || 'N/A',
    logo: company?.logo || '',
    exchange: company?.exchange || quote?.exchange || 'N/A',
    sector: company?.sector || summaryProfile?.sector || 'N/A',
    industry: company?.industry || summaryProfile?.industry || 'N/A',
    headquarters: [summaryProfile?.city, summaryProfile?.state, summaryProfile?.country].filter(Boolean).join(', ') || company?.city || company?.address1 || 'N/A',
    ceo: company?.ceo || companyOfficers?.[0]?.name || summaryProfile?.companyOfficers?.[0]?.name || 'N/A',
    foundedYear: company?.foundedYear || 'N/A',
    employees: company?.fullTimeEmployees || company?.employees || summaryProfile?.fullTimeEmployees || 'N/A',
    website: company?.website || summaryProfile?.website || '',
    marketCap: company?.marketCap || quote?.marketCap || null,
    enterpriseValue: defaultKeyStatistics?.enterpriseValue || null,
    peRatio: quote?.peRatio || defaultKeyStatistics?.trailingPE || null,
    forwardPe: quote?.forwardPe || defaultKeyStatistics?.forwardPE || null,
    eps: quote?.eps || defaultKeyStatistics?.trailingEps || null,
    bookValue: quote?.bookValue || defaultKeyStatistics?.bookValue || null,
    priceToBook: quote?.priceToBook || defaultKeyStatistics?.priceToBook || null,
    dividendYield: quote?.dividendYield || defaultKeyStatistics?.dividendYield || null,
    faceValue: defaultKeyStatistics?.faceValue || null,
    beta: quote?.beta || defaultKeyStatistics?.beta || null,
    roe: financialData?.returnOnEquity || null,
    roce: financialData?.returnOnAssets || null,
    debtToEquity: financialData?.debtToEquity || null,
    cashFlow: financialData?.operatingCashflow || null,
    revenue: financialData?.totalRevenue || null,
    netIncome: defaultKeyStatistics?.netIncomeToCommon || null,
    profitMargin: financialData?.profitMargins || null,
    sharesOutstanding: quote?.sharesOutstanding || defaultKeyStatistics?.sharesOutstanding || null,
    description: company?.longBusinessSummary || company?.description || summaryProfile?.longBusinessSummary || '',
    currency: quote?.currency || company?.currency || 'USD',
  };

  const technical = {
    indicators: [
      { label: 'Current Trend', value: quote?.change >= 0 ? 'Bullish' : 'Bearish', tone: quote?.change >= 0 ? 'positive' : 'negative' },
      { label: 'Moving Average 20', value: quote?.movingAverage20 || 'N/A', tone: 'neutral' },
      { label: 'Moving Average 50', value: quote?.movingAverage50 || 'N/A', tone: 'neutral' },
      { label: 'Moving Average 200', value: quote?.movingAverage200 || 'N/A', tone: 'neutral' },
      { label: 'RSI', value: quote?.rsi || 'N/A', tone: quote?.rsi > 70 ? 'negative' : quote?.rsi < 30 ? 'positive' : 'neutral' },
      { label: 'MACD', value: quote?.macd || 'N/A', tone: quote?.macd >= 0 ? 'positive' : 'negative' },
      { label: 'Momentum', value: quote?.momentum || 'N/A', tone: 'neutral' },
      { label: 'Volatility', value: quote?.volatility || 'N/A', tone: 'neutral' },
      { label: 'Support Level', value: quote?.supportLevel || 'N/A', tone: 'positive' },
      { label: 'Resistance Level', value: quote?.resistanceLevel || 'N/A', tone: 'negative' },
      { label: '52 Week High', value: quote?.fiftyTwoWeekHigh || 'N/A', tone: 'positive' },
      { label: '52 Week Low', value: quote?.fiftyTwoWeekLow || 'N/A', tone: 'negative' },
      { label: 'Average Volume', value: quote?.averageVolume || 'N/A', tone: 'neutral' },
      { label: 'Current Volume', value: quote?.volume || 'N/A', tone: 'neutral' },
      { label: 'High', value: quote?.high || 'N/A', tone: 'positive' },
      { label: 'Low', value: quote?.low || 'N/A', tone: 'negative' },
      { label: 'Open', value: quote?.open || 'N/A', tone: 'neutral' },
      { label: 'Previous Close', value: quote?.previousClose || 'N/A', tone: 'neutral' },
    ],
  };

  const financials = {
    metrics: [
      { label: 'Revenue', value: summary?.financialData?.totalRevenue || null, kind: 'currency' },
      { label: 'Net Profit', value: summary?.financialData?.netIncomeToCommon || null, kind: 'currency' },
      { label: 'Operating Income', value: summary?.financialData?.operatingIncome || null, kind: 'currency' },
      { label: 'EBITDA', value: summary?.financialData?.ebitda || null, kind: 'currency' },
      { label: 'Cash Flow', value: summary?.financialData?.operatingCashflow || null, kind: 'currency' },
      { label: 'Free Cash Flow', value: summary?.financialData?.freeCashflow || null, kind: 'currency' },
      { label: 'Assets', value: summary?.financialData?.totalAssets || null, kind: 'currency' },
      { label: 'Liabilities', value: summary?.financialData?.totalDebt || null, kind: 'currency' },
      { label: 'Equity', value: summary?.financialData?.totalCash || null, kind: 'currency' },
      { label: 'Growth Rate', value: summary?.financialData?.revenueGrowth || null, kind: 'percent' },
      { label: 'Operating Margin', value: summary?.financialData?.operatingMargins || null, kind: 'percent' },
      { label: 'Net Margin', value: summary?.financialData?.profitMargins || null, kind: 'percent' },
    ],
    quarterlyResults: summary?.earnings?.financialsChart?.quarterly || [],
    annualResults: summary?.earnings?.financialsChart?.yearly || [],
  };

  const fno = {
    available: false,
    message: 'F&O data is currently unavailable for this company.',
    summary: [],
  };

  const news = {
    items: [],
    search: '',
  };

  const events = {
    items: [],
    search: '',
  };

  return {
    overview,
    technical,
    financials,
    fno,
    news,
    events,
  };
}

async function getCompanyHubData(symbol) {
  const normalizedSymbol = normalizeSymbol(symbol);
  if (!normalizedSymbol) {
    throw new AppError('Please provide a stock symbol', 400);
  }

  try {
    const [quotePayload, summaryPayload] = await Promise.all([
      yahooFinance.quote(normalizedSymbol),
      yahooFinance.quoteSummary(normalizedSymbol, { modules: ['summaryProfile', 'financialData', 'defaultKeyStatistics', 'earnings'] }).catch(() => ({})),
    ]);

    const company = transformCompanyResponse(quotePayload);
    const quote = transformQuoteResponse(quotePayload);
    const summary = summaryPayload || {};
    const summaryProfile = summary?.summaryProfile || {};
    const financialData = summary?.financialData || {};
    const defaultKeyStatistics = summary?.defaultKeyStatistics || {};

    const enrichedQuote = {
      ...quote,
      exchange: quotePayload?.exchange || quote?.exchange || null,
      sector: summaryProfile?.sector || quotePayload?.sector || company?.sector || null,
      industry: summaryProfile?.industry || quotePayload?.industry || company?.industry || null,
      currency: quotePayload?.currency || quote?.currency || 'USD',
      website: summaryProfile?.website || quotePayload?.website || company?.website || '',
      marketCap: quotePayload?.marketCap ?? quote?.marketCap ?? null,
      sharesOutstanding: quotePayload?.sharesOutstanding ?? defaultKeyStatistics?.sharesOutstanding ?? null,
      bookValue: quotePayload?.bookValue ?? defaultKeyStatistics?.bookValue ?? null,
      peRatio: quotePayload?.trailingPE ?? defaultKeyStatistics?.trailingPE ?? null,
      eps: quotePayload?.trailingEps ?? defaultKeyStatistics?.trailingEps ?? null,
      beta: quotePayload?.beta ?? defaultKeyStatistics?.beta ?? null,
      dividendYield: quotePayload?.dividendYield ?? defaultKeyStatistics?.dividendYield ?? null,
      priceToBook: quotePayload?.priceToBook ?? defaultKeyStatistics?.priceToBook ?? null,
      forwardPe: quotePayload?.forwardPE ?? defaultKeyStatistics?.forwardPE ?? null,
      enterpriseValue: defaultKeyStatistics?.enterpriseValue ?? null,
      roe: financialData?.returnOnEquity ?? null,
      roce: financialData?.returnOnAssets ?? null,
      debtToEquity: financialData?.debtToEquity ?? null,
      cashFlow: financialData?.operatingCashflow ?? null,
      revenue: financialData?.totalRevenue ?? null,
      netIncome: defaultKeyStatistics?.netIncomeToCommon ?? null,
      profitMargin: financialData?.profitMargins ?? null,
      fullTimeEmployees: summaryProfile?.fullTimeEmployees || quotePayload?.fullTimeEmployees || null,
      longBusinessSummary: summaryProfile?.longBusinessSummary || company?.longBusinessSummary || '',
      address1: summaryProfile?.address1 || null,
      city: summaryProfile?.city || null,
      state: summaryProfile?.state || null,
      country: summaryProfile?.country || quotePayload?.country || company?.country || null,
    };

    return buildCompanyHubData({
      symbol: normalizedSymbol,
      quote: enrichedQuote,
      company: {
        ...(company || {}),
        ...(summaryProfile || {}),
        ...(enrichedQuote || {}),
      },
      summary,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    const fallbackCompany = getFallbackStockEntry(normalizedSymbol);
    if (fallbackCompany) {
      return buildCompanyHubData({
        symbol: normalizedSymbol,
        quote: {
          currentPrice: fallbackCompany.currentPrice,
          previousClose: fallbackCompany.previousClose,
          open: fallbackCompany.open,
          high: fallbackCompany.high,
          low: fallbackCompany.low,
          volume: fallbackCompany.volume,
          change: fallbackCompany.currentPrice - fallbackCompany.previousClose,
          changePercent: ((fallbackCompany.currentPrice - fallbackCompany.previousClose) / fallbackCompany.previousClose) * 100,
          marketState: 'REGULAR',
        },
        company: {
          name: fallbackCompany.companyName,
          exchange: fallbackCompany.exchange,
          sector: fallbackCompany.sector,
          industry: fallbackCompany.industry,
          website: fallbackCompany.website,
          longBusinessSummary: fallbackCompany.longBusinessSummary,
          marketCap: fallbackCompany.marketCap,
          fullTimeEmployees: fallbackCompany.fullTimeEmployees,
          currency: fallbackCompany.currency,
        },
        summary: {},
      });
    }

    return getYahooError(error);
  }
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
    // Fetch quote and summary to gather more detailed company metadata
    const [quotePayload, summaryPayload] = await Promise.all([
      yahooFinance.quote(normalizedSymbol),
      yahooFinance.quoteSummary(normalizedSymbol, { modules: ['summaryProfile', 'defaultKeyStatistics', 'financialData'] }).catch(() => ({})),
    ]);

    const companyFromQuote = transformCompanyResponse(quotePayload) || {};
    const summary = summaryPayload?.quoteSummary?.result?.[0] || {};

    const company = {
      symbol: companyFromQuote.symbol || normalizedSymbol,
      name: companyFromQuote.name || summary?.summaryProfile?.longName || companyFromQuote.symbol || normalizedSymbol,
      exchange: companyFromQuote.exchange || quotePayload?.exchange || null,
      sector: companyFromQuote.sector || summary?.summaryProfile?.sector || null,
      industry: companyFromQuote.industry || summary?.summaryProfile?.industry || null,
      country: companyFromQuote.country || summary?.summaryProfile?.country || null,
      website: companyFromQuote.website || summary?.summaryProfile?.website || null,
      longBusinessSummary: companyFromQuote.longBusinessSummary || summary?.summaryProfile?.longBusinessSummary || '',
      marketCap: quotePayload?.marketCap ?? summary?.defaultKeyStatistics?.marketCap ?? null,
      enterpriseValue: summary?.defaultKeyStatistics?.enterpriseValue ?? null,
      fullTimeEmployees: companyFromQuote.fullTimeEmployees || summary?.summaryProfile?.fullTimeEmployees || null,
      logo: companyFromQuote.logo || null,
      currency: companyFromQuote.currency || quotePayload?.currency || 'USD',
      peRatio: summary?.defaultKeyStatistics?.trailingPE ?? quotePayload?.trailingPE ?? null,
      eps: summary?.defaultKeyStatistics?.trailingEps ?? null,
      beta: summary?.defaultKeyStatistics?.beta ?? null,
      dividendYield: summary?.defaultKeyStatistics?.dividendYield ?? null,
      bookValue: summary?.defaultKeyStatistics?.bookValue ?? null,
      faceValue: summary?.defaultKeyStatistics?.faceValue ?? null,
      fiftyTwoWeekHigh: quotePayload?.fiftyTwoWeekHigh ?? summary?.summaryDetail?.fiftyTwoWeekHigh ?? null,
      fiftyTwoWeekLow: quotePayload?.fiftyTwoWeekLow ?? summary?.summaryDetail?.fiftyTwoWeekLow ?? null,
      currentPrice: quotePayload?.regularMarketPrice ?? quotePayload?.currentPrice ?? null,
      dayChange: quotePayload?.change ?? null,
      dayChangePercent: quotePayload?.changePercent ?? null,
      volume: quotePayload?.volume ?? null,
      indexMembership: summary?.summaryProfile?.index ?? null,
    };

    const headerPayload = buildCompanyHeaderPayload(company);

    if (!headerPayload.logo && company.website) {
      try {
        const url = new URL(company.website);
        const domain = url.hostname.replace(/^www\./, '');
        headerPayload.logo = `https://logo.clearbit.com/${domain}`;
      } catch (e) {
        // ignore invalid urls
      }
    }

    return headerPayload;

    // If logo missing but website available, attempt Clearbit logo by domain
    if (!company.logo && company.website) {
      try {
        const url = new URL(company.website);
        const domain = url.hostname.replace(/^www\./, '');
        company.logo = `https://logo.clearbit.com/${domain}`;
      } catch (e) {
        // ignore invalid urls
      }
    }

    return company;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    const fallbackCompany = getFallbackStockEntry(normalizedSymbol);
    if (fallbackCompany) {
      return buildCompanyHeaderPayload({
        symbol: fallbackCompany.symbol,
        name: fallbackCompany.companyName,
        exchange: fallbackCompany.exchange,
        sector: fallbackCompany.sector,
        industry: fallbackCompany.industry,
        country: fallbackCompany.country,
        website: fallbackCompany.website,
        marketCap: fallbackCompany.marketCap,
        currentPrice: fallbackCompany.currentPrice,
        dayChange: fallbackCompany.currentPrice - fallbackCompany.previousClose,
        dayChangePercent: ((fallbackCompany.currentPrice - fallbackCompany.previousClose) / fallbackCompany.previousClose) * 100,
        volume: fallbackCompany.volume,
        currency: fallbackCompany.currency,
        logo: null,
      });
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
  const requestedRange = String(options.range || '1M').trim().toUpperCase();
  const requestedInterval = String(options.interval || '').trim();
  const range = normalizeRange(requestedRange);

  if (!normalizedSymbol) {
    throw new AppError('Please provide a stock symbol', 400);
  }

  try {
    const requestConfig = buildHistoricalRequestConfig(requestedRange, requestedInterval);
    const chartResult = await yahooFinance.chart(normalizedSymbol, {
      period1: requestConfig.period1,
      period2: requestConfig.period2,
      interval: requestConfig.interval,
    });

    const quotes = Array.isArray(chartResult?.quotes) ? chartResult.quotes : [];
    const transformedBars = transformChartResponse(quotes.map((entry) => ({
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
      interval: requestConfig.interval,
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
  buildCompanyHeaderPayload,
  transformSearchResponse,
  normalizeSearchPayload,
  buildCompanyHubData,
  getCompanyHubData,
  searchStocks,
  getCompanyDetails,
  getStockQuote,
  getStockChart,
};
