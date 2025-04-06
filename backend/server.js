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
  const { user_id, intent, message, order_id, status, expected_delivery } = req.body;
  console.log("📩 Voiceflow Webhook Hit:");
  console.log("User ID:", user_id);
  console.log("Intent:", intent);
  console.log("Message:", message);

  try {
    // Handling the ticket intent
    if (intent === "ticket") {
      const query = `INSERT INTO tickets (user_id, intent, message) VALUES ($1, $2, $3) RETURNING id`;
      const result = await pool.query(query, [user_id, intent, message]);
      return res.status(200).json({ status: "Saved in tickets", id: result.rows[0].id });
    
    // Handling the appointment intent
    } else if (intent === "appointment") {
      const query = `INSERT INTO appointments (user_id, intent, message) VALUES ($1, $2, $3) RETURNING id`;
      const result = await pool.query(query, [user_id, intent, message]);
      return res.status(200).json({ status: "Saved in appointments", id: result.rows[0].id });

    // Handling the order_tracking intent
    } else if (intent === "order_tracking") {
      // Validate expected_delivery if provided
      let validDeliveryDate = null;
      if (expected_delivery) {
        validDeliveryDate = new Date(expected_delivery);
        if (isNaN(validDeliveryDate.getTime())) {
          return res.status(400).json({ status: "Invalid date format for expected_delivery" });
        }
      }

      const query = `INSERT INTO order_tracking (user_id, intent, message, order_id, status, expected_delivery)
                     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
      const result = await pool.query(query, [user_id, intent, message, order_id, status, validDeliveryDate]);
      return res.status(200).json({ status: "Saved in order_tracking", id: result.rows[0].id });

    } else {
      return res.status(400).json({ status: "Invalid intent" });
    }
  } catch (err) {
    console.error("❌ DB Insert Error:", err);
    return res.status(500).json({ status: "DB Error", error: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
