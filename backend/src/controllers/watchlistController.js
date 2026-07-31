const watchlistService = require('../services/watchlistService');
const { buildSuccessResponse } = require('../utils/response');
const { asyncHandler } = require('../utils/errors');

const addToWatchlist = asyncHandler(async (req, res) => {
  const payload = await watchlistService.addCompanyToWatchlist(req.user.id, req.body || {});
  res.status(200).json(buildSuccessResponse(200, 'Company added to watchlist', payload));
});

module.exports = {
  addToWatchlist,
};
