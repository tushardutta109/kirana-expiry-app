const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const itemRoutes = require('./routes/itemRoutes');
const { initCronJobs, checkExpiryAndSendAlert } = require('./services/cronService');

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/items', itemRoutes);

// Database Connection & Initialization
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully! 📦');
    initCronJobs();
    checkExpiryAndSendAlert(); // Server start hote hi instant scan
  })
  .catch((err) => console.error('MongoDB Error:', err));

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});