'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowRight, Sparkles } from 'lucide-react'

interface Question {
  id: number
  type: 'text' | 'single-choice' | 'multiple-choice'
  question: string
  placeholder?: string
  options?: string[]
}

const questions: Question[] = [
  {
    id: 1,
    type: 'text',
    question: 'Nice, you want to learn {topic}. First, can you tell me your name so I can personalize things for you?',
    placeholder: 'Type your answer...',
  },
  {
    id: 2,
    type: 'single-choice',
    question: 'Nice to meet you, {name}. What is your main goal with learning {topic} right now? For example, coding interviews, college exams, competitive programming, building strong fundamentals, or something else?',
    options: [
      'Coding interviews',
      'College exams',
      'Competitive programming',
      'I want strong fundamentals',
      'I am very tired, I need in short',
    ],
  },
  {
    id: 3,
    type: 'single-choice',
    question: 'What is your current experience level with {topic}?',
    options: [
      'Complete beginner - Never studied this before',
      'Beginner - I know the basics',
      'Intermediate - I have some experience',
      'Advanced - I\'m quite experienced',
      'Expert - I know this very well',
    ],
  },
  {
    id: 4,
    type: 'single-choice',
    question: 'How much time can you dedicate to learning {topic} per day?',
    options: [
      'Less than 30 minutes',
      '30 minutes to 1 hour',
      '1-2 hours',
      '2-3 hours',
      'More than 3 hours',
    ],
  },
  {
    id: 5,
    type: 'single-choice',
    question: 'What\'s your preferred learning style?',
    options: [
      'Visual - I learn best with diagrams and videos',
      'Practical - I prefer hands-on coding exercises',
      'Reading - I like detailed written explanations',
      'Mixed - I like a combination of all',
    ],
  },
  {
    id: 6,
    type: 'single-choice',
    question: 'When do you want to complete learning {topic}?',
    options: [
      'Within 1 week',
      'Within 2 weeks',
      'Within 1 month',
      '1-3 months',
      'More than 3 months - I\'m not in a hurry',
    ],
  },
  {
    id: 7,
    type: 'multiple-choice',
    question: 'Which specific areas of {topic} are you most interested in? (Select all that apply)',
    options: [
      'Core concepts and theory',
      'Practical applications',
      'Interview questions',
      'Project-based learning',
      'Best practices and patterns',
      'Advanced topics',
    ],
  },
  {
    id: 8,
    type: 'single-choice',
    question: 'Do you prefer to learn with real-world projects or theoretical exercises?',
    options: [
      'Real-world projects',
      'Theoretical exercises',
      'A mix of both',
    ],
  },
  {
    id: 9,
    type: 'single-choice',
    question: 'How do you want to track your progress?',
    options: [
      'Quizzes and assessments',
      'Building projects',
      'Coding challenges',
      'All of the above',
    ],
  },
  {
    id: 10,
    type: 'text',
    question: 'Is there anything specific about {topic} you want to focus on or any challenges you\'ve faced before?',
    placeholder: 'Type your answer... (optional)',
  },
]

