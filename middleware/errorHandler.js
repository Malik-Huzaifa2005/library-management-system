// =============================================================
// middleware/errorHandler.js
// Global error handling middleware
// Catches all errors passed via next(err) and returns JSON response
// =============================================================

const errorHandler = (err, req, res, next) => {
  // Log the full error stack to console for debugging
  console.error('\x1b[31m[ERROR]\x1b[0m', err.stack || err.message);

  // Determine HTTP status code (default to 500 if not set)
  const statusCode = err.statusCode || err.status || 500;

  // Send structured JSON error response
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Only show stack trace in development mode
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
