import { once } from "node:events";
import type { AddressInfo } from "node:net";
import { app } from "../server/index";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function fetchJson(baseUrl: string, path: string) {
  const response = await fetch(`${baseUrl}${path}`);
  if (!response.ok) {
    throw new Error(`${path} failed (${response.status})`);
  }
  return response.json();
}

async function main() {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address() as AddressInfo | null;
  if (!address) {
    throw new Error("failed to resolve aegisops review smoke port");
  }

  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const [healthz, meta, reviewPack, liveSessionPack, schema, replaySummary, runtimeScorecard] =
      await Promise.all([
        fetchJson(baseUrl, "/api/healthz"),
        fetchJson(baseUrl, "/api/meta"),
        fetchJson(baseUrl, "/api/review-pack"),
        fetchJson(baseUrl, "/api/live-session-pack"),
        fetchJson(baseUrl, "/api/schema/report"),
        fetchJson(baseUrl, "/api/evals/replays/summary"),
        fetchJson(baseUrl, "/api/runtime/scorecard?focus=quality"),
      ]);

    assert(meta?.links?.reviewPack === "/api/review-pack", "service meta review-pack link mismatch");
    assert(reviewPack?.reviewPackId, "review pack id missing");
    assert(liveSessionPack?.liveSessionPackId, "live session pack id missing");
    assert(schema?.schemaId === "incident-report-v1", "incident report schema id mismatch");
    assert(
      Array.isArray(schema?.requiredFields) && schema.requiredFields.includes("title"),
      "incident report schema required fields are incomplete"
    );
    assert(
      Array.isArray(reviewPack?.twoMinuteReview) && reviewPack.twoMinuteReview.length > 0,
      "review pack two-minute review is missing"
    );
    assert(replaySummary?.summaryId === "incident-replay-summary-v1", "replay summary id mismatch");
    assert(runtimeScorecard?.summary, "runtime scorecard summary missing");

    console.log(
      JSON.stringify(
        {
          smoke: "review-surface",
          ok: true,
          baseUrl,
          runtime: {
            deployment: healthz?.deployment ?? null,
            mode: healthz?.mode ?? null,
            provider: healthz?.provider ?? null,
          },
          proof: {
            reviewPackId: reviewPack.reviewPackId,
            liveSessionPackId: liveSessionPack.liveSessionPackId,
            schemaId: schema.schemaId,
            replaySummaryId: replaySummary.summaryId,
            replayPassRate: replaySummary?.totals?.passRate ?? null,
            severityAccuracy: replaySummary?.totals?.severityAccuracy ?? null,
            requiredFieldCount: Array.isArray(schema.requiredFields)
              ? schema.requiredFields.length
              : 0,
          },
          reviewRoutes: {
            healthz: meta?.links?.healthz ?? null,
            reviewPack: meta?.links?.reviewPack ?? null,
            liveSessionPack: meta?.links?.liveSessionPack ?? null,
            runtimeScorecard: meta?.links?.runtimeScorecard ?? null,
            reportSchema: meta?.links?.reportSchema ?? null,
          },
          quality: {
            totalRequests: runtimeScorecard?.summary?.totalRequests ?? null,
            persistedEventCount: runtimeScorecard?.summary?.persistedEventCount ?? null,
            spotlightHeadline: runtimeScorecard?.spotlight?.headline ?? null,
          },
        },
        null,
        2
      )
    );
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
