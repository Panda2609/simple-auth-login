const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Rutas públicas (sin autenticación)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rutas protegidas (requieren token válido)
router.get('/profile', authenticateToken, authController.profile);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
