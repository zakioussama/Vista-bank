const sequelize = require('../config/database');
const User = require('./User');
const UploadedFile = require('./UploadedFile');
const Mapping = require('./Mapping');
const Migration = require('./Migration');
const ValidationError = require('./ValidationError');
const Log = require('./Log');
const MigratedRecord = require('./MigratedRecord');

User.hasMany(UploadedFile, { foreignKey: 'user_id', as: 'files' });
UploadedFile.belongsTo(User, { foreignKey: 'user_id', as: 'uploader' });

User.hasMany(Mapping, { foreignKey: 'user_id', as: 'mappings' });
Mapping.belongsTo(User, { foreignKey: 'user_id', as: 'creator' });

User.hasMany(Migration, { foreignKey: 'user_id', as: 'migrations' });
Migration.belongsTo(User, { foreignKey: 'user_id', as: 'operator' });

UploadedFile.hasMany(Migration, { foreignKey: 'file_id', as: 'migrations' });
Migration.belongsTo(UploadedFile, { foreignKey: 'file_id', as: 'file' });

Mapping.hasMany(Migration, { foreignKey: 'mapping_id', as: 'migrations' });
Migration.belongsTo(Mapping, { foreignKey: 'mapping_id', as: 'mapping' });

Migration.hasMany(ValidationError, { foreignKey: 'migration_id', as: 'validationErrors' });
ValidationError.belongsTo(Migration, { foreignKey: 'migration_id', as: 'migration' });

UploadedFile.hasMany(ValidationError, { foreignKey: 'file_id', as: 'validationErrors' });
ValidationError.belongsTo(UploadedFile, { foreignKey: 'file_id', as: 'file' });

Migration.hasMany(Log, { foreignKey: 'migration_id', as: 'logs' });
Log.belongsTo(Migration, { foreignKey: 'migration_id', as: 'migration' });

User.hasMany(Log, { foreignKey: 'user_id', as: 'logs' });
Log.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Migration.hasMany(MigratedRecord, { foreignKey: 'migration_id', as: 'records' });
MigratedRecord.belongsTo(Migration, { foreignKey: 'migration_id', as: 'migration' });

module.exports = {
  sequelize,
  User,
  UploadedFile,
  Mapping,
  Migration,
  ValidationError,
  Log,
  MigratedRecord,
};
