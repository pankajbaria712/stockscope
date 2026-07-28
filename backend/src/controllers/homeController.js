const homeService = require('../services/homeService');
const { buildSuccessResponse } = require('../utils/response');
const { asyncHandler } = require('../utils/errors');

const getOverview = asyncHandler(async (req, res) => {
  const payload = await homeService.getHomeOverview();
  res.status(200).json(buildSuccessResponse(200, 'Homepage overview loaded', payload));
});

const getTrending = asyncHandler(async (req, res) => {
  const payload = await homeService.getHomeTrending();
  res.status(200).json(buildSuccessResponse(200, 'Trending stocks loaded', payload));
});

const getPopular = asyncHandler(async (req, res) => {
  const payload = await homeService.getHomePopular();
  res.status(200).json(buildSuccessResponse(200, 'Popular companies loaded', payload));
});

const getGainers = asyncHandler(async (req, res) => {
  const payload = await homeService.getHomeGainers();
  res.status(200).json(buildSuccessResponse(200, 'Top gainers loaded', payload));
});

const getLosers = asyncHandler(async (req, res) => {
  const payload = await homeService.getHomeLosers();
  res.status(200).json(buildSuccessResponse(200, 'Top losers loaded', payload));
});

const getMarketStatus = asyncHandler(async (req, res) => {
  const payload = await homeService.getMarketStatus();
  res.status(200).json(buildSuccessResponse(200, 'Market status loaded', payload));
});

const getFeatured = asyncHandler(async (req, res) => {
  const payload = await homeService.getFeaturedCompany();
  res.status(200).json(buildSuccessResponse(200, 'Featured company loaded', payload));
});

module.exports = {
  getOverview,
  getTrending,
  getPopular,
  getGainers,
  getLosers,
  getMarketStatus,
  getFeatured,
};
