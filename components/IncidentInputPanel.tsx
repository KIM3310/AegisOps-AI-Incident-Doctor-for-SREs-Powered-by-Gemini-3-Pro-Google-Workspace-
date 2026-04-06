
import React from 'react';
import { FileText, Image as ImageIcon, Upload, X } from 'lucide-react';
import type { AppState } from '../hooks/useAppState';

interface IncidentInputPanelProps {
  state: AppState;
}

export function IncidentInputPanel({ state }: IncidentInputPanelProps) {
  const {
    logs,
    setLogs,
    images,
    isDragging,
    maxLogChars,
    maxImages,
    logCharsUsed,
    logCharsRemaining,
    logsNearBudget,
    logsOverBudget,
    imagesWithinBudget,
    extraImages,
    setSelectedIncidentId,
    setSelectedPresetSlug,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleImageUpload,
    removeImage,
  } = state;

  return (
    <div
      className={`relative grid md:grid-cols-2 gap-4 p-1 rounded-xl transition-all duration-300 ${isDragging ? 'ring-2 ring-accent/50 bg-accent/5 scale-[1.01]' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {isDragging && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-[2px] rounded-xl pointer-events-none">
            <div className="text-accent font-medium flex flex-col items-center gap-3 animate-bounce">
                <Upload className="w-8 h-8" />
                <span>Drop files to analyze</span>
            </div>
         </div>
      )}

      {/* Log Input */}
      <div className="bg-bg-card border border-border rounded-lg p-4 flex flex-col h-[280px] shadow-sm hover:border-border-light transition-colors group">
        <div className="flex items-center justify-between mb-3">
          <label htmlFor="log-input" className="flex items-center gap-2 text-xs font-medium text-text-muted cursor-pointer group-hover:text-text transition-colors">
            <FileText className="w-4 h-4" />System Logs
          </label>
          <span className="text-[10px] text-text-dim px-2 py-0.5 bg-bg rounded-full border border-border">
            {logs.split('\n').filter(Boolean).length} lines
          </span>
        </div>
        <textarea
          id="log-input"
          value={logs}
          onChange={(e) => {
            setLogs(e.target.value);
            setSelectedIncidentId(null);
            setSelectedPresetSlug(null);
          }}
          placeholder="Paste raw logs here..."
          className="flex-1 w-full p-3 bg-bg border border-border rounded-md text-xs font-mono text-text placeholder-text-dim/50 resize-none focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all leading-relaxed"
          spellCheck={false}
        />
        <div className="mt-2 flex items-center justify-between text-[10px]">
          <span className={`${logsOverBudget ? 'text-sev1' : logsNearBudget ? 'text-sev2' : 'text-text-dim'}`}>
            {logCharsUsed.toLocaleString()} / {maxLogChars.toLocaleString()} chars
          </span>
          <span className="text-text-dim">
            {logCharsRemaining.toLocaleString()} chars remaining
          </span>
        </div>
        {logsOverBudget ? (
          <p className="mt-1 text-[10px] text-sev1">
            Analyze will trim logs to the backend limit before upload.
          </p>
        ) : logsNearBudget ? (
          <p className="mt-1 text-[10px] text-sev2">
            Near the payload limit. Extra context may be trimmed after Teachable Machine signals are appended.
          </p>
        ) : null}
      </div>

      {/* Screenshot Input */}
      <div className="bg-bg-card border border-border rounded-lg p-4 flex flex-col h-[280px] shadow-sm hover:border-border-light transition-colors group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-medium text-text-muted group-hover:text-text transition-colors">
            <ImageIcon className="w-4 h-4" />Screenshots
          </div>
          <span className="text-[10px] text-text-dim px-2 py-0.5 bg-bg rounded-full border border-border">
            {images.length} files
          </span>
        </div>

        <div className="flex-1 flex flex-col">
          {images.length > 0 ? (
            <div className="flex-1 p-2 bg-bg border border-border rounded-md mb-2 overflow-y-auto grid grid-cols-3 gap-2 content-start">
              {images.map((imgItem, idx) => (
                <div key={idx} className="relative group/img aspect-square rounded overflow-hidden border border-border bg-black">
                  <img src={imgItem.preview} alt="" className="w-full h-full object-cover opacity-80 group-hover/img:opacity-100 transition-opacity" />
                  <button onClick={() => removeImage(idx)} aria-label="Remove screenshot" className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-red-500/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 focus:opacity-100 transition-all">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            <label className="aspect-square rounded border border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-bg-hover hover:border-text-dim transition-colors text-text-dim" aria-label="Add more screenshots">
              <Upload className="w-4 h-4" aria-hidden="true" />
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" aria-label="Upload screenshots" />
            </label>
          </div>
          ) : (
            <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-border rounded-md cursor-pointer hover:border-text-dim hover:bg-bg-hover/50 transition-all text-text-dim">
              <div className="w-10 h-10 rounded-full bg-bg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5 opacity-50" />
              </div>
              <span className="text-xs font-medium">Click or Drag images</span>
              <span className="text-[10px] opacity-60 mt-1">Supports PNG, JPG</span>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
            </label>
          )}
          <div className="mt-2 flex items-center justify-between text-[10px]">
            <span className={`${extraImages > 0 ? 'text-sev2' : 'text-text-dim'}`}>
              {imagesWithinBudget} / {maxImages} images will be analyzed
            </span>
            <span className="text-text-dim">
              {extraImages > 0 ? `${extraImages} extra files ignored` : 'Within image budget'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
