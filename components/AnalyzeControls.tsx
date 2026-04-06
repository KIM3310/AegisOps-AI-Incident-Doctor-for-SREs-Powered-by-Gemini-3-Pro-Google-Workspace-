
import React from 'react';
import { Zap, Loader2, AlertCircle } from 'lucide-react';
import type { AppState } from '../hooks/useAppState';

interface AnalyzeControlsProps {
  state: AppState;
}

export function AnalyzeControls({ state }: AnalyzeControlsProps) {
  const {
    logs,
    images,
    status,
    error,
    enableGrounding,
    tmConfigured,
    enableTmVision,
    tmStatus,
    tmError,
    tmSignals,
    payloadGuardrail,
    handleAnalyze,
  } = state;

  return (
    <>
      {payloadGuardrail && (
        <div className="rounded-lg border border-sev2/20 bg-sev2/5 px-4 py-3 space-y-1">
          <div className="text-[11px] uppercase tracking-[0.18em] text-sev2">{payloadGuardrail.title}</div>
          <p className="text-sm text-text font-medium">{payloadGuardrail.detail}</p>
          <p className="text-2xs text-text-muted leading-5">{payloadGuardrail.next}</p>
        </div>
      )}

      {error && (
        <div role="alert" aria-live="assertive" className="flex items-start gap-3 p-4 bg-sev1/5 border border-sev1/20 rounded-lg text-xs text-sev1 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 leading-relaxed">{error}</div>
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={(!logs.trim() && images.length === 0) || status !== 'IDLE'}
        aria-busy={status !== 'IDLE'}
        aria-label={status === 'IDLE' ? 'Run incident analysis' : 'Analysis in progress'}
        className={`w-full h-11 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-sm ${
          (logs.trim() || images.length > 0) && status === 'IDLE' ? 'bg-accent hover:bg-accent-hover text-white shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] hover:scale-[1.01] active:scale-[0.99]' : 'bg-bg-card text-text-dim border border-border cursor-not-allowed opacity-50'
        }`}
      >
        {status === 'IDLE' ? <><Zap className="w-4 h-4 fill-white/20" aria-hidden="true" />Run Analysis</> : <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />Processing...</>}
      </button>
      {enableGrounding && (
        <div className="text-2xs text-sev3/90 border border-sev3/20 bg-sev3/5 rounded-lg px-3 py-2 leading-relaxed">
          Web grounding is enabled. Only trust claims that include references, and treat web results as hints (not source of truth).
        </div>
      )}
      {tmConfigured && (
        <div className="text-2xs border border-border bg-bg-card/60 rounded-lg px-3 py-2 leading-relaxed">
          <div className="font-medium text-text mb-1">
            Teachable Machine status: <span className="text-accent">{tmStatus}</span>
          </div>
          <div className="text-text-muted">
            {enableTmVision
              ? 'Image uploads are pre-scored locally and high-confidence labels are appended to analysis context.'
              : 'TM Vision is disabled. Enable it from the top bar when model URL is configured.'}
          </div>
          {tmError && <div className="text-sev1 mt-1">TM error: {tmError}</div>}
          {tmSignals.length > 0 && (
            <div className="mt-2 space-y-1">
              {tmSignals.slice(0, 3).map((row) => (
                <div key={row.fileName} className="text-text-muted">
                  <span className="text-text">{row.fileName}:</span>{' '}
                  {row.predictions
                    .map((p) => `${p.className} ${(p.probability * 100).toFixed(0)}%`)
                    .join(', ')}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="text-center text-[10px] text-text-dim">
          Shortcut: <kbd className="font-mono bg-bg-card px-1 py-0.5 rounded border border-border">Cmd/Ctrl + Enter</kbd>
      </div>
    </>
  );
}
