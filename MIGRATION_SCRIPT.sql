-- ========================================
-- HSBC BANK - DATABASE MIGRATION SCRIPT
-- ========================================
-- Complete SQL for MySQL Workbench
-- Copy and paste this entire script into MySQL Workbench
-- Database: hsbc_bank
-- ========================================

USE hsbc_bank;

-- ========================================
-- STEP 1: ALTER USERS TABLE (Add 7 columns)
-- ========================================

-- These will skip silently if columns already exist
ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT NULL;
ALTER TABLE users ADD COLUMN emailNotifications BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN smsNotifications BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN pushNotifications BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN email2fa VARCHAR(50) DEFAULT 'email' COMMENT 'email or sms';
ALTER TABLE users ADD COLUMN sms2fa VARCHAR(50) DEFAULT 'email' COMMENT 'email or sms';
ALTER TABLE users ADD COLUMN twoFaEnabled BOOLEAN DEFAULT FALSE;

-- ========================================
-- STEP 2: CREATE TRANSACTIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  fromAccount VARCHAR(50) DEFAULT 'main',
  toAccount VARCHAR(100),
  amount DECIMAL(15,2) NOT NULL,
  type ENUM('transfer', 'deposit', 'withdrawal', 'payment', 'refund') DEFAULT 'transfer',
  status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'completed',
  description VARCHAR(255),
  transactionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completedDate TIMESTAMP NULL,
  referenceNo VARCHAR(100) UNIQUE,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_status (status),
  INDEX idx_date (transactionDate),
  INDEX idx_referenceNo (referenceNo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- STEP 3: CREATE CARDS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  cardNumber VARCHAR(20) NOT NULL UNIQUE,
  cardholderName VARCHAR(100),
  cardType ENUM('credit', 'debit', 'prepaid') DEFAULT 'debit',
  expiryMonth INT,
  expiryYear INT,
  cvv VARCHAR(4),
  issuer VARCHAR(50) DEFAULT 'HSBC',
  issuedDate DATE,
  status ENUM('active', 'inactive', 'blocked', 'expired') DEFAULT 'active',
  dailyLimit DECIMAL(15,2) DEFAULT 10000,
  monthlyLimit DECIMAL(15,2) DEFAULT 100000,
  totalUsed DECIMAL(15,2) DEFAULT 0,
  lastUsedDate TIMESTAMP NULL,
  isPrimary BOOLEAN DEFAULT FALSE,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_cardNumber (cardNumber),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- STEP 4: CREATE SUPPORT_TICKETS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  ticketNumber VARCHAR(50) UNIQUE,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50),
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  status ENUM('open', 'in-progress', 'waiting', 'resolved', 'closed') DEFAULT 'open',
  assignedTo INT,
  attachments JSON,
  resolution TEXT,
  resolvedAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_ticketNumber (ticketNumber)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- STEP 5: CREATE CHAT_MESSAGES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  sessionId VARCHAR(100),
  messageText TEXT NOT NULL,
  messageType ENUM('user', 'bot', 'agent') DEFAULT 'user',
  isAiResponse BOOLEAN DEFAULT FALSE,
  sentiment VARCHAR(50),
  intent VARCHAR(100),
  responseTime INT DEFAULT 0 COMMENT 'milliseconds',
  isResolved BOOLEAN DEFAULT FALSE,
  escalated BOOLEAN DEFAULT FALSE,
  escalatedTo INT,
  rating INT DEFAULT 0 COMMENT '1-5 stars',
  feedback TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_sessionId (sessionId),
  INDEX idx_date (createdAt),
  INDEX idx_messageType (messageType)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- STEP 6: CREATE NOTIFICATIONS TABLE (Phase 4A)
