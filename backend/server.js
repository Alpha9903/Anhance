const express = require('express');
const path = require('path');
const app = express();
const mysql = require('mysql2');
const port = process.env.PORT || 3000;

app.use(express.json());

// Serve static files from the 'public' folder inside backend
app.use(express.static(path.join(__dirname, 'public')));

// ✅ MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST.split(':')[0],
  port: process.env.DB_HOST.split(':')[1],
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

// ✅ Connect to DB
db.connect(err => {
  if (err) {
    console.error('❌ MySQL connection failed:', err);
  } else {
    console.log('✅ Connected to MySQL');
  }
});

// ✅ Webhook route
app.post('/webhook', (req, res) => {
  const { user_id, intent, message } = req.body;

  console.log("📩 Voiceflow Webhook Hit:");
  console.log("User ID:", user_id);
  console.log("Intent:", intent);
  console.log("Message:", message);

  const sql = `INSERT INTO tickets (user_id, intent, message) VALUES (?, ?, ?)`;
  db.query(sql, [user_id, intent, message], (err, result) => {
    if (err) {
      console.error("❌ DB Insert Error:", err);
      return res.status(500).json({ status: "DB Error" });
    }
    res.status(200).json({ status: "Saved", id: result.insertId });
  });
});

// Static fallback route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
