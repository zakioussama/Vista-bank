const express = require('express');
const {
  getMigrations, getMigration, previewMigration, createMigration, startMigration, cancelMigration, rollbackMigration,
} = require('../controllers/migrationController');
const { protect } = require('../middlewares/auth');

const router = express.Router();
router.use(protect);
router.get('/', getMigrations);
router.post('/preview', previewMigration);
router.get('/:id', getMigration);
router.post('/', createMigration);
router.post('/:id/start', startMigration);
router.post('/:id/cancel', cancelMigration);
router.post('/:id/rollback', rollbackMigration);

module.exports = router;
