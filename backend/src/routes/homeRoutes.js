const express = require('express');
const homeController = require('../controllers/homeController');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome to Stockscope API', statusCode: 200 });
});
router.get('/overview', homeController.getOverview);
router.get('/trending', homeController.getTrending);
router.get('/popular', homeController.getPopular);
router.get('/gainers', homeController.getGainers);
router.get('/losers', homeController.getLosers);
router.get('/market-status', homeController.getMarketStatus);
router.get('/featured', homeController.getFeatured);

module.exports = router;
