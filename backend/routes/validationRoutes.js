const express = require('express');
const { validateFile, getErrors } = require('../controllers/validationController');
const { protect } = require('../middlewares/auth');

const router = express.Router();
router.use(protect);
router.post('/:fileId', validateFile);
router.get('/:fileId/errors', getErrors);

module.exports = router;
