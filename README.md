# AegisOps

**Incident evidence → structured analysis → operator handoff.**

A React/TypeScript application that combines logs and monitoring screenshots into an incident report, with explicit severity, hypotheses, timeline, and follow-up actions. The default demo runs without provider keys.

[Demo](https://aegisops-ai-incident-doctor.pages.dev/) · [CI](https://github.com/KIM3310/AegisOps/actions/workflows/ci.yml) · [MIT](LICENSE)

## Inspect the implementation

| Engineering problem | Implementation | Verify |
|---|---|---|
| Make model output usable outside a chat window | [Report schemas](server/lib/schemas.ts) and provider adapters under `server/lib/` | Run the incident replay suite against four fixtures. |
| Keep a review usable after interrupted writes | [Session storage](server/lib/sessionStore.ts) validates persisted records and normalizes timestamps. | [Corrupt-record, timezone, and pagination tests](__tests__/session-store.test.ts) |
| Separate UI and model credentials | The browser calls the local API; model credentials stay in the server environment. | Inspect `server/index.ts` and the client services. |

```text
Logs + screenshots → server provider → validated report → review UI / exports
                                ↘ persisted incident sessions
Synthetic incident fixtures → deterministic replay checks
```

## Run it

Requires Node.js 22.12+.

```bash
npm ci
npm run dev
```

Open `http://127.0.0.1:3000`. The local API listens on port 8787.

```bash
npm run verify
```

This runs TypeScript checks, unit tests, replay evaluation, an API architecture smoke check, and the production build.

## Scope

The public demo and replay fixtures are synthetic. Their passing checks do not establish real incident diagnosis accuracy. Provider-backed inference and optional cloud integrations require separate configuration. The file-backed session log is intended for a single process and needs retention/rotation for sustained operation.

## Further reading

- [Detailed reference](REFERENCE.md)
- [Engineering changes and regression cases](docs/engineering-notes.md)
- [Cloud architecture](docs/cloud-ai-architecture.md) · [Machine-readable blueprint](docs/architecture/blueprint.json) · [Blueprint validator](scripts/validate_architecture_blueprint.py)
