import { useState } from 'react';
import { SimulationResult } from '../types/index';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import SimulationResults from '../components/Results/SimulationResults';
import APIConfigurationModal from '../components/Modals/APIConfigurationModal';

interface ResultsPageProps {
  result: SimulationResult;
  onNewSimulation: () => void;
}

export default function ResultsPage({ result, onNewSimulation }: ResultsPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        onConfigClick={() => setIsModalOpen(true)}
        showNewSimulation={true}
        onNewSimulation={onNewSimulation}
      />

      <main style={{ flex: 1 }}>
        <SimulationResults result={result} />
      </main>

      <Footer />

      <APIConfigurationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
