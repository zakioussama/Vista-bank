const { Migration, MigratedRecord, ValidationError } = require('../models');
const { parseFile } = require('./fileParserService');
const { createLog } = require('./logService');
const { normalizeColumns } = require('../utils/columnUtils');
const {
  applyMapping,
  applyValueMappings,
  validateMappingForFile,
  buildPreviewRows,
} = require('./mappingTransformService');
const { validateMappedRow, normalizeMappedForInsert } = require('./rowValidationService');

const activeJobs = new Map();

const runMigration = async (migrationId, userId) => {
  const startTime = Date.now();
  const migration = await Migration.findByPk(migrationId, {
    include: [{ association: 'file' }, { association: 'mapping' }],
  });

  if (!migration?.file || !migration?.mapping) {
    throw new Error('Migration requires file and mapping');
  }

  const mappingCheck = validateMappingForFile(migration.mapping.mapping_config, migration.file);
  if (!mappingCheck.valid) {
    throw new Error(`Invalid field mapping: ${mappingCheck.issues.join('; ')}`);
  }

  activeJobs.set(migrationId, { cancelled: false });
  await migration.update({ status: 'running', started_at: new Date(), progress: 0 });

  const { rows, columns: fileColumns } = parseFile(migration.file.file_path, migration.file.original_name);
  const columns = normalizeColumns(fileColumns.length ? fileColumns : migration.file.columns);
  const mappingConfig = migration.mapping.mapping_config;
  const valueMappings = migration.mapping.value_mappings;

  let successCount = 0;
  let failedCount = 0;
  const failedRows = [];
  const seenEmails = new Set();
  const seenAccounts = new Set();

  await migration.update({ total_records: rows.length });

  for (let i = 0; i < rows.length; i++) {
    const job = activeJobs.get(migrationId);
    if (job?.cancelled) {
      await migration.update({ status: 'cancelled', completed_at: new Date() });
      await createLog({
        migrationId,
        userId,
        level: 'warning',
        action: 'migration_cancelled',
        message: `Migration #${migrationId} cancelled`,
      });
      activeJobs.delete(migrationId);
      return migration;
    }

    let mapped = applyMapping(rows[i], mappingConfig, columns);
    mapped = applyValueMappings(mapped, valueMappings);
    const rowErrors = validateMappedRow({ ...mapped }, { seenEmails, seenAccounts });

    if (rowErrors.length === 0) {
      const record = normalizeMappedForInsert(mapped);
      if (record.email) seenEmails.add(String(record.email).toLowerCase());
      if (record.account_number) seenAccounts.add(String(record.account_number).trim());

      await MigratedRecord.create({
        migration_id: migrationId,
        legacy_id: record.legacy_id ? String(record.legacy_id) : null,
        source_migration_id: record.migration_id ? String(record.migration_id) : null,
        customer_id: record.customer_id ? String(record.customer_id) : null,
        first_name: record.first_name || null,
        last_name: record.last_name || null,
        email: record.email,
        phone_number: record.phone_number || null,
        account_number: String(record.account_number),
        account_type: record.account_type,
        balance: record.balance,
        currency: record.currency,
        branch_code: record.branch_code ? String(record.branch_code) : null,
        account_status: record.account_status,
        account_created_at: record.created_at || null,
        raw_data: rows[i],
      });
      successCount++;
    } else {
      failedCount++;
      failedRows.push({ row: i + 2, errors: rowErrors });
      await ValidationError.create({
        migration_id: migrationId,
        file_id: migration.file_id,
        row_number: i + 2,
        field_name: 'migration',
        error_message: rowErrors.join('; '),
        row_data: rows[i],
      });
    }

    const progress = Math.round(((i + 1) / rows.length) * 100);
    if ((i + 1) % 10 === 0 || i === rows.length - 1) {
      await migration.update({ progress, success_count: successCount, failed_count: failedCount });
    }
  }

  const durationMs = Date.now() - startTime;
  const report = {
    total: rows.length,
    success: successCount,
    failed: failedCount,
    failedSample: failedRows.slice(0, 20),
    durationMs,
    durationFormatted: `${(durationMs / 1000).toFixed(1)}s`,
    completedAt: new Date().toISOString(),
    accountErrors: failedRows.filter((f) =>
      f.errors.some((e) => /account|balance|currency|status|type/i.test(e))
    ).length,
  };

  await migration.update({
    status: 'completed',
    progress: 100,
    success_count: successCount,
    failed_count: failedCount,
    completed_at: new Date(),
    report,
  });

  await migration.file.update({ status: 'migrated' });

  await createLog({
    migrationId,
    userId,
    level: 'success',
    action: 'migration_completed',
    message: `Migration "${migration.name}" completed in ${report.durationFormatted}: ${successCount} success, ${failedCount} failed`,
    metadata: report,
  });

  activeJobs.delete(migrationId);
  return migration;
};

const getMigrationPreview = async (fileId, mappingId, limit = 20) => {
  const { UploadedFile, Mapping } = require('../models');
  const file = await UploadedFile.findByPk(fileId);
  const mapping = await Mapping.findByPk(mappingId);
  if (!file || !mapping) throw new Error('File or mapping not found');

  const { rows, columns: fileColumns } = parseFile(file.file_path, file.original_name);
  const columns = normalizeColumns(fileColumns.length ? fileColumns : file.columns);

  const preview = buildPreviewRows(
    rows,
    columns,
    mapping.mapping_config,
    mapping.value_mappings,
    limit
  );

  return {
    totalRows: rows.length,
    preview,
    validCount: preview.filter((p) => p.valid).length,
    invalidCount: preview.filter((p) => !p.valid).length,
  };
};

const cancelMigration = async (migrationId, userId) => {
  const job = activeJobs.get(migrationId);
  if (job) {
    job.cancelled = true;
    return { message: 'Cancellation requested' };
  }
  const migration = await Migration.findByPk(migrationId);
  if (migration?.status === 'pending') {
    await migration.update({ status: 'cancelled', completed_at: new Date() });
    await createLog({
      migrationId,
      userId,
      level: 'warning',
      action: 'migration_cancelled',
      message: `Pending migration #${migrationId} cancelled`,
    });
  }
  return { message: 'Migration cancelled' };
};

const rollbackMigration = async (migrationId, userId) => {
  const migration = await Migration.findByPk(migrationId);
  if (!migration) throw new Error('Migration not found');
  if (migration.status !== 'completed') throw new Error('Only completed migrations can be rolled back');

  await MigratedRecord.destroy({ where: { migration_id: migrationId } });
  await ValidationError.destroy({ where: { migration_id: migrationId } });
  await migration.update({
    status: 'rolled_back',
    success_count: 0,
    failed_count: 0,
    progress: 0,
    report: null,
    completed_at: new Date(),
  });

  await createLog({
    migrationId,
    userId,
    level: 'warning',
    action: 'migration_rollback',
    message: `Migration "${migration.name}" rolled back`,
  });

  return migration;
};

module.exports = {
  runMigration,
  getMigrationPreview,
  cancelMigration,
  rollbackMigration,
  activeJobs,
};
