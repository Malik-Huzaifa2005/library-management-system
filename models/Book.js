const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title:         { type: String, required: true, trim: true },
  author:        { type: String, required: true, trim: true },
  category:      { type: String, required: true, trim: true },
  isbn:          { type: String, default: 'N/A', trim: true },
  quantity:      { type: Number, default: 1, min: 0 },
  available:     { type: Number, default: 1, min: 0 },
  publishedYear: { type: Number, default: null },
  description:   { type: String, default: '', trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
