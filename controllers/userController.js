// =============================================================
// controllers/userController.js
// Handles all CRUD operations for Library Members/Users
// Reads/writes data to data/users.json using Node's fs module
// =============================================================

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Path to the users JSON file
const USERS_FILE = path.join(__dirname, '../data/users.json');

// ── Helper: Read users from JSON file ──────────────────────────
const readUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

// ── Helper: Write users to JSON file ───────────────────────────
const writeUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
};

// ── GET /api/users ─────────────────────────────────────────────
// Returns all users; supports search (?search=) and status filter
const getAllUsers = (req, res, next) => {
  try {
    let users = readUsers();
    const { search, status, membershipType } = req.query;

    // Filter by search term (name or email)
    if (search) {
      const term = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
      );
    }

    // Filter by status (Active/Inactive)
    if (status && status !== 'all') {
      users = users.filter(
        (u) => u.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Filter by membership type
    if (membershipType && membershipType !== 'all') {
      users = users.filter(
        (u) => u.membershipType.toLowerCase() === membershipType.toLowerCase()
      );
    }

    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/users/:id ─────────────────────────────────────────
// Returns a single user by ID
const getUserById = (req, res, next) => {
  try {
    const users = readUsers();
    const user = users.find((u) => u.id === req.params.id);

    if (!user) {
      const err = new Error(`User with ID '${req.params.id}' not found`);
      err.statusCode = 404;
      return next(err);
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/users ────────────────────────────────────────────
// Registers a new library member
const createUser = (req, res, next) => {
  try {
    const { name, email, phone, membershipType, address } = req.body;

    // Validate required fields
    if (!name || !email) {
      const err = new Error('Name and Email are required fields');
      err.statusCode = 400;
      return next(err);
    }

    const users = readUsers();

    // Check for duplicate email
    const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      const err = new Error('A member with this email already exists');
      err.statusCode = 409;
      return next(err);
    }

    // Build new user object
    const newUser = {
      id: 'u' + uuidv4().replace(/-/g, '').substring(0, 8),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : 'N/A',
      membershipType: membershipType || 'Standard',
      joinDate: new Date().toISOString(),
      status: 'Active',
      address: address ? address.trim() : '',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeUsers(users);

    res.status(201).json({
      success: true,
      message: 'Member registered successfully!',
      data: newUser,
    });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/users/:id ─────────────────────────────────────────
// Updates an existing member's details
const updateUser = (req, res, next) => {
  try {
    const users = readUsers();
    const index = users.findIndex((u) => u.id === req.params.id);

    if (index === -1) {
      const err = new Error(`User with ID '${req.params.id}' not found`);
      err.statusCode = 404;
      return next(err);
    }

    const { name, email, phone, membershipType, status, address } = req.body;

    const updatedUser = {
      ...users[index],
      name: name ? name.trim() : users[index].name,
      email: email ? email.trim().toLowerCase() : users[index].email,
      phone: phone ? phone.trim() : users[index].phone,
      membershipType: membershipType || users[index].membershipType,
      status: status || users[index].status,
      address: address !== undefined ? address.trim() : users[index].address,
      updatedAt: new Date().toISOString(),
    };

    users[index] = updatedUser;
    writeUsers(users);

    res.json({
      success: true,
      message: 'Member updated successfully!',
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/users/:id ──────────────────────────────────────
// Removes a member from the system
const deleteUser = (req, res, next) => {
  try {
    let users = readUsers();
    const index = users.findIndex((u) => u.id === req.params.id);

    if (index === -1) {
      const err = new Error(`User with ID '${req.params.id}' not found`);
      err.statusCode = 404;
      return next(err);
    }

    const deleted = users[index];
    users.splice(index, 1);
    writeUsers(users);

    res.json({
      success: true,
      message: `Member '${deleted.name}' removed successfully!`,
      data: deleted,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
