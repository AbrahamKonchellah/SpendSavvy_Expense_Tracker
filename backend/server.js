const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));
//app.use(express.static(path.join(__dirname, '..', 'Frontend')));

app.use(express.static(path.join(__dirname, '..')));
const JWT_SECRET = process.env.JWT_SECRET;

// DB Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) console.log('DB failed:', err.message);
  else console.log('Connected to database!');
});

// Nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  tls: { rejectUnauthorized: false },
  logger: true,
  debug: true
});

// Test
app.get('/api/test', (req, res) => res.json({ message: 'Server is working!' }));

// Signup 
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.json({ success: false, message: 'All fields required' });

  db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
    if (err || results.length > 0) return res.json({ success: false, message: err ? 'DB error' : 'User exists' });

    bcrypt.hash(password, 12, (err, hash) => {
      if (err) return res.json({ success: false, message: 'Hash error' });

      db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hash], (err, result) => {
        if (err) return res.json({ success: false, message: 'Insert error' });

        const token = jwt.sign({ userId: result.insertId, email, name }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ success: true, token, user: { id: result.insertId, name, email }, message: 'Created' });
      });
    });
  });
});

// Login 
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.json({ success: false, message: 'Email & password required' });

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err || !results.length) return res.json({ success: false, message: 'Invalid credentials' });

    const user = results[0];
    bcrypt.compare(password, user.password, (err, match) => {
      if (err || !match) return res.json({ success: false, message: 'Invalid credentials' });

      const token = jwt.sign({ userId: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email }, message: 'Login OK' });
    });
  });
});

app.post('/api/auth/forgot-password', async (req, res) => {
  console.log('\nFORGOT PASSWORD HIT');
  console.log('Time:', new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }));
  console.log('Body:', req.body);

  const { email } = req.body;
  if (!email) return res.json({ success: false, message: 'Email required' });

  try {
    
    const users = await new Promise((resolve, reject) => {
      db.query('SELECT id, name FROM users WHERE email = ?', [email], (err, rows) => {
        err ? reject(err) : resolve(rows);
      });
    });

    const generic = 'If that email exists, a reset link has been sent.';
    if (!users || users.length === 0) {
      console.log('No user → generic response');
      return res.json({ success: true, message: generic });
    }

    const user = users[0];
    console.log(`User: id=${user.id} name=${user.name || '—'}`);

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000);
    const link = `${process.env.FRONTEND_URL}/reset-password.html?token=${token}`;

    console.log('Token:', token);
    console.log('Link:', link);

    await new Promise((resolve, reject) => {
      db.query(
        'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
        [token, expires, user.id],
        err => err ? reject(err) : resolve()
      );
    });
    console.log('Token saved');

    const html = `
      <div style="font-family:Arial;max-width:600px;margin:auto;padding:20px;border:1px solid #ddd;border-radius:10px;background:#f9f9f9;">
        <h2 style="color:#2c3e50;text-align:center;">SpendSavvy</h2>
        <p>Hello <strong>${user.name || email}</strong>,</p>
        <p>Click below to reset your password (expires in 1 hour):</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${link}" style="background:#3498db;color:#fff;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold;">
            Reset Password
          </a>
        </div>
        <p><small>If you didn’t request this, ignore this email.</small></p>
      </div>`;

    const info = await transporter.sendMail({
      from: `"SpendSavvy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset – SpendSavvy',
      html,
    });

    console.log('EMAIL SENT →', info.messageId);
    console.log('Check: https://mail.google.com/mail/u/0/#sent');

    const debug = process.env.NODE_ENV === 'development' ? link : null;
    res.json({ success: true, message: generic, debug_link: debug });

  } catch (e) {
    console.error('ERROR →', e.message);
    console.error(e);
    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  }
});

// Validate Token
app.get('/api/auth/validate-reset-token/:token', (req, res) => {
  const { token } = req.params;
  db.query('SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()', [token], (err, results) => {
    if (err) return res.json({ success: false, valid: false });
    res.json({ success: true, valid: results.length > 0 });
  });
});

// Reset Password
app.post('/api/auth/reset-password', (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword || newPassword.length < 8)
    return res.json({ success: false, message: 'Invalid input' });

  db.query('SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()', [token], async (err, results) => {
    if (err || !results.length) return res.json({ success: false, message: 'Invalid/expired token' });

    const userId = results[0].id;
    const hash = await bcrypt.hash(newPassword, 12);

    db.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?', [hash, userId], err => {
      if (err) return res.json({ success: false, message: 'Update failed' });
      res.json({ success: true, message: 'Password reset!' });
    });
  });
});

// Start
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Frontend: ${process.env.FRONTEND_URL}`);
});