// MongoDB-based course queries
// This connects to the backend API instead of direct database access

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export interface GeneratedModule {
  id?: number | string
  title: string
  duration?: string
  description?: string
  topics?: string[]
  activities?: string[]
  project?: string
  assessment?: string
  readingMaterials?: any[]
}

export interface GeneratedCourse {
  title: string
  description?: string
  duration?: string
  difficulty?: string
  level?: string
  objectives?: string[]
  modules?: GeneratedModule[]
  resources?: { type?: string; title?: string; description?: string; url?: string }[]
  finalProject?: { title?: string; description?: string }
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const token = typeof window !== 'undefined' ? localStorage.getItem('careeros_token') : null

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || data.error || 'API request failed')
    }

    return data
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error)
    throw error
  }
}

export async function saveGeneratedCourse(course: GeneratedCourse, userId?: string) {
  try {
    console.log('Saving course to MongoDB backend:', course.title)
    
    const courseData = {
      user: userId || null,
      title: course.title,
      description: course.description || '',
      level: course.difficulty || course.level || 'beginner',
      duration: course.duration || '8 weeks',
      objectives: course.objectives || [],
      modules: (course.modules || []).map((mod, idx) => ({
        title: mod.title,
        description: mod.description || '',
        duration: mod.duration || '1 week',
        topics: mod.topics || [],
        lessons: [{
          title: mod.title,
          content: mod.description || '',
          duration: mod.duration || '1 week',
          resources: mod.readingMaterials || [],
          completed: false,
        }],
      })),
      status: 'published',
    }

    const result = await apiRequest('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    })

    console.log('Course saved successfully:', result.data?._id)
    return { courseId: result.data?._id || result.data?.id }
  } catch (error) {
    console.error('Save course error:', error)
    throw error
  }
}

export async function getCourseWithContent(courseId: string) {
  try {
    const result = await apiRequest(`/courses/${courseId}`)
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch course' }
  }
}
}
