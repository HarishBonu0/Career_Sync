'use client'

import { useState } from 'react'
import HomePage from './_app/pages/HomePage'
import AssessmentPage from './_app/pages/AssessmentPage'
import CareerWorkspacePage from './_app/pages/CareerWorkspacePage'
import type {
  AssessmentReport,
  AssessmentSession,
  SimulationInput,
  SimulationResult,
} from './_app/types/index'
import {
  generateAssessmentSession,
  calculateAssessmentReport,
} from './_app/services/assessmentService'
import { simulatePathways } from './_app/services/simulationService'

type Stage = 'form' | 'assessment' | 'workspace'

export default function RoadmapsPage() {
  const [stage, setStage] = useState<Stage>('form')
  const [profileInput, setProfileInput] = useState<SimulationInput | null>(null)
  const [assessmentSession, setAssessmentSession] = useState<AssessmentSession | null>(null)
  const [assessmentReport, setAssessmentReport] = useState<AssessmentReport | null>(null)
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [isGeneratingAssessment, setIsGeneratingAssessment] = useState(false)
  const [isBuildingWorkspace, setIsBuildingWorkspace] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleStartAssessment = async (input: SimulationInput) => {
    setIsGeneratingAssessment(true)
    setErrorMessage('')
    try {
      const session = await generateAssessmentSession(input)
      setProfileInput(input)
      setAssessmentSession(session)
      setAssessmentReport(null)
      setSimulationResult(null)
      setStage('assessment')
    } catch (error) {
      console.error('Failed to generate assessment:', error)
      setErrorMessage('The skill assessment could not be generated. Please try again.')
    } finally {
      setIsGeneratingAssessment(false)
    }
  }

  const handleAssessmentComplete = async (answers: Record<string, string>) => {
    if (!profileInput || !assessmentSession) return
    setIsBuildingWorkspace(true)
    setErrorMessage('')
    try {
      const enrichedInput: SimulationInput = {
        ...profileInput,
        skills:
          assessmentSession.derivedSkills && assessmentSession.derivedSkills.length > 0
            ? assessmentSession.derivedSkills
            : profileInput.skills,
      }
      const report = calculateAssessmentReport(enrichedInput, assessmentSession, answers)
      const pathways = await simulatePathways(profileInput)
      setAssessmentReport(report)
      setSimulationResult(pathways)
      setStage('workspace')
    } catch (error) {
      console.error('Failed to prepare workspace:', error)
      setErrorMessage('The assessment was submitted, but the insights workspace could not be built. Please retry.')
    } finally {
      setIsBuildingWorkspace(false)
    }
  }

  const handleStartOver = () => {
    setStage('form')
    setProfileInput(null)
    setAssessmentSession(null)
    setAssessmentReport(null)
    setSimulationResult(null)
    setErrorMessage('')
  }

  return (
    <div className="px-4 py-6 lg:px-8">
      {stage === 'form' && (
        <HomePage
          isLoading={isGeneratingAssessment}
          errorMessage={errorMessage}
          onStartAssessment={handleStartAssessment}
        />
      )}
      {stage === 'assessment' && profileInput && assessmentSession && (
        <AssessmentPage
          input={profileInput}
          session={assessmentSession}
          isSubmitting={isBuildingWorkspace}
          errorMessage={errorMessage}
          onBack={handleStartOver}
          onComplete={handleAssessmentComplete}
        />
      )}
      {stage === 'workspace' && profileInput && assessmentReport && simulationResult && (
        <CareerWorkspacePage
          input={profileInput}
          report={assessmentReport}
          simulationResult={simulationResult}
          onStartOver={handleStartOver}
        />
      )}
    </div>
  )
}
