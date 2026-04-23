// =============================================================
// routes/issueRoutes.js
// Defines all REST API routes for Issue/Return operations
// =============================================================

const express = require('express');
const router = express.Router();
const {
  getAllIssues,
  getIssueById,
  createIssue,
  returnBook,
  deleteIssue,
} = require('../controllers/issueController');

// GET    /api/issues         — get all issue records (with optional ?status= & ?search=)
router.get('/', getAllIssues);

// GET    /api/issues/:id     — get single issue record
router.get('/:id', getIssueById);

// POST   /api/issues         — issue a book to a member
router.post('/', createIssue);

// PUT    /api/issues/:id     — return a book (update status to Returned)
router.put('/:id', returnBook);

// DELETE /api/issues/:id     — delete an issue record
router.delete('/:id', deleteIssue);

module.exports = router;
