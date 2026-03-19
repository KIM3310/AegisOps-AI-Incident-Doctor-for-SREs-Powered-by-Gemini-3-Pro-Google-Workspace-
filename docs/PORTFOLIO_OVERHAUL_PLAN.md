# AegisOps Portfolio Overhaul Plan

## Starting point
Existing repo strengths from the current audit posture:
- strong product story already exists across README, summary pack, replay evals, and architecture docs
- deterministic replay proof is already present and reproducible
- service-review endpoints (`/api/healthz`, `/api/meta`, `/api/summary-pack`, `/api/live-session-pack`, `/api/schema/report`) are already meaningful

This pass focuses on making those strengths faster to evaluate for Big Tech / frontier LLM / AI engineer / solution architect reviewers without broad rewrites.

## Scope
1. **README/docs polish**
   - tighten the top-level evaluation path
   - add a dedicated proof-surface / recruiter-review doc
   - make local verification and demo posture easier to scan
2. **Proof surface / UX / devex**
   - add a deterministic smoke path for the review surfaces
   - expose a single verification command for local and CI use
3. **Repo metadata / hygiene**
   - align package metadata with the portfolio narrative
   - tighten CI so proof claims are exercised explicitly
4. **Low-risk code quality cleanup**
   - reduce obvious duplication in clipboard/export helper logic without changing behavior
   - keep or add regression protection where cleanup touches behavior-sensitive logic

## Acceptance criteria
- anyone can understand what AegisOps is, why it matters, and how to verify it in under 3 minutes
- test assets and review endpoints are easier to discover from the README/docs
- one-command verification covers typecheck, tests, replay proof, review-surface smoke, and build
- CI explicitly exercises the proof/review surface, not just unit tests/build
- at least one low-risk code cleanup reduces duplication while preserving behavior
- all relevant checks pass after changes

## Planned passes
1. **Docs / framing pass**
   - README navigation and quick-start path
   - dedicated portfolio proof doc
2. **Verification / proof pass**
   - add review-surface smoke script
   - add `npm run verify`
   - wire proof checks into CI
3. **Code cleanup pass**
   - simplify duplicated clipboard/export helper flow in `App.tsx`
   - keep diff small and behavior-preserving
4. **Validation pass**
   - run typecheck, tests, replay evals, smoke script, build

## Risks
- README edits can accidentally hide useful detail if over-compressed
- smoke verification must stay demo-safe and avoid depending on external keys
- App cleanup can cause UX regressions if copy/share text changes unexpectedly

## Non-goals
- no architecture rewrite
- no dependency additions
- no broad component decomposition campaign
- no product-behavior changes to core analysis flow
