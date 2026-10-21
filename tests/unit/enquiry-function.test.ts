import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onRequest, type Env } from '../../functions/api/enquiry';

const ORIGIN = 'https://www.ilelahtech.com';

const body = {
  formType: 'contact',
  name: 'Test Person',
  email: 'test@example.com',
  phone: '',
  service: 'website',
  message: 'I would like a website for my school with an admissions page.',
  contactMethod: 'email',
  consent: true,
  website: '',
  startedAt: String(Date.now() - 60_000),
  'cf-turnstile-response': 'token-123',
};

let ipCounter = 0;
function call(env: Env, init: { body?: unknown; method?: string; origin?: string | null; ip?: string; raw?: string; contentType?: string } = {}) {
  const headers = new Headers({ 'content-type': init.contentType ?? 'application/json' });
  if (init.origin !== null) headers.set('origin', init.origin ?? ORIGIN);
  headers.set('cf-connecting-ip', init.ip ?? `10.0.0.${++ipCounter}`);
  const request = new Request(`${ORIGIN}/api/enquiry`, {
    method: init.method ?? 'POST',
    headers,
    body: init.method === 'GET' ? undefined : (init.raw ?? JSON.stringify(init.body ?? body)),
  });
  // Only the fields the handler uses are needed.
  return onRequest({ request, env } as unknown as Parameters<typeof onRequest>[0]);
}

const configured: Env = {
  RESEND_API_KEY: 'test_key_not_real',
  ENQUIRY_TO_EMAIL: 'inbox@example.com',
  ENQUIRY_FROM_EMAIL: 'Website <website@example.com>',
};

describe('POST /api/enquiry', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('delivers a valid enquiry through Resend and returns a reference', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ id: 'abc' }), { status: 200 }));
    const res = await call(configured);
    const json = (await res.json()) as { ok: boolean; reference: string };
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.reference).toMatch(/^ILT-\d{6}-[A-Z2-9]{4}$/);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(opts.headers.authorization).toBe('Bearer test_key_not_real');
    const sent = JSON.parse(opts.body);
    expect(sent.to).toEqual(['inbox@example.com']);
    expect(sent.reply_to).toBe('test@example.com');
    expect(sent.subject).toContain(json.reference);
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('returns 503 and sends nothing when email delivery is not configured', async () => {
    const res = await call({});
    const json = (await res.json()) as { ok: boolean; code: string };
    expect(res.status).toBe(503);
    expect(json.ok).toBe(false);
    expect(json.code).toBe('not_configured');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 502 (not success) when Resend rejects the message', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{"message":"invalid"}', { status: 422 }));
    const res = await call(configured);
    const json = (await res.json()) as { ok: boolean; code: string };
    expect(res.status).toBe(502);
    expect(json.ok).toBe(false);
    expect(json.code).toBe('delivery_failed');
  });

  it('returns 502 when the email provider cannot be reached', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network down'));
    const res = await call(configured);
    expect(res.status).toBe(502);
  });

  it('returns 422 with field errors for invalid input, without sending', async () => {
    const res = await call(configured, { body: { ...body, email: 'nope', message: 'short' } });
    const json = (await res.json()) as { ok: boolean; errors: Record<string, string> };
    expect(res.status).toBe(422);
    expect(json.errors.email).toBeDefined();
    expect(json.errors.message).toBeDefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('silently drops honeypot submissions without sending email', async () => {
    const res = await call(configured, { body: { ...body, website: 'spam' } });
    const json = (await res.json()) as { ok: boolean; reference: null };
    expect(res.status).toBe(200);
    expect(json.reference).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('silently drops submissions made too quickly after page load', async () => {
    const res = await call(configured, { body: { ...body, startedAt: String(Date.now()) } });
    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('verifies Turnstile when a secret is configured and rejects a failed check', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ success: false }), { status: 200 }));
    const res = await call({ ...configured, TURNSTILE_SECRET_KEY: 'turnstile_test_secret' });
    const json = (await res.json()) as { code: string };
    expect(res.status).toBe(400);
    expect(json.code).toBe('verification_failed');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
  });

  it('sends the email after a successful Turnstile check', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'x' }), { status: 200 }));
    const res = await call({ ...configured, TURNSTILE_SECRET_KEY: 'turnstile_test_secret' });
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('rejects posts from other websites', async () => {
    const res = await call(configured, { origin: 'https://evil.example' });
    expect(res.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('allows extra origins listed in ALLOWED_ORIGINS', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 200 }));
    const res = await call({ ...configured, ALLOWED_ORIGINS: 'https://preview.ilelah.pages.dev' }, { origin: 'https://preview.ilelah.pages.dev' });
    expect(res.status).toBe(200);
  });

  it('rate-limits repeated submissions from one IP address', async () => {
    fetchMock.mockImplementation(async () => new Response('{}', { status: 200 }));
    const env = { ...configured, RATE_LIMIT_MAX: '2' };
    const ip = '192.0.2.77';
    expect((await call(env, { ip })).status).toBe(200);
    expect((await call(env, { ip })).status).toBe(200);
    const third = await call(env, { ip });
    expect(third.status).toBe(429);
    expect(third.headers.get('retry-after')).toBeTruthy();
  });

  it('rejects oversized and malformed bodies', async () => {
    const big = await call(configured, { raw: JSON.stringify({ ...body, message: 'x'.repeat(30_000) }) });
    expect(big.status).toBe(400);
    const bad = await call(configured, { raw: '{not json' });
    expect(bad.status).toBe(400);
    const arr = await call(configured, { raw: '[1,2,3]' });
    expect(arr.status).toBe(400);
  });

  it('accepts url-encoded form posts', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 200 }));
    const form = new URLSearchParams({ ...body, consent: 'on' } as unknown as Record<string, string>).toString();
    const res = await call(configured, { raw: form, contentType: 'application/x-www-form-urlencoded' });
    expect(res.status).toBe(200);
  });

  it('answers other methods with 405', async () => {
    const res = await call(configured, { method: 'GET' });
    expect(res.status).toBe(405);
    expect(res.headers.get('allow')).toBe('POST');
  });

  it('never leaks internal error details', async () => {
    fetchMock.mockRejectedValueOnce(new Error('SECRET internal stack details'));
    const res = await call(configured);
    const text = await res.text();
    expect(text).not.toContain('SECRET');
    expect(text).not.toContain('stack');
  });
});
