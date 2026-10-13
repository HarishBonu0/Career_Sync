'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import {
  Map,
  CheckCircle2,
  Circle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  Target,
  Clock,
  Layers,
  Copy,
  Check,
  Printer,
  ExternalLink,
  Flame,
  Award,
  ListFilter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface Milestone {
  title: string
  description: string
  targetDate?: string
  resources?: string[]
}

interface RoadmapStep {
  order: number
  skill: string
  priority?: string
  prerequisites?: string[]
  resources?: Array<{
    title: string
    url: string
    provider?: string
    resourceType?: string
  }>
}

interface Roadmap {
  _id: string
  title: string
  description?: string
  currentRole?: string
  targetRole?: string
  timeline?: string
  stages?: number
  progress?: number
  status?: string
  milestones?: Milestone[]
  steps?: RoadmapStep[]
}

interface ParsedTopic {
  id: string
  title: string
  description: string
  tags: string[]
}

interface ParsedStage {
  index: number
  title: string
  overview: string
  topics: ParsedTopic[]
}

async function fetcher(url: string) {
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch roadmap')
  return res.json()
}

/**
 * Strips raw AI boilerplate/preamble from text
 */
function cleanAIText(text: string): string {
  if (!text) return ''
  return text
    .replace(/^Given the\s+['"][^'"]+['"]\s*(?:title|role)?,?\s*(?:this step\s+)?(?:focuses on\s+)?/i, '')
    .replace(/^For a\s+['"][^'"]+['"]\s*(?:role|title)?,?\s*(?:preparation goes beyond\s+)?/i, '')
    .replace(/^This step focuses on (?:acquiring|solidifying|building|learning)[^.]*\.\s*/i, '')
    .replace(/As an AI[^.]*\.\s*/gi, '')
    .replace(/In a simulated business scenario,?\s*/gi, '')
    .trim()
}

/**
 * Extracts tech tags mentioned in the topic description
 */
function extractTechTags(text: string, title: string): string[] {
  const commonKeywords = [
    'C#', '.NET', 'TypeScript', 'JavaScript', 'React', 'Angular', 'Vue', 'HTML', 'CSS',
    'SQL', 'Dataverse', 'FetchXML', 'Git', 'GitHub', 'Azure', 'AWS', 'Docker', 'Kubernetes',
    'CI/CD', 'Power Platform', 'D365', 'Dynamics 365', 'PCF', 'Power Automate', 'Power Pages',
    'Power Fx', 'Logic Apps', 'API', 'REST', 'LINQ', 'OOP', 'Bicep', 'Terraform', 'Python',
    'PL-400', 'AZ-204', 'AZ-900', 'Playwright', 'Jest', 'Figma'
  ]

  const found = new Set<string>()
  const combined = `${title} ${text}`
  
  for (const kw of commonKeywords) {
    const escaped = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    const regex = new RegExp(`\\b${escaped}\\b`, 'i')
    if (regex.test(combined)) {
      found.add(kw)
    }
  }

  return Array.from(found).slice(0, 4)
}

/**
 * Intelligently decomposes clumsy unformatted markdown text into structured actionable topics
 */
