process.env.TZ = 'America/New_York';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db'); // your MongoDB connection
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const aiRoutes = require('./routes/ai');

const app = express();

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/', (req, res) => res.send({ ok: true, service: 'SmartToDo backend' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
