const pool = require('../db-mysql');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { auditLog } = require('../services/audit-service');
const otpStore = require('../services/otp-store');
const bcrypt = require('bcryptjs');

let notificationService;
function getNotifications() {
  if (!notificationService) {
    try {
      notificationService = require('../services/notification-service');
    } catch (error) {
      console.warn('Notification service unavailable:', error.message);
      notificationService = { sendWelcomeNotification: async () => {}, sendTransactionNotification: async () => {}, send2FANotification: async () => {}, updatePreferences: async () => {} };
    }
  }
  return notificationService;
}

function registerApiExtensions(app) {
  // Account balance and monthly stats
  app.get('/api/account', requireAuth, async (req, res) => {
    try {
      const userId = req.auth.id;
      const connection = await pool.getConnection();

      const [accounts] = await connection.query(
        'SELECT id, accountNumber, accountType, balance, status FROM accounts WHERE userId = ?',
        [userId]
      );
      const [users] = await connection.query(
        'SELECT twoFaEnabled FROM users WHERE id = ?',
        [userId]
      );
      const [monthStats] = await connection.query(
        `SELECT
          COALESCE(SUM(CASE WHEN type IN ('debit', 'payment') THEN amount ELSE 0 END), 0) as spent,
          COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) as received
         FROM transactions
         WHERE userId = ? AND MONTH(createdAt) = MONTH(NOW()) AND YEAR(createdAt) = YEAR(NOW())`,
        [userId]
      );
      connection.release();

      const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);
      const savingsAcc = accounts.find(a => a.accountType === 'savings');
      const checkingAcc = accounts.find(a => a.accountType === 'checking');
      const fixedAcc = accounts.find(a => a.accountType === 'fixed');
      const recurringAcc = accounts.find(a => a.accountType === 'recurring');

      res.json({
        success: true,
        balance: totalBalance,
        accounts: accounts,
        savings: savingsAcc ? parseFloat(savingsAcc.balance) : 0,
        checking: checkingAcc ? parseFloat(checkingAcc.balance) : 0,
        fixed: fixedAcc ? parseFloat(fixedAcc.balance) : 0,
        recurring: recurringAcc ? parseFloat(recurringAcc.balance) : 0,
        available: checkingAcc ? parseFloat(checkingAcc.balance) : 0,
        status: accounts[0]?.status || 'active',
        twoFaEnabled: !!users[0]?.twoFaEnabled,
        monthSpent: parseFloat(monthStats[0]?.spent || 0),
        monthReceived: parseFloat(monthStats[0]?.received || 0)
      });
    } catch (error) {
      console.error('Error fetching account:', error);
      res.status(500).json({ success: false, message: 'Error fetching account' });
    }
  });

  // Monthly statement
  app.get('/api/statements', requireAuth, async (req, res) => {
    try {
      const userId = req.auth.id;
      const month = req.query.month || new Date().toISOString().slice(0, 7);
      const connection = await pool.getConnection();

      const [users] = await connection.query(
        'SELECT firstName, lastName, email FROM users WHERE id = ?',
        [userId]
      );
      const [transactions] = await connection.query(
        `SELECT * FROM transactions
         WHERE userId = ? AND DATE_FORMAT(createdAt, '%Y-%m') = ?
         ORDER BY createdAt ASC`,
        [userId, month]
      );
      const [accounts] = await connection.query(
        'SELECT balance FROM accounts WHERE userId = ?',
        [userId]
      );
      connection.release();

      const totalDebit = transactions.filter(t => t.type === 'debit' || t.type === 'payment')
        .reduce((s, t) => s + parseFloat(t.amount), 0);
      const totalCredit = transactions.filter(t => t.type === 'credit')
        .reduce((s, t) => s + parseFloat(t.amount), 0);

      const statement = {
        month,
        user: users[0],
        openingBalance: parseFloat(accounts[0]?.balance || 0) - totalCredit + totalDebit,
        closingBalance: parseFloat(accounts[0]?.balance || 0),
        totalDebit,
        totalCredit,
        transactionCount: transactions.length,
        transactions
      };

      if (req.query.format === 'csv') {
        const lines = ['Date,Type,Description,Amount,Status,Reference'];
        transactions.forEach(t => {
          lines.push([
            new Date(t.createdAt).toISOString().slice(0, 10),
            t.type,
            `"${(t.description || '').replace(/"/g, '""')}"`,
            t.amount,
            t.status,
            t.reference || ''
          ].join(','));
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="statement-${month}.csv"`);
        return res.send(lines.join('\n'));
      }

      res.json({ success: true, statement });
    } catch (error) {
      console.error('Error generating statement:', error);
      res.status(500).json({ success: false, message: 'Error generating statement' });
    }
  });

  // Update profile
  app.put('/api/user/profile', requireAuth, async (req, res) => {
    try {
      const { firstName, lastName, phone } = req.body;
      const userId = req.auth.id;
      const connection = await pool.getConnection();

      await connection.query(
        'UPDATE users SET firstName = COALESCE(?, firstName), lastName = COALESCE(?, lastName), phone = COALESCE(?, phone) WHERE id = ?',
        [firstName || null, lastName || null, phone || null, userId]
      );
      connection.release();

      res.json({ success: true, message: 'Profile updated' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating profile' });
    }
  });

  // Change password
  app.put('/api/user/password', requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword || newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Valid current and new password required (min 6 chars)' });
      }

      const connection = await pool.getConnection();
      const [rows] = await connection.query(
        'SELECT id FROM users WHERE id = ? AND password = ?',
        [req.auth.id, currentPassword]
      );
      if (rows.length === 0) {
        connection.release();
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }

      await connection.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, req.auth.id]);
      connection.release();
      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error changing password' });
    }
  });

  // Notification preferences
  app.get('/api/user/preferences', requireAuth, async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(
        `SELECT emailNotifications, smsNotifications, pushNotifications, email2fa, sms2fa, phone, twoFaEnabled
         FROM users WHERE id = ?`,
        [req.auth.id]
      );
      connection.release();
      res.json({ success: true, preferences: rows[0] || {} });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching preferences' });
    }
  });

  app.put('/api/user/preferences', requireAuth, async (req, res) => {
    try {
      await getNotifications().updatePreferences(req.auth.id, req.body);
      res.json({ success: true, message: 'Preferences saved' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error saving preferences' });
    }
  });

  // Export user data
  app.get('/api/user/export', requireAuth, async (req, res) => {
    try {
      const userId = req.auth.id;
      const connection = await pool.getConnection();
      const [users] = await connection.query(
        'SELECT id, firstName, lastName, email, role, createdAt FROM users WHERE id = ?',
        [userId]
      );
      const [accounts] = await connection.query('SELECT balance, status FROM accounts WHERE userId = ?', [userId]);
      const [transactions] = await connection.query('SELECT * FROM transactions WHERE userId = ? ORDER BY createdAt DESC LIMIT 100', [userId]);
      const [cards] = await connection.query('SELECT id, cardType, lastFour, cardNumber, status, provider FROM cards WHERE userId = ?', [userId]);
      connection.release();

      const exportData = { user: users[0], account: accounts[0], transactions, cards, exportedAt: new Date().toISOString() };
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="hsbc-data-export.json"');
      res.send(JSON.stringify(exportData, null, 2));
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error exporting data' });
    }
  });

  // Delete account
  app.delete('/api/user/account', requireAuth, async (req, res) => {
    try {
      const connection = await pool.getConnection();
      await connection.query('DELETE FROM users WHERE id = ?', [req.auth.id]);
      connection.release();
      res.json({ success: true, message: 'Account deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error deleting account' });
    }
  });

  // User support ticket
  app.post('/api/tickets', requireAuth, async (req, res) => {
    try {
      const { subject, description, priority } = req.body;
      if (!subject) return res.status(400).json({ success: false, message: 'Subject required' });

      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'INSERT INTO support_tickets (userId, subject, description, priority, status) VALUES (?, ?, ?, ?, ?)',
        [req.auth.id, subject, description || '', priority || 'medium', 'open']
      );
      connection.release();
      res.json({ success: true, ticketId: result.insertId });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error creating ticket' });
    }
  });

  // Admin: create user
  app.post('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { firstName, lastName, email, password, role } = req.body;
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields required' });
      }

      const connection = await pool.getConnection();
      const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        connection.release();
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }

      const [result] = await connection.query(
        'INSERT INTO users (firstName, lastName, email, password, role) VALUES (?, ?, ?, ?, ?)',
        [firstName, lastName, email, password, role || 'user']
      );
      await connection.query(
        'INSERT INTO accounts (userId, balance, status) VALUES (?, 5000.00, ?)',
        [result.insertId, 'active']
      );
      connection.release();

      res.json({ success: true, userId: result.insertId, message: 'User created' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error creating user' });
    }
  });

  // Admin: user detail
  app.get('/api/admin/users/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [users] = await connection.query(
        'SELECT id, firstName, lastName, email, role, phone, twoFaEnabled, createdAt FROM users WHERE id = ?',
        [req.params.id]
      );
      if (users.length === 0) {
        connection.release();
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const [accounts] = await connection.query('SELECT balance, status FROM accounts WHERE userId = ?', [req.params.id]);
      const [txnCount] = await connection.query('SELECT COUNT(*) as cnt FROM transactions WHERE userId = ?', [req.params.id]);
      const [cards] = await connection.query('SELECT COUNT(*) as cnt FROM cards WHERE userId = ?', [req.params.id]);
      connection.release();

      res.json({
        success: true,
        user: users[0],
        account: accounts[0] || { balance: 0, status: 'none' },
        stats: { transactions: txnCount[0].cnt, cards: cards[0].cnt }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching user' });
    }
  });

  // Admin: support tickets
  app.get('/api/admin/tickets', requireAuth, requireAdmin, async (req, res) => {
    try {
      const status = req.query.status || null;
      const connection = await pool.getConnection();
      const [tickets] = await connection.query(
        `SELECT t.*, u.firstName, u.lastName, u.email
         FROM support_tickets t
         LEFT JOIN users u ON t.userId = u.id
         WHERE (? IS NULL OR t.status = ?)
         ORDER BY t.createdAt DESC
         LIMIT 100`,
        [status, status]
      );
      connection.release();
      res.json({ success: true, tickets });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching tickets' });
    }
  });

  app.get('/api/admin/tickets/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [tickets] = await connection.query(
        `SELECT t.*, u.firstName, u.lastName, u.email
         FROM support_tickets t LEFT JOIN users u ON t.userId = u.id
         WHERE t.id = ?`,
        [req.params.id]
      );
      connection.release();
      if (tickets.length === 0) return res.status(404).json({ success: false, message: 'Ticket not found' });
      res.json({ success: true, ticket: tickets[0] });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching ticket' });
    }
  });

  app.patch('/api/admin/tickets/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { status, priority, assignedTo } = req.body;
      const updates = [];
      const values = [];
      if (status) { updates.push('status = ?'); values.push(status); }
      if (priority) { updates.push('priority = ?'); values.push(priority); }
      if (assignedTo !== undefined) { updates.push('assignedTo = ?'); values.push(assignedTo); }
      if (status === 'resolved') updates.push('resolvedAt = NOW()');
      if (updates.length === 0) return res.status(400).json({ success: false, message: 'Nothing to update' });

      values.push(req.params.id);
      const connection = await pool.getConnection();
      await connection.query(`UPDATE support_tickets SET ${updates.join(', ')} WHERE id = ?`, values);
      connection.release();
      res.json({ success: true, message: 'Ticket updated' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating ticket' });
    }
  });

  // Admin: reports
  app.get('/api/admin/reports', requireAuth, requireAdmin, async (req, res) => {
    try {
      const connection = await pool.getConnection();

      const [userStats] = await connection.query(`
        SELECT COUNT(*) as total,
          SUM(CASE WHEN createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as newUsers
        FROM users
      `);
      const [txnStats] = await connection.query(`
        SELECT COUNT(*) as total,
          COALESCE(SUM(amount), 0) as volume,
          COALESCE(AVG(amount), 0) as average
        FROM transactions
      `);
      const [monthlyVolume] = await connection.query(`
        SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, COUNT(*) as count, SUM(amount) as volume
        FROM transactions GROUP BY month ORDER BY month DESC LIMIT 6
      `);
      const [userGrowth] = await connection.query(`
        SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, COUNT(*) as users
        FROM users GROUP BY month ORDER BY month DESC LIMIT 6
      `);
      connection.release();

      res.json({
        success: true,
        reports: {
          users: userStats[0],
          transactions: txnStats[0],
          monthlyVolume,
          userGrowth
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching reports' });
    }
  });

  // Admin: global search
  app.get('/api/admin/search', requireAuth, requireAdmin, async (req, res) => {
    try {
      const q = (req.query.q || '').trim();
      if (!q) return res.json({ success: true, users: [], transactions: [] });

      const like = `%${q}%`;
      const connection = await pool.getConnection();
      const [users] = await connection.query(
        `SELECT id, firstName, lastName, email, role FROM users
         WHERE firstName LIKE ? OR lastName LIKE ? OR email LIKE ? LIMIT 10`,
        [like, like, like]
      );
      const [transactions] = await connection.query(
        `SELECT t.id, t.type, t.amount, t.description, t.status, u.firstName, u.lastName
         FROM transactions t LEFT JOIN users u ON t.userId = u.id
         WHERE t.description LIKE ? OR t.reference LIKE ? OR u.email LIKE ? LIMIT 10`,
        [like, like, like]
      );
      connection.release();
      res.json({ success: true, users, transactions });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Search failed' });
    }
  });

  // Recipient lookup for transfer validation
  app.get('/api/transfer/lookup-recipient', requireAuth, async (req, res) => {
    try {
      const email = (req.query.email || '').trim().toLowerCase();
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email query parameter is required' });
      }

      // Check if trying to lookup oneself
      if (email === req.auth.email.toLowerCase()) {
        return res.status(400).json({ success: false, message: 'You cannot transfer to your own email' });
      }

      const connection = await pool.getConnection();
      const [users] = await connection.query(
        'SELECT firstName, lastName, email FROM users WHERE email = ? LIMIT 1',
        [email]
      );
      connection.release();

      if (users.length === 0) {
        return res.json({ success: false, message: 'Recipient user not found' });
      }

      return res.json({
        success: true,
        recipient: {
          name: `${users[0].firstName} ${users[0].lastName}`,
          email: users[0].email
        }
      });
    } catch (error) {
      console.error('Error during recipient lookup:', error.message);
      res.status(500).json({ success: false, message: 'Lookup query failed' });
    }
  });

  // GET: List all beneficiaries for logged-in user (with auto-activation after 30 minutes)
  app.get('/api/beneficiaries', requireAuth, async (req, res) => {
    try {
      const userId = req.auth.id;
      const connection = await pool.getConnection();

      // Auto-activate pending beneficiaries that are older than 30 minutes
      await connection.query(
        `UPDATE beneficiaries 
         SET status = 'active', activatedAt = DATE_ADD(createdAt, INTERVAL 30 MINUTE)
         WHERE userId = ? AND status = 'pending' AND createdAt <= DATE_SUB(NOW(), INTERVAL 30 MINUTE)`,
        [userId]
      );

      const [list] = await connection.query(
        `SELECT id, name, accountNumber, accountType, ifscCode, beneficiaryType, status, createdAt, activatedAt
         FROM beneficiaries WHERE userId = ? ORDER BY id DESC`,
        [userId]
      );
      
      connection.release();
      res.json({ success: true, beneficiaries: list });
    } catch (error) {
      console.error('Error listing beneficiaries:', error.message);
      res.status(500).json({ success: false, message: 'Error retrieving beneficiaries list' });
    }
  });

  // POST: Register a new beneficiary (max 4 per 24 hours, NetBanking IPIN/Password validation, OTP authorization)
  app.post('/api/beneficiaries', requireAuth, async (req, res) => {
    try {
      const userId = req.auth.id;
      const { name, accountNumber, confirmAccountNumber, accountType, ifscCode, beneficiaryType, customerId, password, otpCode, sentCode } = req.body;

      if (!name || !accountNumber || !confirmAccountNumber || !accountType || !ifscCode || !beneficiaryType || !customerId || !password || !otpCode) {
        return res.status(400).json({ success: false, message: 'All inputs including Customer ID, Password, and OTP are mandatory.' });
      }

      if (accountNumber !== confirmAccountNumber) {
        return res.status(400).json({ success: false, message: 'Account numbers do not match.' });
      }

      if (!['savings', 'current', 'overdraft'].includes(accountType)) {
        return res.status(400).json({ success: false, message: 'Invalid Account Type. Must be savings, current, or overdraft.' });
      }

      // Check IFSC code (11-digit alphanumeric)
      if (!/^[a-zA-Z0-9]{11}$/.test(ifscCode)) {
        return res.status(400).json({ success: false, message: 'IFSC Code must be exactly 11 characters (alphanumeric).' });
      }

      if (otpCode !== sentCode) {
        return res.status(400).json({ success: false, message: 'Incorrect security OTP code.' });
      }

      const connection = await pool.getConnection();

      // 1. Verify daily addition limit: maximum of 4 new beneficiaries within a 24-hour window
      const [additions] = await connection.query(
        'SELECT COUNT(*) as count FROM beneficiaries WHERE userId = ? AND createdAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR)',
        [userId]
      );
      if (additions[0].count >= 4) {
        connection.release();
        return res.status(400).json({ success: false, message: 'Daily addition limit exceeded: You can add a maximum of 4 new beneficiaries within any 24-hour window.' });
      }

      // 2. Verify NetBanking Credentials (Customer ID & Password)
      const [users] = await connection.query('SELECT password, email FROM users WHERE id = ?', [userId]);
      if (users.length === 0) {
        connection.release();
        return res.status(404).json({ success: false, message: 'Sender profile not found.' });
      }

      // Check if customerId matches user's email or user id
      if (String(customerId).trim().toLowerCase() !== users[0].email.toLowerCase() && String(customerId).trim() !== String(userId)) {
        connection.release();
        return res.status(401).json({ success: false, message: 'Customer ID does not match your active logged-in profile.' });
      }

      // Compare password hash
      const isPasswordValid = await bcrypt.compare(password, users[0].password);
      if (!isPasswordValid) {
        connection.release();
        return res.status(401).json({ success: false, message: 'Invalid NetBanking password/IPIN.' });
      }

      // 3. Check duplicate accountNumber for this user
      const [existing] = await connection.query(
        'SELECT id FROM beneficiaries WHERE userId = ? AND accountNumber = ?',
        [userId, accountNumber]
      );
      if (existing.length > 0) {
        connection.release();
        return res.status(400).json({ success: false, message: 'Beneficiary with this account number is already registered.' });
      }

      // 4. Save beneficiary (status defaults to 'pending')
      const [result] = await connection.query(
        `INSERT INTO beneficiaries (userId, name, accountNumber, accountType, ifscCode, beneficiaryType, status, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`,
        [userId, name, accountNumber, accountType, ifscCode, beneficiaryType]
      );

      connection.release();

      res.json({
        success: true,
        message: 'Beneficiary added successfully! It will be activated after a 30-minute security cooling period.',
        beneficiaryId: result.insertId
      });
    } catch (error) {
      console.error('Error adding beneficiary:', error.message);
      res.status(500).json({ success: false, message: 'Failed to add beneficiary: ' + error.message });
    }
  });

  // POST: Demo activation bypass (instantly activates pending beneficiary)
  app.post('/api/beneficiaries/:id/activate-demo', requireAuth, async (req, res) => {
    try {
      const userId = req.auth.id;
      const id = req.params.id;
      const connection = await pool.getConnection();
      
      const [result] = await connection.query(
        `UPDATE beneficiaries SET status = 'active', activatedAt = NOW() WHERE id = ? AND userId = ?`,
        [id, userId]
      );
      
      connection.release();
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Beneficiary not found or unauthorized.' });
      }
      
      res.json({ success: true, message: 'Beneficiary activated instantly (Demo Bypass)!' });
    } catch (error) {
      console.error('Error in demo activation:', error.message);
      res.status(500).json({ success: false, message: 'Bypass activation failed' });
    }
  });

  // POST: Send Transfer/Beneficiary Registration OTP via SMS
  app.post('/api/transfer/send-otp', requireAuth, async (req, res) => {
    try {
      const userId = req.auth.id;
      const { phone } = req.body;
      
      const connection = await pool.getConnection();
      const [users] = await connection.query('SELECT phone FROM users WHERE id = ?', [userId]);
      connection.release();
      
      const targetPhone = phone || users[0]?.phone;
      if (!targetPhone) {
        return res.status(400).json({ success: false, message: 'No destination phone number specified. Please verify your phone number input.' });
      }

      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Save it temporarily in the audit/store or console log
      console.log(`📱 Routing SMS OTP to ${targetPhone} - code: ${otpCode}`);

      const smsService = require('../services/sms-service');
      const smsRes = await smsService.sendOTPSMS(targetPhone, otpCode);
      
      return res.json({
        success: true,
        message: 'OTP sent successfully via SMS.',
        otpCode: otpCode, // Send back in response for testing/demo
        smsRes
      });
    } catch (error) {
      console.error('Error sending transfer OTP:', error.message);
      res.status(500).json({ success: false, message: 'SMS transmission failed: ' + error.message });
    }
  });
}

module.exports = { registerApiExtensions, otpStore, getNotifications };
