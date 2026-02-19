/**
 * Refactored Course Generation API Route
 * Uses modular service orchestrator instead of monolithic logic
 * 
 * Flow:
 * 1. Validate request
 * 2. Extract user preferences from answers
 * 3. Call generationOrchestrator.generateCourse()
 * 4. Returns base course immediately (enrichment continues in background)
 * 5. Client polls for enrichment progress via GET /api/enrich/status/[jobId]
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateCourse, getEnrichmentStatus } from '../../../backend/services/generationOrchestrator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, answers } = body

    console.log('🚀 REFACTORED COURSE GENERATION REQUEST')
    console.log('Topic:', topic)
    console.log('Answers:', answers)

    // Validate required parameters
    if (!topic || topic.trim().length === 0) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    // Validate API keys
    const openrouterKey = process.env.OPENROUTER_API_KEY
    const youtubeKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
    const redisUrl = process.env.REDIS_URL

    if (!openrouterKey) {
      console.error('❌ OPENROUTER_API_KEY not configured')
      return NextResponse.json(
        { error: 'OpenRouter configuration missing' },
        { status: 500 }
      )
    }

    if (!youtubeKey) {
      console.warn('⚠️  YOUTUBE_API_KEY not configured, video enrichment will use fallbacks')
    }

    if (!redisUrl) {
      console.warn('⚠️  REDIS_URL not configured, enrichment will use in-memory storage')
    }

    // Extract user preferences from answers
    const experience = extractDifficulty(answers?.[3])
    const timelineText = answers?.[6] || '1 month'
    const numModules = calculateModuleCount(timelineText, experience)

    console.log(`📊 Course parameters:`)
    console.log(`   Difficulty: ${experience}`)
    console.log(`   Module count: ${numModules}`)
    console.log(`   Timeline: ${timelineText}`)

    // Generate course using orchestrator
    // This will:
    // 1. Generate module titles via LLM
    // 2. Validate & deduplicate via embeddings
    // 3. Expand modules into full structures
    // 4. Queue background enrichment (videos + resources)
    // 5. Return immediately with base course
    const startTime = Date.now()
    const generatedCourse = await generateCourse({
      topic,
      numModules,
      difficulty: experience as 'beginner' | 'intermediate' | 'advanced',
    })
    const generationTime = Date.now() - startTime

    console.log(`✅ Course generated in ${(generationTime / 1000).toFixed(1)}s`)
    console.log(`   Course ID: ${generatedCourse.id}`)
    console.log(`   Enrichment Job: ${generatedCourse.enrichmentJobId}`)
    console.log(`   Status: ${generatedCourse.status}`)

    // Return base course immediately
    // Client can poll enrichment progress via enrichmentJobId
    return NextResponse.json({
      success: true,
      course: generatedCourse,
      meta: {
        topic,
        userName: answers?.[1] || 'Student',
        generationTimeMs: generationTime,
        enrichmentJobId: generatedCourse.enrichmentJobId,
        enrichmentStatus: `Poll /api/enrich/status/${generatedCourse.enrichmentJobId} for progress`,
      },
    })
  } catch (error) {
    console.error('❌ Course generation failed:', error)
    return NextResponse.json(
      {
        error: 'Course generation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to check enrichment progress
 */
export async function GET(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId query parameter required' },
        { status: 400 }
      )
    }

    const status = await getEnrichmentStatus(jobId)

    return NextResponse.json({
      jobId,
      ...status,
    })
  } catch (error) {
    console.error('Error fetching enrichment status:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch enrichment status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Extract difficulty level from user answers
 */
function extractDifficulty(experienceAnswer: string): 'beginner' | 'intermediate' | 'advanced' {
  if (!experienceAnswer) return 'intermediate'

  const lower = experienceAnswer.toLowerCase()
  if (lower.includes('beginner') || lower.includes('novice') || lower.includes('new'))
    return 'beginner'
  if (lower.includes('advanced') || lower.includes('expert') || lower.includes('professional'))
    return 'advanced'
  return 'intermediate'
}

/**
 * Calculate module count based on timeline and difficulty
 */
function calculateModuleCount(timeline: string, difficulty: string): number {
  if (!timeline) return 10

  const lower = timeline.toLowerCase()

  // Extract number from timeline (e.g., "2 weeks" → 2)
  const match = lower.match(/(\d+)\s*(week|month|day|hour)?/)
  const amount = match ? parseInt(match[1], 10) : 4

  // Map timeline to module count
  if (lower.includes('week')) {
    // 1 week = 5-6 modules, 2 weeks = 8-10, 4 weeks = 12-15
    if (difficulty === 'beginner') return Math.max(5, amount * 2)
    if (difficulty === 'advanced') return amount * 3
    return Math.max(8, amount * 2 + 2)
  }

  if (lower.includes('month')) {
    // 1 month = 8-10, 2 months = 12-15, 3+ months = 15+
    if (difficulty === 'beginner') return Math.max(5, amount * 6)
    if (difficulty === 'advanced') return Math.max(15, amount * 7)
    return Math.max(10, amount * 6 + 2)
  }

  if (lower.includes('day')) {
    // 1-2 days = 3 modules, 3-4 days = 5, 5+ days = 8
    if (difficulty === 'beginner') return Math.min(5, Math.ceil(amount / 1.5))
    if (difficulty === 'advanced') return Math.ceil(amount * 2)
    return Math.ceil(amount * 1.5)
  }

  // Default based on difficulty
  return difficulty === 'beginner' ? 8 : difficulty === 'advanced' ? 15 : 10
}
