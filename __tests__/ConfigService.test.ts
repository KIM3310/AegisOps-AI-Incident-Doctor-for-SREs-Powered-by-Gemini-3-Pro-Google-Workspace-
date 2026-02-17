import { afterEach, describe, expect, it } from "vitest";
import { loadConfig } from "../server/lib/config";

const BASE_ENV = { ...process.env };

function setEnv(values: Record<string, string | undefined>): void {
  process.env = { ...BASE_ENV, ...values };
}

afterEach(() => {
  process.env = { ...BASE_ENV };
});

describe("loadConfig", () => {
  it("uses safe defaults when env is unset", () => {
    setEnv({
      GEMINI_API_KEY: undefined,
      PORT: undefined,
      MAX_IMAGES: undefined,
      MAX_LOG_CHARS: undefined,
      GROUNDING_DEFAULT: undefined,
    });

    const cfg = loadConfig();

    expect(cfg.mode).toBe("demo");
    expect(cfg.port).toBe(8787);
    expect(cfg.maxImages).toBe(8);
    expect(cfg.maxLogChars).toBe(50_000);
    expect(cfg.groundingDefault).toBe(false);
  });

  it("clamps numeric env values to safe bounds", () => {
    setEnv({
      PORT: "-1",
      MAX_IMAGES: "999",
      MAX_LOG_CHARS: "20",
      GEMINI_API_KEY: "test-key",
      GROUNDING_DEFAULT: "true",
    });

    const cfg = loadConfig();

    expect(cfg.mode).toBe("live");
    expect(cfg.port).toBe(1);
    expect(cfg.maxImages).toBe(16);
    expect(cfg.maxLogChars).toBe(1_000);
    expect(cfg.groundingDefault).toBe(true);
  });
});
