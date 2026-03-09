import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../server/index";

describe("live session history api", () => {
  const server = createServer(app);
  let baseUrl = "";
  const tempDir = mkdtempSync(path.join(tmpdir(), "aegisops-live-sessions-"));

  beforeAll(async () => {
    process.env.AEGISOPS_SESSION_STORE_PATH = path.join(tempDir, "sessions.jsonl");
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    delete process.env.AEGISOPS_SESSION_STORE_PATH;
    rmSync(tempDir, { force: true, recursive: true });
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  });

  it("persists analyze and follow-up events into a live session history", async () => {
    const sessionId = "sev1-checkout-session";

    const analyze = await fetch(`${baseUrl}/api/analyze`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        sessionId,
        lane: "commander-handoff",
        logs: "checkout saturation across two worker pools",
        images: [],
      }),
    });
    const analyzeBody = await analyze.json();
    expect(analyze.status).toBe(200);
    expect(analyzeBody.sessionId).toBe(sessionId);

    const followup = await fetch(`${baseUrl}/api/followup`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        sessionId,
        lane: "review",
        question: "What should the incident commander verify next?",
        report: analyzeBody,
      }),
    });
    const followupBody = await followup.json();
    expect(followup.status).toBe(200);
    expect(followupBody.sessionId).toBe(sessionId);

    const list = await fetch(`${baseUrl}/api/live-sessions?lane=review`);
    const listBody = await list.json();
    expect(list.status).toBe(200);
    expect(listBody.schema).toBe("aegisops-live-session-list-v1");
    expect(listBody.items.some((item: { sessionId: string }) => item.sessionId === sessionId)).toBe(true);

    const detail = await fetch(`${baseUrl}/api/live-sessions/${sessionId}`);
    const detailBody = await detail.json();
    expect(detail.status).toBe(200);
    expect(detailBody.schema).toBe("aegisops-live-session-detail-v1");
    expect(detailBody.summary.eventCount).toBeGreaterThanOrEqual(2);
    expect(detailBody.reviewTimeline.some((item: { eventKind: string }) => item.eventKind === "followup")).toBe(true);
    expect(detailBody.links.liveSessions).toBe("/api/live-sessions");
  });

  it("rejects invalid live session lane filters", async () => {
    const response = await fetch(`${baseUrl}/api/live-sessions?lane=invalid`);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.message).toContain("lane must be");
  });
});
