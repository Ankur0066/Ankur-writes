function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  console.error(error);
  const status = error.statusCode || 500;
  res.status(status).json({
    error: {
      code: error.code || 'INTERNAL_SERVER_ERROR',
      message: status === 500 ? 'An unexpected error occurred.' : error.message,
    },
  });
}

module.exports = errorHandler;
