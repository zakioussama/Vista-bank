/**
 * Normalize API column metadata to a string array (defensive for JSON strings / objects).
 */
export const parseColumns = (columns) => {
  if (!columns) return [];

  if (Array.isArray(columns)) {
    return columns.map((c) => String(c)).filter(Boolean);
  }

  if (typeof columns === 'string') {
    try {
      const parsed = JSON.parse(columns);
      return parseColumns(parsed);
    } catch {
      return columns.split(',').map((c) => c.trim()).filter(Boolean);
    }
  }

  if (typeof columns === 'object') {
    return Object.keys(columns);
  }

  return [];
};

/** Collect unique columns from one or more uploaded files */
export const collectSourceColumns = (files, selectedFileId = null) => {
  if (!Array.isArray(files) || files.length === 0) return [];

  const pool = selectedFileId
    ? files.filter((f) => String(f.id) === String(selectedFileId))
    : files;

  const all = pool.flatMap((f) => parseColumns(f.columns));
  return [...new Set(all)];
};
