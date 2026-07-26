const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a shared MySQL connection pool for the application.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'stockscope',
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  timezone: 'Z',
});

async function testConnection() {
  const connection = await pool.getConnection();
  connection.release();
  return true;
}

module.exports = {
  pool,
  testConnection,
};
