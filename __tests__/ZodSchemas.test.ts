import { describe, expect, it } from "vitest";
import {
  AnalyzeBodySchema,
  ApiKeyBodySchema,
  FollowUpBodySchema,
  LiveEscalationPreviewBodySchema,
  OperatorSessionBodySchema,
  TtsBodySchema,
  validateBody,
} from "../server/lib/schemas";

describe("Zod request validation schemas", () => {
  describe("AnalyzeBodySchema", () => {
    it("accepts a valid analyze payload with all fields", () => {
      const result = validateBody(AnalyzeBodySchema, {
        logs: "ERROR: timeout at 14:32",
        images: [{ mimeType: "image/png", data: "aGVsbG8=" }],
        lane: "incident-command",
        options: { enableGrounding: true },
        sessionId: "sess-001",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.logs).toBe("ERROR: timeout at 14:32");
        expect(result.data.images).toHaveLength(1);
        expect(result.data.options?.enableGrounding).toBe(true);
      }
    });

    it("accepts an empty body (all fields optional)", () => {
      const result = validateBody(AnalyzeBodySchema, {});
      expect(result.success).toBe(true);
    });

    it("rejects images with wrong shape", () => {
      const result = validateBody(AnalyzeBodySchema, {
        images: "not-an-array",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("images");
      }
    });
  });

  describe("FollowUpBodySchema", () => {
    it("accepts a valid followup payload", () => {
      const result = validateBody(FollowUpBodySchema, {
        question: "What was the root cause?",
        report: { title: "Incident X", severity: "SEV1" },
        history: [{ role: "user", content: "hello" }],
      });
      expect(result.success).toBe(true);
    });

    it("rejects history with invalid role", () => {
      const result = validateBody(FollowUpBodySchema, {
        question: "test",
        history: [{ role: "system", content: "hello" }],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("TtsBodySchema", () => {
    it("accepts valid TTS payload", () => {
      const result = validateBody(TtsBodySchema, { text: "Hello world", lane: "review" });
      expect(result.success).toBe(true);
    });

    it("accepts empty body", () => {
      const result = validateBody(TtsBodySchema, {});
      expect(result.success).toBe(true);
    });
  });

  describe("ApiKeyBodySchema", () => {
    it("accepts a valid API key", () => {
      const result = validateBody(ApiKeyBodySchema, { apiKey: "AIzaSyBxxxxx" });
      expect(result.success).toBe(true);
    });

    it("rejects missing API key", () => {
      const result = validateBody(ApiKeyBodySchema, {});
      expect(result.success).toBe(false);
    });

    it("rejects empty API key", () => {
      const result = validateBody(ApiKeyBodySchema, { apiKey: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("OperatorSessionBodySchema", () => {
    it("accepts valid session with token auth", () => {
      const result = validateBody(OperatorSessionBodySchema, {
        authMode: "token",
        credential: "my-secret-token",
        roles: ["incident-commander"],
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing credential", () => {
      const result = validateBody(OperatorSessionBodySchema, {
        authMode: "token",
      });
      expect(result.success).toBe(false);
    });

    it("accepts roles as comma-separated string", () => {
      const result = validateBody(OperatorSessionBodySchema, {
        credential: "token-123",
        roles: "admin,viewer",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("LiveEscalationPreviewBodySchema", () => {
    it("accepts a valid bundle id", () => {
      const result = validateBody(LiveEscalationPreviewBodySchema, {
        incidentBundleId: "checkout-sev1",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing bundle id", () => {
      const result = validateBody(LiveEscalationPreviewBodySchema, {});
      expect(result.success).toBe(false);
    });
  });
});
