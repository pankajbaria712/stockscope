const authService = require('../services/authService');
const { buildSuccessResponse, buildErrorResponse } = require('../utils/response');
const { asyncHandler } = require('../utils/errors');

// Register a new user and return a signed JWT for immediate use.
const register = asyncHandler(async (req, res) => {
  const { full_name, email, password } = req.body;
  const { user, token } = await authService.registerUser({
    fullName: full_name,
    email,
    password,
  });

  res.status(201).json(
    buildSuccessResponse(201, 'Registration successful', {
      user,
      token,
    }),
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.loginUser({ email, password });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json(
    buildSuccessResponse(200, 'Login successful', {
      user,
      token,
    }),
  );
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.status(200).json(buildSuccessResponse(200, 'Logout successful'));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json(buildSuccessResponse(200, 'Current user fetched successfully', {
    id: req.user.id,
    full_name: req.user.full_name || 'User',
    email: req.user.email,
    role: req.user.role || 'user',
    avatar: req.user.avatar || null,
    created_at: req.user.created_at,
  }));
});

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
};
