const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Database setup
const db = new Database('history.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT,
    last_name TEXT,
    date_display TEXT,
    qr_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// API Routes
app.get('/api/history', (req, res) => {
  const rows = db.prepare('SELECT * FROM scans ORDER BY created_at DESC').all();
  res.json(rows);
});

app.post('/api/scan', (req, res) => {
  const { first, last, dateDisplayText, qrData } = req.body;
  const stmt = db.prepare('INSERT INTO scans (first_name, last_name, date_display, qr_data) VALUES (?, ?, ?, ?)');
  const info = stmt.run(first, last, dateDisplayText, qrData);
  res.json({ id: info.lastInsertRowid, success: true });
});

app.delete('/api/history/:id', (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare('DELETE FROM scans WHERE id = ?');
  stmt.run(id);
  res.json({ success: true });
});

app.delete('/api/history', (req, res) => {
  const stmt = db.prepare('DELETE FROM scans');
  stmt.run();
  res.json({ success: true });
});

app.get('/api/export', (req, res) => {
  const rows = db.prepare('SELECT id, first_name, last_name, date_display, qr_data, created_at FROM scans').all();
  
  let csv = 'ID;Prenom;Nom;Date Affichage;QR Data;Date Enregistrement\n';
  rows.forEach(row => {
    csv += `${row.id};${row.first_name};${row.last_name};${row.date_display};${row.qr_data};${row.created_at}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=export_scans.csv');
  res.send(csv);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
