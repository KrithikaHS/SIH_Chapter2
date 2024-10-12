const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;

// Connect to SQLite database
// const db = new sqlite3.Database('./Places.db');
app.use(express.static(path.join(__dirname, 'public')));;
 // Serve static files from the 'public' directory
app.use(bodyParser.json()); // For parsing application/json
app.use(express.json());
// Route to get data from database and render it
app.get('/data', (req, res) => {
  db.all(
    `SELECT placename, placedesc, placeimg, placeloc, hours, budget 
     FROM place`, [], (err, rows) => {
      if (err) {
        throw err;
      }
      res.json(rows); // Send data as JSON
    }
  );
});


// New route to handle adding data to add_data table
app.post('/add-data', (req, res) => {
  const { placename, placeloc, budget, hours } = req.body;
  
  // Insert data into the 'added' table
  const sql = 'INSERT INTO added (placename, placeloc, budget, hours) VALUES (?, ?, ?, ?)';
  db.run(sql, [placename, placeloc, budget, hours], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, message: 'Data added successfully!' });
  });
});


// Route to serve HTML file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Endpoint to fetch added places
app.get('/added-places', (req, res) => {
    db.all('SELECT * FROM added', (err, rows) => {
        if (err) {
            console.error('Error fetching added places:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Endpoint to remove a place
app.post('/remove-data', (req, res) => {
    const { placeid } = req.body;
    db.run('DELETE FROM added WHERE placeid = ?', [placeid], function (err) {
        if (err) {
            console.error('Error removing place:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ changes: this.changes });
    });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

// display added elements
// const express = require('express');
// const app = express();
// const port = 3000;

// Middleware
// app.use(express.json());
// app.use(express.static('public')); // Serve static files from the "public" directory

// const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('Places.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error('Could not open database:', err.message);
    } else {
        console.log('Database opened successfully.');
    }
});

// Endpoint to fetch added places
// app.get('/added-places', (req, res) => {
//     db.all('SELECT * FROM added', (err, rows) => {
//         if (err) {
//             console.error('Error fetching added places:', err.message);
//             res.status(500).json({ error: err.message });
//             return;
//         }
//         res.json(rows);
//     });
// });

// Endpoint to remove a place
// app.post('/remove-data', (req, res) => {
//     const { placeid } = req.body;
//     db.run('DELETE FROM added WHERE placeid = ?', [placeid], function (err) {
//         if (err) {
//             console.error('Error removing place:', err.message);
//             res.status(500).json({ error: err.message });
//             return;
//         }
//         res.json({ changes: this.changes });
//     });
// });

// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
// });


// const express = require('express');
// const path = require('path');
// const sqlite3 = require('sqlite3').verbose();
// const cors = require('cors');
// const bodyParser = require('body-parser'); // To parse JSON bodies

// const app = express();
// const port = 3000;

// // CORS configuration
// app.use(cors({
//   origin: 'http://127.0.0.1:5500' // Replace with your frontend origin
// }));

// // Body parser middleware
// app.use(bodyParser.json()); // For parsing application/json
// app.use(bodyParser.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// // Connect to SQLite database
// const db = new sqlite3.Database('./Places.db', (err) => {
//   if (err) {
//     console.error('Error opening database:', err.message);
//   } else {
//     console.log('Connected to the SQLite database.');
//   }
// });

// // Serve static files from the 'public' directory
// app.use(express.static(path.join(__dirname, '../public')));

// app.get('/data', (req, res) => {
//   const city = req.query.city; // Get the city from query parameters
//   console.log('city: ', city);
  
//   if (city) {
//     const sql = `
//       select placename,placedesc,placeimg
//       FROM place p,city c,city_place cp
//       where p.placeid=cp.placeid AND c.cityid=cp.cityid AND c.cityname= ?
//     `;
    
//     db.all(sql, [city], (err, rows) => {
//       if (err) {
//         console.error('Database query error:', err.message);
//         return res.status(500).json({ error: err.message });
//       }
//       res.json(rows); // Send data as JSON
//     });
//   } else {
//     res.status(400).json({ error: 'City parameter is missing' });
//   }
// });

// // New route to handle adding data to add_data table
// app.post('/add-data', (req, res) => {
//   console.log("add sever inside");
//   const { placename, placeloc, budget, hours } = req.body;
  
//   if (!placename || !placeloc || !budget || !hours) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }
  
//   const sql = 'INSERT INTO added (placename, placeloc, budget, hours) VALUES (?, ?, ?, ?)';
  
//   db.run(sql, [placename, placeloc, budget, hours], function(err) {
//     if (err) {
//       console.error('Database insert error:', err.message);
//       return res.status(500).json({ error: err.message });
//     }
//     res.json({ id: this.lastID, message: 'Data added successfully!' });
//   });
// });

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '../public/index2.html'));
// });
