function buildSuccessResponse(statusCode, message, data = null) {
  return {
    success: true,
    message,
    data,
    statusCode,
  };
}

function buildErrorResponse(statusCode, message, errors = null) {
  return {
    success: false,
    message,
    errors,
    statusCode,
  };
}

module.exports = {
  buildSuccessResponse,
  buildErrorResponse,
};
