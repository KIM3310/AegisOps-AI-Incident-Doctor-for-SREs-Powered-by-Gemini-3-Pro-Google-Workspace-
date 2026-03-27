import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IncidentReport } from "../types";
import { persistAnalyzeArtifactsToGcp } from "../server/lib/gcp-persistence";
import {
  isGcpEnabled,
  recordIncidentAnalytics,
  uploadIncidentReport,
} from "../server/lib/gcp-adapter";

vi.mock("../server/lib/gcp-adapter", () => ({
  isGcpEnabled: vi.fn(),
  recordIncidentAnalytics: vi.fn(),
  uploadIncidentReport: vi.fn(),
}));

const sampleReport: IncidentReport = {
  actionItems: [{ priority: "HIGH", task: "Restart the stuck worker" }],
  rootCauses: ["Dependency timeout cascade"],
  severity: "SEV1",
  summary: "Checkout requests are timing out across one shard.",
  tags: ["checkout", "timeout"],
  timeline: [{ description: "Latency spike detected", time: "2026-03-24T00:00:00Z" }],
  title: "Checkout shard timeout cascade",
  mitigationSteps: ["Fail over traffic"],
};

describe("persistAnalyzeArtifactsToGcp", () => {
  beforeEach(() => {
    vi.mocked(isGcpEnabled).mockReturnValue(true);
    vi.mocked(uploadIncidentReport).mockResolvedValue({
      bucket: "bucket",
      contentLength: 10,
      generation: "1",
      name: "reports/demo.json",
      selfLink: "https://storage.googleapis.com/demo",
      uploadedAt: "2026-03-24T00:00:00Z",
    });
    vi.mocked(recordIncidentAnalytics).mockResolvedValue({
      insertedAt: "2026-03-24T00:00:00Z",
      insertedRows: 1,
      tableId: "incident_events",
    });
  });

  it("skips persistence when GCP is disabled", async () => {
    vi.mocked(isGcpEnabled).mockReturnValue(false);

    await persistAnalyzeArtifactsToGcp({
      analysisLatencyMs: 1200,
      imageCount: 1,
      lane: "incident-command",
      logChars: 1024,
      provider: "demo",
      report: sampleReport,
      requestId: "req-123",
      sessionId: "sess-456",
    });

    expect(uploadIncidentReport).not.toHaveBeenCalled();
    expect(recordIncidentAnalytics).not.toHaveBeenCalled();
  });

  it("uploads the report artifact and analytics row when enabled", async () => {
    await persistAnalyzeArtifactsToGcp({
      analysisLatencyMs: 1200,
      imageCount: 2,
      lane: "incident-command",
      logChars: 2048,
      provider: "gemini",
      report: sampleReport,
      requestId: "req-123",
      sessionId: "sess-456",
    });

    expect(uploadIncidentReport).toHaveBeenCalledTimes(1);
    expect(uploadIncidentReport).toHaveBeenCalledWith(
      "sess-456-req-123",
      expect.objectContaining({
        lane: "incident-command",
        provider: "gemini",
        report: sampleReport,
        reportId: "sess-456-req-123",
        requestId: "req-123",
        schema: "aegisops-gcp-report-v1",
        sessionId: "sess-456",
      })
    );

    expect(recordIncidentAnalytics).toHaveBeenCalledTimes(1);
    expect(recordIncidentAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({
        analysisLatencyMs: 1200,
        imageCount: 2,
        logChars: 2048,
        provider: "gemini",
        reportId: "sess-456-req-123",
        severity: "SEV1",
      })
    );
  });
});
