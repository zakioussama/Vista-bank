const { ValidationError } = require('../models');
const { isValidEmail } = require('../utils/validators');
const { normalizeColumns, getMappedValue } = require('../utils/columnUtils');
const { TARGET_FIELDS, REQUIRED_FIELDS } = require('../config/bankingFields');
const { parseFile } = require('./fileParserService');
const { createLog } = require('./logService');
const { applyMapping, applyValueMappings } = require('./mappingTransformService');
const { validateMappedRow } = require('./rowValidationService');

const validateRows = async (file, userId, mappingConfig = null, valueMappings = null) => {
  const { rows, columns: fileColumns } = parseFile(file.file_path, file.original_name);
  const columns = normalizeColumns(fileColumns.length ? fileColumns : file.columns);
  const errors = [];
  const seenEmails = new Set();
  const seenAccounts = new Set();

  await ValidationError.destroy({ where: { file_id: file.id, migration_id: null } });

  rows.forEach((row, index) => {
    const rowNum = index + 2;
    let mapped;

    if (mappingConfig) {
      mapped = applyMapping(row, mappingConfig, columns);
      mapped = applyValueMappings(mapped, valueMappings);
    } else {
      mapped = {};
      TARGET_FIELDS.forEach((field) => {
        const col = field === 'legacy_id' ? 'id' : field;
        const value = getMappedValue(row, columns, field, col);
        if (value !== undefined) mapped[field] = value;
      });
    }

    const rowErrors = validateMappedRow(mapped, { seenEmails, seenAccounts });

    if (mapped.email && isValidEmail(mapped.email)) {
      seenEmails.add(String(mapped.email).toLowerCase());
    }
    if (mapped.account_number && /^\d+$/.test(String(mapped.account_number))) {
      seenAccounts.add(String(mapped.account_number).trim());
    }

    rowErrors.forEach((msg) => {
      errors.push({
        row_number: rowNum,
        field_name: msg.includes(':') ? msg.split(':')[0].replace('Missing required field: ', '') : 'row',
        error_message: msg,
        row_data: row,
      });
    });
  });

  if (errors.length > 0) {
    await ValidationError.bulkCreate(
      errors.map((e) => ({
        file_id: file.id,
        row_number: e.row_number,
        field_name: e.field_name,
        error_message: e.error_message,
        row_data: e.row_data,
      }))
    );
  }

  await file.update({ status: errors.length ? 'error' : 'validated', row_count: rows.length });

  await createLog({
    userId,
    level: errors.length ? 'warning' : 'success',
    action: 'validation',
    message: `Validated file "${file.original_name}": ${errors.length} error(s) in ${rows.length} rows`,
    metadata: { fileId: file.id, errorCount: errors.length, rowCount: rows.length },
  });

  return {
    totalRows: rows.length,
    errorCount: errors.length,
    validRows: rows.length - new Set(errors.map((e) => e.row_number)).size,
    errors: errors.slice(0, 500),
    columns: normalizeColumns(columns),
  };
};

module.exports = {
  validateRows,
  TARGET_FIELDS,
  REQUIRED_FIELDS,
};
