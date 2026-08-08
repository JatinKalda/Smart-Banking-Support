# 🗄️ MySQL Workbench - Complete Database Setup Guide

## ✅ Step 1: Open MySQL Workbench

1. **Launch MySQL Workbench**
   - Search for "MySQL Workbench" in Windows Start Menu
   - Click to open
   - Wait for it to load

---

## ✅ Step 2: Connect to Your Database

### If You Already Have a Connection:

1. **Look at the Workbench home screen**
2. **Under "MySQL Connections"** you should see your connection (e.g., "Local instance MySQL80" or "hsbc_bank")
3. **Double-click on it** to connect

### If You DON'T Have a Connection Yet:

1. **Click the "+" button** next to "MySQL Connections"
2. **Connection Name:** `hsbc_bank` (or anything you like)
3. **Connection Method:** `Standard (TCP/IP)` (should be default)
4. **Hostname:** `localhost` or `127.0.0.1`
5. **Port:** `3306` (default)
6. **Username:** `root` or `hsbc_user` (whatever you use)
7. **Password:** Click "Store in Vault" and enter your MySQL password
8. **Click "Test Connection"** to verify it works
9. **Click "OK"**

### After Connection is Made:

- You should see your connection in the home screen
- **Double-click it** to open/connect

---

## ✅ Step 3: Verify You're Connected to the Right Database

After double-clicking your connection:

