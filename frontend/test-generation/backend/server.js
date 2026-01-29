require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDb = require('./config/db');

const skillRoutes = require('./routes/skillRoutes');
const questionRoutes = require('./routes/questionRoutes');
const testRoutes = require('./routes/testRoutes');

const app = express();

const corsOptions = {
  origin: '*',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API Routes
app.use('/api/skills', skillRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/tests', testRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: err.message 
  });
});

const PORT = process.env.PORT || 5000;

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API endpoint: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server because database connection failed.', err.message);
  });
