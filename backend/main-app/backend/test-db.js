import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function testDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check existing users
    const userCount = await User.countDocuments();
    console.log(`📊 Total users in database: ${userCount}`);

    // List all users
    const users = await User.find({}, { email: 1, name: 1, createdAt: 1, lastLoginAt: 1, loginCount: 1 });
    console.log('\n📋 All Users:');
    console.table(users);

    // Create a test user
    console.log('\n➕ Creating test user...');
    const testUser = await User.create({
      email: `test-${Date.now()}@example.com`,
      passwordHash: 'hashed_password_here',
      name: 'Test User',
      phone: '1234567890'
    });
    console.log('✅ Test user created:', testUser._id);

    // Verify it was saved
    const savedUser = await User.findById(testUser._id);
    console.log('✅ Verified - User found in database:', savedUser.email);

    // Update lastLoginAt
    testUser.lastLoginAt = new Date();
    testUser.loginCount = 1;
    await testUser.save();
    console.log('✅ Login recorded');

    // List users again
    const allUsers = await User.find({}, { email: 1, name: 1, createdAt: 1, lastLoginAt: 1, loginCount: 1 });
    console.log('\n📋 Users after update:');
    console.table(allUsers);

    await mongoose.connection.close();
    console.log('\n✅ Test complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testDatabase();
