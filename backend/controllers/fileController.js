const { UploadedFile } = require('../models');
const { parseFile } = require('../services/fileParserService');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { createLog } = require('../services/logService');
const { normalizeColumns } = require('../utils/columnUtils');

const serializeFile = (file) => {
  const json = file.toJSON ? file.toJSON() : file;
  return { ...json, columns: normalizeColumns(json.columns) };
};

exports.upload = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  let parsed;
  try {
    parsed = parseFile(req.file.path, req.file.originalname);
  } catch (err) {
    throw new AppError(`Failed to parse file: ${err.message}`, 400);
  }

  const file = await UploadedFile.create({
    filename: req.file.filename,
    original_name: req.file.originalname,
    mime_type: req.file.mimetype,
    size: req.file.size,
    row_count: parsed.rows.length,
    columns: parsed.columns,
    file_path: req.file.path,
    user_id: req.user.id,
    status: 'uploaded',
  });

  await createLog({
    userId: req.user.id,
    level: 'info',
    action: 'file_upload',
    message: `Uploaded file "${file.original_name}" (${parsed.rows.length} rows)`,
    metadata: { fileId: file.id },
  });

  res.status(201).json({
    success: true,
    file: serializeFile(file),
    columns: parsed.columns,
    preview: parsed.rows.slice(0, 20),
  });
});

exports.getFiles = asyncHandler(async (req, res) => {
  const files = await UploadedFile.findAll({
    order: [['created_at', 'DESC']],
    include: [{ association: 'uploader', attributes: ['id', 'name'] }],
  });
  res.json({ success: true, files: files.map(serializeFile) });
});

exports.getFile = asyncHandler(async (req, res) => {
  const file = await UploadedFile.findByPk(req.params.id, {
    include: [{ association: 'uploader', attributes: ['id', 'name'] }],
  });
  if (!file) throw new AppError('File not found', 404);

  const { rows, columns } = parseFile(file.file_path, file.original_name);
  res.json({
    success: true,
    file: serializeFile(file),
    columns: normalizeColumns(columns),
    preview: rows.slice(0, 50),
  });
});

exports.getFileColumns = asyncHandler(async (req, res) => {
  const file = await UploadedFile.findByPk(req.params.id);
  if (!file) throw new AppError('File not found', 404);

  const { columns } = parseFile(file.file_path, file.original_name);
  const normalized = normalizeColumns(columns.length ? columns : file.columns);

  res.json({ success: true, columns: normalized });
});

exports.deleteFile = asyncHandler(async (req, res) => {
  const file = await UploadedFile.findByPk(req.params.id);
  if (!file) throw new AppError('File not found', 404);
  await file.destroy();
  res.json({ success: true, message: 'File deleted' });
});
