const { pool } = require('../config/db');
const { AppError } = require('../utils/errors');

function normalizeSymbol(symbol) {
  return String(symbol || '').trim().toUpperCase();
}

async function ensureWatchlistTableExists() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS watchlists (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      stock_symbol VARCHAR(20) NOT NULL,
      company_name VARCHAR(255) NULL,
      exchange VARCHAR(100) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_symbol (user_id, stock_symbol),
      CONSTRAINT fk_watchlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  await pool.execute(createTableQuery);

  const [stockColumnRows] = await pool.execute("SHOW COLUMNS FROM watchlists LIKE 'stock_symbol'");
  if (!stockColumnRows.length) {
    await pool.execute("ALTER TABLE watchlists ADD COLUMN stock_symbol VARCHAR(20) NULL");
  }

  const [legacySymbolRows] = await pool.execute("SHOW COLUMNS FROM watchlists LIKE 'symbol'");
  if (legacySymbolRows.length) {
    await pool.execute("UPDATE watchlists SET stock_symbol = COALESCE(stock_symbol, symbol) WHERE (stock_symbol IS NULL OR stock_symbol = '') AND symbol IS NOT NULL");
  }

  await pool.execute("ALTER TABLE watchlists ADD COLUMN IF NOT EXISTS company_name VARCHAR(255) NULL");
  await pool.execute("ALTER TABLE watchlists ADD COLUMN IF NOT EXISTS exchange VARCHAR(100) NULL");
  await pool.execute("ALTER TABLE watchlists ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  await pool.execute("ALTER TABLE watchlists ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
}

function normalizeWatchlistPayload(payload = {}) {
  const symbol = normalizeSymbol(payload.symbol || payload.ticker || '');
  const companyName = payload.companyName || payload.name || payload.company || payload.longName || payload.shortName || symbol || 'Unknown company';

  return {
    symbol,
    companyName,
    exchange: payload.exchange || null,
    sector: payload.sector || null,
    industry: payload.industry || null,
    currency: payload.currency || 'USD',
    website: payload.website || null,
    marketCap: payload.marketCap ?? payload.market_cap ?? null,
    currentPrice: payload.currentPrice ?? payload.price ?? null,
  };
}

async function addCompanyToWatchlist(userId, payload = {}) {
  if (!userId) {
    throw new AppError('Authentication is required', 401);
  }

  const normalizedPayload = normalizeWatchlistPayload(payload);
  if (!normalizedPayload.symbol) {
    throw new AppError('Please provide a stock symbol', 400);
  }

  await ensureWatchlistTableExists();

  const [result] = await pool.execute(
    `
      INSERT INTO watchlists (
        user_id, stock_symbol, company_name, exchange
      ) VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
    `,
    [
      userId,
      normalizedPayload.symbol,
      normalizedPayload.companyName,
      normalizedPayload.exchange,
    ],
  );

  const [rows] = await pool.execute(
    'SELECT id, user_id AS userId, stock_symbol AS stockSymbol, company_name AS companyName, exchange, created_at AS createdAt, updated_at AS updatedAt FROM watchlists WHERE user_id = ? AND stock_symbol = ? LIMIT 1',
    [userId, normalizedPayload.symbol],
  );

  return {
    added: result.affectedRows > 0 || rows.length > 0,
    item: rows[0] || null,
  };
}

module.exports = {
  ensureWatchlistTableExists,
  normalizeWatchlistPayload,
  addCompanyToWatchlist,
};
