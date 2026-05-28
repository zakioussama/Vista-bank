const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mapping = sequelize.define('Mapping', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  description: { type: DataTypes.TEXT },
  mapping_config: { type: DataTypes.JSON, allowNull: false },
  value_mappings: { type: DataTypes.JSON, allowNull: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  is_default: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'mappings',
});

module.exports = Mapping;
