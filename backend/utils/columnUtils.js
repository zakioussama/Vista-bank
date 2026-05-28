/**
 * Normalize stored column metadata (JSON string, array, or object) to a string array.
 */
const normalizeColumns = (columns) => {
  if (!columns) return [];

  if (Array.isArray(columns)) {
    return columns.map((c) => String(c)).filter(Boolean);
  }

  if (typeof columns === 'string') {
    try {
      const parsed = JSON.parse(columns);
      return normalizeColumns(parsed);
    } catch {
      return columns.split(',').map((c) => c.trim()).filter(Boolean);
    }
  }

  if (typeof columns === 'object') {
    return Object.keys(columns);
  }

  return [];
};

const normalizeKey = (key) => String(key || '').toLowerCase().replace(/[\s-]/g, '_');

/**
 * Resolve a source field name to an actual column key present in the file.
 */
const resolveColumn = (columns, fieldName) => {
  if (!fieldName || !columns?.length) return null;

  const norm = normalizeKey(fieldName);
  return (
    columns.find((c) => c === fieldName)
    || columns.find((c) => normalizeKey(c) === norm)
    || null
  );
};

/**
 * Read a value from a row using mapping config with identity fallback
 * (when CSV column names already match target platform fields).
 */
const getMappedValue = (row, columns, targetField, sourceField) => {
  if (sourceField) {
    const col = resolveColumn(columns, sourceField);
    if (col && row[col] !== undefined && row[col] !== '') return row[col];
    if (row[sourceField] !== undefined && row[sourceField] !== '') return row[sourceField];
  }

  const identityCol = resolveColumn(columns, targetField);
  if (identityCol && row[identityCol] !== undefined && row[identityCol] !== '') {
    return row[identityCol];
  }

  if (row[targetField] !== undefined && row[targetField] !== '') {
    return row[targetField];
  }

  return undefined;
};

const parseMappingConfig = (mappingConfig) => {
  if (!mappingConfig) return {};
  if (typeof mappingConfig === 'string') {
    try {
      return JSON.parse(mappingConfig);
    } catch {
      return {};
    }
  }
  return mappingConfig;
};

module.exports = {
  normalizeColumns,
  normalizeKey,
  resolveColumn,
  getMappedValue,
  parseMappingConfig,
};
