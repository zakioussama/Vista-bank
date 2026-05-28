require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'vista-migration-dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
