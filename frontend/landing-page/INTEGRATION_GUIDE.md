// Integration Guide: How to connect frontend pages with backend database
// This file shows examples of how to call the updated profile utilities

// ============ COURSE GENERATION PAGE (http://localhost:3002) ============
/*

1. When user starts a course, add this code:
   
   const courseData = {
       id: 'course-001',
       title: 'Advanced JavaScript',
       courseName: 'Advanced JavaScript',
       level: 'Advanced',
       duration: '6 weeks',
       modules: 12,
       totalModules: 12,
       completedModules: 0,
       progress: 0,
       status: 'in-progress',
       curriculum: [...modules...]
   };
   
   // Call the function from profile-utils.js
   await careersyncProfile.saveCourse(courseData);

2. When user completes a module, update progress:
   
   const enrollmentId = courseData._id; // Stored from enrollment
   const currentProgress = 25; // 25% complete (3 of 12 modules)
   const completedModules = 3;
   
   await careersyncProfile.updateCourseProgress(enrollmentId, currentProgress, completedModules);

3. If module completion UI shows percentage:
   
   // After completing each module
   const currentModuleIndex = 2; // 0-indexed
   const totalModules = 12;
   const newProgress = ((currentModuleIndex + 1) / totalModules) * 100;
   
   await careersyncProfile.updateCourseProgress(enrollmentId, newProgress, currentModuleIndex + 1);

*/

// ============ ROADMAP PAGE (http://localhost:5173) ============
/*

1. When user starts a roadmap, add this code:
   
   const roadmapData = {
       id: 'roadmap-001',
       title: 'Backend Developer Roadmap',
       careerGoal: 'Become a Backend Developer',
       targetRole: 'Senior Backend Developer',
       stages: 5,
       totalStages: 5,
       completedStages: 0,
       progress: 0,
       duration: '12 months',
       status: 'in-progress'
   };
   
   await careersyncProfile.saveRoadmap(roadmapData);

2. When user completes a stage, update progress:
   
   const enrollmentId = roadmapData._id;
   const completedStage = 1; // Completed stage 1 of 5
   const currentProgress = (completedStage / roadmapData.stages) * 100; // 20%
   
   await careersyncProfile.updateRoadmapProgress(enrollmentId, currentProgress, completedStage);

3. Update progress after each stage:
   
   // When stage is marked complete
   const stageIndex = 0; // 0-indexed
   const totalStages = 5;
   const newProgress = ((stageIndex + 1) / totalStages) * 100;
   
   await careersyncProfile.updateRoadmapProgress(enrollmentId, newProgress, stageIndex + 1);

*/

// ============ SKILL EVALUATOR PAGE (http://localhost:3001) ============
/*

1. When user submits evaluation results:
   
   const evaluationData = {
       id: 'eval-001',
       title: 'JavaScript Fundamentals Test',
       topic: 'JavaScript',
       totalQuestions: 20,
       correctAnswers: 17,
       score: 85, // Percentage
       timeTaken: '15 min',
       results: [...detailed results...]
   };
   
   await careersyncProfile.saveEvaluation(evaluationData);

2. To calculate score percentage:
   
   const score = (correctAnswers / totalQuestions) * 100;
   console.log('Test Score:', score + '%');

*/

// ============ PROFILE PAGE (http://localhost:4173/profile.html) ============
/*

1. To fetch and display all profile data:
   
   // This is called automatically in profile.html, but can be called manually too
   const profileData = await careersyncProfile.getProfileData();
   
   console.log('Courses:', profileData.courses);
   console.log('Roadmaps:', profileData.roadmaps);
   console.log('Evaluations:', profileData.evaluations);

2. Display courses with progress bars:
   
   profileData.courses.forEach(course => {
       console.log(`${course.title}: ${course.progress}% complete`);
       console.log(`Modules: ${course.completedModules}/${course.totalModules}`);
   });

3. Display roadmaps with stage progress:
   
   profileData.roadmaps.forEach(roadmap => {
       console.log(`${roadmap.title}: ${roadmap.progress}% complete`);
       console.log(`Stages: ${roadmap.completedStages}/${roadmap.stages}`);
   });

4. Display evaluation scores:
   
   profileData.evaluations.forEach(eval => {
       console.log(`${eval.title}: ${eval.score}% (${eval.correctAnswers}/${eval.totalQuestions})`);
   });

*/

// ============ IMPLEMENTATION STEPS ============
/*

1. Include profile-utils.js in all HTML pages:
   <script src="path/to/profile-utils.js"></script>

2. In Course Generation Page:
   - Add "Enroll Course" button click handler that calls: saveCourse()
   - Add module completion handler that calls: updateCourseProgress()
   - Example:
     document.getElementById('enrollBtn').addEventListener('click', async () => {
         const result = await careersyncProfile.saveCourse(courseData);
         alert('Enrolled! Enrollment ID: ' + result._id);
     });

3. In Roadmap Page:
   - Add "Start Roadmap" button that calls: saveRoadmap()
   - Add "Complete Stage" button that calls: updateRoadmapProgress()
   - Example:
     document.getElementById('completeStageBtn').addEventListener('click', async () => {
         const stageIndex = getCurrentStageIndex();
         const progress = ((stageIndex + 1) / totalStages) * 100;
         await careersyncProfile.updateRoadmapProgress(enrollmentId, progress, stageIndex + 1);
     });

4. In Skill Evaluator Page:
   - Add "Submit Test" button that calls: saveEvaluation()
   - Calculate score before saving:
     const score = (correctAnswers / totalQuestions) * 100;
   - Example:
     document.getElementById('submitBtn').addEventListener('click', async () => {
         const result = await careersyncProfile.saveEvaluation(evaluationData);
         alert('Test submitted! Score: ' + result.score + '%');
     });

5. In Profile Page:
   - Call getProfileData() on page load
   - Refresh data every 5 seconds or when user switches tabs
   - Example:
     window.addEventListener('focus', async () => {
         const data = await careersyncProfile.getProfileData();
         displayProfile(data);
     });

*/

// ============ DATA FLOW DIAGRAM ============
/*

User Action          →  Frontend Function        →  Backend Endpoint        →  Database
─────────────────────────────────────────────────────────────────────────────────────
Click "Start Course" →  saveCourse()             →  POST /enroll/course     →  MongoDB
Complete Module      →  updateCourseProgress()  →  PUT /progress/course    →  MongoDB
Click "Start Roadmap"→  saveRoadmap()            →  POST /enroll/roadmap    →  MongoDB
Complete Stage       →  updateRoadmapProgress() →  PUT /progress/roadmap   →  MongoDB
Submit Evaluation    →  saveEvaluation()         →  POST /evaluation/submit →  MongoDB
View Profile         →  getProfileData()         →  GET /profile           →  MongoDB
─────────────────────────────────────────────────────────────────────────────────────

All data is synced to both backend (for persistence) and localStorage (for offline)

*/

export default {
    guide: 'See comments in this file for implementation examples'
};

