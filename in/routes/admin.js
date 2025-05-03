const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const QRCode = require('../models/QRCode');
const UPI = require('../models/UPI');
const Plan = require('../models/Plan');
const Withdrawal = require('../models/Withdrawal');
const UTR = require('../models/UTR');

// Admin middleware
router.use((req, res, next) => {
  if (!req.session.isAdmin) {
    return res.redirect('/login');
  }
  next();
});

// Admin dashboard
router.get('/', (req, res) => {
  res.render('admin.html');
});

// QR Code management
// QR Code management
router.get('/qr', async (req, res) => {
  try {
    const qrCodes = await QRCode.find().sort({ createdAt: -1 });
    res.render('admin/qr.html', { qrCodes });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/qr', upload.single('qrImage'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send('No file uploaded');
    }

    // Convert the buffer to base64
    const base64Image = file.buffer.toString('base64');

    const qrCode = new QRCode({
      image: base64Image,
      contentType: file.mimetype
    });

    await qrCode.save();
    res.redirect('/admin/qr');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
// Delete QR Code
router.post('/qr/delete/:id', async (req, res) => {
  try {
    await QRCode.findByIdAndDelete(req.params.id);
    res.redirect('/admin/qr');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
// UPI management
router.get('/upi', async (req, res) => {
  const upi = await UPI.findOne().sort({ createdAt: -1 });
  res.render('admin/upi.html', { upi });
});

router.post('/upi', async (req, res) => {
  const { upiId } = req.body;
  
  try {
    const upi = new UPI({ upiId });
    await upi.save();
    res.redirect('/admin/upi');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// User management
router.get('/users', async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.render('admin/users.html', { users });
});

router.post('/users/add-balance', async (req, res) => {
  const { userId, amount } = req.body;
  
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    user.balance += parseFloat(amount);
    await user.save();
    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/users/delete', async (req, res) => {
  const { userId } = req.body;
  
  try {
    await User.findByIdAndDelete(userId);
    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Plan management
router.get('/plans', async (req, res) => {
  const plans = await Plan.find().sort({ createdAt: -1 });
  res.render('admin/plans.html', { plans });
});

router.post('/plans', async (req, res) => {
  const { amount, duration, interest, winningAmount } = req.body;
  
  try {
    const plan = new Plan({
      amount,
      duration,
      interest,
      winningAmount
    });

    await plan.save();
    res.redirect('/admin/plans');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Withdrawal management
router.get('/withdrawals', async (req, res) => {
  const withdrawals = await Withdrawal.find()
    .populate('userId', 'phone name')
    .sort({ createdAt: -1 });
  res.render('admin/withdrawals.html', { withdrawals });
});

// UTR management
router.get('/utrs', async (req, res) => {
  const utrs = await UTR.find()
    .populate('withdrawalId')
    .sort({ createdAt: -1 });
  res.render('admin/utrs.html', { utrs });
});

router.post('/utrs', async (req, res) => {
  const { withdrawalId, utrNumber } = req.body;
  
  try {
    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).send('Withdrawal not found');
    }

    withdrawal.status = 'completed';
    await withdrawal.save();

    const utr = new UTR({
      utrNumber,
      withdrawalId
    });

    await utr.save();
    res.redirect('/admin/withdrawals');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
// Add this to your admin routes
router.get('/withdrawals/download/:id', async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal || !withdrawal.qrImage) {
      return res.status(404).send('QR code not found');
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(withdrawal.qrImage, 'base64');
    
    // Set headers for download
    res.set({
      'Content-Type': withdrawal.contentType,
      'Content-Disposition': `attachment; filename="withdrawal_qr_${withdrawal.phone}.png"`,
      'Content-Length': imageBuffer.length
    });
    
    // Send the image
    res.send(imageBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
module.exports = router;