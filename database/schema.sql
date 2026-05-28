-- Vista Data Migration Tool - MySQL Schema (Banking CSV v2)

CREATE DATABASE IF NOT EXISTS vista_migration
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vista_migration;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'operator') NOT NULL DEFAULT 'operator',
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS uploaded_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100),
  size INT,
  row_count INT DEFAULT 0,
  columns JSON,
  file_path VARCHAR(500) NOT NULL,
  status ENUM('uploaded', 'validated', 'migrated', 'error') DEFAULT 'uploaded',
  user_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mappings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  mapping_config JSON NOT NULL,
  value_mappings JSON,
  user_id INT NOT NULL,
  is_default TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  status ENUM('pending', 'running', 'completed', 'failed', 'cancelled', 'rolled_back') DEFAULT 'pending',
  total_records INT DEFAULT 0,
  success_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  progress INT DEFAULT 0,
  user_id INT NOT NULL,
  file_id INT,
  mapping_id INT,
  started_at DATETIME,
  completed_at DATETIME,
  report JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (file_id) REFERENCES uploaded_files(id) ON DELETE SET NULL,
  FOREIGN KEY (mapping_id) REFERENCES mappings(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS validation_errors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  migration_id INT,
  file_id INT NOT NULL,
  row_number INT NOT NULL,
  field_name VARCHAR(100),
  error_message VARCHAR(500) NOT NULL,
  row_data JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (migration_id) REFERENCES migrations(id) ON DELETE CASCADE,
  FOREIGN KEY (file_id) REFERENCES uploaded_files(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  migration_id INT,
  user_id INT,
  level ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
  action VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  metadata JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (migration_id) REFERENCES migrations(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS migrated_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  migration_id INT NOT NULL,
  legacy_id VARCHAR(50),
  source_migration_id VARCHAR(50),
  customer_id VARCHAR(50),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(150),
  phone_number VARCHAR(20),
  account_number VARCHAR(20) NOT NULL,
  account_type ENUM('savings', 'current', 'business', 'checking'),
  balance DECIMAL(15, 2) DEFAULT 0,
  currency ENUM('MAD', 'USD', 'EUR'),
  branch_code VARCHAR(20),
  account_status ENUM('active', 'frozen', 'closed') DEFAULT 'active',
  account_created_at DATETIME,
  raw_data JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (migration_id) REFERENCES migrations(id) ON DELETE CASCADE,
  INDEX idx_migrated_email (email),
  INDEX idx_migrated_account (account_number),
  INDEX idx_migrated_migration (migration_id),
  UNIQUE KEY uniq_account_per_migration (migration_id, account_number)
);
