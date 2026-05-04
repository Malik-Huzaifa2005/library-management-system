// =============================================================
// server.js
// Main entry point for the Library Management System backend
// Configures Express, middleware, routes, MongoDB, and starts the server
// =============================================================

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const mongoose = require('mongoose');

// Import custom middleware
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

// Import route modules
const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/userRoutes');
const issueRoutes = require('./routes/issueRoutes');

// ── Initialize Express App ─────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware Setup ───────────────────────────────────────────

// Enable CORS for all origins (needed when frontend & backend are on same server)
app.use(cors());

// Parse incoming JSON request bodies
app.use(bodyParser.json());

// Parse URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));

// Morgan HTTP request logger (uses 'dev' format — compact, colorful)
app.use(morgan('dev'));

// Custom logger middleware (logs method, URL, status, duration)
app.use(logger);

// Serve static frontend files from the /public directory
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ─────────────────────────────────────────────────
// All API routes are prefixed with /api
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/issues', issueRoutes);

// ── Health Check Route ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Library Management System API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ── Catch-all: serve index.html for unknown routes ─────────────
// This allows the frontend to handle its own navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Global Error Handler (must be LAST middleware) ─────────────
app.use(errorHandler);

// ── Connect to MongoDB, then Start Server ──────────────────────
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('\x1b[31m✖ MONGODB_URI not found in environment variables!\x1b[0m');
  console.error('  Please set MONGODB_URI in your .env file');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('\x1b[32m✔ Connected to MongoDB Atlas\x1b[0m');

    app.listen(PORT, () => {
      console.log('\x1b[36m%s\x1b[0m', '━'.repeat(50));
      console.log('\x1b[32m✔ Library Management System\x1b[0m');
      console.log(`\x1b[36m  Server running on: http://localhost:${PORT}\x1b[0m`);
      console.log(`\x1b[36m  API Base URL:      http://localhost:${PORT}/api\x1b[0m`);
      console.log(`\x1b[36m  Database:          MongoDB Atlas\x1b[0m`);
      console.log(`\x1b[36m  Environment:       ${process.env.NODE_ENV || 'development'}\x1b[0m`);
      console.log('\x1b[36m%s\x1b[0m', '━'.repeat(50));
    });
  })
  .catch((err) => {
    console.error('\x1b[31m✖ MongoDB connection failed:\x1b[0m', err.message);
    process.exit(1);
  });

module.exports = app;
