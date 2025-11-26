const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// REGISTER
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    // Validar que todos los campos existan
    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Por favor completa todos los campos'
      });
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Las contraseñas no coinciden'
      });
    }

    // Validar que la contraseña tenga al menos 6 caracteres
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    const connection = await pool.getConnection();

    try {
      // Verificar si el email ya existe
      const [users] = await connection.query(
        'SELECT email FROM users WHERE email = ?',
        [email]
      );

      if (users.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está en uso'
        });
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insertar usuario en la BD
      await connection.query(
        'INSERT INTO users (fullName, email, password, registeredDate) VALUES (?, ?, ?, NOW())',
        [fullName, email, hashedPassword]
      );

      return res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente'
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
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

    const connection = await pool.getConnection();

    try {
      // Buscar usuario por email
      const [users] = await connection.query(
        'SELECT id, fullName, email, password, registeredDate FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Email o contraseña incorrectos'
        });
      }

      const user = users[0];

      // Comparar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
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

      return res.status(200).json({
        success: true,
        message: 'Login exitoso',
        token: token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          registeredDate: user.registeredDate
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};
