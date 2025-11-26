require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
