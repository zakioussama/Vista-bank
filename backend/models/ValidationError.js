const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ValidationError = sequelize.define('ValidationError', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  migration_id: { type: DataTypes.INTEGER },
  file_id: { type: DataTypes.INTEGER, allowNull: false },
  row_number: { type: DataTypes.INTEGER, allowNull: false },
  field_name: { type: DataTypes.STRING(100) },
  error_message: { type: DataTypes.STRING(500), allowNull: false },
  row_data: { type: DataTypes.JSON },
}, {
  tableName: 'validation_errors',
});

module.exports = ValidationError;
