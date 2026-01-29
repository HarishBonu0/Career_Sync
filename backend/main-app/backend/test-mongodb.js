import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

console.log('🧪 MongoDB Connection Test\n');
console.log('================================');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

// Mask password in URI for logging
const maskedURI = MONGODB_URI.replace(/:([^@]+)@/, ':****@');
console.log(`📡 Connection URI: ${maskedURI}\n`);

async function testConnection() {
  try {
    console.log('🔄 Attempting to connect to MongoDB Atlas...');
    
    const startTime = Date.now();
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    const duration = Date.now() - startTime;
    
    console.log('✅ CONNECTION SUCCESSFUL!\n');
    console.log('📊 Connection Details:');
    console.log('   Database Name:', mongoose.connection.db.databaseName);
    console.log('   Host:', mongoose.connection.host);
    console.log('   Ready State:', mongoose.connection.readyState);
    console.log('   Connection Time:', `${duration}ms\n`);
    
    // Test a simple operation
    console.log('🧪 Testing database operations...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections:`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    if (collections.length === 0) {
      console.log('\n💡 Database is empty. Collections will be created when you add data.');
    }
    
    console.log('\n🎉 MongoDB connection test completed successfully!');
    console.log('✅ Your backend is ready to use MongoDB Atlas!\n');
    
  } catch (error) {
    console.error('\n❌ CONNECTION FAILED!\n');
    console.error('Error:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Check your internet connection');
      console.error('   - Verify the cluster hostname is correct');
    } else if (error.message.includes('authentication failed')) {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Check your username and password');
      console.error('   - Special characters in password must be URL-encoded');
      console.error('   - Example: @ becomes %40, # becomes %23');
    } else if (error.message.includes('timed out')) {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Check if your IP address is whitelisted in MongoDB Atlas');
      console.error('   - Go to: Network Access → Add IP Address → Add Current IP');
      console.error('   - Or add 0.0.0.0/0 to allow from anywhere (development only)');
    }
    
    console.error('\n📚 MongoDB Atlas Setup:');
    console.error('   1. Go to https://cloud.mongodb.com');
    console.error('   2. Select your cluster → Connect');
    console.error('   3. Network Access → Add your current IP address');
    console.error('   4. Database Access → Verify user credentials\n');
    
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
  }
}

testConnection();
