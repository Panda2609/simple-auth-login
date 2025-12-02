const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Validar formato de email
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar fortaleza de contraseña
const validatePassword = (password) => {
  // Al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;
    console.log('Registro iniciado para:', email);

    // Validar que todos los campos existan
    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Por favor completa todos los campos'
      });
    }

    // Validar formato de email
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email inválido'
      });
    }

    // Validar que el fullName tenga al menos 3 caracteres
    if (fullName.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'El nombre debe tener al menos 3 caracteres'
      });
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Las contraseñas no coinciden'
      });
    }

    // Validar que la contraseña sea lo suficientemente fuerte
    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener: 8+ caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial (@$!%*?&)'
      });
    }

    try {
      // Verificar si el email ya existe
      const userExists = await pool.query(
        'SELECT email FROM users WHERE email = $1',
        [email]
      );

      if (userExists.rows.length > 0) {
        console.log('Email ya existe:', email);
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Contraseña hasheada');

      // Insertar usuario en la BD
      await pool.query(
        'INSERT INTO users (fullname, email, password, registereddate) VALUES ($1, $2, $3, NOW())',
        [fullName, email, hashedPassword]
      );

      console.log('Usuario registrado exitosamente:', email);
      return res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente'
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        success: false,
        message: 'Error en el servidor: ' + error.message
      });
    }
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor: ' + error.message
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar que existan email y contraseña
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Validar formato de email
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email inválido'
      });
    }

    try {
      // Buscar usuario por email
      const result = await pool.query(
        'SELECT id, fullname, email, password, registereddate FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        console.log('Usuario no encontrado:', email);
        return res.status(401).json({
          success: false,
          message: 'Email o contraseña incorrectos'
        });
      }

      const user = result.rows[0];
      console.log('Usuario encontrado:', user.email);

      // Comparar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Contraseña válida:', isPasswordValid);

      if (!isPasswordValid) {
        console.log('Contraseña incorrecta para:', email);
        return res.status(401).json({
          success: false,
          message: 'Email o contraseña incorrectos'
        });
      }

      // Generar JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      console.log('Login exitoso para:', email);
      return res.status(200).json({
        success: true,
        message: 'Login exitoso',
        token: token,
        user: {
          id: user.id,
          fullName: user.fullname,
          email: user.email,
          registeredDate: user.registereddate
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error en el servidor'
      });
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// PROFILE - Endpoint protegido para obtener datos del usuario
exports.profile = async (req, res) => {
  try {
    // req.user viene del middleware de autenticación
    const userId = req.user.id;

    const connection = await pool.query(
      'SELECT id, fullname, email, registereddate FROM users WHERE id = $1',
      [userId]
    );

    if (connection.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = connection.rows[0];
    console.log('Perfil obtenido para usuario:', userId);

    return res.status(200).json({
      success: true,
      message: 'Datos del usuario obtenidos',
      user: {
        id: user.id,
        fullName: user.fullname,
        email: user.email,
        registeredDate: user.registereddate
      }
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// LOGOUT - Endpoint para cerrar sesión (fronted lo maneja, pero es buena práctica)
exports.logout = (req, res) => {
  try {
    // El logout se maneja principalmente en el frontend (eliminar token del localStorage)
    // Este endpoint solo es para registrar el logout en logs si lo necesitas
    console.log('Logout para usuario:', req.user.email);

    return res.status(200).json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};
