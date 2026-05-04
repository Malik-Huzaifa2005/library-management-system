const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  bookId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  bookTitle:  { type: String, required: true },
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName:   { type: String, required: true },
  issueDate:  { type: Date, default: Date.now },
  dueDate:    { type: Date, required: true },
  returnDate: { type: Date, default: null },
  status:     { type: String, default: 'Issued', enum: ['Issued', 'Returned'] },
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);
