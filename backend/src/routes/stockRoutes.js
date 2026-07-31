const express = require('express');
const stockController = require('../controllers/stockController');

const router = express.Router();

router.get('/search', stockController.searchStocks);
router.get('/company/:symbol', stockController.getCompanyDetails);
router.get('/company/:symbol/hub', stockController.getCompanyHubData);
router.get('/quote/:symbol', stockController.getStockQuote);
router.get('/chart/:symbol', stockController.getStockChart);

module.exports = router;
