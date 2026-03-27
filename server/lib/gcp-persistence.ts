import type { IncidentReport } from "../../types";
import {
  isGcpEnabled,
  recordIncidentAnalytics,
  uploadIncidentReport,
} from "./gcp-adapter";
import { logger } from "./logger";

export interface PersistAnalyzeArtifactsInput {
  analysisLatencyMs: number;
  imageCount: number;
  lane: string;
  logChars: number;
  provider: string;
  report: IncidentReport;
  requestId: string;
  sessionId: string;
}

function buildReportId(input: PersistAnalyzeArtifactsInput): string {
  return input.sessionId
    ? `${input.sessionId}-${input.requestId}`
    : input.requestId;
}

export async function persistAnalyzeArtifactsToGcp(
  input: PersistAnalyzeArtifactsInput
): Promise<void> {
  if (!isGcpEnabled()) {
    return;
  }

  const reportId = buildReportId(input);
  const persistedAt = new Date().toISOString();
  const artifactPayload = {
    lane: input.lane,
    persistedAt,
    provider: input.provider,
    report: input.report,
    reportId,
    requestId: input.requestId,
    schema: "aegisops-gcp-report-v1",
    sessionId: input.sessionId || null,
  };

  const [uploadResult, analyticsResult] = await Promise.allSettled([
    uploadIncidentReport(reportId, artifactPayload),
    recordIncidentAnalytics({
      reportId,
      severity: input.report.severity,
      provider: input.provider,
      analysisLatencyMs: input.analysisLatencyMs,
      imageCount: input.imageCount,
      logChars: input.logChars,
      timestamp: persistedAt,
    }),
  ]);

  if (uploadResult.status === "fulfilled") {
    logger.info(
      {
        bucket: uploadResult.value?.bucket ?? null,
        event: "gcp-report-persisted",
        objectName: uploadResult.value?.name ?? null,
        reportId,
      },
      "Persisted incident report artifact to GCS"
    );
  } else {
    logger.warn(
      {
        error:
          uploadResult.reason instanceof Error
            ? uploadResult.reason.message
            : String(uploadResult.reason),
        event: "gcp-report-persist-failed",
        reportId,
      },
      "Failed to persist incident report artifact to GCS"
    );
  }

  if (analyticsResult.status === "fulfilled") {
    logger.info(
      {
        event: "gcp-incident-analytics-persisted",
        reportId,
        rows: analyticsResult.value?.insertedRows ?? 0,
        tableId: analyticsResult.value?.tableId ?? "incident_events",
      },
      "Persisted incident analytics to BigQuery"
    );
  } else {
    logger.warn(
      {
        error:
          analyticsResult.reason instanceof Error
            ? analyticsResult.reason.message
            : String(analyticsResult.reason),
        event: "gcp-incident-analytics-persist-failed",
        reportId,
      },
      "Failed to persist incident analytics to BigQuery"
    );
  }
}
