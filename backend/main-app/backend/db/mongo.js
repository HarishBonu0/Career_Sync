import mongoose from 'mongoose';

export async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set. Add it to your environment.');
    console.error('⚠️  Server will continue running with limited functionality');
    console.error('🔧 To fix: Set MONGODB_URI in your environment variables');
    // Don't exit - allow server to start for testing
    return false;
  }

  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB connected successfully!`);
    console.log(`📦 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('💡 Make sure your IP is whitelisted in MongoDB Atlas');
    console.error('💡 Check your connection string and credentials');
    console.error('⚠️  Server will continue running with limited functionality (localStorage only)');
    console.error('🔧 To fix: Update MongoDB credentials or whitelist IP: https://cloud.mongodb.com/');
    // Don't exit - allow server to start for frontend development
    return false;
  }
  
  return true;

  // Handle connection events
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err.message);
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected');
  });
}
