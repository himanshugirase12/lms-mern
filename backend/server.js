require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require("dotenv");
const dns = require("dns");
// Add this near the top, with your other requires
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');

dns.setServers([
  "8.8.8.8",
  "1.1.1.1"
]);

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/enrollments', enrollmentRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Connect to MongoDB, then start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
  });