function parseMilestone(milestone: { title: string; description: string }, stageIndex: number): ParsedStage {
  const rawDesc = milestone.description || ''
  
  // Look for bullet items formatted as * **Title:** or - **Title:** or **Title:**
  const rawParts = rawDesc.split(/(?=\s*(?:[*•-]\s*)?\*\*[^*]+\*\*[:\s-])/g)
  let overview = ''
  const topics: ParsedTopic[] = []

  for (let i = 0; i < rawParts.length; i++) {
    const part = rawParts[i].trim()
    if (!part) continue

    const match = part.match(/^(?:[*•-]\s*)?\*\*([^*]+)\*\*[:\s-]*([\s\S]*)/)
    if (match) {
      const topicTitle = match[1].replace(/[:\-]$/, '').trim()
      let topicContent = cleanAIText(match[2].trim())
      
      const tags = extractTechTags(topicContent, topicTitle)
      const topicId = `s-${stageIndex}-t-${topics.length}`
      
      topics.push({
        id: topicId,
        title: topicTitle,
        description: topicContent,
        tags
      })
    } else if (i === 0) {
      overview = cleanAIText(part)
    } else {
      const cleanedPart = cleanAIText(part.replace(/^[*•-]\s*/, ''))
      if (cleanedPart.length > 15) {
        const topicId = `s-${stageIndex}-t-${topics.length}`
        topics.push({
          id: topicId,
          title: `Focus Area ${topics.length + 1}`,
          description: cleanedPart,
          tags: extractTechTags(cleanedPart, '')
        })
      }
    }
  }

  // Fallback if no markdown bold markers were present
  if (topics.length === 0 && rawDesc.trim().length > 0) {
    const sentences = rawDesc
      .split(/(?<=[.!?])\s+(?=[A-Z*•-])/)
      .map(s => cleanAIText(s.replace(/^[*•-]\s*/, '').trim()))
      .filter(s => s.length > 20)

    sentences.forEach((sentence, sIdx) => {
      const topicId = `s-${stageIndex}-t-${sIdx}`
      topics.push({
        id: topicId,
        title: `Core Objective ${sIdx + 1}`,
        description: sentence,
        tags: extractTechTags(sentence, '')
      })
    })
  }

  return {
    index: stageIndex,
    title: milestone.title || `Stage ${stageIndex + 1}`,
    overview,
    topics
  }
}

