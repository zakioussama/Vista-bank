const express = require('express');
const { getLogs } = require('../controllers/logController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();
router.use(protect, authorize('admin'));
router.get('/', getLogs);

module.exports = router;