1. **Look at the left panel** (Schemas)
2. **You should see:** `hsbc_bank` listed
3. **Right-click on `hsbc_bank`** → **Set as default schema**
   - The name will turn **bold** (meaning it's active)

---

## ✅ Step 4: Check Current Database State

Before running the migration, let's see what exists:

1. **In the top menu:** Click **File** → **New Query Tab**
   - OR press **Ctrl+T** for a new query
   
2. **Copy this query:**
   ```sql
   USE hsbc_bank;
   SHOW TABLES;
   ```

3. **Paste it in the editor**

4. **Execute:** Click the **⚡ Execute** button (or **Ctrl+Shift+Enter**)

**Expected Result:**
```
Tables_in_hsbc_bank
users
add-roles
```

This shows you only have the `users` table. After migration, you'll have 14 tables.

---

## ✅ Step 5: Load the Migration Script

### **Option A: Open the SQL File Directly** (EASIEST)

1. **In MySQL Workbench top menu:** Click **File** → **Open SQL Script**
2. **Navigate to:** `d:\projects\bank card\hsbc-bank\MIGRATION_SCRIPT.sql`
3. **Click "Open"**
4. The entire migration script should load in a new tab

### **Option B: Copy-Paste the Script Manually**

1. **Open the Migration Script file:**
   - Open File Explorer
   - Navigate to: `d:\projects\bank card\hsbc-bank`
   - Right-click **MIGRATION_SCRIPT.sql** → **Open With** → **Notepad**

2. **Copy the entire content** (Ctrl+A, Ctrl+C)

3. **In MySQL Workbench:**
   - Create a new query tab (Ctrl+T)
   - Paste the script (Ctrl+V)

---

## ✅ Step 6: Execute the Migration Script

1. **Look at the script in Workbench**
2. **Click the ⚡ Execute** button (top toolbar)
   - OR press **Ctrl+Shift+Enter**

### 🎯 What Will Happen:

```
Successfully executed:
✅ Altered users table (added 7 columns)
✅ Created transactions table
✅ Created cards table
✅ Created support_tickets table
✅ Created chat_messages table
✅ Created notifications table (Phase 4A)
✅ Created chat_sessions table (Phase 4B)
✅ Created loans table (Phase 5)
✅ Created bills table (Phase 5)
✅ Created investments table (Phase 5)
✅ Created beneficiaries table (Phase 5)
✅ Created audit_logs table (Phase 7)
✅ Created devices table (Phase 7)
✅ Created feedback table (Phase 7)

Total: 14 tables created
```

---

## ✅ Step 7: Verify the Migration was Successful

After execution completes, run these verification queries:

### Query 1: Check All Tables

```sql
USE hsbc_bank;
SHOW TABLES;
```

**Expected Output (14 tables):**
```
audit_logs
beneficiaries
bills
cards
chat_messages
chat_sessions
devices
feedback
investments
loans
notifications
support_tickets
transactions
users
```

---

### Query 2: Check Users Table Structure

```sql
DESCRIBE users;
```

**Expected Output (14 columns - 7 original + 7 new):**
```
Field                  Type              Null    Key    Default    Extra
id                     int(11)           NO      PRI    NULL       auto_increment
firstName              varchar(100)      YES            NULL
lastName               varchar(100)      YES            NULL
email                  varchar(100)      NO      UNI    NULL
password               varchar(255)      NO             NULL
role                   varchar(50)       YES            admin
createdAt              timestamp         NO             CURRENT_TIMESTAMP
phone                  varchar(20)       YES            NULL          ← NEW
emailNotifications     tinyint(1)        YES            1            ← NEW
smsNotifications       tinyint(1)        YES            1            ← NEW
pushNotifications      tinyint(1)        YES            1            ← NEW
email2fa               varchar(50)       YES            email        ← NEW
sms2fa                 varchar(50)       YES            email        ← NEW
twoFaEnabled           tinyint(1)        YES            0            ← NEW
```

---

### Query 3: Check Existing Users Are Intact

```sql
SELECT * FROM users;
```

**Expected Output:**
```
4 rows returned (your existing users are safe!)
```

---

### Query 4: Check Transaction Table Structure

```sql
DESCRIBE transactions;
```

**Expected Output (20+ columns):**
```
id, userId, fromAccount, toAccount, amount, type, status, description, 
transactionDate, completedDate, referenceNo, notes, createdAt, updatedAt
```

---

### Query 5: Count Total Tables

```sql
SELECT COUNT(*) as total_tables 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'hsbc_bank';
```

**Expected Output:**
```
total_tables
14
```

---

## 🔴 If You Get Errors

### Error: "Table already exists"

✅ **This is NORMAL!** It means some tables were already created.
- The script will skip them automatically
- Continue with verification

### Error: "Duplicate column name"

✅ **This is NORMAL!** It means some columns already exist in users table.
- The script will skip them
- Continue with verification

### Error: "Access denied for user"

❌ **You need to check your MySQL credentials:**
1. Verify your username and password
2. Make sure MySQL Service is running (Windows Services)
3. Try reconnecting

### Error: "Unknown database 'hsbc_bank'"

❌ **The database doesn't exist yet:**
1. Create it first with this query:
   ```sql
   CREATE DATABASE IF NOT EXISTS hsbc_bank 
   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

### Error: "Syntax error near..."

❌ **Script copy-paste issue:**
1. Try opening the SQL file directly (Option A in Step 5)
2. Don't manually copy-paste

---

## ✅ Step 8: After Successful Migration

### Restart Your Node Server

```bash
cd "d:\projects\bank card\hsbc-bank"
node server-mysql.js
```

**Expected:** Server starts without "table not found" errors

---

### Test the Dashboard

Open in browser: **http://localhost:3000/dashboard**

✅ Should load without errors  
✅ All pages should work (cards, transfers, settings)  
✅ Admin panel should work

---

### Run Server Test

```bash
cd "d:\projects\bank card\hsbc-bank"
node test-db.js
```

**Expected Output:**
```
✅ Database connection successful
✅ Users table in use
✅ All 14 tables found
```

---

## 📊 Complete Verification Checklist

After migration, verify all data is connected:

```sql
-- 1. Count of each table
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'cards', COUNT(*) FROM cards
UNION ALL
SELECT 'support_tickets', COUNT(*) FROM support_tickets
UNION ALL
SELECT 'chat_messages', COUNT(*) FROM chat_messages
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'chat_sessions', COUNT(*) FROM chat_sessions
UNION ALL
SELECT 'loans', COUNT(*) FROM loans
UNION ALL
SELECT 'bills', COUNT(*) FROM bills
UNION ALL
SELECT 'investments', COUNT(*) FROM investments
UNION ALL
SELECT 'beneficiaries', COUNT(*) FROM beneficiaries
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs
UNION ALL
SELECT 'devices', COUNT(*) FROM devices
UNION ALL
SELECT 'feedback', COUNT(*) FROM feedback;
```

**Expected Output:**
```
users              4          ← Your 4 existing users
transactions       0          ← Will be 0 initially
cards              0          ← Will be 0 initially
support_tickets    0          ← Will be 0 initially
chat_messages      0          ← Will be 0 initially
notifications      0          ← Will be 0 initially
chat_sessions      0          ← Will be 0 initially
loans              0          ← Will be 0 initially
bills              0          ← Will be 0 initially
investments        0          ← Will be 0 initially
beneficiaries      0          ← Will be 0 initially
audit_logs         0          ← Will be 0 initially
devices            0          ← Will be 0 initially
feedback           0          ← Will be 0 initially
```

---

## 🎯 Summary of Data Connections

After migration, your data is connected like this:

```
MySQL Database (hsbc_bank)
├── users (4 rows - your accounts)
├── transactions ← Links to users via userId
├── cards ← Links to users via userId
├── support_tickets ← Links to users via userId
├── chat_messages ← Links to users via userId
├── notifications ← Links to users via userId
├── chat_sessions ← Links to users via userId
├── loans ← Links to users via userId
├── bills ← Links to users via userId
├── investments ← Links to users via userId
├── beneficiaries ← Links to users via userId
├── audit_logs ← Links to users via userId
├── devices ← Links to users via userId
└── feedback ← Links to users via userId

Server (Node.js)
└── Connects to hsbc_bank DB
    └── Queries all 14 tables
        └── Displays in Dashboard/Admin/Cards/Transfers

Frontend (HTML/CSS/JS)
└── Fetches data from Server
    └── Displays on Pages
```

---

## 🎉 Success Indicators

You've successfully connected everything when:

✅ All 14 tables exist in MySQL  
✅ Users table has 14 columns  
✅ Your 4 users are still intact  
✅ Server starts without errors  
✅ Dashboard loads at http://localhost:3000/dashboard  
✅ All pages work (cards, transfers, settings)  
✅ Admin panel shows stats correctly  

---

## 📞 Need Help?

If you get stuck:

1. **Copy the error message exactly**
2. **Tell me which step failed**
3. **Share the error text**
4. **I'll fix it for you**

---

**Status:** Ready to connect!  
**Next Step:** Execute the MIGRATION_SCRIPT.sql in MySQL Workbench
