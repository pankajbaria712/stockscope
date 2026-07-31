const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeWatchlistPayload } = require('../services/watchlistService');

test('normalizeWatchlistPayload uppercases the symbol and preserves company metadata', () => {
  const payload = normalizeWatchlistPayload({
    symbol: ' aapl ',
    companyName: 'Apple Inc.',
    exchange: 'NASDAQ',
    sector: 'Technology',
    industry: 'Consumer Electronics',
  });

  assert.equal(payload.symbol, 'AAPL');
  assert.equal(payload.companyName, 'Apple Inc.');
  assert.equal(payload.exchange, 'NASDAQ');
  assert.equal(payload.sector, 'Technology');
  assert.equal(payload.industry, 'Consumer Electronics');
});

test('normalizeWatchlistPayload falls back to the provided name when companyName is missing', () => {
  const payload = normalizeWatchlistPayload({
    symbol: 'msft',
    name: 'Microsoft Corporation',
  });

  assert.equal(payload.symbol, 'MSFT');
  assert.equal(payload.companyName, 'Microsoft Corporation');
});
