# AegisOps — Multimodal Incident Review System

[![CI](https://github.com/KIM3310/AegisOps/actions/workflows/ci.yml/badge.svg)](https://github.com/KIM3310/AegisOps/actions)

**AegisOps** turns raw logs and monitoring screenshots into a structured incident report, postmortem pack, and handoff path that stays easy to inspect and replay.

- **Input:** raw text logs + monitoring screenshots
- **Output:** structured JSON incident report — severity, RCA hypotheses, prioritized actions, timeline, prevention recommendations, reasoning trace
- **Replay evals:** 4 scenarios / 32 rubric checks (severity, tags, title quality, actionability, timeline coverage)
- **Optional:** on-call audio briefing (TTS), export to Google Workspace (Docs/Slides/Sheets/Calendar/Chat)
- **Providers:** Gemini (default), OpenAI, Ollama (local/offline), demo mode (no keys required)

## Live Demo

- Cloudflare Pages: https://aegisops-ai-incident-doctor.pages.dev
- Google AI Studio: https://ai.studio/apps/drive/1nInCvCJjSXy0IQGiDeK9gbsjjhhPqtlg?fullscreenApplet=true
- Demo video: https://youtu.be/FOcjPcMheIg

## Quick Start

```bash
npm install && npm run dev
# UI:  http://127.0.0.1:3000
# API: http://127.0.0.1:8787
```

Copy `.env.example` to `.env`. If `GEMINI_API_KEY` is not set, the API runs in demo mode — no external calls, deterministic output, replay suite still runs.

## Architecture

```
React/Vite UI  →  /api/*  →  Express API (server-side key handling)  →  Gemini / OpenAI / Ollama
                                    ↓ (optional)
                              GCS (artifacts) + BigQuery (analytics rows)
```

Key design: API key never reaches the browser. The frontend calls `/api/analyze`, `/api/followup`, `/api/tts` — the API reads `GEMINI_API_KEY` server-side.

## Core API

| Endpoint | Description |
|---|---|
| `POST /api/analyze` | Analyze logs + screenshots, return structured incident report |
| `POST /api/followup` | Follow-up Q&A grounded on the generated report |
| `POST /api/tts` | Text-to-speech audio briefing |
| `GET /api/evals/replays` | Replay suite results (4 scenarios / 32 checks) |
| `GET /api/live-sessions` | Persisted incident session history |
| `GET /api/meta` | Runtime modes, replay summary, operator checklist |
| `GET /api/healthz` | Deployment mode, provider, limits |

## Incident Replay Evals

```bash
npm run eval:replays
```

Suite: `evals/incidentReplays.ts` — scoring logic: `server/lib/replayEvals.ts`. Rubric covers severity, tags, title quality, actionability, timeline coverage, reasoning structure, and confidence bands. See `docs/INCIDENT_REPLAY_EVALS.md`.

## Deployment

**Local**
```bash
npm install && npm run dev
```

**Cloudflare Pages**
```bash
npm run build && wrangler pages deploy dist/
```

**Docker / Cloud Run** — set `GEMINI_API_KEY` as a secret, `HOST=0.0.0.0`.

Optional GCP path: set `GOOGLE_APPLICATION_CREDENTIALS` + `GCP_PROJECT_ID` to persist incident artifacts to GCS and analytics rows to BigQuery.

## Tech Stack

TypeScript · React · Vite · Express · Gemini · OpenAI · Ollama · Cloudflare Pages · GCP (GCS, BigQuery) · AWS · Datadog

## License

MIT
