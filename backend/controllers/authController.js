const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

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
