const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql');
require('dotenv').config(); // Load .env variables

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '..')));

const JWT_SECRET = process.env.JWT_SECRET;

// Database connection - USING .ENV
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, // ← Now reading from .env
    database: process.env.DB_NAME
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.log('Database connection failed:', err.message);
    } else {
        console.log('Connected to database!');
    }
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

// Signup
app.post('/api/auth/signup', (req, res) => {
    const { name, email, password } = req.body;
    
    console.log('Signup attempt:', email);
    
    if (!name || !email || !password) {
        return res.json({ success: false, message: 'All fields required' });
    }
    
    // Check if user exists
    db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.log('DB error:', err);
            return res.json({ success: false, message: 'Database error' });
        }
        
        if (results.length > 0) {
            return res.json({ success: false, message: 'User already exists' });
        }
        
        // Hash password and create user
        bcrypt.hash(password, 12, (err, hashedPassword) => {
            if (err) {
                return res.json({ success: false, message: 'Error creating user' });
            }
            
            db.query(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                [name, email, hashedPassword],
                (err, result) => {
                    if (err) {
                        console.log('Insert error:', err);
                        return res.json({ success: false, message: 'Error creating user' });
                    }
                    
                    // Create token
                    const token = jwt.sign(
                        { userId: result.insertId, email: email, name: name },
                        JWT_SECRET,
                        { expiresIn: '24h' }
                    );
                    
                    res.json({
                        success: true,
                        token: token,
                        user: { id: result.insertId, name: name, email: email },
                        message: 'Account created successfully'
                    });
                }
            );
        });
    });
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    console.log('Login attempt:', email);
    
    if (!email || !password) {
        return res.json({ success: false, message: 'Email and password required' });
    }
    
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.log('DB error:', err);
            return res.json({ success: false, message: 'Database error' });
        }
        
        if (results.length === 0) {
            return res.json({ success: false, message: 'Invalid email or password' });
        }
        
        const user = results[0];
        
        bcrypt.compare(password, user.password, (err, isValid) => {
            if (err) {
                return res.json({ success: false, message: 'Error checking password' });
            }
            
            if (!isValid) {
                return res.json({ success: false, message: 'Invalid email or password' });
            }
            
            // Create token
            const token = jwt.sign(
                { userId: user.id, email: user.email, name: user.name },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            res.json({
                success: true,
                token: token,
                user: { id: user.id, name: user.name, email: user.email },
                message: 'Login successful'
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});