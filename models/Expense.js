const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: String,
  amount: Number,
  date: Date,
  description: String,
});

module.exports = mongoose.model('Expense', expenseSchema);
