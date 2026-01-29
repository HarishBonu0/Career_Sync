'use client'

import { notFound, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, BookOpen, User as UserIcon } from 'lucide-react'
import { mockJourneys, mockCourses } from '@/lib/data'
import { format } from 'date-fns'
import CourseCard from '@/components/courses/CourseCard'

export default function JourneyDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const journey = mockJourneys.find((j) => j.slug === slug)

  if (!journey) {
    notFound()
  }

  // Get courses that belong to this journey
  const journeyCourses = mockCourses.filter((c) => c.journeyId === journey.id)
  // Get the first course's first topic for the "Start Learning" button
  const firstCourseFirstTopic = journeyCourses[0]?.topics?.[0]?.slug

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container-custom">
          <Link
            href="/learning-journeys"
            className="inline-flex items-center space-x-2 text-primary-100 hover:text-white mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Journeys</span>
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">{journey.title}</h1>
          {journey.subtitle && (
            <p className="text-xl text-primary-100 mb-6">{journey.subtitle}</p>
          )}

          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>{journey.courseCount} Courses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Journey</h2>
              <p className="text-gray-700 leading-relaxed">{journey.description}</p>
            </div>

            {/* Who is for / Who is not for */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {journey.whoIsFor && (
                <div className="card bg-green-50 border-2 border-green-200">
                  <h3 className="text-xl font-bold text-green-900 mb-3">✓ Who is this for?</h3>
                  <p className="text-gray-700 leading-relaxed">{journey.whoIsFor}</p>
                </div>
              )}
              {journey.whoIsNotFor && (
                <div className="card bg-red-50 border-2 border-red-200">
                  <h3 className="text-xl font-bold text-red-900 mb-3">✗ Who is this NOT for?</h3>
                  <p className="text-gray-700 leading-relaxed">{journey.whoIsNotFor}</p>
                </div>
              )}
            </div>

            {/* Courses */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Courses in This Journey ({journeyCourses.length})
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {journeyCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-20">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Pathway Details</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Courses</span>
                  <span className="font-semibold">{journey.courseCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Level</span>
                  <span className="font-semibold">All Levels</span>
                </div>
              </div>

                {firstCourseFirstTopic ? (
                  <Link
                    href={`/generate/${firstCourseFirstTopic}`}
                    className="w-full btn-primary mb-3 inline-block text-center"
                  >
                    Start Learning
                  </Link>
                ) : (
                  <button disabled className="w-full btn-primary mb-3 opacity-50 cursor-not-allowed">
                    Start Learning
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
