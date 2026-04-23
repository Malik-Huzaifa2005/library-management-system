// =============================================================
// controllers/bookController.js
// Handles all CRUD operations for Books
// Reads/writes data to data/books.json using Node's fs module
// =============================================================

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Path to the books JSON file
const BOOKS_FILE = path.join(__dirname, '../data/books.json');

// ── Helper: Read books from JSON file ──────────────────────────
const readBooks = () => {
  try {
    const data = fs.readFileSync(BOOKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return []; // Return empty array if file doesn't exist or is corrupted
  }
};

// ── Helper: Write books to JSON file ───────────────────────────
const writeBooks = (books) => {
  fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2), 'utf-8');
};

// ── GET /api/books ─────────────────────────────────────────────
// Returns all books; supports search (?search=) and filter (?category=)
const getAllBooks = (req, res, next) => {
  try {
    let books = readBooks();
    const { search, category } = req.query;

    // Filter by search term (title or author)
    if (search) {
      const term = search.toLowerCase();
      books = books.filter(
        (b) =>
          b.title.toLowerCase().includes(term) ||
          b.author.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (category && category !== 'all') {
      books = books.filter(
        (b) => b.category.toLowerCase() === category.toLowerCase()
      );
    }

    res.json({ success: true, count: books.length, data: books });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/books/:id ─────────────────────────────────────────
// Returns a single book by ID
const getBookById = (req, res, next) => {
  try {
    const books = readBooks();
    const book = books.find((b) => b.id === req.params.id);

    if (!book) {
      const err = new Error(`Book with ID '${req.params.id}' not found`);
      err.statusCode = 404;
      return next(err);
    }

    res.json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/books ────────────────────────────────────────────
// Adds a new book to the collection
const createBook = (req, res, next) => {
  try {
    const { title, author, category, isbn, quantity, publishedYear, description } = req.body;

    // Validate required fields
    if (!title || !author || !category) {
      const err = new Error('Title, Author, and Category are required fields');
      err.statusCode = 400;
      return next(err);
    }

    const books = readBooks();
    const qty = parseInt(quantity) || 1;

    // Build new book object
    const newBook = {
      id: 'b' + uuidv4().replace(/-/g, '').substring(0, 8),
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      isbn: isbn ? isbn.trim() : 'N/A',
      quantity: qty,
      available: qty, // All copies available initially
      publishedYear: publishedYear ? parseInt(publishedYear) : null,
      description: description ? description.trim() : '',
      createdAt: new Date().toISOString(),
    };

    books.push(newBook);
    writeBooks(books);

    res.status(201).json({
      success: true,
      message: 'Book added successfully!',
      data: newBook,
    });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/books/:id ─────────────────────────────────────────
// Updates an existing book's details
const updateBook = (req, res, next) => {
  try {
    const books = readBooks();
    const index = books.findIndex((b) => b.id === req.params.id);

    if (index === -1) {
      const err = new Error(`Book with ID '${req.params.id}' not found`);
      err.statusCode = 404;
      return next(err);
    }

    const { title, author, category, isbn, quantity, publishedYear, description } = req.body;

    // Merge existing book with updated fields
    const updatedBook = {
      ...books[index],
      title: title ? title.trim() : books[index].title,
      author: author ? author.trim() : books[index].author,
      category: category ? category.trim() : books[index].category,
      isbn: isbn ? isbn.trim() : books[index].isbn,
      quantity: quantity !== undefined ? parseInt(quantity) : books[index].quantity,
      publishedYear: publishedYear ? parseInt(publishedYear) : books[index].publishedYear,
      description: description !== undefined ? description.trim() : books[index].description,
      updatedAt: new Date().toISOString(),
    };

    books[index] = updatedBook;
    writeBooks(books);

    res.json({
      success: true,
      message: 'Book updated successfully!',
      data: updatedBook,
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/books/:id ──────────────────────────────────────
// Removes a book from the collection
const deleteBook = (req, res, next) => {
  try {
    let books = readBooks();
    const index = books.findIndex((b) => b.id === req.params.id);

    if (index === -1) {
      const err = new Error(`Book with ID '${req.params.id}' not found`);
      err.statusCode = 404;
      return next(err);
    }

    const deleted = books[index];
    books.splice(index, 1);
    writeBooks(books);

    res.json({
      success: true,
      message: `Book '${deleted.title}' deleted successfully!`,
      data: deleted,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllBooks, getBookById, createBook, updateBook, deleteBook };
