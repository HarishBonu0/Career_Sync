import { SimulationInput } from '../types/index';
import SimulationForm from '../components/Form/SimulationForm';

interface HomePageProps {
  onStartAssessment: (input: SimulationInput) => void;
  isLoading: boolean;
  errorMessage?: string;
}

export default function HomePage({ onStartAssessment, isLoading, errorMessage }: HomePageProps) {

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
      <section
        style={{
          background:
            'linear-gradient(135deg, rgba(9,22,43,0.98) 0%, rgba(18,53,80,0.96) 58%, rgba(19,89,102,0.92) 100%)',
          borderRadius: '28px',
          padding: '2.5rem',
          color: 'white',
          marginBottom: '1.5rem',
          boxShadow: '0 24px 80px rgba(9, 22, 43, 0.24)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
          <div>
            <p style={{ letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8BE9D3', fontWeight: 700, marginBottom: '1rem' }}>
              Career Intelligence Flow
            </p>
            <h1 style={{ fontSize: 'clamp(2.4rem, 4vw, 4.4rem)', lineHeight: 1, marginBottom: '1rem' }}>
              Build your assessment, then unlock insights, jobs, and a roadmap in one flow.
            </h1>
            <p style={{ maxWidth: '52rem', fontSize: '1.05rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.82)' }}>
              Complete the profile, upload the resume, and generate a fresh 20-question assessment using your declared skills and resume evidence. After submission, the app builds a new workspace with insights, job matches, and the roadmap directly below the header.
            </p>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: '22px',
              padding: '1.5rem',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div style={{ display: 'grid', gap: '0.9rem' }}>
              {[
                '1. Complete the profile and upload the resume.',
                '2. Generate a 20-question skill assessment.',
                '3. Submit answers to calculate combined readiness.',
                '4. Navigate insights, jobs, and roadmap tabs in one workspace.',
              ].map((step) => (
                <div key={step} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span
                    style={{
                      width: '1.75rem',
                      height: '1.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '999px',
                      background: '#F8C15A',
                      color: '#0B2239',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {step[0]}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.88)', lineHeight: 1.5 }}>{step.slice(3)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {errorMessage && (
        <div
          style={{
            margin: '0 auto 1.25rem',
            maxWidth: '720px',
            background: '#fff3f0',
            color: '#9b3412',
            border: '1px solid #fdba74',
            padding: '0.9rem 1rem',
            borderRadius: '14px',
          }}
        >
          {errorMessage}
        </div>
      )}

      <SimulationForm onSubmit={onStartAssessment} isLoading={isLoading} />
    </div>
  );
}
