const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MigratedRecord = sequelize.define('MigratedRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  migration_id: { type: DataTypes.INTEGER, allowNull: false },
  legacy_id: { type: DataTypes.STRING(50) },
  source_migration_id: { type: DataTypes.STRING(50) },
  customer_id: { type: DataTypes.STRING(50) },
  first_name: { type: DataTypes.STRING(100) },
  last_name: { type: DataTypes.STRING(100) },
  email: { type: DataTypes.STRING(150) },
  phone_number: { type: DataTypes.STRING(20) },
  account_number: { type: DataTypes.STRING(20), allowNull: false },
  account_type: {
    type: DataTypes.ENUM('savings', 'current', 'business', 'checking'),
  },
  balance: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  currency: { type: DataTypes.ENUM('MAD', 'USD', 'EUR') },
  branch_code: { type: DataTypes.STRING(20) },
  account_status: {
    type: DataTypes.ENUM('active', 'frozen', 'closed'),
    defaultValue: 'active',
  },
  account_created_at: { type: DataTypes.DATE },
  raw_data: { type: DataTypes.JSON },
}, {
  tableName: 'migrated_records',
  indexes: [
    { fields: ['email'] },
    { fields: ['migration_id'] },
    { unique: true, fields: ['account_number', 'migration_id'], name: 'uniq_account_per_migration' },
  ],
});

module.exports = MigratedRecord;
