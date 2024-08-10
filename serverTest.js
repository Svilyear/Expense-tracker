const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
dotenv.config();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// MySQL connection setup
const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE

});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err.stack);
        return;
    }
    console.log('Connected to MySQL');
});

// Create users and expenses tables if they do not exist
const createUsersTable = `
    CREATE TABLE IF NOT EXISTS usersDB (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
    )
`;

const createExpenseTable = `
    CREATE TABLE IF NOT EXISTS Expense_Data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL
    )
`;

db.query(createUsersTable, (err) => {
    if (err) throw err;
    console.log('Users table created successfully!');

    db.query(createExpenseTable, (err) => {
        if (err) throw err;
        console.log('Expense data table created successfully!');
    });
});

// User registration route
app.post('/api/register', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const userQuery = 'SELECT * FROM usersDB WHERE email = ?';
        db.query(userQuery, [email], (err, data) => {
            if (data.length) return res.status(409).json({ message: 'User already exists!' });

            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);

            const newUserQuery = 'INSERT INTO usersDB (email, username, password) VALUES (?, ?, ?)';
            db.query(newUserQuery, [email, username, hashedPassword], (err) => {
                if (err) return res.status(500).json({ message: 'Something went wrong, User cannot be created! Try again later' });
                res.status(200).json({ message: 'User created successfully!' });
            });
        });
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// User login route
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const userQuery = 'SELECT * FROM usersDB WHERE email = ?';
        db.query(userQuery, [email], (err, data) => {
            if (data.length === 0) return res.status(404).json({ message: 'User not found!' });

            const isPasswordValid = bcrypt.compareSync(password, data[0].password);
            if (!isPasswordValid) return res.status(400).json({ message: 'Invalid email or password' }); 
            
             

            res.status(200).json({ message: 'Login successful' });
           
           
          
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get all expenses route
app.get('/api/expenses', (req, res) => {
    const query = 'SELECT * FROM Expense_Data';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Add a new expense
app.post('/api/expenses', (req, res) => {
    const { date, name, amount } = req.body;
    const query = 'INSERT INTO Expense_Data (date, name, amount) VALUES (?, ?, ?)';
    db.query(query, [date, name, amount], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: results.insertId, date, name, amount });
    });
});

// Update an expense
app.put('/api/expenses/:id', (req, res) => {
    const { date, name, amount } = req.body;
    const query = 'UPDATE Expense_Data SET date = ?, name = ?, amount = ? WHERE id = ?';
    db.query(query, [date, name, amount, req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: req.params.id, date, name, amount });
    });
});

// Delete an expense
app.delete('/api/expenses/:id', (req, res) => {
    const query = 'DELETE FROM Expense_Data WHERE id = ?';
    db.query(query, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(204).send();
    });
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/addExpense', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'addExpense.html'));
});

// Get total amount route
app.get('/api/expenses/total', (req, res) => {
    const totalQuery = 'SELECT SUM(amount) AS total FROM Expense_Data';
    db.query(totalQuery, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0].total || 0);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
