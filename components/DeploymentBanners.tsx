
import React from 'react';
import { Shield, BrainCircuit } from 'lucide-react';

interface DeploymentBannersProps {
  isStaticDemo: boolean | undefined;
  isOllamaMode: boolean | undefined;
}

export function DeploymentBanners({ isStaticDemo, isOllamaMode }: DeploymentBannersProps) {
  return (
    <>
      {isStaticDemo && (
        <div className="rounded-lg border border-border bg-bg-card/90 p-4 space-y-2">
          <div className="text-xs font-semibold flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-accent" />
            Static demo deployment
          </div>
          <p className="text-2xs text-text-muted">
            This Pages build runs the replay suite and deterministic local incident review in the browser. Start the local Express API to use Gemini BYOK, runtime key controls, and backend routes.
          </p>
        </div>
      )}

      {isOllamaMode && (
        <div className="rounded-lg border border-border bg-bg-card/90 p-4 space-y-2">
          <div className="text-xs font-semibold flex items-center gap-1.5">
            <BrainCircuit className="w-3.5 h-3.5 text-accent" />
            Ollama Local Mode
          </div>
          <p className="text-2xs text-text-muted">
            로컬 Ollama 모델로 동작 중입니다. 외부 API 키 없이 오프라인 데모가 가능합니다.
          </p>
        </div>
      )}
    </>
  );
}
