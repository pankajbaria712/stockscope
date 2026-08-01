const express = require('express');
const watchlistController = require('../controllers/watchlistController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, watchlistController.getWatchlist);
router.post('/', protect, watchlistController.addToWatchlist);
router.delete('/:symbol', protect, watchlistController.removeFromWatchlist);

module.exports = router;
