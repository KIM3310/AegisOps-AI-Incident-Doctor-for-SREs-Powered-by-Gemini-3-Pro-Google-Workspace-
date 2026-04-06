
import React from 'react';
import { KeyRound } from 'lucide-react';
import type { AppState } from '../hooks/useAppState';

interface ApiKeyPanelProps {
  state: AppState;
}

export function ApiKeyPanel({ state }: ApiKeyPanelProps) {
  const {
    apiHealth,
    apiKeyInput,
    setApiKeyInput,
    apiKeyMasked,
    apiKeyBusy,
    apiKeySource,
    handleSaveApiKey,
    handleClearApiKey,
  } = state;

  return (
    <div className="rounded-lg border border-border bg-bg-card/90 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs font-semibold flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-accent" />
            Gemini API Key
          </div>
          <p className="text-2xs text-text-muted mt-1">
            키는 백엔드 런타임 메모리에만 저장되며 서버 재시작 시 초기화됩니다.
          </p>
        </div>
        <span className={`text-[10px] px-2 py-1 rounded-full border ${apiHealth?.mode === 'live' ? 'bg-sev3/10 text-sev3 border-sev3/20' : 'bg-sev1/10 text-sev1 border-sev1/20'}`}>
          {apiHealth?.mode === 'live' ? `LIVE (${apiKeySource.toUpperCase()})` : 'DEMO'}
        </span>
      </div>
      {apiKeyMasked && (
        <div className="text-2xs text-text-muted">
          Active key: <span className="text-text">{apiKeyMasked}</span>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="password"
          value={apiKeyInput}
          onChange={(e) => setApiKeyInput(e.target.value)}
          placeholder="Enter Gemini API key (e.g. AIza...)"
          className="flex-1 h-9 px-3 rounded-md bg-bg border border-border text-xs focus:outline-none focus:ring-1 focus:ring-accent/40"
        />
        <button
          onClick={handleSaveApiKey}
          disabled={apiKeyBusy}
          className="h-9 px-3 rounded-md bg-accent hover:bg-accent-hover text-white text-xs font-medium disabled:opacity-60"
        >
          {apiKeyBusy ? 'Saving...' : 'Save Key'}
        </button>
        <button
          onClick={handleClearApiKey}
          disabled={apiKeyBusy}
          className="h-9 px-3 rounded-md border border-border bg-bg hover:bg-bg-hover text-xs text-text-muted hover:text-text disabled:opacity-60"
        >
          Clear Runtime Key
        </button>
      </div>
    </div>
  );
}
