import { useState } from 'react';
import HomePage from './pages/HomePage';
import AssessmentPage from './pages/AssessmentPage';
import CareerWorkspacePage from './pages/CareerWorkspacePage';
import Footer from './components/Layout/Footer';
import './styles/globals.css';
import {
  AssessmentReport,
  AssessmentSession,
  SimulationInput,
  SimulationResult,
} from './types/index';
import { generateAssessmentSession, calculateAssessmentReport } from './services/assessmentService';
import { simulatePathways } from './services/simulationService';

export default function App() {
  const [stage, setStage] = useState<'form' | 'assessment' | 'workspace'>('form');
  const [profileInput, setProfileInput] = useState<SimulationInput | null>(null);
  const [assessmentSession, setAssessmentSession] = useState<AssessmentSession | null>(null);
  const [assessmentReport, setAssessmentReport] = useState<AssessmentReport | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isGeneratingAssessment, setIsGeneratingAssessment] = useState(false);
  const [isBuildingWorkspace, setIsBuildingWorkspace] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleStartAssessment = async (input: SimulationInput) => {
    setIsGeneratingAssessment(true);
    setErrorMessage('');

    try {
      const session = await generateAssessmentSession(input);
      setProfileInput(input);
      setAssessmentSession(session);
      setAssessmentReport(null);
      setSimulationResult(null);
      setStage('assessment');
    } catch (error) {
      console.error('Failed to generate assessment:', error);
      setErrorMessage('The skill assessment could not be generated. Please try again.');
    } finally {
      setIsGeneratingAssessment(false);
    }
  };

  const handleAssessmentComplete = async (answers: Record<string, string>) => {
    if (!profileInput || !assessmentSession) {
      return;
    }

    setIsBuildingWorkspace(true);
    setErrorMessage('');

    try {
      const enrichedInput: SimulationInput = {
        ...profileInput,
        skills:
          assessmentSession.derivedSkills && assessmentSession.derivedSkills.length > 0
            ? assessmentSession.derivedSkills
            : profileInput.skills,
      };

      const report = calculateAssessmentReport(enrichedInput, assessmentSession, answers);
      const pathways = await simulatePathways(profileInput);

      setAssessmentReport(report);
      setSimulationResult(pathways);
      setStage('workspace');
    } catch (error) {
      console.error('Failed to prepare workspace:', error);
      setErrorMessage('The assessment was submitted, but the insights workspace could not be built. Please retry.');
    } finally {
      setIsBuildingWorkspace(false);
    }
  };

  const handleStartOver = () => {
    setStage('form');
    setProfileInput(null);
    setAssessmentSession(null);
    setAssessmentReport(null);
    setSimulationResult(null);
    setErrorMessage('');
  };

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, padding: '2rem 1.25rem 3rem' }}>
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
      </main>

      <Footer />
    </div>
  );
}
