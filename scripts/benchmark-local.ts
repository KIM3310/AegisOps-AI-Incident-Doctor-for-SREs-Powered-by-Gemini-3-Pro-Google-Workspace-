import assert from "node:assert/strict";
import { once } from "node:events";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { cpus, totalmem, tmpdir } from "node:os";
import { join } from "node:path";
import type { AddressInfo } from "node:net";

const directory = mkdtempSync(join(tmpdir(), "aegisops-benchmark-"));
// Set before dynamic import; no provider call, shared runtime files, or credential is used.
process.env.LLM_PROVIDER = "demo";
process.env.GEMINI_API_KEY = "";
process.env.OPENAI_API_KEY = "";
process.env.OPENROUTER_API_KEY = "";
process.env.AEGISOPS_OPERATOR_TOKEN = "";
process.env.ANALYZE_CACHE_TTL_SEC = "0";
process.env.AEGISOPS_RUNTIME_STORE_PATH = join(directory, "runtime.jsonl");
process.env.AEGISOPS_SESSION_STORE_PATH = join(directory, "sessions.jsonl");
const { app } = await import("../server/index");
const server = app.listen(0, "127.0.0.1");
await once(server, "listening");
const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
try {
  const samples: number[] = [];
  const warmup = 5, count = 30; // Stay within the application's normal 40/min analyze limit.
  for (let index=0; index<warmup+count; index++) {
    const start = performance.now();
    const response = await fetch(`${base}/api/analyze`, { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ logs: `Synthetic checkout incident ${index}: 502 upstream timeout and queue pressure`, images: [] }), signal: AbortSignal.timeout(5000) });
    assert.equal(response.status, 200);
    const report = await response.json();
    assert.ok(report.title && report.summary && report.sessionId);
    if(index>=warmup) samples.push(performance.now()-start);
  }
  const sorted = [...samples].sort((a,b) => a-b);
  const report = { schema: "aegisops-local-http-latency-v1", recordedAt: new Date().toISOString(),
    scope: "Actual loopback HTTP /api/analyze with uncached synthetic demo provider and temporary file persistence; excludes model inference.",
    environment: { node: process.version, platform: process.platform, arch: process.arch, cpu: cpus()[0]?.model, logicalCpus: cpus().length, memoryGiB: Math.round(totalmem()/2**30) },
    method: { warmupRequests: warmup, measuredRequests: count, concurrency: 1, cacheTtlSec: 0, percentile: "nearest rank", provider: "demo", images: 0 },
    latencyMs: { p50: sorted[Math.ceil(count*.5)-1], p95: sorted[Math.ceil(count*.95)-1], min: sorted[0], max: sorted[count-1] },
    samplesMs: samples,
    sourceHashes: Object.fromEntries(["server/index.ts", "server/lib/demo.ts", "scripts/benchmark-local.ts"].map(name => [name,createHash("sha256").update(readFileSync(name)).digest("hex")])),
    limits: ["No LLM latency, image understanding or real incident quality measured", "Small single-run local sample, not production throughput or an SLA", "Results vary with host contention and JIT state"],
  };
  mkdirSync("docs/evidence", { recursive: true });
  writeFileSync("docs/evidence/local-http-latency.json", JSON.stringify(report,null,2)+"\n");
  console.log(JSON.stringify(report,null,2));
} finally {
  server.closeAllConnections();
  await new Promise<void>((resolve,reject)=>server.close(error=>error ? reject(error) : resolve()));
  rmSync(directory, { recursive: true, force: true });
}
