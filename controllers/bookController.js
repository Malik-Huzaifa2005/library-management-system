// =============================================================
// controllers/bookController.js
// Handles all CRUD operations for Books
// Uses MongoDB via Mongoose
// =============================================================

const Book = require('../models/Book');

// ── GET /api/books ─────────────────────────────────────────────
// Returns all books; supports search (?search=) and filter (?category=)
const getAllBooks = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    let filter = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ title: regex }, { author: regex }];
    }

    if (category && category !== 'all') {
      filter.category = new RegExp(`^${category}$`, 'i');
    }

    const books = await Book.find(filter).sort({ createdAt: -1 });

    // Map _id to id for frontend compatibility
    const data = books.map(b => ({ id: b._id, ...b.toObject(), _id: undefined }));

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/books/:id ─────────────────────────────────────────
const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      const err = new Error(`Book with ID '${req.params.id}' not found`);
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, data: { id: book._id, ...book.toObject(), _id: undefined } });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/books ────────────────────────────────────────────
const createBook = async (req, res, next) => {
  try {
    const { title, author, category, isbn, quantity, publishedYear, description } = req.body;

    if (!title || !author || !category) {
      const err = new Error('Title, Author, and Category are required fields');
      err.statusCode = 400;
      return next(err);
    }

    const qty = parseInt(quantity) || 1;

    const newBook = await Book.create({
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      isbn: isbn ? isbn.trim() : 'N/A',
      quantity: qty,
      available: qty,
      publishedYear: publishedYear ? parseInt(publishedYear) : null,
      description: description ? description.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Book added successfully!',
      data: { id: newBook._id, ...newBook.toObject(), _id: undefined },
    });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/books/:id ─────────────────────────────────────────
const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      const err = new Error(`Book with ID '${req.params.id}' not found`);
      err.statusCode = 404;
      return next(err);
    }

    const { title, author, category, isbn, quantity, publishedYear, description } = req.body;

    if (title) book.title = title.trim();
    if (author) book.author = author.trim();
    if (category) book.category = category.trim();
    if (isbn) book.isbn = isbn.trim();
    if (quantity !== undefined) book.quantity = parseInt(quantity);
    if (publishedYear) book.publishedYear = parseInt(publishedYear);
    if (description !== undefined) book.description = description.trim();

    await book.save();

    res.json({
      success: true,
      message: 'Book updated successfully!',
      data: { id: book._id, ...book.toObject(), _id: undefined },
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/books/:id ──────────────────────────────────────
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      const err = new Error(`Book with ID '${req.params.id}' not found`);
      err.statusCode = 404;
      return next(err);
    }

    res.json({
      success: true,
      message: `Book '${book.title}' deleted successfully!`,
      data: { id: book._id, ...book.toObject(), _id: undefined },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllBooks, getBookById, createBook, updateBook, deleteBook };
