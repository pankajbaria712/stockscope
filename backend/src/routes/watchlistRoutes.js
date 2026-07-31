const express = require('express');
const watchlistController = require('../controllers/watchlistController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, watchlistController.addToWatchlist);

module.exports = router;
