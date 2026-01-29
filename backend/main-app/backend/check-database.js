import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Course from './models/Course.js';
import UserEnrollment from './models/UserEnrollment.js';
import SkillEvaluation from './models/SkillEvaluation.js';
import CourseGeneration from './models/CourseGeneration.js';
import Roadmap from './models/Roadmap.js';

dotenv.config();

async function checkDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected successfully!');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n📊 DATABASE STRUCTURE:');
    console.log('='.repeat(60));
    console.log(`Database: ${db.databaseName}`);
    console.log('='.repeat(60));
    
    console.log('\n📁 Collections Found:');
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`  ✓ ${collection.name} (${count} documents)`);
    }
    
    console.log('\n📋 Required Collections Status:');
    const requiredCollections = {
      'users': User,
      'courses': Course,
      'userenrollments': UserEnrollment,
      'skillevaluations': SkillEvaluation,
      'coursegenerations': CourseGeneration,
      'roadmaps': Roadmap
    };
    
    for (const [name, model] of Object.entries(requiredCollections)) {
      const exists = collections.find(c => c.name === name);
      if (exists) {
        const count = await model.countDocuments();
        console.log(`  ✅ ${name} - EXISTS (${count} records)`);
      } else {
        console.log(`  ⚠️  ${name} - NOT FOUND (will be created on first use)`);
      }
    }
    
    console.log('\n📈 Data Summary:');
    console.log('  Users:', await User.countDocuments());
    console.log('  Courses:', await Course.countDocuments());
    console.log('  Enrollments:', await UserEnrollment.countDocuments());
    console.log('    - Course Enrollments:', await UserEnrollment.countDocuments({ type: 'course' }));
    console.log('    - Roadmap Enrollments:', await UserEnrollment.countDocuments({ type: 'roadmap' }));
    console.log('    - Evaluations:', await UserEnrollment.countDocuments({ type: 'evaluation' }));
    console.log('  Skill Evaluations:', await SkillEvaluation.countDocuments());
    console.log('  Course Generations:', await CourseGeneration.countDocuments());
    console.log('  Roadmaps:', await Roadmap.countDocuments());
    
    console.log('\n✅ Database check complete!');
    console.log('='.repeat(60));
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database check failed:', error);
    process.exit(1);
  }
}

checkDatabase();
