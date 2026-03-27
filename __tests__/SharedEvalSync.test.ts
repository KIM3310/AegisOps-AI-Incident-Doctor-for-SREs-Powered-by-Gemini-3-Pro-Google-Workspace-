/**
 * Sync check: verify TypeScript shared types match the Python schema version
 * and that all expected types/interfaces are importable.
 *
 * This test validates the TypeScript side of the cross-language contract.
 * The Python side is validated by tests/test_shared_eval_sync.py in Aegis-Air.
 */

import { describe, expect, it } from "vitest";
import {
  SHARED_EVAL_SCHEMA_VERSION,
  SHARED_FAILURE_TAXONOMY,
} from "../server/lib/aegis-shared-types";
import type {
  SharedIncidentSeverity,
  SharedFailureBucket,
  SharedEvalCheckCategory,
  SharedConfidenceRange,
  SharedProbeObservation,
  SharedIncidentMetrics,
  SharedReplayCaseExpectation,
  SharedEvalCheck,
  SharedReplayCaseResult,
  SharedReplaySuiteSummary,
  SharedReplaySuiteResult,
} from "../server/lib/aegis-shared-types";

describe("shared eval types sync check", () => {
  it("schema version is set and follows semver", () => {
    expect(SHARED_EVAL_SCHEMA_VERSION).toBe("1.0.0");
    expect(SHARED_EVAL_SCHEMA_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("failure taxonomy has all four buckets", () => {
    const expectedBuckets: SharedFailureBucket[] = [
      "dependency-outage",
      "dependency-timeout",
      "latency-saturation",
      "auth-regression",
    ];
    const taxonomyKeys = Object.keys(SHARED_FAILURE_TAXONOMY);
    expect(taxonomyKeys.sort()).toEqual(expectedBuckets.sort());
  });

  it("failure taxonomy values are non-empty descriptions", () => {
    for (const [bucket, description] of Object.entries(SHARED_FAILURE_TAXONOMY)) {
      expect(description.length).toBeGreaterThan(10);
      expect(typeof description).toBe("string");
    }
  });

  it("severity type includes all expected values", () => {
    const severities: SharedIncidentSeverity[] = ["SEV1", "SEV2", "SEV3", "UNKNOWN"];
    expect(severities).toHaveLength(4);
  });

  it("eval check categories include all expected values", () => {
    const categories: SharedEvalCheckCategory[] = [
      "severity_match",
      "failure_bucket_match",
      "title_keywords",
      "tag_coverage",
      "timeline_coverage",
      "root_cause_coverage",
      "actionability",
      "reasoning_trace",
      "confidence_range",
      "summary_keywords",
      "evidence_keywords",
      "action_keywords",
    ];
    expect(categories).toHaveLength(12);
  });

  it("SharedEvalCheck interface is structurally valid", () => {
    const check: SharedEvalCheck = {
      name: "severity_match",
      category: "severity_match",
      passed: true,
      detail: "expected=SEV1 actual=SEV1",
    };
    expect(check.name).toBe("severity_match");
    expect(check.passed).toBe(true);
  });

  it("SharedReplayCaseResult interface is structurally valid", () => {
    const result: SharedReplayCaseResult = {
      case_id: "test-case",
      title: "Test Case",
      severity: "SEV1",
      failure_bucket: "dependency-outage",
      score_pct: 100.0,
      passed_checks: 8,
      total_checks: 8,
      checks: [],
      status: "pass",
    };
    expect(result.status).toBe("pass");
    expect(result.score_pct).toBe(100.0);
  });

  it("SharedReplaySuiteResult interface is structurally valid", () => {
    const suite: SharedReplaySuiteResult = {
      summary: {
        cases: 4,
        passed_checks: 32,
        total_checks: 32,
        score_pct: 100.0,
        severity_accuracy_pct: 100.0,
        bucket_accuracy_pct: 100.0,
        taxonomy_coverage_pct: 100.0,
      },
      severity_breakdown: { SEV1: 2, SEV2: 2 },
      bucket_breakdown: { "dependency-outage": 1, "dependency-timeout": 1, "latency-saturation": 1, "auth-regression": 1 },
      failure_taxonomy: SHARED_FAILURE_TAXONOMY,
      runs: [],
    };
    expect(suite.summary.cases).toBe(4);
    expect(suite.summary.score_pct).toBe(100.0);
  });

  it("SharedReplayCaseExpectation supports both probe and log styles", () => {
    const probeExpectation: SharedReplayCaseExpectation = {
      severity: "SEV1",
      failure_bucket: "dependency-outage",
      summary_terms: ["dependency", "checkout"],
      evidence_terms: ["error rate"],
      action_terms: ["restore"],
    };
    expect(probeExpectation.failure_bucket).toBe("dependency-outage");

    const logExpectation: SharedReplayCaseExpectation = {
      severity: "SEV1",
      title_includes: ["latency"],
      tags_include: ["autoscaling"],
      root_cause_includes: ["resource saturation"],
      min_timeline_events: 6,
      confidence_range: { min: 60, max: 80 },
    };
    expect(logExpectation.min_timeline_events).toBe(6);
    expect(logExpectation.confidence_range?.min).toBe(60);
  });
});
