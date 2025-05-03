const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  duration: { type: String, required: true },
  interest: { type: Number, required: true },
  winningAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Plan', planSchema);