/**
 * React Hook: useEnrichmentPolling
 * Polls the backend for enrichment progress
 * Useful for displaying real-time progress indicator to user
 */

import { useEffect, useState } from 'react'

export interface EnrichmentStatus {
  jobId: string
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  progress?: {
    totalModules: number
    videosCompleted: number
    resourcesCompleted: number
    videosFailed: number
    resourcesFailed: number
  }
  message: string
  error?: string
}

interface UseEnrichmentPollingOptions {
  jobId: string | null
  pollInterval?: number // milliseconds
  maxAttempts?: number
  onComplete?: (status: EnrichmentStatus) => void
  onError?: (error: string) => void
}

/**
 * Hook to poll enrichment status from backend
 */
export function useEnrichmentPolling({
  jobId,
  pollInterval = 2000,
  maxAttempts = 300, // 10 minutes at 2s interval
  onComplete,
  onError,
}: UseEnrichmentPollingOptions) {
  const [status, setStatus] = useState<EnrichmentStatus | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    if (!jobId) return

    setIsPolling(true)
    let pollTimeout: NodeJS.Timeout | null = null

    const poll = async () => {
      try {
        const response = await fetch(`/api/enrich/status/${jobId}`)
        const data = await response.json()

        setStatus(data)
        setAttempts(prev => prev + 1)

        // Stop polling if completed or failed
        if (data.status === 'completed' || data.status === 'failed') {
          setIsPolling(false)
          if (data.status === 'completed' && onComplete) {
            onComplete(data)
          }
          if (data.status === 'failed' && onError) {
            onError('Enrichment failed')
          }
          return
        }

        // Stop if reached max attempts
        if (attempts >= maxAttempts) {
          setIsPolling(false)
          if (onError) {
            onError('Enrichment polling timeout')
          }
          return
        }

        // Schedule next poll
        pollTimeout = setTimeout(poll, pollInterval)
      } catch (error) {
        console.error('Error polling enrichment status:', error)
        if (onError) {
          onError(
            error instanceof Error ? error.message : 'Failed to fetch enrichment status'
          )
        }
        setIsPolling(false)
      }
    }

    // Start polling
    poll()

    return () => {
      if (pollTimeout) clearTimeout(pollTimeout)
    }
  }, [jobId, pollInterval, maxAttempts, attempts, onComplete, onError])

  return {
    status,
    isPolling,
    attempts,
    progressPercent: status?.progress
      ? Math.round(
          (((status.progress.videosCompleted + status.progress.resourcesCompleted) /
            (status.progress.totalModules * 2)) *
            100) as number
        )
      : 0,
  }
}

export default useEnrichmentPolling
