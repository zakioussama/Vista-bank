const { getLogs } = require('../services/logService');
const asyncHandler = require('../utils/asyncHandler');

exports.getLogs = asyncHandler(async (req, res) => {
  const { page, limit, level, action, migrationId, search } = req.query;
  const result = await getLogs({ page, limit, level, action, migrationId, search });
  res.json({ success: true, ...result });
});
