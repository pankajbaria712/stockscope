const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    ca: fs.readFileSync(path.join(__dirname, '../certs/isrgrootx1.pem')),
    rejectUnauthorized: true,
  },

  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  timezone: 'Z',
});

async function testConnection() {
  const connection = await pool.getConnection();
  console.log('✅ Connected to TiDB Cloud');
  connection.release();
  return true;
}

module.exports = {
  pool,
  testConnection,
};