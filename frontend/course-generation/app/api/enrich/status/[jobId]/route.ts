/**
 * Enrichment Status Polling Endpoint
 * Clients poll this to get real-time progress on video and resource enrichment
 * 
 * GET /api/enrich/status/[jobId]
 */

import { NextRequest, NextResponse } from 'next/server'
import Redis from 'ioredis'

const REDIS_HOST = process.env.REDIS_HOST || 'localhost'
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10)
const REDIS_PASSWORD = process.env.REDIS_PASSWORD

const redisOptions = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  enableReadyQueue: false,
}

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    console.log(`📊 Fetching enrichment status for job: ${jobId}`)

    // Try Redis first
    let enrichmentData = null

    try {
      const redis = new Redis(redisOptions)
      const trackingKey = `enrichment:${jobId}`
      const trackingData = await redis.get(trackingKey)

      if (trackingData) {
        enrichmentData = JSON.parse(trackingData)
      }

      // Also get progress updates
      const updatesKey = `enrichment:${jobId}:updates`
      const updateData = await redis.get(updatesKey)
      const updates = updateData ? JSON.parse(updateData) : null

      await redis.quit()

      if (enrichmentData && updates) {
        return NextResponse.json({
          jobId,
          status: enrichmentData.status,
          progress: {
            totalModules: enrichmentData.totalModules,
            videosCompleted: updates.completedVideoJobs || 0,
            resourcesCompleted: updates.completedResourceJobs || 0,
            videosFailed: updates.failedVideoJobs || 0,
            resourcesFailed: updates.failedResourceJobs || 0,
          },
          tracking: enrichmentData,
          message: getStatusMessage(enrichmentData, updates),
        })
      }
    } catch (redisError) {
      console.warn(
        '⚠️  Redis error, falling back to simple status:',
        redisError instanceof Error ? redisError.message : 'Unknown error'
      )
    }

    // Fallback response if Redis unavailable
    return NextResponse.json({
      jobId,
      status: 'pending',
      message: 'Enrichment in progress. Check again in a few seconds.',
      message_detailed:
        'This endpoint requires Redis to track real-time progress. ' +
        'Without Redis configured, enrichment continues in background but status cannot be tracked.',
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
 * Generate human-readable status message
 */
function getStatusMessage(
  enrichmentData: any,
  updates: any
): string {
  if (!enrichmentData) {
    return 'Enrichment status unknown'
  }

  const status = enrichmentData.status
  const total = enrichmentData.totalModules
  const completed = (updates?.completedVideoJobs || 0) + (updates?.completedResourceJobs || 0)
  const failed = (updates?.failedVideoJobs || 0) + (updates?.failedResourceJobs || 0)

  if (status === 'completed') {
    return `✅ Enrichment complete! ${completed} modules enriched.`
  }

  if (status === 'in-progress') {
    const percent =
      total > 0 ? Math.round(((completed + failed) / (total * 2)) * 100) : 0
    return `🔄 Enrichment in progress: ${percent}% (${completed}/${total * 2} jobs)`
  }

  if (status === 'failed') {
    return `❌ Enrichment failed. ${failed} jobs failed, ${completed} completed.`
  }

  return `📌 Enrichment queued for ${total} modules`
}
