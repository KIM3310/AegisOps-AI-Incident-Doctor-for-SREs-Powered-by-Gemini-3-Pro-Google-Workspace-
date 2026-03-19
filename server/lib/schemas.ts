import { z } from "zod";

// --- /api/analyze ---
const ImageInputSchema = z.object({
  mimeType: z.string().optional(),
  data: z.string().optional(),
});

const AnalyzeOptionsSchema = z.object({
  enableGrounding: z.boolean().optional(),
}).optional();

export const AnalyzeBodySchema = z.object({
  logs: z.string().optional(),
  images: z.array(ImageInputSchema).optional(),
  lane: z.string().optional(),
  options: AnalyzeOptionsSchema,
  sessionId: z.string().optional(),
});

export type AnalyzeBodyParsed = z.infer<typeof AnalyzeBodySchema>;

// --- /api/followup ---
const FollowUpHistoryItemSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const FollowUpOptionsSchema = z.object({
  enableGrounding: z.boolean().optional(),
}).optional();

export const FollowUpBodySchema = z.object({
  report: z.any().optional(),
  history: z.array(FollowUpHistoryItemSchema).optional(),
  lane: z.string().optional(),
  question: z.string().optional(),
  options: FollowUpOptionsSchema,
  sessionId: z.string().optional(),
});

export type FollowUpBodyParsed = z.infer<typeof FollowUpBodySchema>;

// --- /api/tts ---
export const TtsBodySchema = z.object({
  text: z.string().optional(),
  lane: z.string().optional(),
  sessionId: z.string().optional(),
});

export type TtsBodyParsed = z.infer<typeof TtsBodySchema>;

// --- /api/settings/api-key ---
export const ApiKeyBodySchema = z.object({
  apiKey: z.string().min(1, "Missing apiKey."),
});

export type ApiKeyBodyParsed = z.infer<typeof ApiKeyBodySchema>;

// --- /api/auth/session POST ---
export const OperatorSessionBodySchema = z.object({
  authMode: z.string().optional(),
  credential: z.string().min(1, "Missing credential."),
  roles: z.union([z.array(z.string()), z.string()]).optional(),
});

export type OperatorSessionBodyParsed = z.infer<typeof OperatorSessionBodySchema>;

// --- /api/live-escalation-preview ---
export const LiveEscalationPreviewBodySchema = z.object({
  incidentBundleId: z.string().min(1, "incidentBundleId is required."),
});

export type LiveEscalationPreviewBodyParsed = z.infer<typeof LiveEscalationPreviewBodySchema>;

/**
 * Helper to validate a request body against a Zod schema.
 * Returns { success: true, data } or { success: false, error: string }.
 */
export function validateBody<T>(
  schema: z.ZodType<T>,
  body: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(body);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstIssue = result.error.issues[0];
  const message = firstIssue
    ? `${firstIssue.path.join(".")}: ${firstIssue.message}`.replace(/^: /, "")
    : "Invalid request body.";
  return { success: false, error: message };
}
