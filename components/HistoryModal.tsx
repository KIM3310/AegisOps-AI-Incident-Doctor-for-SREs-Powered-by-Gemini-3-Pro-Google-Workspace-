
import React from 'react';
import { History, X } from 'lucide-react';
import { IncidentHistory } from './IncidentHistory';
import type { SavedIncident } from '../types';

interface HistoryModalProps {
  savedIncidents: SavedIncident[];
  onClose: () => void;
  onSelect: (incident: SavedIncident) => void;
  onDelete: (id: string) => void;
}

export function HistoryModal({ savedIncidents, onClose, onSelect, onDelete }: HistoryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="w-full max-w-lg max-h-[70vh] overflow-hidden bg-bg-card border border-border rounded-xl shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-border bg-bg-card flex items-center justify-between">
          <span className="text-sm font-medium flex items-center gap-2"><History className="w-4 h-4 text-accent" /> Incident History</span>
          <button onClick={onClose} className="p-1 hover:bg-bg-hover rounded-full transition-colors"><X className="w-4 h-4 text-text-muted" /></button>
        </div>
        <div className="p-2 overflow-y-auto max-h-[60vh] scrollbar-thin">
            <IncidentHistory incidents={savedIncidents} onSelect={onSelect} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
}
