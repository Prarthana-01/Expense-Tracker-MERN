const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: String,
  amount: Number,
  date: Date,
});

module.exports = mongoose.model('Income', incomeSchema);
