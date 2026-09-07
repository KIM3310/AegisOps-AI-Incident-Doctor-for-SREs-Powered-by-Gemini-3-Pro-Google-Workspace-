// @vitest-environment node
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildLiveSessionDetail, buildLiveSessionList, buildLiveSessionStoreSummary } from "../server/lib/sessionStore";

describe("persisted incident sessions", () => {
  let directory: string;
  let file: string;
  const event = (sessionId: string, timestamp = "2026-09-07T00:00:00.000Z") => ({
    sessionId, timestamp, eventKind: "analyze", lane: "review", provider: "demo", reportTitle: sessionId,
  });

  beforeEach(() => {
    directory = mkdtempSync(path.join(tmpdir(), "aegis-session-test-"));
    file = path.join(directory, "sessions.jsonl");
    vi.stubEnv("AEGISOPS_SESSION_STORE_PATH", file);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    rmSync(directory, { recursive: true, force: true });
  });

  it("retains valid records around partial writes and invalid JSON shapes", () => {
    writeFileSync(file, [JSON.stringify(event("first")), "{", "null", "42", '"text"', "{}",
      JSON.stringify({ ...event("invalid"), timestamp: "bad-date" }),
      JSON.stringify({ ...event("second"), futureField: true })].join("\n"));
    expect(buildLiveSessionList().summary.totalEvents).toBe(2);
    expect(buildLiveSessionDetail("second")?.summary?.latestTitle).toBe("second");
  });

  it("counts every session while bounding the recent preview", () => {
    writeFileSync(file, Array.from({ length: 7 }, (_, index) => JSON.stringify(event(`incident-${index}`))).join("\n"));
    const result = buildLiveSessionStoreSummary(2);
    expect(result.sessionCount).toBe(7);
    expect(result.recentSessions).toHaveLength(2);
  });

  it("orders timestamps by instant across UTC offsets", () => {
    writeFileSync(file, [event("earlier", "2026-09-07T09:00:00+09:00"),
      event("later", "2026-09-07T01:00:00Z")].map(value => JSON.stringify(value)).join("\n"));
    expect(buildLiveSessionList().items.map(item => item.sessionId)).toEqual(["later", "earlier"]);
  });
});
