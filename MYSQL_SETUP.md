# MySQL Setup Guide for HSBC Bank Website

## 📋 Prerequisites

Before connecting MySQL to your Node.js application, ensure you have:
1. **MySQL Server** installed on your computer
2. **Node.js** already installed
3. The project folder with all files

---

## 🚀 Step 1: Install MySQL Server

### For Windows:

1. Download MySQL installer from: https://dev.mysql.com/downloads/windows/installer/
2. Run the installer and follow these steps:
   - Choose `Full Setup`
   - Install MySQL Server (recommended: MySQL 8.0 or later)
   - Keep default port: **3306**
   - Configure MySQL as a Windows Service
   - Set root password (remember this!)

3. After installation, test MySQL by opening Command Prompt:
```bash
mysql --version
```

### For Mac:

```bash
# Using Homebrew
brew install mysql
brew services start mysql
mysql_secure_installation
```

### For Linux (Ubuntu):

```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

---

## 🔧 Step 2: Start MySQL Service

### Windows:
```bash
# Open Command Prompt as Administrator
net start MySQL80
```

Or use MySQL Workbench (installed with MySQL):
1. Open MySQL Workbench
2. You'll see the MySQL connection

### Mac:
```bash
brew services start mysql
```

### Linux:
```bash
sudo systemctl start mysql
```

---

## 📦 Step 3: Install MySQL Package in Node.js

Open Command Prompt in your project folder:

```bash
cd "d:\projects\bank card\hsbc-bank"
npm install mysql2
```

This installs the `mysql2` package needed for Node.js to connect to MySQL.

---

## 🔑 Step 4: Configure MySQL Connection

### Option A: Using Root User (Simple - For Development Only)

1. Open `db-mysql.js` in the project folder

2. Update the configuration:
```javascript
const pool = mysql.createPool({
  host: 'localhost',        // Usually localhost
  user: 'root',             // MySQL username (default is root)
  password: 'your_password', // THE PASSWORD YOU SET DURING INSTALLATION
  database: 'hsbc_bank',    // Database name
  // ... rest of config
});
```

3. **Replace `your_password`** with the root password you created during MySQL setup

### Option B: Create a New MySQL User (Recommended for Security)

1. Open Command Prompt and connect to MySQL:

```bash
mysql -u root -p
```

When prompted, enter your MySQL root password.

2. Create a new user and database:

```sql
# Create the database
CREATE DATABASE hsbc_bank;

# Create a new user for the app
CREATE USER 'hsbc_user'@'localhost' IDENTIFIED BY 'hsbc_password123';

# Give permissions
GRANT ALL PRIVILEGES ON hsbc_bank.* TO 'hsbc_user'@'localhost';

# Apply changes
FLUSH PRIVILEGES;

# Exit MySQL
EXIT;
```

3. Update `db-mysql.js`:
```javascript
const pool = mysql.createPool({
  host: 'localhost',
  user: 'hsbc_user',              // New user
  password: 'hsbc_password123',   // New password
  database: 'hsbc_bank',
  // ... rest of config
});
```

---

## 🖥️ Step 5: Update package.json

Add MySQL script to `package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "start:mysql": "node server-mysql.js",
    "dev": "node server-mysql.js"
  }
}
```

---

## ▶️ Step 6: Run the Application with MySQL

### Make sure MySQL Service is Running

**Windows:**
```bash
net start MySQL80
```

### Start the Application

```bash
cd "d:\projects\bank card\hsbc-bank"
npm run start:mysql
```

You should see:
```
╔════════════════════════════════════════╗
║   HSBC Bank Website Running! ✨       ║
╚════════════════════════════════════════╝
🌐 Open browser: http://localhost:3000
🚀 Using MySQL Database
```

### Open in Browser:
```
http://localhost:3000
```

---

## ✅ Verify MySQL Connection

1. Open MySQL command line (or use MySQL Workbench):

```bash
mysql -u root -p
# Enter password
```

2. Check if database exists:

```sql
SHOW DATABASES;
```

You should see `hsbc_bank` in the list.

3. View the users table:

```sql
USE hsbc_bank;
SHOW TABLES;
SELECT * FROM users;
```

4. Exit:
```sql
EXIT;
```

---

## 🐛 Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:3306"
- MySQL service is not running
- **Solution:** Start MySQL service (see Step 2)

### Error: "Access denied for user 'root'"
- Wrong password
- **Solution:** Check the password in `db-mysql.js`

### Error: "Unknown database 'hsbc_bank'"
- Database not created
- **Solution:** Run the database creation commands again or let the app create it

### Error: "PROTOCOL_SEQUENCE_TIMEOUT"
- MySQL server crashed or is not responsive
- **Solution:** Restart MySQL service:

**Windows:**
```bash
net stop MySQL80
net start MySQL80
```

### Error: "Can't connect to local MySQL server"
- MySQL not installed or not started
- **Solution:** Follow Step 1 & 2 again

---

## 🔐 Security Notes

⚠️ **Important for Production:**

1. **Never commit passwords to Git** - Use environment variables:

Create `.env` file:
```
MYSQL_HOST=localhost
MYSQL_USER=hsbc_user
MYSQL_PASSWORD=hsbc_password123
MYSQL_DATABASE=hsbc_bank
```

Update `db-mysql.js`:
```javascript
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});
```

Install dotenv:
```bash
npm install dotenv
```

2. **Encrypt passwords** - Don't store plain text passwords (we'll add this later)

3. **Use HTTPS** - For production deployment

---

## 📊 Using MySQL Workbench (GUI Tool)

Alternative to command line:

1. Download: https://dev.mysql.com/downloads/workbench/
2. Install and open MySQL Workbench
3. Create new connection with:
   - Host: localhost
   - Port: 3306
   - User: root
   - Password: your_password
4. Use SQL editor to run commands visually

---

## 🎯 Next Steps

1. ✅ Install MySQL
2. ✅ Start MySQL Service
3. ✅ Configure connection credentials
4. ✅ Run `npm install mysql2`
5. ✅ Start app with `npm run start:mysql`
6. Test by signing up and checking database

---

## 📞 Quick Reference Commands

```bash
# Start MySQL service (Windows)
net start MySQL80

# Stop MySQL service (Windows)
net stop MySQL80

# Connect to MySQL
mysql -u root -p

# View databases
SHOW DATABASES;

# Create database
CREATE DATABASE hsbc_bank;

# Use database
USE hsbc_bank;

# View tables
SHOW TABLES;

# View table data
SELECT * FROM users;

# Exit MySQL
EXIT;
```

---

## ✨ Switching Between Databases

**To use SQLite:** (default)
```bash
npm start
```

**To use MySQL:**
```bash
npm run start:mysql
```

Both are available! Choose based on your needs.

---

Good luck! 🚀 If you have issues, check the troubleshooting section above.
