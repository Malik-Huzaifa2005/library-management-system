// =============================================================
// controllers/issueController.js
// Handles Issue & Return of books
// Uses MongoDB via Mongoose
// =============================================================

const Book = require('../models/Book');
const User = require('../models/User');
const Issue = require('../models/Issue');

// ── GET /api/issues ────────────────────────────────────────────
const getAllIssues = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let filter = {};

    if (status && status !== 'all') {
      filter.status = new RegExp(`^${status}$`, 'i');
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ bookTitle: regex }, { userName: regex }];
    }

    const issues = await Issue.find(filter).sort({ createdAt: -1 });
    const data = issues.map(i => ({ id: i._id, ...i.toObject(), _id: undefined }));

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/issues/:id ─────────────────────────────────────────
const getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      const err = new Error(`Issue record '${req.params.id}' not found`);
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, data: { id: issue._id, ...issue.toObject(), _id: undefined } });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/issues ────────────────────────────────────────────
const createIssue = async (req, res, next) => {
  try {
    const { bookId, userId, dueDate } = req.body;

    if (!bookId || !userId) {
      const err = new Error('Book ID and User ID are required');
      err.statusCode = 400;
      return next(err);
    }

    // Validate book exists and is available
    const book = await Book.findById(bookId);
    if (!book) {
      const err = new Error('Book not found');
      err.statusCode = 404;
      return next(err);
    }
    if (book.available <= 0) {
      const err = new Error('No copies of this book are available for issue');
      err.statusCode = 400;
      return next(err);
    }

    // Validate user exists and is active
    const user = await User.findById(userId);
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
    const alreadyIssued = await Issue.findOne({
      bookId, userId, status: 'Issued'
    });
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
    const newIssue = await Issue.create({
      bookId,
      bookTitle: book.title,
      userId,
      userName: user.name,
      issueDate,
      dueDate: computedDueDate,
      status: 'Issued',
    });

    // Decrement available count
    book.available -= 1;
    await book.save();

    res.status(201).json({
      success: true,
      message: `'${book.title}' issued to ${user.name} successfully!`,
      data: { id: newIssue._id, ...newIssue.toObject(), _id: undefined },
    });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/issues/:id ─────────────────────────────────────────
const returnBook = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      const err = new Error(`Issue record '${req.params.id}' not found`);
      err.statusCode = 404;
      return next(err);
    }

    if (issue.status === 'Returned') {
      const err = new Error('This book has already been returned');
      err.statusCode = 400;
      return next(err);
    }

    // Mark as returned
    issue.returnDate = new Date();
    issue.status = 'Returned';
    await issue.save();

    // Increment book's available count
    const book = await Book.findById(issue.bookId);
    if (book) {
      book.available = Math.min(book.available + 1, book.quantity);
      await book.save();
    }

    res.json({
      success: true,
      message: `'${issue.bookTitle}' returned by ${issue.userName} successfully!`,
      data: { id: issue._id, ...issue.toObject(), _id: undefined },
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/issues/:id ──────────────────────────────────────
const deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) {
      const err = new Error(`Issue record '${req.params.id}' not found`);
      err.statusCode = 404;
      return next(err);
    }

    res.json({
      success: true,
      message: 'Issue record deleted successfully!',
      data: { id: issue._id, ...issue.toObject(), _id: undefined },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllIssues, getIssueById, createIssue, returnBook, deleteIssue };
