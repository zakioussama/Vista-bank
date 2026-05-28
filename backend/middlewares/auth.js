const jwt = require('jsonwebtoken');
const config = require('../config');
const { User } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Not authorized. Please log in.', 401);
  }

  const decoded = jwt.verify(token, config.jwt.secret);
  const user = await User.findByPk(decoded.id, {
    attributes: { exclude: ['password'] },
  });

  if (!user || !user.is_active) {
    throw new AppError('User no longer exists or is inactive.', 401);
  }

  req.user = user;
  next();
});

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new AppError('You do not have permission to perform this action.', 403);
  }
  next();
};

module.exports = { protect, authorize };
