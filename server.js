const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

// Signup Route
app.post('/api/signup', (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  // Validation
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }

  // Check if email already exists
  db.get('SELECT email FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (row) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Insert new user
    db.run(
      'INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)',
      [firstName, lastName, email, password],
      function (err) {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error creating account' });
        }

        res.json({ 
          success: true, 
          message: 'Account created successfully',
          redirect: '/about'
        });
      }
    );
  });
});

// Login Route
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  // Check user
  db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (!row) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({ 
      success: true, 
      message: 'Login successful',
      user: { firstName: row.firstName, lastName: row.lastName },
      redirect: '/about'
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`HSBC Bank website running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
});
