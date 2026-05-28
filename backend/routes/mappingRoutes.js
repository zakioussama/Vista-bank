const express = require('express');
const {
  getMappings, getMapping, createMapping, updateMapping, deleteMapping, getTargetFields, getValueMappingDefaults, suggestFromFile,
} = require('../controllers/mappingController');
const { protect } = require('../middlewares/auth');

const router = express.Router();
router.use(protect);
router.get('/fields', getTargetFields);
router.get('/value-defaults', getValueMappingDefaults);
router.get('/suggest/:fileId', suggestFromFile);
router.get('/', getMappings);
router.get('/:id', getMapping);
router.post('/', createMapping);
router.put('/:id', updateMapping);
router.delete('/:id', deleteMapping);

module.exports = router;
