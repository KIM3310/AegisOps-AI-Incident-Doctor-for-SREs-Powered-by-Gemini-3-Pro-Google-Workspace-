type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

type GoogleApiRequest = {
  accessToken: string;
  url: string;
  label: string;
  method?: string;
  headers?: HeadersInit;
  body?: BodyInit | null;
  timeoutMs?: number;
};

const DEFAULT_GOOGLE_API_TIMEOUT_MS = 15_000;

function clampTimeoutMs(value: number | undefined): number {
  const raw = Number(value || DEFAULT_GOOGLE_API_TIMEOUT_MS);
  return Math.max(1_000, Math.min(120_000, raw));
}

function trimForError(value: string, maxChars = 280): string {
  const raw = String(value || "").replace(/\s+/g, " ").trim();
  if (!raw) return "";
  if (raw.length <= maxChars) return raw;
  return `${raw.slice(0, maxChars)}...`;
}

async function readBodyForError(res: Response): Promise<string> {
  try {
    const text = await res.text();
    return trimForError(text);
  } catch {
    return "";
  }
}

export async function googleApiFetch(request: GoogleApiRequest): Promise<Response> {
  const timeoutMs = clampTimeoutMs(request.timeoutMs);
  const method = String(request.method || "GET").toUpperCase();
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(request.url, {
      method,
      headers: {
        Authorization: `Bearer ${request.accessToken}`,
        ...(request.headers || {}),
      },
      body: request.body,
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`${request.label} request timed out after ${Math.round(timeoutMs / 1000)}s.`);
    }
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`${request.label} network request failed: ${msg}`);
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const body = await readBodyForError(res);
    throw new Error(`${request.label} failed (${res.status})${body ? `: ${body}` : ""}`);
  }

  return res;
}

export async function googleApiJson<T = JsonValue>(request: GoogleApiRequest): Promise<T> {
  const res = await googleApiFetch(request);
  const text = await res.text();
  if (!text.trim()) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`${request.label} returned invalid JSON.`);
  }
}

