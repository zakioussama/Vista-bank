const express = require('express');
const { upload, getFiles, getFile, getFileColumns, deleteFile } = require('../controllers/fileController');
const { protect } = require('../middlewares/auth');
const uploadMiddleware = require('../middlewares/upload');

const router = express.Router();
router.use(protect);
router.post('/upload', uploadMiddleware.single('file'), upload);
router.get('/', getFiles);
router.get('/:id/columns', getFileColumns);
router.get('/:id', getFile);
router.delete('/:id', deleteFile);

module.exports = router;
