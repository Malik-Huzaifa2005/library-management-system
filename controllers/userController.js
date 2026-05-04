// =============================================================
// controllers/userController.js
// Handles all CRUD operations for Library Members/Users
// Uses MongoDB via Mongoose
// =============================================================

const User = require('../models/User');

// ── GET /api/users ─────────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const { search, status, membershipType } = req.query;
    let filter = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }

    if (status && status !== 'all') {
      filter.status = new RegExp(`^${status}$`, 'i');
    }

    if (membershipType && membershipType !== 'all') {
      filter.membershipType = new RegExp(`^${membershipType}$`, 'i');
    }

    const users = await User.find(filter).sort({ createdAt: -1 });
    const data = users.map(u => ({ id: u._id, ...u.toObject(), _id: undefined }));

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/users/:id ─────────────────────────────────────────
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      const err = new Error(`User with ID '${req.params.id}' not found`);
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, data: { id: user._id, ...user.toObject(), _id: undefined } });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/users ────────────────────────────────────────────
const createUser = async (req, res, next) => {
  try {
    const { name, email, phone, membershipType, address } = req.body;

    if (!name || !email) {
      const err = new Error('Name and Email are required fields');
      err.statusCode = 400;
      return next(err);
    }

    // Check for duplicate email
    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists) {
      const err = new Error('A member with this email already exists');
      err.statusCode = 409;
      return next(err);
    }

    const newUser = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : 'N/A',
      membershipType: membershipType || 'Standard',
      joinDate: new Date(),
      status: 'Active',
      address: address ? address.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Member registered successfully!',
      data: { id: newUser._id, ...newUser.toObject(), _id: undefined },
    });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/users/:id ─────────────────────────────────────────
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      const err = new Error(`User with ID '${req.params.id}' not found`);
      err.statusCode = 404;
      return next(err);
    }

    const { name, email, phone, membershipType, status, address } = req.body;

    if (name) user.name = name.trim();
    if (email) user.email = email.trim().toLowerCase();
    if (phone) user.phone = phone.trim();
    if (membershipType) user.membershipType = membershipType;
    if (status) user.status = status;
    if (address !== undefined) user.address = address.trim();

    await user.save();

    res.json({
      success: true,
      message: 'Member updated successfully!',
      data: { id: user._id, ...user.toObject(), _id: undefined },
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/users/:id ──────────────────────────────────────
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      const err = new Error(`User with ID '${req.params.id}' not found`);
      err.statusCode = 404;
      return next(err);
    }

    res.json({
      success: true,
      message: `Member '${user.name}' removed successfully!`,
      data: { id: user._id, ...user.toObject(), _id: undefined },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
