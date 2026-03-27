import { describe, expect, it } from "vitest";
import { demoAnalyzeIncident, demoFollowUpAnswer } from "../server/lib/demo";
import type { IncidentReport } from "../types";

describe("demo analysis engine", () => {
  it("classifies redis OOM logs as SEV1 with correct tags", () => {
    const report = demoAnalyzeIncident({
      logs: "[14:32:00] ERROR: Redis master OOM kill\n[14:32:05] WARN: cache miss storm\nSLO breach detected",
      imageCount: 2,
      maxLogChars: 50_000,
    });

    expect(report.severity).toBe("SEV1");
    expect(report.tags).toContain("redis");
    expect(report.tags).toContain("oom");
    expect(report.title).toContain("Redis");
    expect(report.reasoning).toBeDefined();
    expect(report.confidenceScore).toBe(68);
  });

  it("classifies latency + queue logs with appropriate tags", () => {
    const report = demoAnalyzeIncident({
      logs: "[10:00:00] WARN: latency spike on checkout\n[10:00:05] ERROR: queue depth growing",
      imageCount: 0,
      maxLogChars: 50_000,
    });

    expect(report.tags).toContain("latency");
    expect(report.tags).toContain("queue");
    expect(report.title).toContain("Latency");
  });

  it("returns UNKNOWN severity for generic logs", () => {
    const report = demoAnalyzeIncident({
      logs: "just some normal stuff happening",
      imageCount: 0,
      maxLogChars: 50_000,
    });

    expect(report.severity).toBe("UNKNOWN");
  });

  it("truncates logs exceeding maxLogChars", () => {
    const longLogs = "x".repeat(100);
    const report = demoAnalyzeIncident({
      logs: longLogs,
      imageCount: 0,
      maxLogChars: 50,
    });

    // Should still produce a valid report
    expect(report.title).toBeDefined();
    expect(report.summary).toBeDefined();
  });

  it("produces SEV1 action items with escalation checklist", () => {
    const report = demoAnalyzeIncident({
      logs: "SLO breach detected, circuit breaker open",
      imageCount: 0,
      maxLogChars: 50_000,
    });

    expect(report.severity).toBe("SEV1");
    expect(report.actionItems.length).toBe(4);
    expect(report.actionItems[0]!.owner).toBe("Incident Commander");
  });

  describe("demoFollowUpAnswer", () => {
    it("returns demo mode response for valid question", () => {
      const mockReport: IncidentReport = {
        title: "Test",
        summary: "Test summary",
        severity: "SEV1",
        rootCauses: [],
        timeline: [],
        actionItems: [],
        mitigationSteps: [],
        tags: [],
      };

      const answer = demoFollowUpAnswer({ report: mockReport, question: "What happened?" });
      expect(answer).toContain("Demo mode response");
      expect(answer).toContain("What happened?");
    });

    it("returns prompt for empty question", () => {
      const answer = demoFollowUpAnswer({ report: {} as IncidentReport, question: "" });
      expect(answer).toContain("Ask a question");
    });
  });
});
