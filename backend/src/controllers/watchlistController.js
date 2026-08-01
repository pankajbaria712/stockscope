const watchlistService = require('../services/watchlistService');
const { buildSuccessResponse } = require('../utils/response');
const { asyncHandler } = require('../utils/errors');

const addToWatchlist = asyncHandler(async (req, res) => {
  const payload = await watchlistService.addCompanyToWatchlist(req.user.id, req.body || {});
  res.status(200).json(buildSuccessResponse(200, 'Company added to watchlist', payload));
});

const getWatchlist = asyncHandler(async (req, res) => {
  const payload = await watchlistService.getWatchlist(req.user.id);
  res.status(200).json(buildSuccessResponse(200, 'Watchlist loaded', payload));
});

const removeFromWatchlist = asyncHandler(async (req, res) => {
  const payload = await watchlistService.removeFromWatchlist(req.user.id, req.params.symbol);
  res.status(200).json(buildSuccessResponse(200, 'Company removed from watchlist', payload));
});

module.exports = {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
};