export default function RoadmapViewerPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const roadmapId = params.id as string

  const { data, error, isLoading, mutate } = useSWR<{ data: Roadmap }>(
    isAuthenticated && roadmapId ? `${API_URL}/roadmaps/${roadmapId}` : null,
    fetcher
  )

  const roadmap = data?.data

  // Stage selection state
  const [activeStageIndex, setActiveStageIndex] = React.useState<number>(0)
  const [viewMode, setViewMode] = React.useState<'stage' | 'all'>('stage')
  const [searchQuery, setSearchQuery] = React.useState<string>('')
  const [copiedChecklist, setCopiedChecklist] = React.useState<boolean>(false)

  // Local storage completed topic IDs tracker
  const [completedTopicIds, setCompletedTopicIds] = React.useState<Set<string>>(new Set())

  // Load progress from localStorage on mount
  React.useEffect(() => {
    if (!roadmapId) return
    try {
      const saved = localStorage.getItem(`roadmap_completed_${roadmapId}`)
      if (saved) {
        setCompletedTopicIds(new Set(JSON.parse(saved)))
      }
    } catch (_err) {
      // Ignore
    }
  }, [roadmapId])

  // Normalize stages from either milestones or steps
  const parsedStages: ParsedStage[] = React.useMemo(() => {
    if (!roadmap) return []

    if (roadmap.milestones && roadmap.milestones.length > 0) {
      return roadmap.milestones.map((m, idx) => parseMilestone(m, idx))
    }

    if (roadmap.steps && roadmap.steps.length > 0) {
      return roadmap.steps.map((s, idx) => ({
        index: idx,
        title: s.skill || `Milestone ${s.order}`,
        overview: `Priority: ${s.priority || 'High'}. Focus on mastering ${s.skill}.`,
        topics: [
          {
            id: `s-${idx}-t-0`,
            title: s.skill,
            description: `Core practical application and development practices for ${s.skill}.`,
            tags: [s.skill, s.priority || 'Core']
          }
        ]
      }))
    }

    return []
  }, [roadmap])

  // Total topics count across entire roadmap
  const totalTopics = React.useMemo(() => {
    return parsedStages.reduce((sum, stage) => sum + stage.topics.length, 0)
  }, [parsedStages])

  // Calculated percentage
  const calculatedProgress = React.useMemo(() => {
    if (totalTopics === 0) return roadmap?.progress || 0
    return Math.min(100, Math.round((completedTopicIds.size / totalTopics) * 100))
  }, [completedTopicIds, totalTopics, roadmap?.progress])

  // Sync progress with backend
  const syncProgressToBackend = async (percentage: number) => {
    try {
      await fetch(`${API_URL}/roadmaps/${roadmapId}/progress`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: percentage }),
      })
      mutate()
    } catch (e) {
      console.warn('Could not sync progress to backend:', e)
    }
  }

  // Toggle single topic completion
  const handleToggleTopic = (topicId: string) => {
    setCompletedTopicIds((prev) => {
      const next = new Set(prev)
      if (next.has(topicId)) {
        next.delete(topicId)
      } else {
        next.add(topicId)
      }
      
      try {
        localStorage.setItem(`roadmap_completed_${roadmapId}`, JSON.stringify(Array.from(next)))
      } catch (_e) {
        // Ignore
      }

      const nextPercent = totalTopics > 0 ? Math.min(100, Math.round((next.size / totalTopics) * 100)) : 0
      syncProgressToBackend(nextPercent)

      return next
    })
  }

  // Mark all topics in a stage complete or reset
  const handleToggleStageCompletion = (stage: ParsedStage) => {
    const stageTopicIds = stage.topics.map(t => t.id)
    const isStageFullyDone = stageTopicIds.every(id => completedTopicIds.has(id))

    setCompletedTopicIds((prev) => {
      const next = new Set(prev)
      if (isStageFullyDone) {
        stageTopicIds.forEach(id => next.delete(id))
      } else {
        stageTopicIds.forEach(id => next.add(id))
      }

      try {
        localStorage.setItem(`roadmap_completed_${roadmapId}`, JSON.stringify(Array.from(next)))
      } catch (_e) {
        // Ignore
      }

      const nextPercent = totalTopics > 0 ? Math.min(100, Math.round((next.size / totalTopics) * 100)) : 0
      syncProgressToBackend(nextPercent)

      return next
    })
  }

  // Copy checklist to clipboard
  const handleCopyChecklist = () => {
    if (!roadmap) return
    const lines = [`# ${roadmap.title}\n`]
    parsedStages.forEach((stage, sIdx) => {
      lines.push(`\n## Stage ${sIdx + 1}: ${stage.title}`)
      stage.topics.forEach(t => {
        const isDone = completedTopicIds.has(t.id)
        lines.push(`- [${isDone ? 'x' : ' '}] ${t.title}: ${t.description.slice(0, 100)}...`)
      })
    })
    navigator.clipboard.writeText(lines.join('\n'))
    setCopiedChecklist(true)
    setTimeout(() => setCopiedChecklist(false), 2500)
  }

  // Open course generator in new tab
  const handleGenerateCourseForSkill = (skill: string) => {
    window.open(`/generate/${encodeURIComponent(skill)}`, '_blank', 'noopener,noreferrer')
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Loading your personalized roadmap...
        </p>
      </div>
    )
  }

  if (error || !roadmap) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <Button
          variant="outline"
          onClick={() => (window.history.length > 1 ? router.back() : router.push('/roadmaps'))}
          className="mb-4 border-slate-300 text-slate-900 font-semibold hover:bg-slate-100"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Roadmaps
        </Button>
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="text-red-700">Roadmap not found</CardTitle>
            <CardDescription className="text-red-600 font-medium">
              {error?.message || "This roadmap doesn't exist or you don't have access."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const activeStage = parsedStages[activeStageIndex] || parsedStages[0]

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <Button
          variant="ghost"
          onClick={() => (window.history.length > 1 ? router.back() : router.push('/roadmaps'))}
          className="w-fit text-slate-800 font-semibold hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Roadmaps
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyChecklist}
            className="border-slate-300 text-slate-800 font-semibold hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200"
          >
            {copiedChecklist ? <Check className="mr-2 h-4 w-4 text-green-600" /> : <Copy className="mr-2 h-4 w-4" />}
            {copiedChecklist ? 'Checklist Copied!' : 'Copy Checklist'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="border-slate-300 text-slate-800 font-semibold hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print / PDF
          </Button>
        </div>
      </div>

      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50 to-indigo-50/40 p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1 text-xs uppercase tracking-wider shadow-sm">
                Active Career Blueprint
              </Badge>
              <Badge variant="default" className="border border-slate-300 text-slate-800 font-bold bg-white/80 dark:border-slate-700 dark:text-slate-200">
                <Clock className="mr-1.5 h-3.5 w-3.5 text-slate-600" />
                {roadmap.timeline || 'Self-paced'}
              </Badge>
              <Badge variant="default" className="border border-slate-300 text-slate-800 font-bold bg-white/80 dark:border-slate-700 dark:text-slate-200 capitalize">
                Status: {roadmap.status || 'Draft'}
              </Badge>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              {roadmap.title}
            </h1>

            <p className="text-base text-slate-800 font-medium leading-relaxed dark:text-slate-200">
              Target Track: <span className="font-bold text-slate-950 dark:text-white">{roadmap.targetRole || 'Specialized Role'}</span>. 
              Interactive execution milestones tailored to master real-world tools, architectures, and industry expectations.
            </p>
          </div>

          {/* Quick Progress Badge Box */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm shrink-0 min-w-[200px] text-center dark:border-slate-700 dark:bg-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Roadmap Progress
            </span>
            <div className="my-2 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {calculatedProgress}%
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {completedTopicIds.size} of {totalTopics} Topics Complete
            </span>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
              <div
                className="h-full bg-indigo-600 transition-all duration-700 ease-out"
                style={{ width: `${calculatedProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Stage Stepper */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Execution Roadmap Milestones
            </h2>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Click any stage to view actionable topics, or toggle completion to track your readiness.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'stage' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('stage')}
              className={viewMode === 'stage' ? 'bg-indigo-600 text-white font-bold' : 'border-slate-300 text-slate-800 font-semibold'}
            >
              <Layers className="mr-1.5 h-4 w-4" />
              Stage View
            </Button>
            <Button
              variant={viewMode === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('all')}
              className={viewMode === 'all' ? 'bg-indigo-600 text-white font-bold' : 'border-slate-300 text-slate-800 font-semibold'}
            >
              <ListFilter className="mr-1.5 h-4 w-4" />
              Full Plan
            </Button>
          </div>
        </div>

        {/* Stage Tabs */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {parsedStages.map((stage, idx) => {
            const isSelected = activeStageIndex === idx && viewMode === 'stage'
            const stageTopicIds = stage.topics.map(t => t.id)
            const completedCount = stageTopicIds.filter(id => completedTopicIds.has(id)).length
            const isFullyCompleted = stage.topics.length > 0 && completedCount === stage.topics.length

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveStageIndex(idx)
                  setViewMode('stage')
                }}
                className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-md ring-2 ring-indigo-600/20 dark:border-indigo-400 dark:bg-indigo-950/40'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-sm dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900">
                    {idx + 1}
                  </span>
                  {isFullyCompleted ? (
                    <Badge className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5">
                      ✓ Complete
                    </Badge>
                  ) : (
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {completedCount}/{stage.topics.length} Done
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1 dark:text-white">
                    {stage.title}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-slate-600 line-clamp-2 dark:text-slate-400">
                    {stage.overview || `${stage.topics.length} focused mastery units`}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'stage' && activeStage && (
        <Card className="border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden rounded-3xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Stage {activeStage.index + 1} of {parsedStages.length}
                </div>
                <CardTitle className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {activeStage.title}
                </CardTitle>
                {activeStage.overview && (
                  <CardDescription className="text-sm font-medium text-slate-800 mt-2 leading-relaxed dark:text-slate-200 max-w-3xl">
                    {activeStage.overview}
                  </CardDescription>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStageCompletion(activeStage)}
                  className="border-slate-300 text-slate-900 font-bold hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                  {activeStage.topics.every(t => completedTopicIds.has(t.id))
                    ? 'Reset Stage'
                    : 'Complete All in Stage'}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="grid gap-4">
              {activeStage.topics.map((topic, topicIdx) => {
                const isCompleted = completedTopicIds.has(topic.id)

                return (
                  <div
                    key={topic.id}
                    className={`relative rounded-2xl border p-5 transition-all ${
                      isCompleted
                        ? 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Interactive Checkbox */}
                      <button
                        type="button"
                        onClick={() => handleToggleTopic(topic.id)}
                        className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all ${
                          isCompleted
                            ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                            : 'border-slate-300 bg-white hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800'
                        }`}
                        aria-label={`Mark ${topic.title} as completed`}
                      >
                        {isCompleted && <Check className="h-4 w-4 stroke-[3]" />}
                      </button>

                      {/* Topic Content with Crisp Contrast */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4
                            className={`text-base font-bold tracking-tight ${
                              isCompleted
                                ? 'text-emerald-950 dark:text-emerald-300 line-through decoration-emerald-500'
                                : 'text-slate-950 dark:text-white'
                            }`}
                          >
                            {topic.title}
                          </h4>

                          {/* Action Button: Generate Targeted Learning Course */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGenerateCourseForSkill(topic.title)}
                            className="h-8 text-xs font-bold text-indigo-700 hover:bg-indigo-50 hover:text-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-950"
                          >
                            <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                            Generate Course
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        </div>

                        {/* Crisp body text: slate-800 with strong contrast against white */}
                        <p className="text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                          {topic.description}
                        </p>

                        {/* Technology and Domain Badges */}
                        {topic.tags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-2">
                            {topic.tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100/80 px-2 py-0.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Stepper Footer Controls */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-6 dark:border-slate-800">
              <Button
                variant="outline"
                disabled={activeStageIndex === 0}
                onClick={() => setActiveStageIndex(prev => Math.max(0, prev - 1))}
                className="border-slate-300 text-slate-800 font-bold hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200"
              >
                <ChevronLeft className="mr-1.5 h-4 w-4" />
                Previous Stage
              </Button>

              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Step {activeStageIndex + 1} of {parsedStages.length}
              </span>

              <Button
                variant="default"
                disabled={activeStageIndex === parsedStages.length - 1}
                onClick={() => setActiveStageIndex(prev => Math.min(parsedStages.length - 1, prev + 1))}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                Next Stage
                <ChevronRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Plan / All Stages View */}
      {viewMode === 'all' && (
        <div className="space-y-6">
          {parsedStages.map((stage, sIdx) => (
            <Card key={sIdx} className="border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/60 p-6 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Stage {sIdx + 1}
                    </span>
                    <CardTitle className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {stage.title}
                    </CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStageCompletion(stage)}
                    className="border-slate-300 text-slate-800 font-bold hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 text-xs"
                  >
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                    Toggle Stage
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {stage.topics.map((topic) => {
                  const isCompleted = completedTopicIds.has(topic.id)
                  return (
                    <div
                      key={topic.id}
                      className={`flex items-start gap-4 rounded-xl border p-4 transition-all ${
                        isCompleted
                          ? 'border-emerald-200 bg-emerald-50/20 dark:border-emerald-900/30 dark:bg-emerald-950/20'
                          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleTopic(topic.id)}
                        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                          isCompleted
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800'
                        }`}
                      >
                        {isCompleted && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </button>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-sm font-bold ${isCompleted ? 'text-emerald-950 dark:text-emerald-300 line-through' : 'text-slate-950 dark:text-white'}`}>
                            {topic.title}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGenerateCourseForSkill(topic.title)}
                            className="h-7 text-[11px] font-bold text-indigo-700 hover:bg-indigo-50"
                          >
                            Generate Course
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                          {topic.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
