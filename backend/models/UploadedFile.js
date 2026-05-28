const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UploadedFile = sequelize.define('UploadedFile', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  filename: { type: DataTypes.STRING(255), allowNull: false },
  original_name: { type: DataTypes.STRING(255), allowNull: false },
  mime_type: { type: DataTypes.STRING(100) },
  size: { type: DataTypes.INTEGER },
  row_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  columns: { type: DataTypes.JSON },
  file_path: { type: DataTypes.STRING(500), allowNull: false },
  status: {
    type: DataTypes.ENUM('uploaded', 'validated', 'migrated', 'error'),
    defaultValue: 'uploaded',
  },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'uploaded_files',
});

module.exports = UploadedFile;
