// Mock database functions for course-generation app
// These are fallback implementations when no real database is available

export async function saveGeneratedCourse(course: any, userId?: string) {
  console.log('Saving course with mock implementation:', course.title)
  
  // Generate a mock ID
  const courseId = `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // Store in localStorage-like structure (would be backend in production)
  const courseData = {
    ...course,
    id: courseId,
    userId: userId || 'guest',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  console.log('Mock course saved:', courseData)
  return { courseId }
}

export async function createRoadmap(roadmap: any, userId?: string) {
  console.log('Creating roadmap with mock implementation:', roadmap.title)
  
  const roadmapId = `roadmap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const roadmapData = {
    ...roadmap,
    id: roadmapId,
    userId: userId || 'guest',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  console.log('Mock roadmap created:', roadmapData)
  return { roadmapId }
}

export async function getRoadmapDeep(roadmapId: string) {
  console.log('Getting roadmap with mock implementation:', roadmapId)
  
  // Return a mock roadmap structure
  return {
    id: roadmapId,
    title: 'Sample Roadmap',
    description: 'A sample learning roadmap',
    stages: [],
    createdAt: new Date().toISOString(),
  }
}
