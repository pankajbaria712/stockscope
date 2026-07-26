const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword } = require('../utils/password');
const { AppError } = require('../utils/errors');
const userModel = require('../models/userModel');

// JWT settings are loaded from environment variables so the module can be configured safely per environment.
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

async function registerUser({ fullName, email, password }) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedName = String(fullName || '').trim();

  const existingUser = await userModel.findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  const passwordHash = await hashPassword(password);
  const user = await userModel.createUser({
    fullName: normalizedName,
    email: normalizedEmail,
    passwordHash,
    role: 'user',
    avatar: null,
  });
  const token = signToken({ sub: user.id, email: user.email, role: user.role });

  return {
    user,
    token,
  };
}

async function loginUser({ email, password }) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await userModel.findUserByEmail(normalizedEmail);
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const storedPassword = user.password || user.password_hash || null;
  if (!storedPassword) {
    throw new AppError('Invalid credentials', 401);
  }

  const isPasswordValid = await comparePassword(password, storedPassword);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = signToken({ sub: user.id, email: user.email, role: user.role });

  return {
    user: {
      id: user.id,
      full_name: user.full_name || 'User',
      email: user.email,
      role: user.role || 'user',
      avatar: user.avatar || null,
      created_at: user.created_at,
    },
    token,
  };
}

async function getCurrentUser(id) {
  const user = await userModel.findUserById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  signToken,
  verifyToken,
};
