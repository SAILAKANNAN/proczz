const mongoose = require('mongoose');

const upiSchema = new mongoose.Schema({
  upiId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UPI', upiSchema);