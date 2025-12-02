const { Pool } = require('pg');
require('dotenv').config();

// Decodificar la contraseña en caso de que esté URL-encoded
const password = process.env.DB_PASSWORD ? decodeURIComponent(process.env.DB_PASSWORD) : '';

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: password,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('error', (err) => {
  console.error('Error en pool de PostgreSQL:', err);
});

module.exports = pool;
