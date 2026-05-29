import * as React from 'react'

interface StepperProps {
  steps: string[]
  current: number
}

export const Stepper: React.FC<StepperProps> = ({ steps, current }) => {
  return (
    <div className="w-full">
      <div className="mb-4 flex items-center gap-3">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center flex-1">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full font-semibold ${i <= current ? 'bg-slate-950 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {i + 1}
            </div>
            {i < steps.length - 1 && <div className={`mx-3 h-1 flex-1 rounded ${i < current ? 'bg-slate-950' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>
      <div className="text-sm text-muted-foreground">{steps[current] || ''}</div>
    </div>
  )
}

export default Stepper
