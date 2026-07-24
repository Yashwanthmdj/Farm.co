const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: String,
  amount: Number,
  date: { type: Date, default: Date.now },
  note: String
});

module.exports = mongoose.model('Expense', expenseSchema);