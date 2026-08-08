# 🗄️ DATABASE AUDIT & MIGRATION GUIDE

**Date:** February 20, 2026  
**Analysis:** Complete project database requirements vs current state  
**Status:** Audit Complete | Ready for Migration

---

## 📊 Current Database State

### ✅ Tables That Exist
```
✅ users table (visible in screenshot)
   Columns: id, firstName, lastName, email, password, role, createdAt
```

### ❌ Tables Missing (Should Exist But Don't)
```
❌ transactions table        - Used in server-mysql.js (Lines 200+)
❌ cards table              - Used in server-mysql.js (Lines 250+)
❌ support_tickets table    - Used in admin panel
❌ chat_messages table      - Used in chatbot system
```

### ❌ Tables Missing (Phase 4A - Email & SMS)
```
❌ notifications table      - Email/SMS logging
❌ chat_sessions table      - Live chat tracking
❌ audit_logs table         - Action tracking
❌ loans table              - Loan products
❌ bills table              - Bill payment system
❌ investments table        - Investment portfolio
❌ devices table            - Device management
❌ feedback table           - Customer feedback
❌ beneficiaries table      - Transfer recipients
```

### ⚠️ Missing Columns in Users Table
```
❌ twoFaEnabled             - 2FA toggle (missing)
❌ phone                    - For SMS (missing)
❌ emailNotifications       - Email toggle (missing)
❌ smsNotifications         - SMS toggle (missing)
❌ pushNotifications        - Push toggle (missing)
❌ email2fa                 - Email 2FA preference (missing)
❌ sms2fa                   - SMS 2FA preference (missing)
```

---

## 🎯 Complete Migration Plan

### Phase 1: Add Missing Columns to Users Table
### Phase 2: Create 4 Core Tables (Transactions, Cards, Support, Chat)
### Phase 3: Create 9 Phase 4A Tables (Advanced Features)

---

## 🔧 SQL Migration Scripts

### PHASE 1: Alter Users Table (Add Missing Columns)

```sql
-- Add columns for 2FA
ALTER TABLE users ADD COLUMN twoFaEnabled BOOLEAN DEFAULT FALSE;

-- Add columns for email/SMS notifications
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS emailNotifications BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS smsNotifications BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pushNotifications BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email2fa BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sms2fa BOOLEAN DEFAULT FALSE;
```

**Result:** 7 new columns added to users table

---

### PHASE 2: Create Core Tables

#### 1. Transactions Table
```sql
CREATE TABLE IF NOT EXISTS transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    type ENUM('credit', 'debit', 'transfer', 'payment') DEFAULT 'transfer',
    amount DECIMAL(15, 2) NOT NULL,
    description VARCHAR(255),
    recipientId INT,
    reference VARCHAR(100),
    balanceAfter DECIMAL(15, 2),
    status ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    INDEX idx_createdAt (createdAt),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

**Purpose:** Track all financial transactions  
**Used By:** Dashboard, transaction history, admin reporting

---

#### 2. Cards Table
```sql
CREATE TABLE IF NOT EXISTS cards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    cardType ENUM('debit', 'credit', 'prepaid') DEFAULT 'debit',
    cardName VARCHAR(100),
    lastFour VARCHAR(4),
    cardNumber VARCHAR(20),
    expiryDate VARCHAR(5),
    cardholderName VARCHAR(100),
    provider VARCHAR(50),
    spendingLimit DECIMAL(15, 2),
    dailyLimit DECIMAL(15, 2),
    isDefault BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'inactive', 'blocked', 'expired') DEFAULT 'active',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    INDEX idx_status (status),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

**Purpose:** Store user payment cards  
**Used By:** Card management page, transaction processing

---

#### 3. Support Tickets Table
```sql
CREATE TABLE IF NOT EXISTS support_tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    assignedTo INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolvedAt TIMESTAMP NULL,
    INDEX idx_userId (userId),
    INDEX idx_status (status),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE SET NULL
);
```

**Purpose:** Customer support ticket system  
**Used By:** Support widget, admin dashboard

---

