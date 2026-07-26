const { validationResult } = require('express-validator');
const { buildErrorResponse } = require('../utils/response');

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(
      buildErrorResponse(400, 'Validation failed', errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      }))),
    );
  }

  next();
}

module.exports = validateRequest;
