require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');

const app = express();

// Confiar en proxies (necesario para Cloud Run)
app.set('trust proxy', 1);

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:4200',
      'http://localhost:3000',
      'https://panda2609.github.io',
      'https://panda2609.github.io/simple-auth-login',
      process.env.FRONTEND_URL
    ];
    
    // Permitir sin origin (para requests desde mobile apps, curl, etc)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
  max: 25, // 25 intentos por IP en 15 minutos
  message: 'Demasiados intentos de login/registro, intenta de nuevo en 15 minutos',
  skipSuccessfulRequests: false, // Contar incluso solicitudes exitosas
  skip: (req) => req.method === 'OPTIONS', // Ignorar requests OPTIONS (CORS preflight)
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
