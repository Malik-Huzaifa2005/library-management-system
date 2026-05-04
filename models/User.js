const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  email:          { type: String, required: true, trim: true, lowercase: true, unique: true },
  phone:          { type: String, default: 'N/A', trim: true },
  membershipType: { type: String, default: 'Standard' },
  joinDate:       { type: Date, default: Date.now },
  status:         { type: String, default: 'Active', enum: ['Active', 'Inactive'] },
  address:        { type: String, default: '', trim: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
