'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ArrowLeft, Play, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { getYouTubeVideoForTopic } from '@/lib/youtube'
import { YouTubeVideo } from '@/lib/youtube'

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
  const [moduleData, setModuleData] = useState<any>(null)
  const [courseId, setCourseId] = useState<string | null>(null)
  const [youtubeVideo, setYoutubeVideo] = useState<YouTubeVideo | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Load module data from localStorage
    const storedModule = localStorage.getItem(`module_${topicId}`)
    if (storedModule) {
      const parsed = JSON.parse(storedModule)
      setModuleData(parsed)
      setCourseId(parsed.courseId)
    }
    
    // Check if user has completed this topic
    const completedTopics = JSON.parse(localStorage.getItem('completedTopics') || '[]')
    setCompleted(completedTopics.includes(topicId))
    setLoading(false)
  }, [topicId])

  useEffect(() => {
    // Fetch YouTube video for the module
    const fetchVideo = async () => {
      const topic = moduleData || mockTopics[0]
      const video = await getYouTubeVideoForTopic(topic.title)
      setYoutubeVideo(video)
    }
    
    if (!loading) {
      fetchVideo()
    }
  }, [moduleData, loading])

  const topic = moduleData || mockTopics[0]

  const markAsCompleted = () => {
    setCompleted(true)
    const completedTopics = JSON.parse(localStorage.getItem('completedTopics') || '[]')
    if (!completedTopics.includes(topicId)) {
      completedTopics.push(topicId)
      localStorage.setItem('completedTopics', JSON.stringify(completedTopics))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container-custom py-4">
          <Link
            href={`/course/${courseSlug}`}
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
            </div>

            {/* Mark as Completed Button */}
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
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{topic.duration || 10} minutes</span>
                      {topic.courseTitle && (
                        <>
                          <span>•</span>
                          <span>{topic.courseTitle}</span>
                        </>
                      )}
                    </div>
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
                <div className="mt-8 pt-6 border-t border-gray-200 flex items-center gap-4">
                  {courseId ? (
                    <Link
                      href={`/course-generated/${courseId}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Course
                    </Link>
                  ) : (
                    <button
                      onClick={() => router.back()}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
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
