const { Migration, UploadedFile, Mapping } = require('../models');
const { runMigration, getMigrationPreview, cancelMigration, rollbackMigration } = require('../services/migrationService');
const { validateMappingForFile } = require('../services/mappingTransformService');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { createLog } = require('../services/logService');

exports.getMigrations = asyncHandler(async (req, res) => {
  const migrations = await Migration.findAll({
    order: [['created_at', 'DESC']],
    include: [
      { association: 'operator', attributes: ['id', 'name'] },
      { association: 'file', attributes: ['id', 'original_name'] },
      { association: 'mapping', attributes: ['id', 'name'] },
    ],
  });
  res.json({ success: true, migrations });
});

exports.getMigration = asyncHandler(async (req, res) => {
  const migration = await Migration.findByPk(req.params.id, {
    include: [
      { association: 'operator', attributes: ['id', 'name', 'email'] },
      { association: 'file' },
      { association: 'mapping' },
    ],
  });
  if (!migration) throw new AppError('Migration not found', 404);
  res.json({ success: true, migration });
});

exports.previewMigration = asyncHandler(async (req, res) => {
  const { file_id, mapping_id, limit = 20 } = req.body;
  if (!file_id || !mapping_id) {
    throw new AppError('file_id and mapping_id are required', 400);
  }
  const result = await getMigrationPreview(file_id, mapping_id, parseInt(limit, 10));
  res.json({ success: true, ...result });
});

exports.createMigration = asyncHandler(async (req, res) => {
  const { name, file_id, mapping_id } = req.body;
  if (!name || !file_id || !mapping_id) {
    throw new AppError('Name, file_id and mapping_id are required', 400);
  }

  const migration = await Migration.create({
    name,
    file_id,
    mapping_id,
    user_id: req.user.id,
    status: 'pending',
  });

  await createLog({
    userId: req.user.id,
    migrationId: migration.id,
    level: 'info',
    action: 'migration_created',
    message: `Migration "${name}" created`,
  });

  res.status(201).json({ success: true, migration });
});

exports.startMigration = asyncHandler(async (req, res) => {
  const migration = await Migration.findByPk(req.params.id);
  if (!migration) throw new AppError('Migration not found', 404);
  if (!['pending', 'failed', 'cancelled'].includes(migration.status)) {
    throw new AppError('Migration cannot be started in current status', 400);
  }

  const file = await UploadedFile.findByPk(migration.file_id);
  const mapping = await Mapping.findByPk(migration.mapping_id);
  if (!file || !mapping) {
    throw new AppError('Migration file or mapping not found', 400);
  }

  const mappingCheck = validateMappingForFile(mapping.mapping_config, file);
  if (!mappingCheck.valid) {
    throw new AppError(mappingCheck.issues.join('; '), 400);
  }

  runMigration(migration.id, req.user.id).catch(async (err) => {
    await migration.update({ status: 'failed', completed_at: new Date() });
    await createLog({
      migrationId: migration.id,
      userId: req.user.id,
      level: 'error',
      action: 'migration_failed',
      message: err.message,
    });
  });

  res.json({ success: true, message: 'Migration started', migrationId: migration.id });
});

exports.cancelMigration = asyncHandler(async (req, res) => {
  const result = await cancelMigration(parseInt(req.params.id, 10), req.user.id);
  res.json({ success: true, ...result });
});

exports.rollbackMigration = asyncHandler(async (req, res) => {
  const migration = await rollbackMigration(parseInt(req.params.id, 10), req.user.id);
  res.json({ success: true, migration });
});
