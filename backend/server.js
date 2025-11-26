require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const bcrypt = require('bcryptjs');
const pool = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando correctamente'
  });
});

// Ruta temporal para re-hashear contraseña (SOLO PARA DESARROLLO)
app.post('/api/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email y contraseña requeridos' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const connection = await pool.getConnection();

    try {
      await connection.query(
        'UPDATE users SET password = ? WHERE email = ?',
        [hashedPassword, email]
      );

      res.json({ success: true, message: 'Contraseña actualizada' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
