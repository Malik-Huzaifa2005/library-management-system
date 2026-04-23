// =============================================================
// routes/userRoutes.js
// Defines all REST API routes for Users/Members
// =============================================================

const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

// GET    /api/users          — get all users (with optional ?search= & ?status=)
router.get('/', getAllUsers);

// GET    /api/users/:id      — get single user by ID
router.get('/:id', getUserById);

// POST   /api/users          — register a new member
router.post('/', createUser);

// PUT    /api/users/:id      — update member details
router.put('/:id', updateUser);

// DELETE /api/users/:id      — remove a member
router.delete('/:id', deleteUser);

module.exports = router;
