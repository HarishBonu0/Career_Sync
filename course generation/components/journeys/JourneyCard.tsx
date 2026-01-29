import Link from 'next/link'
import { LearningJourney } from '@/types'
import { Calendar, BookOpen } from 'lucide-react'
import { format } from 'date-fns'

interface JourneyCardProps {
  journey: LearningJourney
}

export default function JourneyCard({ journey }: JourneyCardProps) {
  return (
    <Link href={`/learning-journeys/${journey.slug}`}>
      <div className="card hover:border hover:border-primary-200 transition-all cursor-pointer h-full">
        {journey.thumbnail && (
          <div className="w-full h-40 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg mb-4"></div>
        )}
        
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {journey.title}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {journey.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(journey.publishedDate), 'do MMM, yyyy')}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <BookOpen className="w-4 h-4" />
            <span>{journey.courseCount} Courses</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
