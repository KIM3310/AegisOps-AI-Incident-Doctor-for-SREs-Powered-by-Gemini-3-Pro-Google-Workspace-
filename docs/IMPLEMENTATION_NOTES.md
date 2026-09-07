# AegisOps: design and evidence

Updated 2026-09-07.

## Design decision

Typed incident reports keep the React client independent of the provider; server-side session persistence makes reload recovery inspectable. Deterministic replays expose known incident cases without implying live-model accuracy.

## Inspect the code

- [server/lib/sessionStore.ts](../server/lib/sessionStore.ts): Recover session history with bounded local persistence.
- [server/lib/replayEvals.ts](../server/lib/replayEvals.ts): Evaluate attributed synthetic incident cases.
- [scripts/benchmark-local.ts](../scripts/benchmark-local.ts): Measure actual uncached loopback HTTP analysis.

## Scope of the evidence

Public preview and replay evidence use synthetic incidents. Local latency uses a demo provider, excludes LLM inference and does not establish a production SLA.

## Contribution and provenance

These notes describe what can be inspected in the repository. Commit history and pull-request diffs preserve the change trail; they do not independently establish manual versus AI-assisted authorship, team roles or contribution percentages. No such percentages are inferred here.

[Project overview](../README.md)
