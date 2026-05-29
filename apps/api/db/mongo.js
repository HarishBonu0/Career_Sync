import mongoose from 'mongoose';

export function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

export async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set. Add it to your environment variables.');
    mongoose.set('bufferCommands', false);
    return false;
  }

  try {
    console.info('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.info(`✅ MongoDB connected successfully!`);
    console.info(`📦 Database: ${mongoose.connection.db.databaseName}`);
    console.info(`🌐 Host: ${mongoose.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err.message);
    });

    mongoose.connection.on('reconnected', () => {
      console.info('✅ MongoDB reconnected');
    });

    return true;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('💡 Make sure your IP is whitelisted in MongoDB Atlas');
    console.error('💡 Check your connection string and credentials');
    console.error('⚠️  Server will continue running with limited functionality (localStorage only)');
    console.error('🔧 To fix: Update MongoDB credentials or whitelist IP: https://cloud.mongodb.com/');
    mongoose.set('bufferCommands', false);
    return false;
  }
}
