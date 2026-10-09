'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ArrowLeft, Play, CheckCircle2, Bookmark } from 'lucide-react'
import Link from 'next/link'
import { YouTubeVideo } from '@/lib/youtube'
import api from '@/lib/api'

interface Topic {
  id: number
  title: string
  content: string
  videoUrl?: string
  duration: number
  completed: boolean
}

const mockTopics: Topic[] = [
  {
    id: 1,
    title: 'Introduction to the Fundamentals',
    content: `# Welcome to Introduction to the Fundamentals

Hi there! I'm excited to guide you through this first topic. Let's start with a simple analogy to make things clear.

## Understanding the Basics

Think of this like building a house. Before you can build walls and a roof, you need a strong foundation. That's exactly what we're doing here - laying down the foundation for your learning journey.

## Key Concepts

1. **Concept One**: This is the first building block. Imagine it as the concrete foundation of your house. Without it, everything else would crumble.

2. **Concept Two**: Now that we have our foundation, we can start building the framework. This is like the wooden beams that give structure to your house.

3. **Concept Three**: Finally, we add the details. These are the finishing touches that make everything come together beautifully.

## Let's Practice

Now that you understand these concepts intuitively, let's look at how they work in practice:

\`\`\`python
# Example code demonstrating the concept
def fundamental_example():
    print("This is where theory meets practice")
    return "Understanding achieved!"
\`\`\`

## Remember

The key to mastering this topic is practice and patience. Don't rush - take your time to absorb each concept fully before moving on.`,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: 480, // 8 minutes in seconds
    completed: false,
  },
  {
    id: 2,
    title: 'Deep Dive into Core Principles',
    content: '# Deep Dive into Core Principles\n\nIn this lesson, we explore the fundamental principles that will guide your learning...',
    duration: 600,
    completed: false,
  },
  {
    id: 3,
    title: 'Practical Applications',
    content: '# Practical Applications\n\nNow that you understand the theory, let\'s apply it to real-world scenarios...',
    duration: 720,
    completed: false,
  },
]

