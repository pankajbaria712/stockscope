const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const stockRoutes = require('./routes/stockRoutes');
const homeRoutes = require('./routes/homeRoutes');
const { buildErrorResponse } = require('./utils/response');
const { ensureUserTableExists } = require('./models/userModel');

const app = express();

// Apply shared security, parsing, and logging middleware for the API.

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy', statusCode: 200 });
});

app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/home', homeRoutes);

app.use((req, res) => {
  res.status(404).json(buildErrorResponse(404, 'Route not found'));
});

app.use((err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json(buildErrorResponse(statusCode, message, err.details || null));
});

async function initializeApp() {
  try {
    await ensureUserTableExists();
    console.log('Database initialization completed.');
  } catch (error) {
    console.error('Database initialization skipped:', error.message);
  }

  return app;
}

module.exports = {
  app,
  initializeApp,
};
