const { Migration } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

exports.getStats = asyncHandler(async (req, res) => {
  const migrations = await Migration.findAll();
  const totalMigrations = migrations.length;
  const completed = migrations.filter((m) => m.status === 'completed');
  const totalSuccess = completed.reduce((s, m) => s + (m.success_count || 0), 0);
  const totalFailed = completed.reduce((s, m) => s + (m.failed_count || 0), 0);
  const totalAccountErrors = completed.reduce(
    (s, m) => s + (m.report?.accountErrors || 0),
    0
  );

  const recentMigrations = await Migration.findAll({
    limit: 10,
    order: [['created_at', 'DESC']],
    include: [{ association: 'operator', attributes: ['id', 'name'] }],
  });

  const statusBreakdown = await Migration.findAll({
    attributes: ['status', [Migration.sequelize.fn('COUNT', 'id'), 'count']],
    group: ['status'],
    raw: true,
  });

  const monthlyStats = await Migration.findAll({
    attributes: [
      [Migration.sequelize.fn('DATE_FORMAT', Migration.sequelize.col('created_at'), '%Y-%m'), 'month'],
      [Migration.sequelize.fn('SUM', Migration.sequelize.col('success_count')), 'success'],
      [Migration.sequelize.fn('SUM', Migration.sequelize.col('failed_count')), 'failed'],
    ],
    where: { status: 'completed' },
    group: [Migration.sequelize.fn('DATE_FORMAT', Migration.sequelize.col('created_at'), '%Y-%m')],
    order: [[Migration.sequelize.literal('month'), 'DESC']],
    limit: 6,
    raw: true,
  });

  res.json({
    success: true,
    stats: {
      totalMigrations,
      totalSuccess,
      totalFailed,
      totalAccountErrors,
      runningMigrations: migrations.filter((m) => m.status === 'running').length,
      statusBreakdown,
      monthlyStats: monthlyStats.reverse(),
    },
    recentMigrations,
  });
});