#### 4. Chat Messages Table
```sql
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    messageText TEXT,
    senderType ENUM('user', 'bot', 'admin') DEFAULT 'user',
    sentiment VARCHAR(50),
    keywords JSON,
    matchedIntents JSON,
    response TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    INDEX idx_createdAt (createdAt),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

**Purpose:** Chatbot conversation history  
**Used By:** Chatbot widget, conversation tracking

---

### PHASE 3: Create Phase 4A Tables (Advanced Features)

#### 5. Notifications Table (Email/SMS Logs)
```sql
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    type ENUM('email', 'sms', 'push', 'in-app') DEFAULT 'in-app',
    title VARCHAR(255) NOT NULL,
    message TEXT,
    metadata JSON,
    isRead BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    INDEX idx_createdAt (createdAt),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

**Purpose:** Log all email/SMS notifications sent  
**Used By:** Email/SMS service, notification history

---

#### 6. Chat Sessions Table (Live Chat Support)
```sql
CREATE TABLE IF NOT EXISTS chat_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    agentId INT,
    status ENUM('active', 'closed', 'waiting') DEFAULT 'active',
    startTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    endTime TIMESTAMP NULL,
    rating INT,
    feedback TEXT,
    INDEX idx_userId (userId),
    INDEX idx_agentId (agentId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (agentId) REFERENCES users(id) ON DELETE SET NULL
);
```

**Purpose:** Live chat session tracking  
**Used By:** Live chat system (Phase 4B)

---

#### 7. Audit Logs Table (Action Tracking)
```sql
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT,
    action VARCHAR(255) NOT NULL,
    details JSON,
    ipAddress VARCHAR(45),
    userAgent TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    INDEX idx_createdAt (createdAt),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);
```

**Purpose:** Audit trail for all user actions  
**Used By:** Security monitoring, compliance

---

#### 8. Loans Table (Loan Products)
```sql
CREATE TABLE IF NOT EXISTS loans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    rate DECIMAL(5, 2) NOT NULL,
    tenure INT NOT NULL,
    emiAmount DECIMAL(15, 2),
    paidAmount DECIMAL(15, 2) DEFAULT 0,
    status ENUM('pending', 'approved', 'rejected', 'active', 'closed', 'defaulted') DEFAULT 'pending',
    approvedBy INT,
    approvalDate TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    INDEX idx_status (status),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approvedBy) REFERENCES users(id) ON DELETE SET NULL
);
```

**Purpose:** Loan management system  
**Used By:** Loan products, financial dashboard (Phase 5)

---

#### 9. Bills Table (Bill Payments)
```sql
CREATE TABLE IF NOT EXISTS bills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    billName VARCHAR(255) NOT NULL,
    billAmount DECIMAL(15, 2) NOT NULL,
    dueDate DATE NOT NULL,
    billerName VARCHAR(255),
    billCategory ENUM('utility', 'credit_card', 'insurance', 'loan', 'other') DEFAULT 'other',
    status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
    paidOn TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    INDEX idx_dueDate (dueDate),
    INDEX idx_status (status),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

**Purpose:** Bill payment tracking  
**Used By:** Bill management, payment reminders (Phase 4A)

---

#### 10. Investments Table (Investment Portfolio)
```sql
CREATE TABLE IF NOT EXISTS investments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    investmentType ENUM('mutual_fund', 'stock', 'fd', 'bond', 'sip') DEFAULT 'mutual_fund',
    investmentName VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currentValue DECIMAL(15, 2),
    returnPercentage DECIMAL(6, 2),
    riskLevel ENUM('low', 'medium', 'high') DEFAULT 'medium',
    purchaseDate DATE,
    targetDate DATE,
    status ENUM('active', 'matured', 'closed') DEFAULT 'active',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    INDEX idx_status (status),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

**Purpose:** Investment tracking  
**Used By:** Investment portfolio (Phase 5)

---

#### 11. Devices Table (Device Management & Security)
```sql
CREATE TABLE IF NOT EXISTS devices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    deviceName VARCHAR(255),
    deviceType ENUM('mobile', 'tablet', 'desktop') DEFAULT 'mobile',
    osType VARCHAR(50),
    ipAddress VARCHAR(45),
    isTrusted BOOLEAN DEFAULT FALSE,
    lastActiveAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

**Purpose:** Device tracking for security  
**Used By:** Login alerts, device management

---

#### 12. Feedback Table (Customer Feedback)
```sql
CREATE TABLE IF NOT EXISTS feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT,
    feedbackType ENUM('bug', 'feature_request', 'improvement', 'complaint', 'compliment') DEFAULT 'feedback',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    rating INT,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolvedAt TIMESTAMP NULL,
    INDEX idx_userId (userId),
    INDEX idx_status (status),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);
