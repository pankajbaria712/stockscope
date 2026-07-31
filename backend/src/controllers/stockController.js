const stockService = require('../services/stockService');
const { buildSuccessResponse } = require('../utils/response');
const { asyncHandler } = require('../utils/errors');

const searchStocks = asyncHandler(async (req, res) => {
  const payload = await stockService.searchStocks(req.query.q);
  res.status(200).json(buildSuccessResponse(200, 'Stock search completed', payload));
});

const getCompanyDetails = asyncHandler(async (req, res) => {
  const payload = await stockService.getCompanyDetails(req.params.symbol);
  res.status(200).json(buildSuccessResponse(200, 'Company details loaded', payload));
});

const getStockQuote = asyncHandler(async (req, res) => {
  const payload = await stockService.getStockQuote(req.params.symbol);
  res.status(200).json(buildSuccessResponse(200, 'Quote loaded', payload));
});

const getStockChart = asyncHandler(async (req, res) => {
  const payload = await stockService.getStockChart(req.params.symbol, {
    range: req.query.range,
    interval: req.query.interval,
    outputsize: req.query.outputsize,
  });

  res.status(200).json(buildSuccessResponse(200, 'Chart data loaded', payload));
});

const getCompanyHubData = asyncHandler(async (req, res) => {
  const payload = await stockService.getCompanyHubData(req.params.symbol);
  res.status(200).json(buildSuccessResponse(200, 'Company hub data loaded', payload));
});

module.exports = {
  searchStocks,
  getCompanyDetails,
  getStockQuote,
  getStockChart,
  getCompanyHubData,
};
