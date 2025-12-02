require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Rate Limiting - Límites generales
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana de tiempo
  message: 'Demasiadas solicitudes desde esta IP, por favor intenta más tarde',
  standardHeaders: true,
  legacyHeaders: false
});

// Rate Limiting - Más estricto para autenticación (previene bruteforce)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por IP en 15 minutos
  message: 'Demasiados intentos de login/registro, intenta de nuevo en 15 minutos',
  skipSuccessfulRequests: false, // Contar incluso solicitudes exitosas
  standardHeaders: true,
  legacyHeaders: false
});

// Aplicar rate limiting general
app.use(generalLimiter);

// Rutas con rate limiting específico para autenticación
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

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