```

**Purpose:** Customer feedback system  
**Used By:** Feedback collection, improvement

---

#### 13. Beneficiaries Table (Money Transfer Recipients)
```sql
CREATE TABLE IF NOT EXISTS beneficiaries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    beneficiaryName VARCHAR(255) NOT NULL,
    beneficiaryEmail VARCHAR(255),
    beneficiaryPhone VARCHAR(20),
    accountNumber VARCHAR(50),
    bankCode VARCHAR(10),
    ifscCode VARCHAR(11),
    relationship VARCHAR(100),
    isVerified BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

**Purpose:** Store money transfer recipients  
**Used By:** Transfers page (Phase 5)

---

## 📋 Complete SQL Migration Script

Run this entire script in your MySQL to add everything at once:

```sql
-- =================================================================
-- PHASE 1: Alter Users Table
-- =================================================================

ALTER TABLE users ADD COLUMN twoFaEnabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS emailNotifications BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS smsNotifications BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pushNotifications BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email2fa BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sms2fa BOOLEAN DEFAULT FALSE;

-- =================================================================
-- PHASE 2: Create Core Tables
-- =================================================================

CREATE TABLE IF NOT EXISTS transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    type ENUM('credit', 'debit', 'transfer', 'payment') DEFAULT 'transfer',
    amount DECIMAL(15, 2) NOT NULL,
    description VARCHAR(255),
    recipientId INT,
    reference VARCHAR(100),
    balanceAfter DECIMAL(15, 2),
    status ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    INDEX idx_createdAt (createdAt),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    cardType ENUM('debit', 'credit', 'prepaid') DEFAULT 'debit',
    cardName VARCHAR(100),
    lastFour VARCHAR(4),
    cardNumber VARCHAR(20),
    expiryDate VARCHAR(5),
    cardholderName VARCHAR(100),
    provider VARCHAR(50),
    spendingLimit DECIMAL(15, 2),
    dailyLimit DECIMAL(15, 2),
    isDefault BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'inactive', 'blocked', 'expired') DEFAULT 'active',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    INDEX idx_status (status),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS support_tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    assignedTo INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolvedAt TIMESTAMP NULL,
    INDEX idx_userId (userId),
    INDEX idx_status (status),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    messageText TEXT,
    senderType ENUM('user', 'bot', 'admin') DEFAULT 'user',
    sentiment VARCHAR(50),
    keywords JSON,
    matchedIntents JSON,
    response TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    INDEX idx_createdAt (createdAt),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- =================================================================
-- PHASE 3: Create Advanced Feature Tables (Phase 4A+)
-- =================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    type ENUM('email', 'sms', 'push', 'in-app') DEFAULT 'in-app',
    title VARCHAR(255) NOT NULL,
    message TEXT,
    metadata JSON,
    isRead BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    INDEX idx_createdAt (createdAt),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    agentId INT,
    status ENUM('active', 'closed', 'waiting') DEFAULT 'active',
    startTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    endTime TIMESTAMP NULL,
    rating INT,
    feedback TEXT,
    INDEX idx_userId (userId),
    INDEX idx_agentId (agentId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (agentId) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT,
    action VARCHAR(255) NOT NULL,
    details JSON,
    ipAddress VARCHAR(45),
    userAgent TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    INDEX idx_createdAt (createdAt),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS loans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    rate DECIMAL(5, 2) NOT NULL,
    tenure INT NOT NULL,
    emiAmount DECIMAL(15, 2),
    paidAmount DECIMAL(15, 2) DEFAULT 0,
    status ENUM('pending', 'approved', 'rejected', 'active', 'closed', 'defaulted') DEFAULT 'pending',
    approvedBy INT,
    approvalDate TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    INDEX idx_status (status),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approvedBy) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS bills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    billName VARCHAR(255) NOT NULL,
    billAmount DECIMAL(15, 2) NOT NULL,
    dueDate DATE NOT NULL,
    billerName VARCHAR(255),
    billCategory ENUM('utility', 'credit_card', 'insurance', 'loan', 'other') DEFAULT 'other',
    status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
    paidOn TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    INDEX idx_dueDate (dueDate),
    INDEX idx_status (status),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS investments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    investmentType ENUM('mutual_fund', 'stock', 'fd', 'bond', 'sip') DEFAULT 'mutual_fund',
    investmentName VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currentValue DECIMAL(15, 2),
    returnPercentage DECIMAL(6, 2),
    riskLevel ENUM('low', 'medium', 'high') DEFAULT 'medium',
    purchaseDate DATE,
    targetDate DATE,
    status ENUM('active', 'matured', 'closed') DEFAULT 'active',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    INDEX idx_status (status),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS devices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    deviceName VARCHAR(255),
    deviceType ENUM('mobile', 'tablet', 'desktop') DEFAULT 'mobile',
    osType VARCHAR(50),
    ipAddress VARCHAR(45),
    isTrusted BOOLEAN DEFAULT FALSE,
    lastActiveAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT,
    feedbackType ENUM('bug', 'feature_request', 'improvement', 'complaint', 'compliment') DEFAULT 'feedback',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    rating INT,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolvedAt TIMESTAMP NULL,
    INDEX idx_userId (userId),
    INDEX idx_status (status),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS beneficiaries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    beneficiaryName VARCHAR(255) NOT NULL,
    beneficiaryEmail VARCHAR(255),
    beneficiaryPhone VARCHAR(20),
    accountNumber VARCHAR(50),
    bankCode VARCHAR(10),
    ifscCode VARCHAR(11),
    relationship VARCHAR(100),
    isVerified BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🚀 How to Apply This Migration

### Option 1: Using MySQL Workbench (UI)
1. Open MySQL Workbench
2. Connect to your database
3. Go to Database → hsbc_bank
4. Click "File → Open SQL Script" or paste the SQL above
5. Execute the script
6. Verify tables are created

### Option 2: Using MySQL Command Line
```bash
mysql -u hsbc_user -p hsbc_bank < migration.sql
```

### Option 3: Using Node.js Script
Run the migration script we created earlier:
```bash
cd hsbc-bank
node create-advanced-tables.js
```

---

## ✅ Verification Checklist

After running migration, verify:

### Check Tables Exist
```sql
SHOW TABLES;
-- Should show all 13 tables
```

### Check Users Table Has New Columns
```sql
DESCRIBE users;
-- Should show 14+ columns including: phone, emailNotifications, smsNotifications, etc.
```

### Verify Sample Data
```sql
SELECT * FROM users;
-- Should show existing 4 users
```

### Check Foreign Key Constraints
```sql
SELECT TABLE_NAME, CONSTRAINT_NAME 
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE REFERENCED_TABLE_NAME = 'users';
``

