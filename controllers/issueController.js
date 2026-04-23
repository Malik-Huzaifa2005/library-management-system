// =============================================================
// controllers/issueController.js
// Handles Issue & Return of books
// Reads/writes to data/issues.json AND updates data/books.json
// to keep track of available copies
// =============================================================

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Paths to JSON files
const ISSUES_FILE = path.join(__dirname, '../data/issues.json');
const BOOKS_FILE  = path.join(__dirname, '../data/books.json');
const USERS_FILE  = path.join(__dirname, '../data/users.json');

// ── Helpers ────────────────────────────────────────────────────
const readJSON  = (file) => JSON.parse(fs.readFileSync(file, 'utf-8') || '[]');
const writeJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');

// ── GET /api/issues ────────────────────────────────────────────
// Returns all issue records; supports filtering by status
const getAllIssues = (req, res, next) => {
  try {
    let issues = readJSON(ISSUES_FILE);
    const { status, search } = req.query;

    // Filter by status (Issued / Returned)
    if (status && status !== 'all') {
      issues = issues.filter(
        (i) => i.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Search by book title or user name
    if (search) {
      const term = search.toLowerCase();
      issues = issues.filter(
        (i) =>
          i.bookTitle.toLowerCase().includes(term) ||
          i.userName.toLowerCase().includes(term)
      );
    }

    res.json({ success: true, count: issues.length, data: issues });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/issues/:id ─────────────────────────────────────────
const getIssueById = (req, res, next) => {
  try {
    const issues = readJSON(ISSUES_FILE);
    const issue = issues.find((i) => i.id === req.params.id);
    if (!issue) {
      const err = new Error(`Issue record '${req.params.id}' not found`);
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, data: issue });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/issues ────────────────────────────────────────────
// Issues a book to a member
// Decrements the book's "available" count
const createIssue = (req, res, next) => {
  try {
    const { bookId, userId, dueDate } = req.body;

    if (!bookId || !userId) {
      const err = new Error('Book ID and User ID are required');
      err.statusCode = 400;
      return next(err);
    }

    // Load all data
    const books  = readJSON(BOOKS_FILE);
    const users  = readJSON(USERS_FILE);
    const issues = readJSON(ISSUES_FILE);

    // Validate book exists and is available
    const bookIndex = books.findIndex((b) => b.id === bookId);
    if (bookIndex === -1) {
      const err = new Error('Book not found');
      err.statusCode = 404;
      return next(err);
    }
    if (books[bookIndex].available <= 0) {
      const err = new Error('No copies of this book are available for issue');
      err.statusCode = 400;
      return next(err);
    }

    // Validate user exists and is active
    const user = users.find((u) => u.id === userId);
    if (!user) {
      const err = new Error('Member not found');
      err.statusCode = 404;
      return next(err);
    }
    if (user.status !== 'Active') {
      const err = new Error('Inactive member cannot borrow books');
      err.statusCode = 400;
      return next(err);
    }

    // Check if member already has this book issued
    const alreadyIssued = issues.find(
      (i) => i.bookId === bookId && i.userId === userId && i.status === 'Issued'
    );
    if (alreadyIssued) {
      const err = new Error('This member already has this book issued');
      err.statusCode = 409;
      return next(err);
    }

    // Calculate due date (14 days from today if not provided)
    const issueDate = new Date();
    const computedDueDate = dueDate
      ? new Date(dueDate)
      : new Date(issueDate.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Create issue record
    const newIssue = {
      id: 'i' + uuidv4().replace(/-/g, '').substring(0, 8),
      bookId,
      bookTitle: books[bookIndex].title,
      userId,
      userName: user.name,
      issueDate: issueDate.toISOString(),
      dueDate: computedDueDate.toISOString(),
      returnDate: null,
      status: 'Issued',
      createdAt: issueDate.toISOString(),
    };

    // Decrement available count
    books[bookIndex].available -= 1;

    // Save everything
    issues.push(newIssue);
    writeJSON(ISSUES_FILE, issues);
    writeJSON(BOOKS_FILE, books);

    res.status(201).json({
      success: true,
      message: `'${books[bookIndex].title}' issued to ${user.name} successfully!`,
      data: newIssue,
    });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/issues/:id ─────────────────────────────────────────
// Returns a book — marks issue as Returned and increments available count
const returnBook = (req, res, next) => {
  try {
    const issues = readJSON(ISSUES_FILE);
    const books  = readJSON(BOOKS_FILE);

    const issueIndex = issues.findIndex((i) => i.id === req.params.id);
    if (issueIndex === -1) {
      const err = new Error(`Issue record '${req.params.id}' not found`);
      err.statusCode = 404;
      return next(err);
    }

    const issue = issues[issueIndex];

    // Prevent double return
    if (issue.status === 'Returned') {
      const err = new Error('This book has already been returned');
      err.statusCode = 400;
      return next(err);
    }

    // Mark as returned
    issues[issueIndex] = {
      ...issue,
      returnDate: new Date().toISOString(),
      status: 'Returned',
      updatedAt: new Date().toISOString(),
    };

    // Increment book's available count
    const bookIndex = books.findIndex((b) => b.id === issue.bookId);
    if (bookIndex !== -1) {
      books[bookIndex].available = Math.min(
        books[bookIndex].available + 1,
        books[bookIndex].quantity
      );
      writeJSON(BOOKS_FILE, books);
    }

    writeJSON(ISSUES_FILE, issues);

    res.json({
      success: true,
      message: `'${issue.bookTitle}' returned by ${issue.userName} successfully!`,
      data: issues[issueIndex],
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/issues/:id ──────────────────────────────────────
// Deletes an issue record (admin use)
const deleteIssue = (req, res, next) => {
  try {
    let issues = readJSON(ISSUES_FILE);
    const index = issues.findIndex((i) => i.id === req.params.id);

    if (index === -1) {
      const err = new Error(`Issue record '${req.params.id}' not found`);
      err.statusCode = 404;
      return next(err);
    }

    const deleted = issues[index];
    issues.splice(index, 1);
    writeJSON(ISSUES_FILE, issues);

    res.json({
      success: true,
      message: 'Issue record deleted successfully!',
      data: deleted,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllIssues, getIssueById, createIssue, returnBook, deleteIssue };
