const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const XLSX = require('xlsx');

const parseFile = (filePath, originalName) => {
  const ext = path.extname(originalName).toLowerCase();

  if (ext === '.csv') {
    const content = fs.readFileSync(filePath, 'utf-8');
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });
    const columns = records.length > 0 ? Object.keys(records[0]) : [];
    return { rows: records, columns };
  }

  if (['.xls', '.xlsx'].includes(ext)) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const records = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    const columns = records.length > 0 ? Object.keys(records[0]) : [];
    return { rows: records, columns };
  }

  throw new Error('Unsupported file format');
};

module.exports = { parseFile };
