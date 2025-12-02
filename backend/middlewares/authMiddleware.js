const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación
 * Valida que el token JWT sea válido
 * Extrae la información del usuario del token
 */
const authenticateToken = (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    // Si no hay token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    // Verificar que el token sea válido
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error('Error verificando token:', err.message);
        
        // Diferenciar entre token expirado y token inválido
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Token expirado',
            expiredAt: err.expiredAt
          });
        }

        return res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
      }

      // Token válido - agregar usuario a la solicitud
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verificando autenticación'
    });
  }
};

module.exports = { authenticateToken };
