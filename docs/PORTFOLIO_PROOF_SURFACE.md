# AegisOps Portfolio Proof Surface

AegisOps should be reviewed as a **working operator surface with explicit proof routes**, not as a single static UI.

## Best review paths

### 1. 90-second recruiter / hiring-manager pass
- Read the top of `README.md`
- Open `docs/executive-one-pager.md`
- Skim `docs/review-pack.svg`

What this proves:
- the problem is clear
- the product has a buyer story
- the repo has visible review assets beyond source code screenshots

### 2. 3-minute technical reviewer pass
- Run `npm install && npm run review:smoke`
- Inspect:
  - `/api/healthz`
  - `/api/meta`
  - `/api/review-pack`
  - `/api/live-session-pack`
  - `/api/schema/report`
  - `/api/evals/replays/summary`

What this proves:
- the repo exposes a deterministic review surface
- replay proof and report contract are first-class
- runtime posture is inspectable without guessing

### 3. 10-minute engineer / architect pass
- Run `npm run verify`
- Read:
  - `docs/solution-architecture.md`
  - `docs/INCIDENT_REPLAY_EVALS.md`
  - `samples/README.md`

What this proves:
- the repo is runnable and verifiable locally
- evaluation is not hand-wavy marketing copy
- the architecture and trust boundary are documented

## Hiring-signal map

| Target role | Strongest evidence in repo | Why it matters |
|---|---|---|
| Frontier / LLM engineer | multimodal input handling, replay evals, schema-first output, grounding controls | shows model-product integration with evaluation and guardrails |
| AI engineer | demo/live/offline runtime modes, deterministic replay suite, Teachable Machine and Gemini/Ollama posture | shows practical system design beyond prompt wrappers |
| Solution architect | review pack, live-session pack, trust boundary, export posture, role-aware routes | shows system framing, operational boundaries, and stakeholder-friendly review flow |
| Field / solutions engineer | sample inputs, reviewer bundle flows, export-ready artifacts, smoke verification | shows demoability, explainability, and customer-facing proof |

## Core proof assets

### Review endpoints
- `GET /api/healthz`
- `GET /api/meta`
- `GET /api/review-pack`
- `GET /api/live-session-pack`
- `GET /api/runtime/scorecard`
- `GET /api/schema/report`
- `GET /api/evals/replays`
- `GET /api/evals/replays/summary`

### Docs and diagrams
- `README.md`
- `docs/executive-one-pager.md`
- `docs/solution-architecture.md`
- `docs/INCIDENT_REPLAY_EVALS.md`
- `docs/review-pack.svg`
- `docs/architecture.png`

### Runnable proof commands
```bash
npm install
npm run review:smoke
npm run verify
```

## What to pay attention to
- **Reviewability over novelty**: the repo makes model behavior inspectable instead of magical.
- **Multiple runtime postures**: static demo, demo backend, Gemini live, and Ollama local are explicit.
- **Trust boundary clarity**: the browser never needs the Gemini key; review routes expose posture and limits.
- **Proof over claims**: replay evals and smoke checks back up the README narrative.

## What not to over-index on
- `App.tsx` size by itself
- whether every optional integration is wired to a live credential in your environment
- the static demo alone without checking the review/eval surfaces

The repo is strongest when judged end-to-end:

`evidence ingestion -> structured incident report -> reviewer pack -> replay proof -> export posture`
