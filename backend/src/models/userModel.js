const { pool } = require('../config/db');

async function ensureUserTableExists() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  await pool.execute(createTableQuery);
  await pool.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user'");
  await pool.execute('ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(255) NULL');
}

async function createUser({ fullName, email, passwordHash, role = 'user', avatar = null }) {
  const [result] = await pool.execute(
    'INSERT INTO users (full_name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)',
    [fullName, email, passwordHash, role, avatar],
  );

  return {
    id: result.insertId,
    full_name: fullName,
    email,
    role,
    avatar,
  };
}

async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT id, full_name, email, password, role, avatar, created_at FROM users WHERE email = ?',
    [email],
  );
  return rows[0] || null;
}

async function findUserById(id) {
  const [rows] = await pool.execute(
    'SELECT id, full_name, email, role, avatar, created_at FROM users WHERE id = ?',
    [id],
  );
  return rows[0] || null;
}

module.exports = {
  ensureUserTableExists,
  createUser,
  findUserByEmail,
  findUserById,
};
