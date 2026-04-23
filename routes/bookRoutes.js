// =============================================================
// routes/bookRoutes.js
// Defines all REST API routes for Books
// =============================================================

const express = require('express');
const router = express.Router();
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} = require('../controllers/bookController');

// GET    /api/books          — get all books (with optional ?search= & ?category=)
router.get('/', getAllBooks);

// GET    /api/books/:id      — get single book by ID
router.get('/:id', getBookById);

// POST   /api/books          — add a new book
router.post('/', createBook);

// PUT    /api/books/:id      — update book details
router.put('/:id', updateBook);

// DELETE /api/books/:id      — remove a book
router.delete('/:id', deleteBook);

module.exports = router;
