# Local HTTP latency

Measured 2026-09-07T11:20:05.922Z on Apple M4, v22.23.2, darwin/arm64.

| Method | Result |
|---|---|
| Endpoint | Actual loopback HTTP POST /api/analyze |
| Provider | Synthetic demo provider; **no LLM inference** |
| Requests | 5 warmup + 30 measured, concurrency 1 |
| Cache | Disabled |
| Persistence | Real temporary local files |
| p50 | 1.99 ms |
| p95 | 3.67 ms |

`npm run benchmark:local` reproduces the method; it will not reproduce the exact timing. The script checks successful structured responses and preserves the normal API rate limit.

[Raw observations and source hashes](evidence/local-http-latency.json) · [Measurement implementation](../scripts/benchmark-local.ts)

This small local sample is not a production SLA, an inference-latency benchmark or a model-quality evaluation. Host contention and JIT state affect results.
