const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const fileRoutes = require('./fileRoutes');
const validationRoutes = require('./validationRoutes');
const mappingRoutes = require('./mappingRoutes');
const migrationRoutes = require('./migrationRoutes');
const logRoutes = require('./logRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/files', fileRoutes);
router.use('/validation', validationRoutes);
router.use('/mappings', mappingRoutes);
router.use('/migrations', migrationRoutes);
router.use('/logs', logRoutes);

module.exports = router;
