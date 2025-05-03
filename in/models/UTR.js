const mongoose = require('mongoose');

const utrSchema = new mongoose.Schema({
  utrNumber: { type: String, required: true, unique: true },
  withdrawalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Withdrawal', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UTR', utrSchema);