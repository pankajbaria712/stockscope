const { verifyToken } = require('../services/authService');
const { buildErrorResponse } = require('../utils/response');
const userModel = require('../models/userModel');

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json(buildErrorResponse(401, 'Authentication token missing'));
    }

    const decoded = verifyToken(token);
    const user = await userModel.findUserById(decoded.sub);

    if (!user) {
      return res.status(401).json(buildErrorResponse(401, 'User no longer exists'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json(buildErrorResponse(401, 'Invalid or expired token'));
    }

    next(error);
  }
}

module.exports = protect;
