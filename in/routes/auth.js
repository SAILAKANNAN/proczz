const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Login page
router.get('/login', (req, res) => {
  res.render('login.html');
});

// Register page
router.get('/register', (req, res) => {
  res.render('register.html');
});

// Login handler
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;
  
  try {
    // Check for admin login
    if (phone === 'kanna' && password === 'kanna') {
      req.session.isAdmin = true;
      return res.redirect('/admin');
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).send('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }

    req.session.userId = user._id;
    req.session.phone = user.phone;
    req.session.isAdmin = user.isAdmin;
    
    if (user.isAdmin) {
      return res.redirect('/admin');
    } else {
      return res.redirect('/user/home');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Register handler
router.post('/register', async (req, res) => {
  const { phone, name, password } = req.body;
  
  try {
    let user = await User.findOne({ phone });
    if (user) {
      return res.status(400).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    user = new User({
      phone,
      name,
      password: hashedPassword,
      balance: 0,
      isAdmin: false
    });

    await user.save();
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;