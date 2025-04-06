const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // ✅ JSON parser sabse pehle

// Serve static files from the 'public' folder inside backend
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Webhook route
app.post('/webhook', (req, res) => {
    const { user_id, intent, message } = req.body;

    console.log("📩 Voiceflow Webhook Hit:");
    console.log("User ID:", user_id);
    console.log("Intent:", intent);
    console.log("Message:", message);

    // ✅ Aage DB/email/integration logic
    res.status(200).json({ status: "Received" });
});

// Static fallback route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
});
