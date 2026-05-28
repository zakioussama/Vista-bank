const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Log = sequelize.define('Log', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  migration_id: { type: DataTypes.INTEGER },
  user_id: { type: DataTypes.INTEGER },
  level: {
    type: DataTypes.ENUM('info', 'warning', 'error', 'success'),
    defaultValue: 'info',
  },
  action: { type: DataTypes.STRING(100), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  metadata: { type: DataTypes.JSON },
}, {
  tableName: 'logs',
});

module.exports = Log;