---

## 📊 Database Summary After Migration

### Total Tables: 13
```
1.  users                  (Enhanced with 7 new columns)
2.  transactions           (New - Core)
3.  cards                  (New - Core)
4.  support_tickets        (New - Core)
5.  chat_messages          (New - Core)
6.  notifications          (New - Phase 4A)
7.  chat_sessions          (New - Phase 4B)
8.  audit_logs             (New - Phase 7)
9.  loans                  (New - Phase 5)
10. bills                  (New - Phase 5)
11. investments            (New - Phase 5)
12. devices                (New - Phase 7)
13. feedback               (New - Phase 7)
14. beneficiaries          (New - Phase 5)
```

### Users Table Columns After Migration: 14
```
1.  id
2.  firstName
3.  lastName
4.  email
5.  password
6.  role
7.  createdAt
8.  twoFaEnabled          (New)
9.  phone                 (New)
10. emailNotifications    (New)
11. smsNotifications      (New)
12. pushNotifications     (New)
13. email2fa              (New)
14. sms2fa                (New)
```

---

## 🎯 What Features Each Table Enables

| Table | Phase | Features Enabled |
|-------|-------|------------------|
| transactions | 1 | Transaction history, dashboard balance |
| cards | 2 | Card management, card payments |
| support_tickets | 2 | Ticket system, admin dashboard |
| chat_messages | 3 | Chatbot functionality |
| notifications | 4A | Email/SMS logging, notification history |
| chat_sessions | 4B | Live chat support system |
| audit_logs | 7 | Security monitoring, compliance |
| loans | 5 | Loan products, loan management |
| bills | 5 | Bill payments, due reminders |
| investments | 5 | Investment portfolio tracking |
| devices | 7 | Device tracking, security alerts |
| feedback | 7 | Customer feedback, improvements |
| beneficiaries | 5 | Transfer recipients, address book |

