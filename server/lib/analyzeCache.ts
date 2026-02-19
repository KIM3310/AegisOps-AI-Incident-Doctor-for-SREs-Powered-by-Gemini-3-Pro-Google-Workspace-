import { createHash } from "node:crypto";

type AnalyzeImage = { mimeType: string; data: string };

export type AnalyzeCacheKeyInput = {
  model: string;
  logs: string;
  enableGrounding: boolean;
  images: AnalyzeImage[];
};

type AnalyzeCacheOptions = {
  ttlSec: number;
  maxEntries: number;
};

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

function clampInt(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Number(value || 0)));
}

function isExpired(entry: CacheEntry<unknown>, now = Date.now()): boolean {
  return entry.expiresAt <= now;
}

function hashImagePayload(image: AnalyzeImage): string {
  return createHash("sha256")
    .update(`${image.mimeType || "image/png"}|${image.data || ""}`)
    .digest("hex");
}

export function buildAnalyzeCacheKey(input: AnalyzeCacheKeyInput): string {
  const digest = createHash("sha256");
  digest.update(`model:${input.model || ""}\n`);
  digest.update(`grounding:${input.enableGrounding ? "1" : "0"}\n`);
  digest.update(`logs:${input.logs || ""}\n`);
  digest.update(`images:${input.images.length}\n`);
  for (const image of input.images) {
    digest.update(`${hashImagePayload(image)}\n`);
  }
  return digest.digest("hex");
}

export function createAnalyzeCache<T>(options: AnalyzeCacheOptions) {
  const ttlSec = clampInt(options.ttlSec, 0, 86_400);
  const maxEntries = clampInt(options.maxEntries, 0, 5_000);
  const store = new Map<string, CacheEntry<T>>();

  function enabled(): boolean {
    return ttlSec > 0 && maxEntries > 0;
  }

  function sweep(now = Date.now()): void {
    for (const [key, entry] of store.entries()) {
      if (isExpired(entry, now)) {
        store.delete(key);
      }
    }
  }

  function size(): number {
    return store.size;
  }

  function get(key: string): T | undefined {
    if (!enabled()) return undefined;
    const entry = store.get(key);
    if (!entry) return undefined;
    if (isExpired(entry)) {
      store.delete(key);
      return undefined;
    }

    // LRU: refresh key order on successful read
    store.delete(key);
    store.set(key, entry);
    return entry.value;
  }

  function set(key: string, value: T): void {
    if (!enabled()) return;
    const now = Date.now();
    sweep(now);

    if (store.has(key)) {
      store.delete(key);
    } else if (store.size >= maxEntries) {
      const oldestKey = store.keys().next().value as string | undefined;
      if (oldestKey) store.delete(oldestKey);
    }

    store.set(key, {
      value,
      expiresAt: now + ttlSec * 1000,
    });
  }

  return {
    get,
    set,
    size,
    sweep,
    enabled,
  };
}

