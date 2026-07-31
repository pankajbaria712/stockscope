const test = require('node:test');
const assert = require('node:assert/strict');

const { buildCompanyHubData } = require('../services/stockService');

test('buildCompanyHubData maps quote and company summary values into a structured hub payload', () => {
  const payload = buildCompanyHubData({
    symbol: 'AAPL',
    quote: {
      currentPrice: 195.2,
      change: 1.4,
      changePercent: 0.72,
      previousClose: 193.8,
      open: 194.1,
      high: 196.2,
      low: 193.4,
      volume: 41250000,
      marketState: 'REGULAR',
      fiftyTwoWeekHigh: 199.62,
      fiftyTwoWeekLow: 164.08,
      averageVolume: 54300000,
    },
    company: {
      name: 'Apple Inc.',
      exchange: 'NASDAQ',
      sector: 'Technology',
      industry: 'Consumer Electronics',
      website: 'https://www.apple.com',
      longBusinessSummary: 'Apple designs and sells consumer electronics, software, and services.',
      marketCap: 3000000000000,
      fullTimeEmployees: 164000,
      currency: 'USD',
      country: 'US',
      address1: 'One Apple Park Way',
      city: 'Cupertino',
      state: 'CA',
      zip: '95014',
    },
    summary: {
      financialData: {
        currentPrice: 195.2,
        returnOnEquity: 0.55,
        debtToEquity: 1.3,
        freeCashflow: 96000000000,
        operatingCashflow: 110000000000,
        ebitdaMargins: 0.31,
        operatingMargins: 0.31,
        profitMargins: 0.25,
        revenueGrowth: 0.08,
        earningsGrowth: 0.11,
        grossMargins: 0.46,
      },
      defaultKeyStatistics: {
        beta: 1.25,
        dividendYield: 0.0052,
        bookValue: 4.67,
        priceToBook: 41.8,
        forwardPE: 27.4,
        trailingPE: 31.2,
        sharesOutstanding: 15600000000,
        enterpriseValue: 3150000000000,
        earningsQuarterlyGrowth: 0.11,
      },
      summaryProfile: {
        fullTimeEmployees: 164000,
        address1: 'One Apple Park Way',
        city: 'Cupertino',
        state: 'CA',
        zip: '95014',
        country: 'US',
        industry: 'Consumer Electronics',
        sector: 'Technology',
        website: 'https://www.apple.com',
        businessSummary: 'Apple designs and sells consumer electronics, software, and services.',
        companyOfficers: [{ name: 'Tim Cook', title: 'CEO' }],
        longBusinessSummary: 'Apple designs and sells consumer electronics, software, and services.',
      },
      earnings: {
        financialsChart: {
          yearly: [{ revenue: 394328000000, earnings: 99803000000 }],
        },
      },
      price: {
        averageVolume10days: 54200000,
      },
    },
  });

  assert.equal(payload.overview.companyName, 'Apple Inc.');
  assert.equal(payload.overview.symbol, 'AAPL');
  assert.equal(payload.overview.ceo, 'Tim Cook');
  assert.equal(payload.technical.indicators[0].label, 'Current Trend');
  assert.equal(payload.financials.metrics[0].label, 'Revenue');
  assert.equal(payload.events.items.length, 0);
});