export default function GenerateCoursePage() {
  const params = useParams()
  const topic = decodeURIComponent(params.topic as string)
  const router = useRouter()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
  const [textInput, setTextInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [showReview, setShowReview] = useState(false)

  const totalSteps = questions.length
  const currentQuestion = questions[currentStep - 1]
  const userName = answers[1] as string || 'there'

  const replaceTokens = (text: string) => {
    return text.replace('{topic}', topic).replace('{name}', userName)
  }

  const handleNext = () => {
    if (currentQuestion.type === 'text' && textInput.trim()) {
      setAnswers({ ...answers, [currentStep]: textInput.trim() })
      setTextInput('')
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
      } else {
        setShowReview(true)
      }
    } else if (currentQuestion.type === 'text' && currentStep === 10) {
      // Last question is optional
      setAnswers({ ...answers, [currentStep]: textInput.trim() })
      setShowReview(true)
    }
  }

  const handleOptionSelect = (option: string) => {
    if (currentQuestion.type === 'single-choice') {
      setAnswers({ ...answers, [currentStep]: option })
      setTimeout(() => {
        if (currentStep < totalSteps) {
          setCurrentStep(currentStep + 1)
        } else {
          setShowReview(true)
        }
      }, 300)
    } else if (currentQuestion.type === 'multiple-choice') {
      const current = (answers[currentStep] as string[]) || []
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option]
      setAnswers({ ...answers, [currentStep]: updated })
    }
  }

  const handleMultipleChoiceNext = () => {
    if ((answers[currentStep] as string[])?.length > 0) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
      } else {
        setShowReview(true)
      }
    }
  }

  const generateCourse = async () => {
    setIsGenerating(true)
    setGenerateError(null)
    
    try {
      console.log('Starting course generation...')
      console.log('Topic:', topic)
      console.log('Answers:', answers)

      let response
      try {
        response = await fetch('/api/generate-course', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic,
            answers,
          }),
          signal: AbortSignal.timeout(180000), // 3 minute timeout for Mixtral
        })
      } catch (fetchErr) {
        console.error('Fetch error:', fetchErr)
        if (fetchErr instanceof TypeError && fetchErr.message.includes('fetch')) {
          throw new Error('Network error: Unable to reach the server. Check your internet connection.')
        }
        throw fetchErr
      }

      console.log('API Response Status:', response.status)
      
      let data
      try {
        data = await response.json()
      } catch (jsonErr) {
        console.error('JSON parse error:', jsonErr)
        throw new Error('Invalid response from server. The API may be temporarily unavailable.')
      }
      
      console.log('API Response Data:', data)

      if (!response.ok) {
        console.error('API Error Response:', data)
        const errorMessage = data.message || data.error || data.details || `Server error: ${response.statusText}`
        throw new Error(errorMessage)
      }

      // Verify course data exists
      if (!data.course) {
        console.error('No course data in response:', data)
        throw new Error('No course data received from server. The API may not be responding correctly.')
      }

      console.log('Course generated successfully:', data.course.title)

      // Persist the course to Supabase
      let courseId: string | null = null
      try {
        const saveResponse = await fetch('/api/courses/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ course: data.course }),
        })

        const saveJson = await saveResponse.json()
        if (!saveResponse.ok) {
          console.warn('Failed to persist course to Supabase, falling back to localStorage', saveJson)
        } else {
          courseId = saveJson.courseId
        }
      } catch (persistErr) {
        console.warn('Persist error (fallback to localStorage):', persistErr)
      }

      // Store locally as a fallback
      console.log('Storing course in localStorage...')
      localStorage.setItem('generatedCourse', JSON.stringify({ ...data.course, id: courseId }))
      console.log('Course stored. Data length:', localStorage.getItem('generatedCourse')?.length)
      
      // Navigate to the generated course page using Supabase ID when available
      const fallbackId = topic.toLowerCase().replace(/\s+/g, '-')
      const targetId = courseId || fallbackId
      console.log('Navigating to:', `/course-generated/${targetId}`)
      router.push(`/course-generated/${targetId}`)
    } catch (error) {
      console.error('Course generation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate course. Please try again.'
      setGenerateError(errorMessage)
      setIsGenerating(false)
    }
  }

  const progressPercentage = (currentStep / totalSteps) * 100

  // Review Page
  if (showReview) {
    const getAnswerDisplay = (questionId: number) => {
      const answer = answers[questionId]
      if (Array.isArray(answer)) {
        return answer.join(', ')
      }
      return answer || 'Not answered'
    }

    const goal = getAnswerDisplay(2)
    const experience = getAnswerDisplay(3)
    const timeCommitment = getAnswerDisplay(4)
    const learningStyle = getAnswerDisplay(5)
    const timeline = getAnswerDisplay(6)
    const interests = getAnswerDisplay(7)
    const preference = getAnswerDisplay(8)
    const tracking = getAnswerDisplay(9)
    const specificFocus = getAnswerDisplay(10)

    return (
      <div className="min-h-screen bg-white">
        {/* Progress Bar */}
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
          <div className="container-custom py-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        step === 3 ? 'bg-gray-900 text-white' : step < 3 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        {step}
                      </div>
                      <span className="text-xs mt-2 text-gray-600">
                        {step === 1 && 'start'}
                        {step === 2 && 'understanding you'}
                        {step === 3 && 'review'}
                        {step === 4 && 'course created'}
                      </span>
                    </div>
                    {step < 4 && (
                      <div className="flex-1 h-1 mx-4 bg-gray-200 rounded">
                        <div className="h-full bg-gray-900 rounded transition-all duration-300"
                          style={{ width: step < 3 ? '100%' : '0%' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-32 pb-20 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-normal text-gray-800 mb-12 leading-relaxed">
              here is what i have understood about you so far, {userName.toLowerCase()}, to design a {topic.toLowerCase()} course that really fits you.
            </h1>

            {/* Conversational Review */}
            <div className="space-y-8 text-gray-700 leading-relaxed">
              {/* 1. Identity and Background */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">1. your identity and background</h3>
                <div className="space-y-2 ml-4">
                  <p>- your name is {userName.toLowerCase()}.</p>
                  <p>- you are learning {topic.toLowerCase()} with experience level: {experience.toLowerCase()}.</p>
                  {experience.toLowerCase().includes('beginner') && (
                    <>
                      <p>- you are new to {topic.toLowerCase()}, so we will start from the basics:</p>
                      <p className="ml-4">- fundamental concepts</p>
                      <p className="ml-4">- core principles</p>
                      <p className="ml-4">- building blocks</p>
                    </>
                  )}
                </div>
              </div>

              {/* 2. Main Goals */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">2. your main goals with {topic.toLowerCase()}</h3>
                <div className="space-y-2 ml-4">
                  <p>- your current goal is: {goal.toLowerCase()}.</p>
                  {goal.toLowerCase().includes('strong fundamentals') && (
                    <>
                      <p>- you want to build a strong base in {topic.toLowerCase()} first.</p>
                      <p>- you want to reach a solid understanding level, which for you means:</p>
                      <p className="ml-4">- mastering beginner to intermediate topics</p>
                      <p className="ml-4">- understanding core concepts deeply</p>
                      <p className="ml-4">- being able to apply knowledge practically</p>
                    </>
                  )}
                  {goal.toLowerCase().includes('interview') && (
                    <p>- interview preparation is your focus, so we'll emphasize problem-solving patterns.</p>
                  )}
                </div>
              </div>

              {/* 3. Learning Style */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">3. your learning style</h3>
                <div className="space-y-2 ml-4">
                  <p>- your preferred learning style: {learningStyle.toLowerCase()}.</p>
                  {learningStyle.toLowerCase().includes('visual') && (
                    <>
                      <p>- you like visuals and analogies to understand concepts.</p>
                      <p className="ml-4">- you prefer to first feel the concept intuitively.</p>
                      <p className="ml-4">- you want to see diagrams, mental pictures, or everyday life analogies.</p>
                      <p>- after understanding the concept visually, you like to then move to code.</p>
                      <p>- you do not want heavy dry theory before intuition.</p>
                    </>
                  )}
                  {learningStyle.toLowerCase().includes('practical') && (
                    <p>- you prefer hands-on exercises and real coding practice.</p>
                  )}
                  {learningStyle.toLowerCase().includes('mixed') && (
                    <p>- you enjoy a combination of visual aids, practical exercises, and written explanations.</p>
                  )}
                </div>
              </div>

              {/* 4. Time Commitment */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">4. your time commitment</h3>
                <div className="space-y-2 ml-4">
                  <p>- you can spend {timeCommitment.toLowerCase()} on {topic.toLowerCase()}.</p>
                  <p>- this is enough to make steady and serious progress.</p>
                  <p>- we can safely design weekly goals that assume consistent effort.</p>
                  <p>- we'll structure the course to be completed in: {timeline.toLowerCase()}.</p>
                </div>
              </div>

              {/* 5. Areas of Interest */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">5. your areas of interest</h3>
                <div className="space-y-2 ml-4">
                  <p>- you're interested in: {interests.toLowerCase()}.</p>
                  <p>- we'll focus on these areas throughout the course.</p>
                </div>
              </div>

              {/* 6. Learning Preference */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">6. your learning preference</h3>
                <div className="space-y-2 ml-4">
                  <p>- you prefer: {preference.toLowerCase()}.</p>
                  {preference.toLowerCase().includes('real-world') && (
                    <p>- we'll include practical, real-world projects throughout.</p>
                  )}
                  {preference.toLowerCase().includes('mix') && (
                    <p>- we'll balance theoretical foundations with practical applications.</p>
                  )}
                </div>
              </div>

              {/* 7. Progress Tracking */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">7. progress tracking</h3>
                <div className="space-y-2 ml-4">
                  <p>- you want to track progress with: {tracking.toLowerCase()}.</p>
                  <p>- we'll incorporate these throughout the course.</p>
                </div>
              </div>

              {/* 8. Specific Focus */}
              {specificFocus && specificFocus !== 'Not answered' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">8. specific focus</h3>
                  <div className="space-y-2 ml-4">
                    <p>- you mentioned: {specificFocus.toLowerCase()}.</p>
                    <p>- we'll make sure to address this in your personalized course.</p>
                  </div>
                </div>
              )}

              {/* Course Plan Summary */}
              <div className="pt-6 border-t border-gray-200">
                <p className="text-gray-800">
                  this is the picture i have of you now as a learner. next, i can turn this understanding into a step by step, 
                  weekly {topic.toLowerCase()} plan tailored to your style.
                </p>
              </div>

              <div className="pt-4">
                <p className="text-gray-600 italic">
                  if anything above feels inaccurate or if you want to adjust your goals or style, tell me and i will adapt it.
                </p>
              </div>
            </div>

            {/* Error Display */}
            {generateError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Error Generating Course</h3>
                <p className="text-red-700">{generateError}</p>
                <p className="text-red-600 text-sm mt-3">
                  Tips: Check your internet connection, ensure the API key is valid, or try again in a few moments.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-12">
              <button
                onClick={() => {
                  setShowReview(false)
                  setCurrentStep(1)
                  setAnswers({})
                  setGenerateError(null)
                }}
                className="px-8 py-3 border-2 border-gray-300 rounded-full font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Start Over
              </button>
              <button
                onClick={generateCourse}
                disabled={isGenerating}
                className="px-8 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-full font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Course
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6 animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Creating Your Personalized Course</h2>
          <p className="text-lg text-gray-600 mb-8">
            We're designing a learning path just for you...
          </p>
          <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full animate-[loading_2s_ease-in-out_infinite]" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Bar */}
      <div className="fixed top-16 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="container-custom py-6">
          <div className="max-w-4xl mx-auto">
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        currentStep >= step * 2.5
                          ? 'bg-gray-900 text-white'
                          : currentStep >= (step - 1) * 2.5 + 1
                          ? 'bg-gray-400 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {step}
                    </div>
                    <span className="text-xs mt-2 text-gray-600">
                      {step === 1 && 'Start'}
                      {step === 2 && 'Understanding You'}
                      {step === 3 && 'Review'}
                      {step === 4 && 'Course Created'}
                    </span>
                  </div>
                  {step < 4 && (
                    <div className="flex-1 h-1 mx-4 bg-gray-200 rounded">
                      <div
                        className="h-full bg-gray-900 rounded transition-all duration-300"
                        style={{ width: currentStep > step * 2.5 ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="pt-52 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-lg md:text-xl font-normal text-gray-700 mb-10 leading-relaxed">
            {replaceTokens(currentQuestion.question)}
          </h1>

          {/* Text Input */}
          {currentQuestion.type === 'text' && (
            <div>
              <div className="relative mb-6">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                  placeholder={currentQuestion.placeholder}
                  className="w-full px-6 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 transition-colors"
                  autoFocus
                />
                <button
                  onClick={handleNext}
                  disabled={!textInput.trim() && currentStep !== 10}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all ${
                    textInput.trim() || currentStep === 10
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
              {currentStep === 10 && (
                <p className="text-sm text-gray-500 text-center">
                  This question is optional. Click the arrow to continue.
                </p>
              )}
            </div>
          )}

          {/* Single Choice Options */}
          {currentQuestion.type === 'single-choice' && (
            <div className="space-y-3">
              {currentQuestion.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full text-left px-6 py-3.5 text-base rounded-xl border-2 transition-all ${
                    answers[currentStep] === option
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {/* Multiple Choice Options */}
          {currentQuestion.type === 'multiple-choice' && (
            <div>
              <div className="space-y-3 mb-6">
                {currentQuestion.options?.map((option, index) => {
                  const isSelected = ((answers[currentStep] as string[]) || []).includes(option)
                  return (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(option)}
                      className={`w-full text-left px-6 py-3.5 text-base rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                            isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        {option}
                      </div>
                    </button>
                  )
                })}
              </div>
              <button
                onClick={handleMultipleChoiceNext}
                disabled={!answers[currentStep] || (answers[currentStep] as string[])?.length === 0}
                className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all ${
                  answers[currentStep] && (answers[currentStep] as string[])?.length > 0
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </div>
          )}

          {/* Back Button */}
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="mt-6 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Go back
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0%, 100% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(400%);
          }
        }
      `}</style>
    </div>
  )
}
