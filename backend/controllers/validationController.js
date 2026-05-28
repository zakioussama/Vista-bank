const { ValidationError, UploadedFile } = require('../models');
const { validateRows } = require('../services/validationService');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

exports.validateFile = asyncHandler(async (req, res) => {
  const file = await UploadedFile.findByPk(req.params.fileId);
  if (!file) throw new AppError('File not found', 404);

  const result = await validateRows(file, req.user.id);
  res.json({ success: true, ...result });
});

exports.getErrors = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  const { count, rows } = await ValidationError.findAndCountAll({
    where: { file_id: fileId },
    order: [['row_number', 'ASC']],
    limit: parseInt(limit, 10),
    offset,
  });

  res.json({
    success: true,
    errors: rows,
    pagination: { total: count, page: parseInt(page, 10), limit: parseInt(limit, 10), totalPages: Math.ceil(count / limit) },
  });
});
