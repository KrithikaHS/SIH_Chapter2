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




// For report 
// For report 
const fs = require('fs'); // Only needed if you're saving files; can be removed otherwise
const PDFDocument = require('pdfkit');
const axios = require('axios');

// Endpoint to generate and download the report
app.get('/download-report', async (req, res) => {
    const city = req.query.city; // Get city from query parameter

    if (!city) {
        return res.status(400).send('City parameter is required.');
    }
    
    console.log(`Generating report for city: ${city}`);

    // Create a new PDF document
    const doc = new PDFDocument();

    // Set the response headers to prompt download
    res.setHeader('Content-disposition', 'attachment; filename=report.pdf');
    res.setHeader('Content-type', 'application/pdf');

    // Pipe the PDF into the response
    doc.pipe(res);

    // Write website name at the top
    doc.fontSize(20).text('Your Website Name', { align: 'center' }).moveDown();

    try {
        // Fetch all data from the 'added' table
        const rows = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM added', [], (err, rows) => {
                if (err) {
                    console.error('Database error:', err.message);
                    reject(err);
                } else {
                    console.log('Fetched data from added table:', rows);
                    resolve(rows);
                }
            });
        });

        // Fetch weather data for the specified city
        let weatherInfo;
        try {
            const weatherResponse = await axios.get(`http://api.weatherapi.com/v1/current.json?key=514ff5865cbb465daaf144700240909&q=${city}`);
            weatherInfo = {
                condition: weatherResponse.data.current.condition.text,
                temperature: weatherResponse.data.current.temp_c,
                iconUrl: weatherResponse.data.current.condition.icon,
            };
            console.log(`Weather fetched for ${city}:`, weatherInfo);
        } catch (error) {
            console.error(`Error fetching weather for ${city}:`, error.message);
            weatherInfo = {
                condition: 'Weather data not available',
                temperature: 'N/A',
                iconUrl: '', // No icon available
            };
        }

        // Calculate total budget
        const totalBudgetSql = 'SELECT SUM(budget) AS total_budget FROM added';
        const budgetRow = await new Promise((resolve, reject) => {
            db.get(totalBudgetSql, [], (err, row) => {
                if (err) {
                    console.error('Database error:', err.message);
                    reject(err);
                } else {
                    console.log('Total budget fetched:', row);
                    resolve(row);
                }
            });
        });

        // Add selected places
        doc.fontSize(16).text('Your Selected Places:', { underline: true }).moveDown();
        rows.forEach(item => {
            doc.fontSize(12).text(`Place Name: ${item.placename}, Budget: ${item.budget}`);
        });

        // Add weather details for the specified city
        doc.moveDown().fontSize(16).text(`Weather in ${city}:`, { underline: true }).moveDown();
        doc.fontSize(12).text(`Condition: ${weatherInfo.condition}`);
        doc.fontSize(12).text(`Temperature: ${weatherInfo.temperature}°C`);
        // if (weatherInfo.iconUrl) {
        //     doc.image(weatherInfo.iconUrl, { width: 20, height: 20 }).moveDown(); // Include weather icon
        // }

        // Add budget details
        doc.moveDown().fontSize(16).text('Total Budget:', { underline: true }).moveDown();
        doc.fontSize(12).text(`Total Budget: ${budgetRow.total_budget}`);

        // Finalize the PDF and end the stream
        doc.end();
    } catch (error) {
        console.error('Error generating report:', error.message);
        // Ensure we only send a response if we haven't sent one yet
        if (!res.headersSent) {
            res.status(500).send('Error generating report.');
        }
    }
});



// Start the server

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
