/**
 * Shared evaluation types for the Aegis product family.
 *
 * These TypeScript types mirror the Pydantic models defined in:
 *   aegis_engine/shared_eval/schemas.py (Aegis-Air, Python)
 *
 * To verify compatibility, run the sync check:
 *   python -m pytest tests/test_shared_eval_sync.py   (Aegis-Air)
 *   npx vitest run __tests__/SharedEvalSync.test.ts    (AegisOps)
 *
 * SCHEMA VERSION: 1.0.0
 * Keep this in sync with the Python schemas whenever the taxonomy changes.
 */

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

/** Incident severity levels used across both repos. */
export type SharedIncidentSeverity = "SEV1" | "SEV2" | "SEV3" | "UNKNOWN";

/** Failure-bucket taxonomy shared across the Aegis product family. */
export type SharedFailureBucket =
  | "dependency-outage"
  | "dependency-timeout"
  | "latency-saturation"
  | "auth-regression";

/** Categories of rubric checks used during replay evaluation. */
export type SharedEvalCheckCategory =
  | "severity_match"
  | "failure_bucket_match"
  | "title_keywords"
  | "tag_coverage"
  | "timeline_coverage"
  | "root_cause_coverage"
  | "actionability"
  | "reasoning_trace"
  | "confidence_range"
  | "summary_keywords"
  | "evidence_keywords"
  | "action_keywords";

// ---------------------------------------------------------------------------
// Shared taxonomy
// ---------------------------------------------------------------------------

/** Failure taxonomy descriptions, keyed by failure bucket. */
export const SHARED_FAILURE_TAXONOMY: Record<SharedFailureBucket, string> = {
  "dependency-outage": "Hard dependency unavailable or refusing connections.",
  "dependency-timeout":
    "Upstream dependency is responding too slowly or timing out.",
  "latency-saturation":
    "Service remains reachable but is saturated and breaching latency SLOs.",
  "auth-regression":
    "Credential, secret, or policy drift is rejecting otherwise valid traffic.",
};

// ---------------------------------------------------------------------------
// Data models
// ---------------------------------------------------------------------------

/** Min/max confidence score band for a replay expectation. */
export interface SharedConfidenceRange {
  min: number;
  max: number;
}

/** A single probe observation from a replay case or live loop. */
export interface SharedProbeObservation {
  probe: number;
  outcome: "success" | "error" | "latency";
  status_code: number;
  latency_ms: number;
  detail?: string;
}

/** Aggregated metrics snapshot for an incident or replay case. */
export interface SharedIncidentMetrics {
  sample_size: number;
  success_count: number;
  error_count: number;
  error_rate: number;
  p95_latency_ms: number;
  latency_spike_count: number;
}

/** Expected outcomes for a replay case, used by both repos' rubrics. */
export interface SharedReplayCaseExpectation {
  severity: SharedIncidentSeverity;

  // Aegis-Air probe-based expectations
  failure_bucket?: SharedFailureBucket | null;
  summary_terms?: string[];
  evidence_terms?: string[];
  action_terms?: string[];

  // AegisOps log-based expectations
  title_includes?: string[];
  tags_include?: string[];
  root_cause_includes?: string[];
  action_items_include?: string[];
  reasoning_sections?: string[];
  min_timeline_events?: number | null;
  confidence_range?: SharedConfidenceRange | null;
}

/** A single rubric check result. */
export interface SharedEvalCheck {
  name: string;
  category: SharedEvalCheckCategory;
  passed: boolean;
  detail?: string;
}

/** Scored result for a single replay case. */
export interface SharedReplayCaseResult {
  case_id: string;
  title: string;
  severity: SharedIncidentSeverity;
  failure_bucket?: SharedFailureBucket | null;
  score_pct: number;
  passed_checks: number;
  total_checks: number;
  checks: SharedEvalCheck[];
  status: "pass" | "fail";
}

/** Aggregate summary for a replay suite run. */
export interface SharedReplaySuiteSummary {
  cases: number;
  passed_checks: number;
  total_checks: number;
  score_pct: number;
  severity_accuracy_pct: number;
  bucket_accuracy_pct?: number;
  taxonomy_coverage_pct?: number;
}

/** Full replay suite result with summary and per-case runs. */
export interface SharedReplaySuiteResult {
  summary: SharedReplaySuiteSummary;
  severity_breakdown: Record<string, number>;
  bucket_breakdown: Record<string, number>;
  failure_taxonomy: Record<string, string>;
  runs: SharedReplayCaseResult[];
}

// ---------------------------------------------------------------------------
// Schema version for sync checking
// ---------------------------------------------------------------------------

/**
 * Schema version string.  Must match the 'version' field in the JSON Schema
 * exported by aegis_engine/shared_eval/export.py.
 */
export const SHARED_EVAL_SCHEMA_VERSION = "1.0.0";
