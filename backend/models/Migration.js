const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Migration = sequelize.define('Migration', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  status: {
    type: DataTypes.ENUM('pending', 'running', 'completed', 'failed', 'cancelled', 'rolled_back'),
    defaultValue: 'pending',
  },
  total_records: { type: DataTypes.INTEGER, defaultValue: 0 },
  success_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  failed_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  progress: { type: DataTypes.INTEGER, defaultValue: 0 },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  file_id: { type: DataTypes.INTEGER },
  mapping_id: { type: DataTypes.INTEGER },
  started_at: { type: DataTypes.DATE },
  completed_at: { type: DataTypes.DATE },
  report: { type: DataTypes.JSON },
}, {
  tableName: 'migrations',
});

module.exports = Migration;
