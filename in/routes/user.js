const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const QRCode = require('../models/QRCode');
const UPI = require('../models/UPI');
const Plan = require('../models/Plan');
const Withdrawal = require('../models/Withdrawal');

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// User middleware
router.use((req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
});

// User home
router.get('/home', async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const plans = await Plan.find().sort({ createdAt: -1 });
    const qrCodes = await QRCode.find().sort({ createdAt: -1 });
    const upi = await UPI.findOne().sort({ createdAt: -1 });
    
    res.render('user/home.html', {
      user,
      plans,
      qrCodes,
      upi
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Withdrawal
router.get('/withdraw', async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    res.render('user/withdraw.html', { user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/withdraw', upload.single('qrImage'), async (req, res) => {
  const { amount, phone } = req.body;
  const file = req.file;
  
  try {
    const user = await User.findById(req.session.userId);
    if (user.balance < parseFloat(amount)) {
      return res.status(400).send('Insufficient balance');
    }

    let qrImage = null;
    let contentType = null;

    if (file) {
      qrImage = file.buffer.toString('base64');
      contentType = file.mimetype;
    }

    const withdrawal = new Withdrawal({
      userId: user._id,
      amount,
      phone,
      qrImage,
      contentType,
      status: 'pending'
    });

    await withdrawal.save();
    
    // Deduct from user balance
    user.balance -= parseFloat(amount);
    await user.save();
    
    res.redirect('/user/home');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Deposit
router.get('/deposit', async (req, res) => {
  try {
    const qrCodes = await QRCode.find().sort({ createdAt: -1 });
    const upi = await UPI.findOne().sort({ createdAt: -1 });
    
    res.render('user/deposit.html', {
      qrCodes,
      upi
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;