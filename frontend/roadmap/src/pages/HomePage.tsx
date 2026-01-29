import { useState } from 'react';
import { SimulationInput, SimulationResult } from '../types/index';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import SimulationForm from '../components/Form/SimulationForm';
import APIConfigurationModal from '../components/Modals/APIConfigurationModal';
import { simulatePathways } from '../services/simulationService';
import { createRoadmap } from '../services/roadmapService';

interface HomePageProps {
  onSimulationComplete: (result: SimulationResult) => void;
}

export default function HomePage({ onSimulationComplete }: HomePageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (input: SimulationInput) => {
    setIsLoading(true);
    try {
      const result = await simulatePathways(input);
      // Fire-and-forget persist to Supabase (ownerless for now)
      createRoadmap({
        user_id: null,
        current_role: input.currentRole,
        target_role: input.targetRole,
        known_skills: input.skills,
        expected_salary: Number(input.targetSalary.replace(/\D/g, '')) || null,
        stages: result.pathways[0]?.roadmap?.map((step, idx) => ({
          title: step.title,
          description: step.description,
          order_index: idx + 1,
          tasks: [],
        })) || [],
      }).catch((err) => console.warn('Roadmap persist skipped:', err));

      onSimulationComplete(result);
    } catch (error) {
      console.error('Simulation failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onConfigClick={() => setIsModalOpen(true)} />

      <main style={{ flex: 1, padding: '2rem 1.5rem' }}>
        <SimulationForm onSubmit={handleSubmit} isLoading={isLoading} />
      </main>

      <Footer />

      <APIConfigurationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