export default function TopicPage() {
  const params = useParams()
  const router = useRouter()
  const courseSlug = params.slug as string
  const topicId = parseInt(params.topicId as string)
  
  const [completed, setCompleted] = useState(false)
  const [completedModules, setCompletedModules] = useState<number[]>([])
  const [moduleData, setModuleData] = useState<any>(null)
  const [courseId, setCourseId] = useState<string | null>(null)
  const [youtubeVideo, setYoutubeVideo] = useState<YouTubeVideo | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'video' | 'reading'>('video')
  const [selectedResource, setSelectedResource] = useState<any>(null)
  
  useEffect(() => {
    if (courseSlug === 'preview') {
      const storedCourse = typeof window !== 'undefined' ? sessionStorage.getItem('coursePreview') : null
      if (storedCourse) {
        try {
          const parsed = JSON.parse(storedCourse)
          setCourseId('preview')
          setModuleData({
            ...parsed.modules[topicId - 1],
            courseTitle: parsed.title,
            courseTotalModules: parsed.modules.length,
          })
          setIsSaved(false)
        } catch (error) {
          console.error('❌ Error parsing preview data:', error)
        }
      }
      setLoading(false)
    } else {
      setCourseId(courseSlug)
      api.getCourse(courseSlug)
        .then((courseResponse) => {
          const course = courseResponse.data
          if (course && course.modules) {
             setModuleData({
                ...course.modules[topicId - 1],
                courseTitle: course.title,
                courseTotalModules: course.totalModules || course.modules.length
             })
             const serverCompletedModules = course.completedModules || []
             setCompletedModules(serverCompletedModules)
             setCompleted(serverCompletedModules.includes(topicId))
             setIsSaved(true)
          }
        })
        .catch((error) => console.warn('Could not hydrate course from server:', error))
        .finally(() => setLoading(false))
    }
  }, [courseSlug, topicId])

  useEffect(() => {
    // If the backend already provided a unique video ID for this module via video intelligence, use it!
    if (moduleData?.youtubeVideoId) {
      setYoutubeVideo({
        id: moduleData.youtubeVideoId,
        title: moduleData.videoIntelligence?.title || moduleData.title,
        channelTitle: moduleData.videoIntelligence?.channel || '',
        description: '',
        thumbnail: moduleData.videoIntelligence?.thumbnail || '',
        url: `https://www.youtube.com/embed/${moduleData.youtubeVideoId}`
      })
      return
    }

    // For legacy courses or if we explicitly didn't find a video (youtubeSearch is empty string)
    console.log('🎥 No videoIntelligence found from backend for this module, skipping video render')
    setYoutubeVideo(null)
  }, [moduleData, loading, topicId])

  const topic = moduleData || mockTopics[0]

  const markAsCompleted = async () => {
    if (completedModules.includes(topicId)) {
      setCompleted(true)
      return
    }

    if (courseSlug === 'preview') {
      alert('This course has not been saved yet. Save the course before tracking progress.')
      return
    }

    const nextCompletedTopics = Array.from(new Set([...completedModules, topicId]))
    const totalModules = moduleData?.courseTotalModules || 1
    const progress = Math.round((nextCompletedTopics.length / totalModules) * 100)
    
    try {
      await api.updateCourseProgress(courseSlug, {
        progress,
        currentModule: topicId,
        completedModules: nextCompletedTopics,
      })
      setCompletedModules(nextCompletedTopics)
      setCompleted(true)
    } catch (error: any) {
      alert(error.message || 'Progress could not be saved. Please try again.')
    }
  }

  const saveCourse = async () => {
    setIsSaving(true)
    try {
      const courseDataStr = typeof window !== 'undefined' ? sessionStorage.getItem('coursePreview') : null
      if (!courseDataStr) {
        alert('No course data found. Please generate a course first.')
        setIsSaving(false)
        return
      }

      const course = JSON.parse(courseDataStr)
      const response = await api.createCourse(course)

      if (response.success) {
        setIsSaved(true)
        alert('Course saved successfully! You can now access it from "My Courses".')
        router.push(`/course-generated/${response.courseId}`)
      } else {
        throw new Error(response.error || 'Failed to save course')
      }
    } catch (error) {
      console.error('Error saving course:', error)
      alert(error instanceof Error ? error.message : 'Failed to save course. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container-custom py-4">
          <Link
            href={courseSlug === 'preview' ? '/course-generated/preview' : `/course-generated/${courseSlug}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Video Player */}
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg">
              {/* Tabbed Header - Video vs Reading Materials */}
              <div className="bg-gray-950 border-b border-gray-700 flex items-center">
                <button
                  onClick={() => {
                    setActiveTab('video')
                    setSelectedResource(null)
                  }}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'video'
                      ? 'text-white border-b-2 border-blue-600 bg-gray-900'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  📺 Video Tutorial
                </button>
                {moduleData?.readingMaterials && moduleData.readingMaterials.length > 0 && (
                  <button
                    onClick={() => setActiveTab('reading')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-l border-gray-700 ${
                      activeTab === 'reading'
                        ? 'text-white border-b-2 border-blue-600 bg-gray-900'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    📚 Reading Materials ({moduleData.readingMaterials.length})
                  </button>
                )}
              </div>

              {/* Video Tab Content */}
              {activeTab === 'video' && (
                <>
                  {/* YouTube Video Embed or Placeholder */}
                  <div className="relative aspect-video bg-gray-800">
                    {youtubeVideo ? (
                      <iframe
                        width="100%"
                        height="100%"
                        src={youtubeVideo.url}
                        title={youtubeVideo.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Play className="w-20 h-20 mx-auto mb-4 opacity-50" />
                          <p className="text-lg opacity-75">Loading video content...</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  {youtubeVideo && (
                    <div className="bg-gray-800 p-4">
                      <p className="text-white text-sm">
                        <span className="font-semibold">{youtubeVideo.title}</span>
                      </p>
                      {youtubeVideo.channelTitle && (
                        <p className="text-gray-400 text-xs mt-1">Source: {youtubeVideo.channelTitle}</p>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Reading Materials Tab Content */}
              {activeTab === 'reading' && moduleData?.readingMaterials && moduleData.readingMaterials.length > 0 && (
                <div className="p-0">
                  {!selectedResource ? (
                    <div className="space-y-2 p-4">
                      <p className="text-gray-300 text-sm mb-4">Choose a resource to view:</p>
                      {moduleData.readingMaterials.map((material: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedResource(material)}
                          className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-200 border border-gray-700 hover:border-gray-600 group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold text-sm group-hover:text-blue-400 mb-1 truncate">
                                {material.title}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400">
                                <span className="font-medium">{material.source}</span>
                                {material.estimatedReadTime && (
                                  <>
                                    <span>•</span>
                                    <span>{material.estimatedReadTime}</span>
                                  </>
                                )}
                                {material.difficulty && (
                                  <>
                                    <span>•</span>
                                    <span className="capitalize px-2 py-0.5 rounded-full bg-blue-900 text-blue-300">
                                      {material.difficulty}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="h-screen flex flex-col bg-gray-800">
                      {/* Resource Header */}
                      <div className="bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-white font-semibold text-sm mb-1">{selectedResource.title}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{selectedResource.source}</span>
                            {selectedResource.estimatedReadTime && (
                              <>
                                <span>•</span>
                                <span>{selectedResource.estimatedReadTime}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedResource(null)}
                          className="text-gray-400 hover:text-white ml-4 flex-shrink-0"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                      </div>

                      {/* Resource Iframe */}
                      <div className="flex-1 overflow-hidden">
                        <iframe
                          src={selectedResource.url}
                          title={selectedResource.title}
                          className="w-full h-full border-0"
                          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
                        />
                      </div>

                      {/* Resource Link */}
                      <div className="bg-gray-900 border-t border-gray-700 p-4">
                        <a
                          href={selectedResource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium"
                        >
                          Open in new tab
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Reading Materials Reference */}
            {moduleData?.readingMaterials && moduleData.readingMaterials.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                    <span>📚</span> Quick Learning Materials
                  </h3>
                  <button
                    onClick={() => setActiveTab('reading')}
                    className="text-xs bg-amber-200 hover:bg-amber-300 text-amber-900 px-3 py-1 rounded-full font-medium transition-colors"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-2">
                  {moduleData.readingMaterials.slice(0, 2).map((material: any, idx: number) => (
                    <a
                      key={idx}
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2 bg-white rounded border border-amber-100 hover:border-amber-300 hover:bg-amber-50 transition-all duration-200 text-sm"
                    >
                      <p className="font-medium text-amber-900 text-xs line-clamp-1">{material.title}</p>
                      <p className="text-xs text-amber-700 mt-1">{material.source} • {material.estimatedReadTime}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {!completed && (
              <button
                onClick={markAsCompleted}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Mark as Completed
              </button>
            )}

            {completed && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">Completed ✓</span>
              </div>
            )}
          </div>

          {/* Right Column - Lesson Content */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading content...</p>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{topic.title}</h1>
                    {topic.courseTitle && (
                      <div className="text-sm text-gray-600">
                        <span>{topic.courseTitle}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lesson Content (Scrollable) */}
                <div className="prose prose-lg max-w-none overflow-y-auto max-h-[600px]">
                  {topic.description && (
                    <div className="text-gray-700 leading-relaxed mb-6">
                      <h2 className="text-2xl font-bold mb-3">Overview</h2>
                      <p>{topic.description}</p>
                    </div>
                  )}
                  
                  {topic.topics && Array.isArray(topic.topics) && topic.topics.length > 0 && (
                    <div className="text-gray-700 leading-relaxed mb-6">
                      <h2 className="text-2xl font-bold mb-3">Topics Covered</h2>
                      <ul className="list-disc pl-6 space-y-2">
                        {topic.topics.map((t: string, idx: number) => (
                          <li key={idx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {topic.activities && Array.isArray(topic.activities) && topic.activities.length > 0 && (
                    <div className="text-gray-700 leading-relaxed mb-6">
                      <h2 className="text-2xl font-bold mb-3">Activities</h2>
                      <ul className="list-disc pl-6 space-y-2">
                        {topic.activities.map((activity: string, idx: number) => (
                          <li key={idx}>{activity}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topic.content && (
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {topic.content}
                    </div>
                  )}
                  
                  {topic.project && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
                      <h2 className="text-2xl font-bold mb-3 text-blue-900">Project</h2>
                      <p className="text-blue-800">{topic.project}</p>
                    </div>
                  )}
                </div>

                {/* Back to Course Button */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex items-center gap-4 flex-wrap">
                  {courseId ? (
                    <button
                      onClick={() => {
                        console.log('🔄 Navigating back to course:', courseSlug)
                        router.push(courseSlug === 'preview' ? '/course-generated/preview' : `/course-generated/${courseSlug}`)
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors inline-flex items-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Course
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        console.log('⚠️ No courseId, using router.back()')
                        router.back()
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors inline-flex items-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Course
                    </button>
                  )}
                  <Link
                    href="/home"
                    className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
