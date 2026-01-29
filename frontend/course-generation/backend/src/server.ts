import app from './app';
import pool, { setDatabaseConnected } from './db/connection';

const PORT = process.env.PORT || 5000;

// Test database connection (non-blocking)
if (pool) {
  pool.query('SELECT NOW()')
    .then((res) => {
      console.log('✅ Database connected successfully');
      setDatabaseConnected(true);
    })
    .catch((err) => {
      console.error('❌ Database connection failed:', err.message);
      console.log('⚠️  Running without database - API will work with mock/frontend data');
      setDatabaseConnected(false);
    });
} else {
  console.log('⚠️  Database not configured - Running in mock mode');
  setDatabaseConnected(false);
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  if (pool) {
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
