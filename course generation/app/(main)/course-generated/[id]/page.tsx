'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, Clock, Target, CheckCircle, Download } from 'lucide-react'
import Link from 'next/link'
import { supabaseClient } from '../../../../../db/supabaseClient'

interface Module {
  id: number
  title: string
  duration: string
  description: string
  topics: string[]
  activities: string[]
  project?: string
  assessment?: string
}

interface Resource {
  type: string
  title: string
  description: string
  url?: string
}

interface Course {
  title: string
  description: string
  duration?: string
  difficulty?: string
  prerequisites?: string[]
  objectives?: string[]
  modules?: Module[]
  resources?: Resource[]
  finalProject?: {
    title: string
    description: string
    deliverables?: string[]
  }
  rawContent?: string
}

export default function GeneratedCoursePage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const loadCourse = async () => {
      console.log('Loading course from localStorage...')
      const courseData = typeof window !== 'undefined' ? localStorage.getItem('generatedCourse') : null
      if (courseData) {
        try {
          const parsedCourse = JSON.parse(courseData)
          if (parsedCourse && parsedCourse.title) {
            setCourse(parsedCourse)
            setLoading(false)
            return
          }
        } catch (error) {
          console.error('Error parsing course data:', error)
        }
      }

      // Fallback: load from Supabase using the course ID from the URL
      try {
        const courseId = params.id as string
        const { data, error } = await supabaseClient
          .from('courses')
          .select(`*, course_sections(*, course_lessons(*, lesson_materials(*)))`)
          .eq('id', courseId)
          .single()

        if (error) {
          console.error('Supabase fetch error:', error.message)
          setLoading(false)
          return
        }

        const modules = (data?.course_sections || []).map((section, idx) => {
          const lesson = section.course_lessons?.[0]
          return {
            id: section.id,
            title: section.title,
            duration: lesson?.duration || lesson?.estimated_time || '1 week',
            description: lesson?.content || section.description || '',
            topics: [],
            activities: [],
            project: lesson?.project || undefined,
            assessment: lesson?.assessment || undefined,
          }
        })

        const assembled: Course = {
          title: data?.title,
          description: data?.description,
          difficulty: data?.difficulty,
          modules,
          resources: [],
        }

        setCourse(assembled)
      } catch (supabaseError) {
        console.error('Supabase load failure:', supabaseError)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(loadCourse, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleSaveCourse = async () => {
    if (!course) return

    setSaving(true)
    try {
      const response = await fetch('/api/courses/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(course),
      })

      const data = await response.json()

      if (data.success) {
        setSaved(true)
        alert('Course saved successfully! You can now access it from "My Courses".')
      } else {
        throw new Error(data.error || 'Failed to save course')
      }
    } catch (error) {
      console.error('Error saving course:', error)
      alert(error instanceof Error ? error.message : 'Failed to save course. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          {/* Animated spinner */}
          <div className="mb-8 flex justify-center">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin"></div>
            </div>
          </div>
          
          {/* Text */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Creating Your Course</h2>
          <p className="text-lg text-gray-600 mb-2">We're personalizing your learning experience...</p>
          <p className="text-sm text-gray-500">This will only take a moment</p>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-red-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Course Could Not Load</h2>
          <p className="text-gray-600 mb-6">
            It looks like the course data didn't transfer properly. This can happen if you navigated directly to this page or if there was a connection issue.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                // Try to refresh
                window.location.reload()
              }}
              className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
            <Link 
              href="/home" 
              className="block px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
            >
              Go Back to Home
            </Link>
          </div>
          
          <p className="text-xs text-gray-500 mt-6">
            Tip: Generate a new course from the home page and the course will load automatically.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <Link
            href="/home"
            className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-8 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-0 leading-tight tracking-tight">
            {course.title}
          </h1>
        </div>
      </div>

      {/* Topics Section */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-[0.15em]">TOPICS</h2>
          <div className="flex items-center gap-3">
            <button className="text-sm text-gray-700 hover:text-gray-900 px-4 py-2 border border-gray-200 rounded-lg transition-colors">
              See course design
            </button>
            <button className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
        </div>

        {/* Topics List */}
        <div className="space-y-8">
          {course.modules && course.modules.length > 0 ? (
            course.modules.map((module, index) => (
              <div key={module.id} className="bg-white border border-gray-200 rounded-3xl p-10 hover:shadow-md transition-all">
                <div className="mb-5">
                  <span className="inline-block text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-1.5 bg-gray-50 rounded-full border border-gray-200">
                    TOPIC {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                
                <h3 className="text-3xl font-bold text-gray-900 mb-5 tracking-tight leading-tight">
                  {module.title}
                </h3>
                
                <p className="text-[15px] text-gray-600 leading-relaxed mb-8">
                  {module.description}
                </p>

                <button 
                  className="inline-flex items-center gap-2 bg-[#0c4a6e] hover:bg-[#0a3d5c] text-white font-medium text-[15px] px-5 py-2.5 rounded-lg transition-colors"
                  onClick={() => {
                    // Store module data and navigate to topic page
                    const moduleData = {
                      ...module,
                      courseTitle: course.title,
                      moduleIndex: index,
                      courseId: params.id
                    }
                    localStorage.setItem(`module_${index + 1}`, JSON.stringify(moduleData))
                    // Use course title as slug for URL
                    const courseSlug = course.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                    router.push(`/course/${courseSlug}/topic/${index + 1}`)
                  }}
                >
                  Start
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))
          ) : (
            // Fallback for courses without structured modules
            <div className="bg-white border border-gray-200 rounded-3xl p-10">
              <div className="mb-5">
                <span className="inline-block text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-1.5 bg-gray-50 rounded-full border border-gray-200">
                  COURSE CONTENT
                </span>
              </div>
              
              <h3 className="text-3xl font-bold text-gray-900 mb-5 tracking-tight leading-tight">
                {course.title}
              </h3>
              
              <div className="prose max-w-none text-[15px] text-gray-600 leading-relaxed mb-8 whitespace-pre-wrap">
                {course.rawContent || course.description}
              </div>
              
              <button 
                className="inline-flex items-center gap-2 bg-[#0c4a6e] hover:bg-[#0a3d5c] text-white font-medium text-[15px] px-5 py-2.5 rounded-lg transition-colors"
                onClick={() => {
                  // Store course content and navigate
                  const moduleData = {
                    title: course.title,
                    description: course.description,
                    content: course.rawContent || course.description,
                    courseTitle: course.title,
                    moduleIndex: 0,
                    courseId: params.id
                  }
                  localStorage.setItem('module_1', JSON.stringify(moduleData))
                  // Use course title as slug for URL
                  const courseSlug = course.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                  router.push(`/course/${courseSlug}/topic/1`)
                }}
              >
                Start
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Additional Course Info */}
        {(course.objectives || course.prerequisites || course.resources) && (
          <div className="mt-12 pt-12 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Learning Objectives */}
              {course.objectives && course.objectives.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">LEARNING OBJECTIVES</h3>
                  <ul className="space-y-3">
                    {course.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prerequisites */}
              {course.prerequisites && course.prerequisites.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">PREREQUISITES</h3>
                  <ul className="space-y-2">
                    {course.prerequisites.map((prereq, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span className="text-gray-700">{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Resources */}
            {course.resources && course.resources.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">📚 CURATED LEARNING RESOURCES</h3>
                <p className="text-gray-600 mb-6">High-quality, hand-picked resources to supplement your learning and provide quick reference materials.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-blue-300 transition-all group cursor-pointer"
                    >
                      <div className="text-xs text-blue-600 uppercase font-semibold mb-2">{resource.type}</div>
                      <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{resource.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                      <div className="text-sm text-blue-600 font-medium group-hover:gap-2 inline-flex items-center gap-1 transition-all">
                        View Resource <span>→</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-12 flex flex-wrap gap-4">
          {!saved && (
            <button
              onClick={handleSaveCourse}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save to My Courses'}
            </button>
          )}
          {saved && (
            <button
              disabled
              className="flex items-center gap-2 bg-green-600 text-white py-3 px-6 rounded-lg font-medium"
            >
              <CheckCircle className="w-5 h-5" />
              Saved
            </button>
          )}
          <button
            onClick={() => {
              const dataStr = JSON.stringify(course, null, 2)
              const dataBlob = new Blob([dataStr], { type: 'application/json' })
              const url = URL.createObjectURL(dataBlob)
              const link = document.createElement('a')
              link.href = url
              link.download = `${course.title.replace(/\s+/g, '_')}_curriculum.json`
              link.click()
            }}
            className="flex items-center gap-2 text-gray-700 border border-gray-300 hover:bg-gray-50 py-3 px-6 rounded-lg font-medium transition-colors"
          >
            <Download className="w-5 h-5" />
            Download Course
          </button>
          <button
            onClick={() => router.push('/home')}
            className="text-gray-700 hover:text-gray-900 py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Create Another Course
          </button>
        </div>
      </div>
    </div>
  )
}
