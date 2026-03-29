# AegisOps Datadog Proof Pack

This pack shows how AegisOps should be presented in Datadog when the conversation is about incident tooling, SRE-adjacent AI systems, or on-call response workflows.

The goal is not to force a live Datadog dependency into the demo. The goal is to make the observability design explicit and reviewable.

## Why this repo is a natural Datadog story

AegisOps already behaves like an incident workflow product.

- raw logs and screenshots come in
- structured RCA and action recommendations come out
- replay suites score reasoning quality
- operator handoff stays visible through API routes and review surfaces

That maps directly to Datadog-style incident dashboards, monitors, notebooks, and service health boards.

## Service map

- `aegisops-web`
  - reviewer UI and operator surface
- `aegisops-api`
  - `/api/analyze`, `/api/followup`, `/api/tts`, `/api/healthz`
- `aegisops-replay-evals`
  - replay suite quality signals
- `aegisops-export`
  - workspace export and artifact handling

## Dashboard pack

### 1. Incident Command Board

- incident volume by severity
- `/api/analyze` latency and error rate
- follow-up latency
- provider mode split: live vs demo vs local
- active session volume

### 2. Replay Quality Board

- replay pass rate
- failing rubric categories
- actionability score trend
- timeline coverage quality

### 3. On-Call Reliability Board

- health endpoint status
- TTS/export failure counts
- average analysis time per scenario type
- fallback-to-demo events

## Monitor pack

- alert when `/api/analyze` error rate exceeds `2%`
- alert when `/api/followup` p95 exceeds `3000 ms`
- alert when replay pass rate drops below release threshold
- alert when the service falls back to demo unexpectedly in a live environment
- synthetic check for `/api/healthz`
- synthetic smoke path for `/api/analyze` with a stable demo payload

## SLO pack

- `99.0%` availability for `/api/healthz`
- `95%` of `/api/analyze` requests under `3000 ms`
- replay quality above the agreed release threshold for public demos

## Portfolio evidence to capture

- one dashboard screenshot that combines incident volume, latency, and replay quality
- one monitor screenshot for analyze-endpoint errors or replay regression
- one Datadog notebook or runbook snippet for incident commander handoff
- one short paragraph connecting replay-eval drift to release risk

## Minimal implementation path

1. Trace the API endpoints and key provider boundaries.
2. Send metrics and traces to Datadog.
3. Build `Incident Command Board` first.
4. Capture one monitor and one notebook screenshot under `docs/datadog/`.

If you only make one Datadog artifact for AegisOps, make it the `Incident Command Board`. That is the clearest proof for incident AI and SRE-adjacent roles.