---

## 🔒 Database Integrity

### Foreign Keys Added
All child tables reference users table:
- ✅ transactions.userId → users.id
- ✅ cards.userId → users.id
- ✅ support_tickets.userId → users.id
- ✅ chat_messages.userId → users.id
- ✅ notifications.userId → users.id
- ✅ chat_sessions.userId → users.id
- ✅ audit_logs.userId → users.id
- ✅ loans.userId → users.id
- ✅ bills.userId → users.id
- ✅ investments.userId → users.id
- ✅ devices.userId → users.id
- ✅ feedback.userId → users.id
- ✅ beneficiaries.userId → users.id

### Cascade Deletes
- When user deleted, all related records deleted automatically
- Data integrity maintained

### Indexes Added
- All frequently searched columns indexed (userId, status, createdAt, etc.)
- Improves query performance

---

## ⚠️ Important Notes

### Order of Creation
1. **Alter users table FIRST** (before creating other tables with FK)
2. **Create core tables SECOND** (transactions, cards, etc.)
3. **Create Phase 4A+ tables THIRD** (notifications, loans, etc.)

### Current Users Not Affected
- Existing 4 users remain intact
- New columns default to NULL or FALSE
- No data loss

### Production Recommendation
- Take database backup before migration
- Apply migration in off-peak hours
- Test on development first
- Verify data integrity after migration

### Backup Command
```bash
mysqldump -u hsbc_user -p hsbc_bank > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## 🎯 Next Steps After Migration

1. **Verify migration successful**
   ```bash
   mysql -u hsbc_user -p hsbc_bank -e "SHOW TABLES;"
   ```

2. **Restart server**
   ```bash
   node server-mysql.js
   ```

3. **Run email/SMS tests**
   ```bash
   node test-email.js
   node test-sms.js
   ```

4. **Check server logs** for any database errors

5. **Verify all features working**:
   - Signup (should create user)
   - Login (should retrieve user)
   - Dashboard (should load)
   - Cards page
   - Admin panel

---

## 📞 Troubleshooting

### Error: "Table 'hsbc_bank.users' already exists"
**Solution:** Table exists already, skip that CREATE TABLE command

### Error: "Foreign key constraint fails"
**Solution:** 
- Ensure users table exists first
- Run ALTER table commands before CREATE TABLE commands

### Error: "Column 'X' already exists"
**Solution:** Column already added, can skip or use IF NOT EXISTS clause

### Users table not showing new columns
**Solution:** 
```sql
DESCRIBE users;  -- Check columns
ALTER TABLE users DROP COLUMN columnName;  -- Remove if duplicate
-- Re-run ADD COLUMN command
```

---

## ✨ Complete Database Now Supports

✅ User authentication (Phase 1-3)  
✅ Card management (Phase 2-3)  
✅ Transaction tracking (Phase 1-3)  
✅ Support system (Phase 2-3)  
✅ Chatbot (Phase 3)  
✅ Email/SMS notifications (Phase 4A) ← **NEW**  
✅ Live chat (Phase 4B)  
✅ Loans (Phase 5)  
✅ Bills (Phase 5)  
✅ Investments (Phase 5)  
✅ Security monitoring (Phase 7)  
✅ Device tracking (Phase 7)  
✅ Compliance/Audit (Phase 7)  

---

**Status: Ready to Migrate** ✅  
**Downtime Required: <5 minutes**  
**Data Loss Risk: 0% (no data deletion)**  
**Backup Recommended: Yes**

Ready to apply? Run: `node create-advanced-tables.js`
