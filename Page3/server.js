const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
// budget
const path = require('path');
const port = 3000;

// Enable CORS
app.use(cors());

// Connect to the SQLite database
let db = new sqlite3.Database('./Places.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

// Endpoint to get a random destination
app.get('/destinations', (req, res) => {
    db.all('SELECT placename FROM added', [], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message); // Log the error
            res.status(500).json({ error: err.message });
            return;
        }
        console.log('Fetched destinations:', rows); // Log the fetched rows
        res.json(rows); // Send all destination names back to the client
    });
});

// Serve static files (HTML, CSS, JS) from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Route to get total budget
app.get('/total-budget', (req, res) => {
    const sql = 'SELECT SUM(budget) AS total_budget FROM added';
    db.get(sql, [], (err, row) => {
        if (err) {
            console.error('Database error:', err.message); // Log the error message
            return res.status(500).send('Error fetching budget.');
        }
        res.send(`Total Budget: ${row.total_budget}`);
    });
});

// Start the server

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