-- ========================================

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  type ENUM('email', 'sms', 'push', 'inapp') DEFAULT 'email',
  recipient VARCHAR(255) NOT NULL COMMENT 'email or phone',
  subject VARCHAR(255),
  message TEXT NOT NULL,
  templateName VARCHAR(100),
  templateData JSON,
  provider VARCHAR(50) COMMENT 'SendGrid, Twilio, etc',
  externalId VARCHAR(100) COMMENT 'Reference from provider',
  status ENUM('pending', 'sent', 'failed', 'bounced', 'opened', 'clicked') DEFAULT 'pending',
  deliveryMethod VARCHAR(50),
  sentAt TIMESTAMP NULL,
  failureReason TEXT,
  retryCount INT DEFAULT 0,
  maxRetries INT DEFAULT 3,
  nextRetryAt TIMESTAMP NULL,
  openedAt TIMESTAMP NULL,
  clickedAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_recipient (recipient),
  INDEX idx_sentAt (sentAt),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- STEP 7: CREATE CHAT_SESSIONS TABLE (Phase 4B)
-- ========================================

CREATE TABLE IF NOT EXISTS chat_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sessionId VARCHAR(100) UNIQUE NOT NULL,
  userId INT NOT NULL,
  agentId INT,
  sessionStatus ENUM('active', 'waiting', 'in-progress', 'closed', 'transferred') DEFAULT 'active',
  topic VARCHAR(100),
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  startedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closedAt TIMESTAMP NULL,
  duration INT COMMENT 'seconds',
  messageCount INT DEFAULT 0,
  resolution TEXT,
  rating INT COMMENT '1-5 stars',
  feedback TEXT,
  tags JSON,
  metadata JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sessionId (sessionId),
  INDEX idx_userId (userId),
  INDEX idx_status (sessionStatus),
  INDEX idx_startedAt (startedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- STEP 8: CREATE LOANS TABLE (Phase 5)
-- ========================================

CREATE TABLE IF NOT EXISTS loans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  loanType VARCHAR(50) NOT NULL COMMENT 'personal, home, auto, business',
  loanAmount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  interestRate DECIMAL(5,2) NOT NULL COMMENT 'annual percentage',
  loanTerm INT COMMENT 'months',
  monthlyEMI DECIMAL(15,2),
  status ENUM('applied', 'approved', 'disbursed', 'active', 'completed', 'defaulted') DEFAULT 'applied',
  approvedAmount DECIMAL(15,2),
  disburseDate DATE,
  maturityDate DATE,
  remainingAmount DECIMAL(15,2),
  remainingTerm INT COMMENT 'months remaining',
  loanNumber VARCHAR(50) UNIQUE,
  purpose TEXT,
  collateral VARCHAR(100),
  mortgageProperty TEXT,
  applicationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approvalDate TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_status (status),
  INDEX idx_loanNumber (loanNumber)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- STEP 9: CREATE BILLS TABLE (Phase 5)
-- ========================================

CREATE TABLE IF NOT EXISTS bills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  billType VARCHAR(50) COMMENT 'electricity, water, phone, insurance, subscription',
  provider VARCHAR(100),
  accountNumber VARCHAR(50),
  billAmount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  dueDate DATE NOT NULL,
  billingDate DATE,
  billNumber VARCHAR(50) UNIQUE,
  status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
  paymentDate TIMESTAMP NULL,
  paymentMethod VARCHAR(50),
  autoPayEnabled BOOLEAN DEFAULT FALSE,
  description TEXT,
  attachments JSON,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_status (status),
  INDEX idx_dueDate (dueDate),
  INDEX idx_billNumber (billNumber)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- STEP 10: CREATE INVESTMENTS TABLE (Phase 5)
-- ========================================

CREATE TABLE IF NOT EXISTS investments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  investmentType VARCHAR(50) COMMENT 'stocks, mutual-funds, bonds, crypto, gold',
  instrumentName VARCHAR(100),
  instrumentCode VARCHAR(20),
  quantity DECIMAL(10,4),
  purchasePrice DECIMAL(15,2),
  currentPrice DECIMAL(15,2),
  investmentDate DATE,
  totalInvested DECIMAL(15,2),
  currentValue DECIMAL(15,2),
  gainLoss DECIMAL(15,2),
  gainLossPercent DECIMAL(5,2),
  status ENUM('active', 'sold', 'matured', 'withdrawn') DEFAULT 'active',
  maturityDate DATE,
  expectedReturn DECIMAL(15,2),
  riskLevel VARCHAR(50) COMMENT 'low, medium, high',
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_investmentType (investmentType),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- STEP 11: CREATE BENEFICIARIES TABLE (Phase 5)
-- ========================================

CREATE TABLE IF NOT EXISTS beneficiaries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  beneficiaryName VARCHAR(100) NOT NULL,
  relationship VARCHAR(50),
  accountNumber VARCHAR(50),
  bankCode VARCHAR(20),
  ifscCode VARCHAR(20),
  swiftCode VARCHAR(20),
  email VARCHAR(100),
  phone VARCHAR(20),
  country VARCHAR(50),
  accountType VARCHAR(50) COMMENT 'savings, checking, credit',
  isActive BOOLEAN DEFAULT TRUE,
  lastUsedDate TIMESTAMP NULL,
  transferLimit DECIMAL(15,2),
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_isActive (isActive),
  INDEX idx_beneficiaryName (beneficiaryName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- STEP 12: CREATE AUDIT_LOGS TABLE (Phase 7)
-- ========================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  action VARCHAR(100) NOT NULL,
  actionType VARCHAR(50) COMMENT 'LOGIN, TRANSFER, CARD_BLOCK, etc',
  module VARCHAR(50) COMMENT 'auth, transaction, card, etc',
  resourceType VARCHAR(50) COMMENT 'user, card, transaction, etc',
  resourceId VARCHAR(100),
  oldValue JSON,
  newValue JSON,
  status VARCHAR(50) COMMENT 'success, failure',
  ipAddress VARCHAR(45),
  userAgent TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  details TEXT,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_userId (userId),
  INDEX idx_action (action),
  INDEX idx_timestamp (timestamp),
  INDEX idx_resourceType (resourceType),
  INDEX idx_actionType (actionType)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- STEP 13: CREATE DEVICES TABLE (Phase 7)
-- ========================================

CREATE TABLE IF NOT EXISTS devices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  deviceId VARCHAR(100) UNIQUE,
  deviceType VARCHAR(50) COMMENT 'mobile, tablet, desktop, web',
  deviceName VARCHAR(255),
  osType VARCHAR(50) COMMENT 'iOS, Android, Windows, MacOS, Linux',
  osVersion VARCHAR(50),
  browserName VARCHAR(50) COMMENT 'Chrome, Safari, Firefox, etc',
  browserVersion VARCHAR(50),
  appVersion VARCHAR(20),
  ipAddress VARCHAR(45),
  location VARCHAR(255),
  isActive BOOLEAN DEFAULT TRUE,
  lastActiveAt TIMESTAMP NULL,
  loginAttempts INT DEFAULT 0,
  failedAttempts INT DEFAULT 0,
  trustLevel VARCHAR(50) COMMENT 'trusted, untrusted',
  twoFaVerified BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_deviceId (deviceId),
  INDEX idx_isActive (isActive),
  INDEX idx_lastActiveAt (lastActiveAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- STEP 14: CREATE FEEDBACK TABLE (Phase 7)
-- ========================================

CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  feedbackType VARCHAR(50) COMMENT 'bug, feature-request, general, complaint',
  title VARCHAR(255),
  description TEXT NOT NULL,
  rating INT COMMENT '1-5 stars',
  module VARCHAR(100),
  attachments JSON,
  status ENUM('open', 'in-review', 'acknowledged', 'resolved', 'closed') DEFAULT 'open',
  priority VARCHAR(50) COMMENT 'low, medium, high',
  response TEXT,
  respondedBy INT,
  respondedAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_status (status),
  INDEX idx_feedbackType (feedbackType),
  INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- VERIFICATION QUERIES (Run after migration)
-- ========================================

-- Check all tables created
-- SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'hsbc_bank' ORDER BY TABLE_NAME;

-- Check users table columns
-- DESCRIBE users;

-- Check total tables count (should be 14)
-- SELECT COUNT(*) as total_tables FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'hsbc_bank';

-- ========================================
-- END OF MIGRATION SCRIPT
-- ========================================
