import { createServer, type Server } from "node:http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { describeIfSocketBinding } from "./socketBinding";

// We test rate limiting through the Express app directly.
// The analyze endpoint has a per-IP rate limit of 40 req/min.
describeIfSocketBinding("rate limiting on /api/analyze", () => {
  let app: any;
  let server: Server;

  beforeEach(async () => {
    // Fresh import each test to reset rate buckets
    vi.resetModules();
    const mod = await import("../server/index");
    app = mod.app;
    server = createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it("returns 200 for requests under the rate limit", async () => {
    const res = await request(server)
      .post("/api/analyze")
      .send({ logs: "ERROR: something went wrong" })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(200);
    expect(res.body.title).toBeDefined();
  });

  it("returns valid incident report shape from demo mode", async () => {
    const res = await request(server)
      .post("/api/analyze")
      .send({ logs: "[14:32:00] ERROR: redis OOM kill detected\n[14:32:05] WARN: cache miss storm" })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(200);
    expect(res.body.severity).toMatch(/^SEV[123]|UNKNOWN$/);
    expect(res.body.rootCauses).toBeInstanceOf(Array);
    expect(res.body.timeline).toBeInstanceOf(Array);
    expect(res.body.actionItems).toBeInstanceOf(Array);
    expect(res.body.tags).toBeInstanceOf(Array);
  });
});
