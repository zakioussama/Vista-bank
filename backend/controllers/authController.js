const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const { User } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { createLog } = require('../services/logService');

const signToken = (id) => jwt.sign({ id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('Email and password are required', 400);

  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password', 401);
  }
  if (!user.is_active) throw new AppError('Account is deactivated', 401);

  const token = signToken(user.id);
  await createLog({ userId: user.id, level: 'info', action: 'login', message: `${user.name} logged in` });

  res.json({
    success: true,
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

exports.logout = asyncHandler(async (req, res) => {
  await createLog({ userId: req.user.id, level: 'info', action: 'logout', message: `${req.user.name} logged out` });
  res.json({ success: true, message: 'Logged out successfully' });
});
