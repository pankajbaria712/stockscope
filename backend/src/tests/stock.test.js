const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeSymbol, normalizeInterval, normalizeRange, buildHistoricalRequestConfig, buildStockErrorPayload, transformSearchResponse, buildCompanyHeaderPayload } = require('../services/stockService');

test('normalizeSymbol trims and uppercases ticker values', () => {
  assert.equal(normalizeSymbol(' aapl '), 'AAPL');
  assert.equal(normalizeSymbol('msft'), 'MSFT');
});

test('normalizeInterval maps UI filters to Yahoo-compatible chart resolutions', () => {
  assert.equal(normalizeInterval('1D'), '1d');
  assert.equal(normalizeInterval('1W'), '1wk');
  assert.equal(normalizeInterval('1M'), '1mo');
  assert.equal(normalizeInterval('3M'), '1mo');
  assert.equal(normalizeInterval('6M'), '1mo');
  assert.equal(normalizeInterval('1Y'), '1mo');
});

test('normalizeRange maps chart timeframes to Yahoo Finance periods', () => {
  assert.equal(normalizeRange('1D'), '1d');
  assert.equal(normalizeRange('5D'), '5d');
  assert.equal(normalizeRange('1M'), '1mo');
  assert.equal(normalizeRange('6M'), '6mo');
  assert.equal(normalizeRange('1Y'), '1y');
  assert.equal(normalizeRange('5Y'), '5y');
  assert.equal(normalizeRange('MAX'), 'max');
});

test('buildHistoricalRequestConfig selects a Yahoo Finance interval for each range', () => {
  const shortRangeConfig = buildHistoricalRequestConfig('1D');
  const mediumRangeConfig = buildHistoricalRequestConfig('1M');
  const longRangeConfig = buildHistoricalRequestConfig('5Y');
  const maxRangeConfig = buildHistoricalRequestConfig('MAX');

  assert.equal(shortRangeConfig.interval, '1m');
  assert.equal(mediumRangeConfig.interval, '1d');
  assert.equal(longRangeConfig.interval, '1wk');
  assert.equal(maxRangeConfig.interval, '1mo');
  assert.ok(shortRangeConfig.period1 < shortRangeConfig.period2);
});

test('buildStockErrorPayload keeps error responses consistent', () => {
  const payload = buildStockErrorPayload('Company not found', 404);
  assert.deepEqual(payload, {
    success: false,
    message: 'Company not found',
    statusCode: 404,
  });
});

test('transformSearchResponse handles Yahoo-style search payloads', () => {
  const payload = [
    { symbol: 'AAPL', shortname: 'Apple', exchange: 'NASDAQ', quoteType: 'EQUITY' },
    { symbol: 'MSFT', longname: 'Microsoft Corp.', exchange: 'NASDAQ', type: 'EQUITY' },
  ];

  const result = transformSearchResponse(payload);
  assert.equal(result[0].symbol, 'AAPL');
  assert.equal(result[1].companyName, 'Microsoft Corp.');
  assert.equal(result.length, 2);
});

test('buildCompanyHeaderPayload normalizes header values and derives market cap category', () => {
  const payload = buildCompanyHeaderPayload({
    symbol: ' aapl ',
    name: 'Apple Inc.',
    exchange: 'NASDAQ',
    country: 'US',
    sector: 'Technology',
    industry: 'Consumer Electronics',
    website: 'https://www.apple.com',
    marketCap: 3000000000000,
    currentPrice: 190.45,
    dayChange: 1.2,
    dayChangePercent: 0.63,
    volume: 1000000,
    beta: 1.28,
    fiftyTwoWeekHigh: 200,
    fiftyTwoWeekLow: 120,
    currency: 'USD',
    logo: '',
  });

  assert.equal(payload.symbol, 'AAPL');
  assert.equal(payload.marketCapCategory, 'Large Cap');
  assert.equal(payload.country, 'US');
  assert.equal(payload.currentPrice, 190.45);
  assert.equal(payload.beta, 1.28);
  assert.equal(payload.logo, null);
});
