const { TARGET_FIELDS, DEFAULT_VALUE_MAPPINGS } = require('../config/bankingFields');
const {
  normalizeColumns,
  getMappedValue,
  parseMappingConfig,
  resolveColumn,
} = require('../utils/columnUtils');
const { parseFile } = require('./fileParserService');

const parseValueMappings = (valueMappings) => {
  if (!valueMappings) return { ...DEFAULT_VALUE_MAPPINGS };
  const parsed = typeof valueMappings === 'string' ? JSON.parse(valueMappings) : valueMappings;
  return {
    account_type: { ...DEFAULT_VALUE_MAPPINGS.account_type, ...(parsed.account_type || {}) },
    account_status: { ...DEFAULT_VALUE_MAPPINGS.account_status, ...(parsed.account_status || {}) },
    currency: { ...DEFAULT_VALUE_MAPPINGS.currency, ...(parsed.currency || {}) },
  };
};

const transformValue = (field, rawValue, valueMappings) => {
  if (rawValue === undefined || rawValue === null || rawValue === '') return rawValue;

  const str = String(rawValue).trim();
  const maps = valueMappings?.[field];
  if (maps) {
    const upper = str.toUpperCase();
    if (maps[upper]) return maps[upper];
    if (maps[str]) return maps[str];
    const lower = str.toLowerCase();
    if (maps[lower]) return maps[lower];
  }
  return str;
};

const applyValueMappings = (mapped, valueMappings) => {
  const vm = parseValueMappings(valueMappings);
  const result = { ...mapped };

  ['account_type', 'account_status', 'currency'].forEach((field) => {
    if (result[field] !== undefined) {
      result[field] = transformValue(field, result[field], vm);
    }
  });

  return result;
};

const applyMapping = (row, mappingConfig, columns) => {
  const config = parseMappingConfig(mappingConfig);
  const result = {};

  TARGET_FIELDS.forEach((targetField) => {
    const sourceField = config[targetField];
    const value = getMappedValue(row, columns, targetField, sourceField);
    if (value !== undefined && value !== null && value !== '') {
      result[targetField] = value;
    }
  });

  // legacy CSV uses "id" for legacy_id
  if (!result.legacy_id && row.id !== undefined) result.legacy_id = row.id;

  return result;
};

const validateMappingForFile = (mappingConfig, file) => {
  const config = parseMappingConfig(mappingConfig);
  const { columns: parsedCols } = parseFile(file.file_path, file.original_name);
  const columns = normalizeColumns(parsedCols.length ? parsedCols : file.columns);

  const issues = [];
  const resolved = {};

  TARGET_FIELDS.forEach((targetField) => {
    const sourceField = config[targetField];
    let sourceCol = sourceField ? resolveColumn(columns, sourceField) : null;
    if (!sourceCol) sourceCol = resolveColumn(columns, targetField);
    if (!sourceCol && targetField === 'legacy_id') sourceCol = resolveColumn(columns, 'id');
    resolved[targetField] = sourceCol;

    if (['email', 'account_number'].includes(targetField) && !sourceCol) {
      issues.push(`Cannot resolve "${targetField}": map a source column or include it in the CSV`);
    }
  });

  return { valid: issues.length === 0, issues, columns, resolved };
};

const suggestMapping = (columns) => {
  const normalized = normalizeColumns(columns);
  const config = {};

  TARGET_FIELDS.forEach((target) => {
    let match = resolveColumn(normalized, target);
    if (!match && target === 'legacy_id') match = resolveColumn(normalized, 'id');
    if (match) config[target] = match;
  });

  return config;
};

const buildPreviewRows = (rows, columns, mappingConfig, valueMappings, limit = 20) => {
  const { validateMappedRow } = require('./rowValidationService');
  const seenEmails = new Set();
  const seenAccounts = new Set();
  const preview = [];

  for (let i = 0; i < Math.min(rows.length, limit); i++) {
    const original = rows[i];
    let transformed = applyMapping(original, mappingConfig, columns);
    transformed = applyValueMappings(transformed, valueMappings);
    const errors = validateMappedRow({ ...transformed }, { seenEmails, seenAccounts });

    if (transformed.email) seenEmails.add(String(transformed.email).toLowerCase());
    if (transformed.account_number) seenAccounts.add(String(transformed.account_number).trim());

    preview.push({
      row_number: i + 2,
      original,
      transformed,
      valid: errors.length === 0,
      errors,
    });
  }

  return preview;
};

module.exports = {
  applyMapping,
  applyValueMappings,
  transformValue,
  parseValueMappings,
  validateMappingForFile,
  suggestMapping,
  buildPreviewRows,
  DEFAULT_VALUE_MAPPINGS,
};
