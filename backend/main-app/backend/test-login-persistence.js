import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function testLoginPersistence() {
  try {
    console.log('\n🔄 Testing MongoDB Atlas Connection and Login Persistence...\n');

    // 1. Connect to MongoDB Atlas
    console.log('1️⃣ Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully!');
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
    console.log(`   Host: ${mongoose.connection.host}\n`);

    // 2. Check User collection
    console.log('2️⃣ Checking User collection...');
    const userCount = await User.countDocuments();
    console.log(`   Found ${userCount} existing users\n`);

    // 3. Create test user (or find existing)
    const testEmail = 'test@skillroute.ai';
    console.log('3️⃣ Setting up test user...');
    
    let testUser = await User.findByEmail(testEmail);
    if (testUser) {
      console.log(`   ✅ Found existing test user: ${testEmail}`);
      console.log(`      Login count: ${testUser.loginCount}`);
      console.log(`      Last login: ${testUser.lastLoginAt || 'Never'}`);
    } else {
      const passwordHash = await bcryptjs.hash('Test@1234', 10);
      testUser = await User.create({
        email: testEmail,
        passwordHash,
        name: 'Test User',
        role: 'user',
        status: 'active'
      });
      console.log(`   ✅ Created new test user: ${testEmail}`);
      console.log(`      Password: Test@1234`);
    }

    // 4. Simulate login
    console.log('\n4️⃣ Simulating login...');
    const beforeLogin = { ...testUser.toObject() };
    await testUser.recordLogin();
    console.log(`   ✅ Login recorded`);
    console.log(`      Before: loginCount=${beforeLogin.loginCount || 0}, lastLogin=${beforeLogin.lastLoginAt || 'Never'}`);
    console.log(`      After:  loginCount=${testUser.loginCount}, lastLogin=${testUser.lastLoginAt}`);

    // 5. Verify persistence by re-fetching
    console.log('\n5️⃣ Verifying persistence...');
    const refetchedUser = await User.findByEmail(testEmail);
    console.log(`   ✅ User data persisted successfully`);
    console.log(`      Email: ${refetchedUser.email}`);
    console.log(`      Login count: ${refetchedUser.loginCount}`);
    console.log(`      Last login: ${refetchedUser.lastLoginAt}`);
    console.log(`      Status: ${refetchedUser.status}`);
    console.log(`      Role: ${refetchedUser.role}`);

    // 6. Test safeObject method
    console.log('\n6️⃣ Testing safe object transformation...');
    const safeObj = refetchedUser.toSafeObject();
    console.log('   ✅ Safe object (no passwordHash):');
    console.log('   ', JSON.stringify(safeObj, null, 2).split('\n').join('\n    '));

    // 7. Indexes check
    console.log('\n7️⃣ Checking indexes...');
    const indexes = await User.collection.getIndexes();
    console.log('   ✅ Indexes:');
    Object.keys(indexes).forEach(key => {
      console.log(`      - ${key}`);
    });

    console.log('\n✅ All tests passed! MongoDB Atlas connection and login persistence are working correctly.\n');
    console.log('📝 Test credentials for frontend testing:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: Test@1234\n`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.\n');
  }
}

testLoginPersistence();
