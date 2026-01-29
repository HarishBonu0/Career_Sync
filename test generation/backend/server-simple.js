require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// CORS Configuration
const corsOptions = {
  origin: '*',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Mock endpoints
app.get('/api/skills', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, skill_name: 'JavaScript' },
      { id: 2, skill_name: 'Python' },
      { id: 3, skill_name: 'React' }
    ]
  });
});

app.post('/api/tests/submit', (req, res) => {
  res.json({
    success: true,
    message: 'Test submission recorded'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: err.message 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend Server running on port ${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}`);
  console.log(`✅ CORS enabled for all origins`);
  console.log(`⏰ Server started at ${new Date().toISOString()}`);
});
