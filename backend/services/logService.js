const { Op } = require('sequelize');
const { Log } = require('../models');

const createLog = async ({ migrationId, userId, level = 'info', action, message, metadata }) => {
  return Log.create({
    migration_id: migrationId || null,
    user_id: userId || null,
    level,
    action,
    message,
    metadata: metadata || null,
  });
};

const getLogs = async ({ page = 1, limit = 20, level, action, migrationId, search }) => {
  const offset = (page - 1) * limit;
  const where = {};

  if (level) where.level = level;
  if (action) where.action = { [Op.like]: `%${action}%` };
  if (migrationId) where.migration_id = migrationId;

  const { Op } = require('sequelize');
  if (search) {
    where[Op.or] = [
      { message: { [Op.like]: `%${search}%` } },
      { action: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Log.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit: parseInt(limit, 10),
    offset,
    include: [
      { association: 'user', attributes: ['id', 'name', 'email'] },
      { association: 'migration', attributes: ['id', 'name', 'status'] },
    ],
  });

  return {
    logs: rows,
    pagination: {
      total: count,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(count / limit),
    },
  };
};

module.exports = { createLog, getLogs };
