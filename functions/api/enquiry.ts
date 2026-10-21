/**
 * POST /api/enquiry
 *
 * Receives contact, quote, demo and training enquiries from the website and
 * delivers them to the business inbox through Resend (https://resend.com).
 *
 * Protection, in order:
 *   1. Method, origin and size checks
 *   2. Rate limit per IP address (KV-backed when RATE_LIMIT_KV is bound)
 *   3. Honeypot field and minimum fill time (silent bot filtering)
 *   4. Cloudflare Turnstile verification (when TURNSTILE_SECRET_KEY is set)
 *   5. Full server-side validation (src/lib/enquiry.ts)
 *
 * Secrets are read from the Cloudflare Pages environment, never from code.
 * See docs/ENVIRONMENT_SETUP.md.
 */
import {
  validateEnquiry,
  isHoneypotTripped,
  isTooFast,
  makeReference,
  buildNotificationEmail,
} from '../../src/lib/enquiry.ts';

export interface Env {
  RESEND_API_KEY?: string;
  ENQUIRY_TO_EMAIL?: string;
  ENQUIRY_FROM_EMAIL?: string;
  TURNSTILE_SECRET_KEY?: string;
  /** Comma-separated extra origins allowed to post (e.g. a preview URL). The site's own origin is always allowed. */
  ALLOWED_ORIGINS?: string;
  /** Optional KV namespace for rate limiting across all Cloudflare locations. */
  RATE_LIMIT_KV?: KVNamespace;
  /** Max submissions per IP per window (default 5) */
  RATE_LIMIT_MAX?: string;
  /** Window length in seconds (default 600) */
  RATE_LIMIT_WINDOW?: string;
}

type Ctx = EventContext<Env, string, Record<string, unknown>>;

const MAX_BODY_BYTES = 20_000;

const json = (status: number, body: Record<string, unknown>, extra: HeadersInit = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      ...extra,
    },
  });

/** Best-effort fallback limiter, local to one Cloudflare isolate. Use RATE_LIMIT_KV or a WAF rule in production. */
const memoryHits = new Map<string, { count: number; resetAt: number }>();

async function isRateLimited(env: Env, ip: string, now = Date.now()): Promise<boolean> {
  const max = Number(env.RATE_LIMIT_MAX) || 5;
  const windowSec = Number(env.RATE_LIMIT_WINDOW) || 600;
  const key = `enquiry:${ip}`;

  if (env.RATE_LIMIT_KV) {
    const current = Number((await env.RATE_LIMIT_KV.get(key)) || '0');
    if (current >= max) return true;
    await env.RATE_LIMIT_KV.put(key, String(current + 1), { expirationTtl: Math.max(60, windowSec) });
    return false;
  }

  const entry = memoryHits.get(key);
  if (!entry || entry.resetAt < now) {
    memoryHits.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    if (memoryHits.size > 5000) memoryHits.clear();
    return false;
  }
  entry.count += 1;
  return entry.count > max;
}

function originAllowed(request: Request, env: Env): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // non-browser clients; other checks still apply
  const self = new URL(request.url).origin;
  const extra = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);
  return origin === self || extra.includes(origin);
}

async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  const type = request.headers.get('content-type') || '';
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return null;
  try {
    if (type.includes('application/json')) {
      const parsed = JSON.parse(text);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
    }
    if (type.includes('application/x-www-form-urlencoded')) {
      return Object.fromEntries(new URLSearchParams(text));
    }
  } catch {
    return null;
  }
  return null;
}

async function verifyTurnstile(secret: string, token: string, ip: string): Promise<boolean> {
  if (!token) return false;
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export async function handleEnquiry({ request, env }: Pick<Ctx, 'request' | 'env'>): Promise<Response> {
  if (!originAllowed(request, env)) {
    return json(403, { ok: false, code: 'forbidden', message: 'This form can only be sent from the Ilelah Technologies website.' });
  }

  const declared = Number(request.headers.get('content-length') || '0');
  if (declared > MAX_BODY_BYTES) {
    return json(413, { ok: false, code: 'too_large', message: 'Your message is too long. Please shorten it and try again.' });
  }

  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (await isRateLimited(env, ip)) {
    return json(
      429,
      { ok: false, code: 'rate_limited', message: 'Too many messages have been sent from your connection. Please wait a few minutes, or contact us by email or WhatsApp.' },
      { 'retry-after': String(Number(env.RATE_LIMIT_WINDOW) || 600) },
    );
  }

  const raw = await readBody(request);
  if (!raw) {
    return json(400, { ok: false, code: 'bad_request', message: 'The form could not be read. Please refresh the page and try again.' });
  }

  // Bots: respond as if accepted, but send nothing. Real visitors never trip these.
  if (isHoneypotTripped(raw) || isTooFast(raw)) {
    return json(200, { ok: true, reference: null });
  }

  if (env.TURNSTILE_SECRET_KEY) {
    const token = typeof raw['cf-turnstile-response'] === 'string' ? (raw['cf-turnstile-response'] as string) : '';
    if (!(await verifyTurnstile(env.TURNSTILE_SECRET_KEY, token, ip))) {
      return json(400, {
        ok: false,
        code: 'verification_failed',
        message: 'We could not confirm the security check. Please complete it again and resend.',
      });
    }
  }

  const result = validateEnquiry(raw);
  if (!result.ok) {
    return json(422, { ok: false, code: 'invalid', message: 'Some details need attention.', errors: result.errors });
  }

  if (!env.RESEND_API_KEY || !env.ENQUIRY_TO_EMAIL || !env.ENQUIRY_FROM_EMAIL) {
    console.error('enquiry: email delivery is not configured (RESEND_API_KEY / ENQUIRY_TO_EMAIL / ENQUIRY_FROM_EMAIL missing)');
    return json(503, {
      ok: false,
      code: 'not_configured',
      message: 'Our online form is not accepting messages at the moment. Please contact us by email, phone or WhatsApp instead.',
    });
  }

  const reference = makeReference();
  const email = buildNotificationEmail(result.data, reference, new Date());

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
        'idempotency-key': reference,
      },
      body: JSON.stringify({
        from: env.ENQUIRY_FROM_EMAIL,
        to: env.ENQUIRY_TO_EMAIL.split(',').map((s) => s.trim()).filter(Boolean),
        reply_to: result.data.email,
        subject: email.subject,
        text: email.text,
        html: email.html,
        tags: [
          { name: 'form', value: result.data.formType },
          { name: 'service', value: result.data.service.replace(/[^a-zA-Z0-9_-]/g, '_') },
        ],
      }),
    });
    if (!res.ok) {
      // Log status only: the response body may echo submitted personal data.
      console.error(`enquiry: Resend returned HTTP ${res.status} for ${reference}`);
      return json(502, {
        ok: false,
        code: 'delivery_failed',
        message: 'Your message could not be delivered just now. Please try again in a few minutes, or contact us by email or WhatsApp.',
      });
    }
  } catch {
    console.error(`enquiry: network error contacting Resend for ${reference}`);
    return json(502, {
      ok: false,
      code: 'delivery_failed',
      message: 'Your message could not be delivered just now. Please try again in a few minutes, or contact us by email or WhatsApp.',
    });
  }

  return json(200, { ok: true, reference });
}

/** Single entry point so every method is handled explicitly. */
export const onRequest = async (ctx: Ctx): Promise<Response> => {
  if (ctx.request.method === 'POST') return handleEnquiry(ctx);
  return json(405, { ok: false, code: 'method_not_allowed', message: 'Use POST.' }, { allow: 'POST' });
};
