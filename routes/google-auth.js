const express = require('express');
const router = express.Router();
const https = require('https');
const pool = require('../db-mysql');
const bcrypt = require('bcryptjs');
const { signJwt } = require('../middleware/auth');
const { auditLog } = require('../services/audit-service');
const crypto = require('crypto');

function verifyGoogleToken(token) {
  return new Promise((resolve, reject) => {
    https.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(parsed.error_description || 'Invalid token'));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => reject(err));
  });
}

router.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ success: false, message: 'Missing Google credential' });
  }

  let connection;
  try {
    const payload = await verifyGoogleToken(credential);
    
    if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ success: false, message: 'Invalid client ID in token' });
    }

    const email = payload.email;
    const firstName = payload.given_name || 'User';
    const lastName = payload.family_name || '';

    connection = await pool.getConnection();

    // Check if user exists
    const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    
    let user;
    let isNewUser = false;

    if (rows.length > 0) {
      user = rows[0];
    } else {
      // Create new user
      isNewUser = true;
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      const [result] = await connection.query(
        'INSERT INTO users (firstName, lastName, email, password, role) VALUES (?, ?, ?, ?, ?)',
        [firstName, lastName, email, hashedPassword, 'user']
      );
      
      const userId = result.insertId;
      user = { id: userId, firstName, lastName, email, role: 'user' };

      // Seed checking/savings accounts
      await connection.query(
        'INSERT INTO accounts (userId, accountNumber, accountType, balance, status) VALUES (?, ?, ?, 545220.50, ?)',
        [userId, `1234 5678 90${userId} 3456`, 'savings', 'active']
      );
      await connection.query(
        'INSERT INTO accounts (userId, accountNumber, accountType, balance, status) VALUES (?, ?, ?, 215000.00, ?)',
        [userId, `2345 6789 90${userId} 4567`, 'checking', 'active']
      );
      await connection.query(
        'INSERT INTO accounts (userId, accountNumber, accountType, balance, status) VALUES (?, ?, ?, 300000.00, ?)',
        [userId, `3456 7890 90${userId} 5678`, 'fixed', 'active']
      );
      await connection.query(
        'INSERT INTO accounts (userId, accountNumber, accountType, balance, status) VALUES (?, ?, ?, 85000.00, ?)',
        [userId, `4567 8901 90${userId} 6789`, 'recurring', 'active']
      );
    }

    const userInfo = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    };

    const token = signJwt(userInfo);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    await auditLog(req, {
      action: isNewUser ? 'USER_SIGNUP_GOOGLE' : 'LOGIN_SUCCESS_GOOGLE',
      actionType: 'AUTH',
      module: 'auth',
      resourceType: 'user',
      resourceId: String(user.id),
      details: { userId: user.id, email: user.email, role: user.role }
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: userInfo,
      token,
      redirect: '/dashboard'
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ success: false, message: 'Authentication failed' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

module.exports = router;
