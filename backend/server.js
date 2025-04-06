const express = require('express');
const path = require('path');
const app = express();
const { Pool } = require('pg');
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: { rejectUnauthorized: false },
});

// Test DB Connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ PostgreSQL connection failed:', err.stack);
  } else {
    console.log('✅ Connected to PostgreSQL');
    release();
  }
});

app.post('/webhook', async (req, res) => {
  const { user_id, intent, message } = req.body;
  console.log("📩 Voiceflow Webhook Hit:");
  console.log("User ID:", user_id);
  console.log("Intent:", intent);
  console.log("Message:", message);

  // Choose correct table based on intent
  let table = '';
  const intentLower = intent?.toLowerCase() || '';

  if (intentLower === 'appointment') {
    table = 'appointments';
  } else if (intentLower === 'order') {
    table = 'orders';
  } else if (intentLower === 'ticket') {
    table = 'tickets';
  } else {
    return res.status(400).json({ status: "Invalid intent" });
  }

  const query = `INSERT INTO ${table} (user_id, intent, message) VALUES ($1, $2, $3) RETURNING id`;

  try {
    const result = await pool.query(query, [user_id, intent, message]);
    res.status(200).json({ status: "Saved", id: result.rows[0].id });
  } catch (err) {
    console.error("❌ DB Insert Error:", err);
    res.status(500).json({ status: "DB Error", error: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
