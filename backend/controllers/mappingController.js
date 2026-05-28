const { Mapping } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { createLog } = require('../services/logService');
const { TARGET_FIELDS } = require('../config/bankingFields');
const { DEFAULT_VALUE_MAPPINGS } = require('../services/mappingTransformService');
const { suggestMapping } = require('../services/mappingTransformService');
const { normalizeColumns } = require('../utils/columnUtils');
const { UploadedFile } = require('../models');
const { parseFile } = require('../services/fileParserService');

exports.getTargetFields = asyncHandler(async (req, res) => {
  const { ENUMS } = require('../config/bankingFields');
  res.json({ success: true, fields: TARGET_FIELDS, enums: ENUMS });
});

exports.getMappings = asyncHandler(async (req, res) => {
  const mappings = await Mapping.findAll({
    order: [['created_at', 'DESC']],
    include: [{ association: 'creator', attributes: ['id', 'name'] }],
  });
  res.json({ success: true, mappings });
});

exports.getMapping = asyncHandler(async (req, res) => {
  const mapping = await Mapping.findByPk(req.params.id);
  if (!mapping) throw new AppError('Mapping not found', 404);
  res.json({ success: true, mapping });
});

exports.getValueMappingDefaults = asyncHandler(async (req, res) => {
  res.json({ success: true, value_mappings: DEFAULT_VALUE_MAPPINGS });
});

exports.createMapping = asyncHandler(async (req, res) => {
  const { name, description, mapping_config, value_mappings, is_default } = req.body;
  if (!name || !mapping_config) throw new AppError('Name and mapping_config are required', 400);

  if (is_default) {
    await Mapping.update({ is_default: false }, { where: {} });
  }

  const mapping = await Mapping.create({
    name,
    description,
    mapping_config,
    value_mappings: value_mappings || DEFAULT_VALUE_MAPPINGS,
    user_id: req.user.id,
    is_default: is_default || false,
  });

  await createLog({ userId: req.user.id, level: 'info', action: 'mapping_created', message: `Created mapping "${name}"` });
  res.status(201).json({ success: true, mapping });
});

exports.updateMapping = asyncHandler(async (req, res) => {
  const mapping = await Mapping.findByPk(req.params.id);
  if (!mapping) throw new AppError('Mapping not found', 404);

  const { name, description, mapping_config, value_mappings, is_default } = req.body;
  if (name) mapping.name = name;
  if (description !== undefined) mapping.description = description;
  if (mapping_config) mapping.mapping_config = mapping_config;
  if (value_mappings) mapping.value_mappings = value_mappings;
  if (is_default) {
    await Mapping.update({ is_default: false }, { where: {} });
    mapping.is_default = true;
  }
  await mapping.save();
  res.json({ success: true, mapping });
});

exports.deleteMapping = asyncHandler(async (req, res) => {
  const mapping = await Mapping.findByPk(req.params.id);
  if (!mapping) throw new AppError('Mapping not found', 404);
  await mapping.destroy();
  res.json({ success: true, message: 'Mapping deleted' });
});

/** Suggest identity mapping from an uploaded file's column headers */
exports.suggestFromFile = asyncHandler(async (req, res) => {
  const file = await UploadedFile.findByPk(req.params.fileId);
  if (!file) throw new AppError('File not found', 404);

  const { columns } = parseFile(file.file_path, file.original_name);
  const normalized = normalizeColumns(columns.length ? columns : file.columns);
  const mapping_config = suggestMapping(normalized);

  res.json({
    success: true,
    columns: normalized,
    mapping_config,
    value_mappings: DEFAULT_VALUE_MAPPINGS,
    fields: TARGET_FIELDS,
  });
});
