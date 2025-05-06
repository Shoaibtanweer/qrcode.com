// --- Authentication Routes ---
const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Example Protected Route (you would add more later)
// router.get('/me', authController.protect, (req, res) => {
//     // Access user data attached by protect middleware
//     res.status(200).json({ status: 'success', user: req.user });
// });

module.exports = router;