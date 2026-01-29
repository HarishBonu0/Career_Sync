# Profile Progress Tracking Guide

## Overview
The profile page now displays courses, roadmaps, and skill evaluations with CodeChef-style progress tracking.

## Features
✅ **Progress Bars** - Visual completion percentage for all items
✅ **Action Buttons** - "Continue Learning" / "Go to Course" buttons  
✅ **Completion Status** - Badges for completed items
✅ **Statistics** - Total courses, roadmaps, and evaluations count

## How to Use in Other Pages

### 1. Include the Profile Utils Script

Add to your HTML file:
```html
<script src="http://localhost:4173/profile-utils.js"></script>
```

### 2. Save Course Progress

When a user generates/saves a course:
```javascript
// Example: After generating a course
const courseData = {
    id: 'unique-course-id',
    title: 'Full Stack Development',
    courseName: 'Full Stack Development',
    level: 'Intermediate',
    duration: '12 weeks',
    modules: 10,
    totalModules: 10,
    completedModules: 0,
    progress: 0
};

// Save to profile
window.Career SyncProfile.saveCourse(courseData);
```

### 3. Update Course Progress

When user completes a module:
```javascript
// Update progress (e.g., completed 3 out of 10 modules = 30%)
window.Career SyncProfile.updateCourseProgress(
    'course-id',  // Course ID
    30,           // Progress percentage
    3             // Completed modules
);
```

### 4. Save Roadmap

When a user generates/saves a roadmap:
```javascript
const roadmapData = {
    id: 'unique-roadmap-id',
    title: 'Frontend Developer',
    careerGoal: 'Frontend Developer',
    targetRole: 'Frontend Developer',
    stages: 6,
    totalStages: 6,
    completedStages: 0,
    progress: 0,
    duration: '6 months'
};

window.Career SyncProfile.saveRoadmap(roadmapData);
```

### 5. Update Roadmap Progress

When user completes a stage:
```javascript
// Update progress (e.g., completed 2 out of 6 stages = 33%)
window.Career SyncProfile.updateRoadmapProgress(
    'roadmap-id',  // Roadmap ID
    33,            // Progress percentage
    2              // Completed stages
);
```

### 6. Save Skill Evaluation

After completing a test:
```javascript
const evaluationData = {
    id: 'unique-eval-id',
    topic: 'JavaScript Fundamentals',
    title: 'JavaScript Fundamentals',
    totalQuestions: 15,
    correctAnswers: 13,
    score: 87,  // Percentage
    completedAt: new Date().toISOString(),
    timeTaken: '25 min'
};

window.Career SyncProfile.saveEvaluation(evaluationData);
```

## Example Integration

### Course Generation Page
```javascript
// After AI generates the course
fetch('http://localhost:5000/api/courses/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseName, duration, level })
})
.then(response => response.json())
.then(data => {
    // Save to profile
    window.Career SyncProfile.saveCourse({
        id: data.generationId,
        title: data.courseName,
        courseName: data.courseName,
        level: level,
        duration: duration,
        modules: 10,
        totalModules: 10,
        completedModules: 0,
        progress: 0
    });
    
    // Redirect to profile or show success
    alert('Course saved to your profile!');
});
```

### Roadmap Page
```javascript
// After generating roadmap
const savedRoadmap = window.Career SyncProfile.saveRoadmap({
    id: Date.now().toString(),
    title: careerGoal,
    careerGoal: careerGoal,
    targetRole: careerGoal,
    stages: 6,
    totalStages: 6,
    completedStages: 0,
    progress: 0,
    duration: '6 months'
});

console.log('Roadmap saved:', savedRoadmap);
```

### Test Page
```javascript
// After submitting test
const result = calculateScore();
window.Career SyncProfile.saveEvaluation({
    id: Date.now().toString(),
    topic: testTopic,
    title: testTopic,
    totalQuestions: questions.length,
    correctAnswers: result.correct,
    score: Math.round((result.correct / questions.length) * 100),
    completedAt: new Date().toISOString(),
    timeTaken: `${result.timeSpent} min`
});
```

## Data Structure

### Courses
```javascript
{
    id: string,
    title: string,
    courseName: string,
    level: string,
    duration: string,
    modules: number,
    totalModules: number,
    completedModules: number,
    progress: number (0-100),
    enrolledAt: ISO date string,
    lastAccessedAt: ISO date string,
    status: 'in-progress' | 'completed',
    completedAt?: ISO date string
}
```

### Roadmaps
```javascript
{
    id: string,
    title: string,
    careerGoal: string,
    targetRole: string,
    stages: number,
    totalStages: number,
    completedStages: number,
    progress: number (0-100),
    duration: string,
    createdAt: ISO date string,
    lastAccessedAt: ISO date string,
    status: 'in-progress' | 'completed'
}
```

### Evaluations
```javascript
{
    id: string,
    topic: string,
    title: string,
    totalQuestions: number,
    correctAnswers: number,
    score: number (0-100),
    completedAt: ISO date string,
    timeTaken: string
}
```

## Testing

The profile page includes sample data that appears on first load. You can:
1. Visit http://localhost:4173/profile.html
2. See sample courses with progress bars
3. Click "Continue Learning" or "Go to Course" buttons
4. View the progress tracking in action

## LocalStorage Keys

- `Career Sync_enrolled_courses` - Array of course objects
- `Career Sync_saved_roadmaps` - Array of roadmap objects
- `Career Sync_evaluations` - Array of evaluation objects

## Notes

- Progress is automatically calculated from completed/total items
- Status changes to 'completed' when progress reaches 100%
- All timestamps are stored in ISO format
- Data persists in browser localStorage
