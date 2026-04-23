// =============================================================
// middleware/logger.js
// Custom request logger middleware
// Logs method, URL, status code, and response time
// =============================================================

const logger = (req, res, next) => {
  const start = Date.now(); // Record start time

  // Listen for when response is finished
  res.on('finish', () => {
    const duration = Date.now() - start; // Calculate duration
    const timestamp = new Date().toISOString();

    // Color codes for console output
    const methodColors = {
      GET: '\x1b[32m',    // Green
      POST: '\x1b[34m',   // Blue
      PUT: '\x1b[33m',    // Yellow
      DELETE: '\x1b[31m', // Red
    };

    const statusColor =
      res.statusCode >= 500 ? '\x1b[31m' : // Red for 5xx
      res.statusCode >= 400 ? '\x1b[33m' : // Yellow for 4xx
      res.statusCode >= 300 ? '\x1b[36m' : // Cyan for 3xx
      '\x1b[32m';                           // Green for 2xx

    const reset = '\x1b[0m';
    const methodColor = methodColors[req.method] || '\x1b[37m';

    console.log(
      `[${timestamp}] ${methodColor}${req.method}${reset} ${req.originalUrl} ` +
      `${statusColor}${res.statusCode}${reset} - ${duration}ms`
    );
  });

  next(); // Pass control to next middleware
};

module.exports = logger;
