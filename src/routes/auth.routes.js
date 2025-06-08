const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller.js');

// Endpoint untuk registrasi user baru
router.post('/register', authController.register);

// Endpoint untuk login
router.post('/login', authController.login);

module.exports = router;