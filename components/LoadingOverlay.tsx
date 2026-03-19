
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import type { AnalysisStatus } from '../types';

interface Props {
  progress: number;
  status: AnalysisStatus;
}

const steps = ['Uploading data...', 'Parsing logs and metrics...', 'Analyzing screenshots...', 'Synthesizing root cause...', 'Finalizing report...'];

export const LoadingOverlay: React.FC<Props> = ({ progress }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setStep((s) => (s + 1) % steps.length), 2000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/95 backdrop-blur-sm" role="status" aria-live="polite" aria-label="Analysis in progress">
      <div className="text-center px-6">
        <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
        <div className="text-sm text-text mb-1 font-medium" aria-live="polite">{steps[step]}</div>
        <div className="text-2xs text-text-dim mb-3">{Math.round(progress)}% complete</div>
        <div className="w-56 h-1.5 bg-border rounded-full overflow-hidden mx-auto">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <p className="mt-4 text-2xs text-text-dim">This may take a few moments</p>
      </div>
    </div>
  );
};
