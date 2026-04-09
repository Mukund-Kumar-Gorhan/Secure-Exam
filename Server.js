const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.use(session({
    secret: 'secureexam_secret',
    resave: false,
    saveUninitialized: false
}));

// SQLite DB
const db = new sqlite3.Database('./database.db');

// Create tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        score INTEGER,
        total INTEGER,
        percentage REAL
    )`);
});

// Routes

app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    db.run(
        `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
        [name, email, hashed],
        function (err) {
            if (err) return res.json({ success: false, message: 'Email exists' });
            res.json({ success: true });
        }
    );
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (!user) return res.json({ success: false });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.json({ success: false });

        req.session.user = user;
        res.json({ success: true });
    });
});

app.get('/session', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

app.post('/submit', (req, res) => {
    if (!req.session.user) return res.json({ success: false });

    const { score, total } = req.body;
    const percentage = ((score / total) * 100).toFixed(2);

    db.run(
        `INSERT INTO results (user_id, score, total, percentage) VALUES (?, ?, ?, ?)`,
        [req.session.user.id, score, total, percentage]
    );

    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// 🔥 ADMIN: get all users
app.get('/admin/users', (req, res) => {
    db.all(`SELECT id, name, email FROM users`, [], (err, rows) => {
        res.json(rows || []);
    });
});

// 🔥 ADMIN: get all results
app.get('/admin/results', (req, res) => {
    db.all(`SELECT * FROM results`, [], (err, rows) => {
        res.json(rows || []);
    });
});