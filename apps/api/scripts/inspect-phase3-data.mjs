import mongoose from 'mongoose';
import User from '../models/User.js';
import Course from '../models/Course.js';
import CourseGeneration from '../models/CourseGeneration.js';
import Roadmap from '../models/Roadmap.js';
import SkillEvaluation from '../models/SkillEvaluation.js';
import UserEnrollment from '../models/UserEnrollment.js';
import SkillProfile from '../models/SkillProfile.js';

await mongoose.connect(process.env.MONGODB_URI);

const [users, courses, generations, roadmaps, evaluations, enrollments, skillProfiles] = await Promise.all([
  User.find().select('_id').lean(),
  Course.find().select('title user userId userEmail').lean(),
  CourseGeneration.find().select('user').lean(),
  Roadmap.find().select('user userId userEmail').lean(),
  SkillEvaluation.find().select('user userId userEmail').lean(),
  UserEnrollment.find().select('user userId userEmail course courseId roadmap roadmapId type').lean(),
  SkillProfile.countDocuments(),
]);

const userIds = new Set(users.map((user) => user._id.toString()));
const summarize = (rows) => ({
  total: rows.length,
  canonical: rows.filter((row) => row.user).length,
  legacyOnly: rows.filter((row) => !row.user && (row.userId || row.userEmail)).length,
  orphaned: rows.filter((row) => row.user && !userIds.has(row.user.toString())).length,
  orphanIds: rows
    .filter((row) => row.user && !userIds.has(row.user.toString()))
    .map((row) => ({ id: row._id?.toString(), title: row.title }))
    .filter(Boolean),
});

const enrollmentKeys = new Map();
for (const enrollment of enrollments) {
  const resource = enrollment.courseId || enrollment.roadmapId || enrollment.course?.toString() || enrollment.roadmap?.toString() || '';
  const key = [enrollment.user?.toString() || '', enrollment.type, resource].join('|');
  enrollmentKeys.set(key, (enrollmentKeys.get(key) || 0) + 1);
}

console.log(JSON.stringify({
  counts: {
    users: users.length,
    courses: courses.length,
    courseGenerations: generations.length,
    roadmaps: roadmaps.length,
    evaluations: evaluations.length,
    enrollments: enrollments.length,
    skillProfiles,
  },
  ownership: {
    courses: summarize(courses),
    courseGenerations: summarize(generations),
    roadmaps: summarize(roadmaps),
    evaluations: summarize(evaluations),
    enrollments: summarize(enrollments),
  },
  duplicateEnrollmentKeys: [...enrollmentKeys.values()].filter((count) => count > 1).length,
}));

await mongoose.disconnect();