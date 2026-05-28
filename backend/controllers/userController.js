const bcrypt = require('bcryptjs');
const { User } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { createLog } = require('../services/logService');

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] },
    order: [['created_at', 'DESC']],
  });
  res.json({ success: true, users });
});

exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) throw new AppError('Name, email and password are required', 400);

  const exists = await User.findOne({ where: { email } });
  if (exists) throw new AppError('Email already in use', 409);

  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 12),
    role: role || 'operator',
  });

  await createLog({ userId: req.user.id, level: 'info', action: 'user_created', message: `Created user ${email}`, metadata: { newUserId: user.id } });

  const { password: _, ...safe } = user.toJSON();
  res.status(201).json({ success: true, user: safe });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) throw new AppError('User not found', 404);

  const { name, email, role, is_active, password } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (typeof is_active === 'boolean') user.is_active = is_active;
  if (password) user.password = await bcrypt.hash(password, 12);
  await user.save();

  const { password: _, ...safe } = user.toJSON();
  res.json({ success: true, user: safe });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  if (user.id === req.user.id) throw new AppError('Cannot delete your own account', 400);
  await user.destroy();
  res.json({ success: true, message: 'User deleted' });
});
