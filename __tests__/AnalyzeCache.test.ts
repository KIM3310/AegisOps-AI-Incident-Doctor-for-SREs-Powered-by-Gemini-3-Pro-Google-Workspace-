import { describe, expect, it, vi } from "vitest";
import { buildAnalyzeCacheKey, createAnalyzeCache } from "../server/lib/analyzeCache";

describe("analyze cache", () => {
  it("buildAnalyzeCacheKey is deterministic and sensitive to payload changes", () => {
    const base = {
      model: "gemini-test",
      logs: "error: timeout",
      enableGrounding: false,
      images: [{ mimeType: "image/png", data: "aGVsbG8=" }],
    };
    const k1 = buildAnalyzeCacheKey(base);
    const k2 = buildAnalyzeCacheKey(base);
    const k3 = buildAnalyzeCacheKey({ ...base, logs: "error: timeout #2" });

    expect(k1).toBe(k2);
    expect(k1).not.toBe(k3);
  });

  it("evicts oldest entry when maxEntries is exceeded", () => {
    const cache = createAnalyzeCache<string>({ ttlSec: 100, maxEntries: 2 });
    cache.set("a", "A");
    cache.set("b", "B");
    cache.set("c", "C");

    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")).toBe("B");
    expect(cache.get("c")).toBe("C");
  });

  it("expires entries by ttl", () => {
    vi.useFakeTimers();
    const cache = createAnalyzeCache<string>({ ttlSec: 1, maxEntries: 10 });
    cache.set("a", "A");
    expect(cache.get("a")).toBe("A");

    vi.advanceTimersByTime(1_500);
    expect(cache.get("a")).toBeUndefined();
    vi.useRealTimers();
  });
});

