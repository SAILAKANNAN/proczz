const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  image: { 
    type: String, // Store as base64 string instead of Buffer
    required: true 
  },
  contentType: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('QRCode', qrCodeSchema);