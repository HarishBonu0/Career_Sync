// Database functions for course-generation app
// Calls MongoDB backend API for real data persistence

const BACKEND_API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'

export async function saveGeneratedCourse(course: any, userId?: string) {
  console.log('Saving course to MongoDB:', course.title)
  
  try {
    // Get user from localStorage - check multiple keys for compatibility
    let user = null
    const userStr = typeof window !== 'undefined' ? (
      localStorage.getItem('careersync_user') || 
      localStorage.getItem('careeros_user')
    ) : null
    
    if (userStr) {
      try {
        user = JSON.parse(userStr)
      } catch (e) {
        console.error('Failed to parse user data:', e)
      }
    }
    
    const userEmail = user?.email || user?.userEmail
    const extractedUserId = user?.id || user?._id || user?.user_id || userId
    
    console.log('📧 User email for course:', userEmail)
    console.log('👤 User ID for course:', extractedUserId)
    
    const response = await fetch(`${BACKEND_API}/courses/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: extractedUserId || 'guest',
        userEmail: userEmail || null,
        title: course.title,
        description: course.description,
        level: course.difficulty || course.level,
        duration: course.duration,
        modules: course.modules,
        objectives: course.objectives,
        course: course
      }),
    })
    
    const data = await response.json()
    
    if (data.success) {
      console.log('✅ Course saved to MongoDB:', data.courseId)
      return { courseId: data.courseId }
    } else {
      throw new Error(data.error || 'Failed to save course')
    }
  } catch (error) {
    console.error('❌ Error saving course to MongoDB:', error)
    throw error
  }
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
