const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeSymbol, normalizeInterval, buildStockErrorPayload, transformSearchResponse } = require('../services/stockService');

test('normalizeSymbol trims and uppercases ticker values', () => {
  assert.equal(normalizeSymbol(' aapl '), 'AAPL');
  assert.equal(normalizeSymbol('msft'), 'MSFT');
});

test('normalizeInterval maps UI filters to Finnhub-compatible resolutions', () => {
  assert.equal(normalizeInterval('1D'), 'D');
  assert.equal(normalizeInterval('1W'), 'W');
  assert.equal(normalizeInterval('1M'), 'M');
  assert.equal(normalizeInterval('3M'), '3M');
  assert.equal(normalizeInterval('6M'), '6M');
  assert.equal(normalizeInterval('1Y'), '12M');
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
