
import React from 'react';
import { X, Edit3, RefreshCw } from 'lucide-react';
import { ReportCard } from './ReportCard';
import type { IncidentReport } from '../types';

interface ReportViewProps {
  report: IncidentReport;
  enableGrounding: boolean;
  ttsAvailable: boolean | undefined;
  onStartNew: () => void;
  onEditInputs: () => void;
  onReAnalyze: () => void;
}

export function ReportView({ report, enableGrounding, ttsAvailable, onStartNew, onEditInputs, onReAnalyze }: ReportViewProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex items-center gap-2 sticky top-14 z-30 py-2 bg-bg/90 backdrop-blur md:static md:bg-transparent md:backdrop-blur-none">
        <button onClick={onStartNew} className="h-8 px-3 text-xs text-text-muted hover:text-text bg-bg-card hover:bg-bg-hover border border-border rounded-full flex items-center gap-1.5 transition-colors shadow-sm"><X className="w-3.5 h-3.5" />Start New</button>
        <button onClick={onEditInputs} className="h-8 px-3 text-xs text-text-muted hover:text-text bg-bg-card hover:bg-bg-hover border border-border rounded-full flex items-center gap-1.5 transition-colors shadow-sm"><Edit3 className="w-3.5 h-3.5" />Edit Inputs</button>
        <div className="flex-1" />
        <button onClick={onReAnalyze} className="h-8 px-3 text-xs text-text-muted hover:text-text bg-bg-card hover:bg-bg-hover border border-border rounded-full flex items-center gap-1.5 transition-colors shadow-sm"><RefreshCw className="w-3.5 h-3.5" />Re-analyze</button>
      </div>
      <ReportCard report={report} enableGrounding={enableGrounding} ttsAvailable={ttsAvailable} />
    </div>
  );
}
