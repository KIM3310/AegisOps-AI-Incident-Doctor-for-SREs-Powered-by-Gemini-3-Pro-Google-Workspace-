import { afterEach, describe, expect, it, vi } from 'vitest';
import { googleApiFetch, googleApiJson } from '../services/googleApiClient';

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('googleApiClient', () => {
  it('injects bearer token and returns successful response', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const res = await googleApiFetch({
      accessToken: 'token-abc',
      label: 'Google API test',
      url: 'https://example.test/v1/resource',
      headers: { 'Content-Type': 'application/json' },
    });

    expect(res.ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [, init] = fetchSpy.mock.calls[0];
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer token-abc');
  });

  it('throws readable error on timeout', async () => {
    vi.useFakeTimers();
    vi.spyOn(globalThis, 'fetch').mockImplementation((_url, init) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          const abortErr = new Error('aborted');
          (abortErr as Error & { name: string }).name = 'AbortError';
          reject(abortErr);
        });
      });
    });

    const pending = expect(
      googleApiFetch({
        accessToken: 'token-abc',
        label: 'Google API timeout test',
        url: 'https://example.test/v1/resource',
        timeoutMs: 1200,
      })
    ).rejects.toThrow('timed out');
    await vi.advanceTimersByTimeAsync(1300);
    await pending;
  });

  it('includes response body summary for non-2xx', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: { message: 'invalid_scope' } }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await expect(
      googleApiFetch({
        accessToken: 'token-abc',
        label: 'Google API forbidden test',
        url: 'https://example.test/v1/resource',
      })
    ).rejects.toThrow('failed (403)');
  });

  it('throws when JSON response is malformed', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('not-json', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await expect(
      googleApiJson({
        accessToken: 'token-abc',
        label: 'Google API invalid json test',
        url: 'https://example.test/v1/resource',
      })
    ).rejects.toThrow('invalid JSON');
  });
});
