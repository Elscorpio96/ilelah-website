/**
 * Enquiry form rules, shared by the browser (instant feedback) and the
 * Cloudflare Pages Function (the check that actually counts).
 *
 * This file must stay free of browser-only or server-only APIs.
 */

export const SERVICE_OPTIONS = [
  { value: 'software', label: 'Custom software development' },
  { value: 'website', label: 'Website design and development' },
  { value: 'mobile', label: 'Mobile app development' },
  { value: 'business-suite', label: 'Ilelah Business Suite' },
  { value: 'edutech', label: 'EduTech, CBT or school systems' },
  { value: 'ict', label: 'ICT support or consultancy' },
  { value: 'design', label: 'Graphic design and branding' },
  { value: 'training', label: 'Digital Academy training' },
  { value: 'other', label: 'Something else' },
] as const;

export const BUDGET_OPTIONS = [
  { value: 'not-sure', label: 'Not sure yet' },
  { value: 'under-250k', label: 'Under ₦250,000' },
  { value: '250k-1m', label: '₦250,000 to ₦1,000,000' },
  { value: '1m-5m', label: '₦1,000,000 to ₦5,000,000' },
  { value: 'over-5m', label: 'Over ₦5,000,000' },
] as const;

export const TIMELINE_OPTIONS = [
  { value: 'flexible', label: 'Flexible' },
  { value: 'asap', label: 'As soon as possible' },
  { value: '1-month', label: 'Within a month' },
  { value: '1-3-months', label: 'In 1 to 3 months' },
  { value: '3-months-plus', label: 'More than 3 months away' },
] as const;

export const CONTACT_METHOD_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone call' },
  { value: 'whatsapp', label: 'WhatsApp' },
] as const;

export const FORM_TYPES = ['contact', 'quote', 'demo', 'training'] as const;

type Values<T extends readonly { value: string }[]> = T[number]['value'];
export type ServiceKey = Values<typeof SERVICE_OPTIONS>;
export type FormType = (typeof FORM_TYPES)[number];

export interface Enquiry {
  formType: FormType;
  name: string;
  organisation: string;
  email: string;
  phone: string;
  country: string;
  service: ServiceKey;
  course: string;
  message: string;
  outcome: string;
  budget: Values<typeof BUDGET_OPTIONS> | '';
  timeline: Values<typeof TIMELINE_OPTIONS> | '';
  contactMethod: Values<typeof CONTACT_METHOD_OPTIONS>;
  consent: true;
}

export type FieldErrors = Partial<Record<keyof Enquiry, string>>;
export type ValidationResult = { ok: true; data: Enquiry } | { ok: false; errors: FieldErrors };

export const LIMITS = {
  name: { min: 2, max: 100 },
  organisation: { max: 150 },
  email: { max: 254 },
  phone: { min: 7, max: 30 },
  country: { max: 80 },
  course: { max: 120 },
  message: { min: 20, max: 5000 },
  outcome: { max: 2000 },
} as const;

/** Minimum time (ms) between the form loading and a submission. Faster is almost always a bot. */
export const MIN_FILL_TIME_MS = 3000;

// Practical email check: something@something.tld, no spaces, one @.
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;
// Digits, spaces, +, -, ( ) and dots; at least 7 digits.
const PHONE_RE = /^\+?[0-9\s\-().]{7,30}$/;
// Strip control characters except newline and tab.
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

function clean(value: unknown, multiline = false): string {
  if (typeof value !== 'string') return '';
  let v = value.replace(CONTROL_RE, '').normalize('NFC');
  if (!multiline) v = v.replace(/\s+/g, ' ');
  return v.trim();
}

const isOneOf = <T extends readonly { value: string }[]>(options: T, v: string): v is Values<T> =>
  options.some((o) => o.value === v);

/**
 * Validate and normalise raw form input.
 * Returns user-facing messages that say what is wrong and how to fix it.
 */
export function validateEnquiry(raw: Record<string, unknown>): ValidationResult {
  const errors: FieldErrors = {};

  const formTypeRaw = clean(raw.formType);
  const formType: FormType = (FORM_TYPES as readonly string[]).includes(formTypeRaw) ? (formTypeRaw as FormType) : 'contact';

  const name = clean(raw.name);
  if (name.length < LIMITS.name.min) errors.name = 'Enter your name.';
  else if (name.length > LIMITS.name.max) errors.name = `Keep your name under ${LIMITS.name.max} characters.`;

  const organisation = clean(raw.organisation);
  if (organisation.length > LIMITS.organisation.max) errors.organisation = `Keep this under ${LIMITS.organisation.max} characters.`;

  const email = clean(raw.email).toLowerCase();
  if (!email) errors.email = 'Enter your email address so we can reply.';
  else if (email.length > LIMITS.email.max || !EMAIL_RE.test(email)) errors.email = 'Enter an email address in the format name@example.com.';

  const phone = clean(raw.phone);
  const digits = phone.replace(/\D/g, '');
  if (phone && (!PHONE_RE.test(phone) || digits.length < 7 || digits.length > 15)) {
    errors.phone = 'Enter a phone number using digits, for example +234 801 234 5678.';
  }

  const country = clean(raw.country) || 'Nigeria';
  if (country.length > LIMITS.country.max) errors.country = 'Enter a shorter country name.';

  const serviceRaw = clean(raw.service);
  let service: ServiceKey = 'other';
  if (!serviceRaw) errors.service = 'Choose the service you are interested in.';
  else if (isOneOf(SERVICE_OPTIONS, serviceRaw)) service = serviceRaw;
  else errors.service = 'Choose one of the listed services.';

  const course = clean(raw.course);
  if (course.length > LIMITS.course.max) errors.course = 'Choose a course from the list.';

  const message = clean(raw.message, true);
  if (message.length < LIMITS.message.min) {
    errors.message = `Tell us a little more (at least ${LIMITS.message.min} characters) so we can reply usefully.`;
  } else if (message.length > LIMITS.message.max) {
    errors.message = `Shorten your message to ${LIMITS.message.max} characters or fewer.`;
  }

  const outcome = clean(raw.outcome, true);
  if (outcome.length > LIMITS.outcome.max) errors.outcome = `Shorten this to ${LIMITS.outcome.max} characters or fewer.`;

  const budgetRaw = clean(raw.budget);
  const budget = budgetRaw && isOneOf(BUDGET_OPTIONS, budgetRaw) ? budgetRaw : '';
  if (budgetRaw && !budget) errors.budget = 'Choose a budget range from the list.';

  const timelineRaw = clean(raw.timeline);
  const timeline = timelineRaw && isOneOf(TIMELINE_OPTIONS, timelineRaw) ? timelineRaw : '';
  if (timelineRaw && !timeline) errors.timeline = 'Choose a timeline from the list.';

  const methodRaw = clean(raw.contactMethod) || 'email';
  let contactMethod: Enquiry['contactMethod'] = 'email';
  if (isOneOf(CONTACT_METHOD_OPTIONS, methodRaw)) contactMethod = methodRaw;
  else errors.contactMethod = 'Choose how you would like us to contact you.';
  if ((contactMethod === 'phone' || contactMethod === 'whatsapp') && !phone) {
    errors.phone = 'Add a phone number, or choose email as your contact method.';
  }

  const consent = raw.consent === true || raw.consent === 'true' || raw.consent === 'on' || raw.consent === 'yes';
  if (!consent) errors.consent = 'Confirm that we may use these details to reply to you.';

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    data: { formType, name, organisation, email, phone, country, service, course, message, outcome, budget, timeline, contactMethod, consent: true },
  };
}

/** True when the hidden honeypot field has been filled in (bots fill every field). */
export function isHoneypotTripped(raw: Record<string, unknown>): boolean {
  return typeof raw.website === 'string' && raw.website.trim() !== '';
}

/** True when the form was submitted implausibly fast after loading. */
export function isTooFast(raw: Record<string, unknown>, now = Date.now()): boolean {
  const started = Number(raw.startedAt);
  if (!Number.isFinite(started) || started <= 0) return false; // missing timestamp: other checks still apply
  return now - started < MIN_FILL_TIME_MS;
}

const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O, 1/I

/** Human-friendly enquiry reference, e.g. ILT-261021-K7QX. */
export function makeReference(now = new Date(), random: (n: number) => Uint8Array = (n) => crypto.getRandomValues(new Uint8Array(n))): string {
  const d = now.toISOString().slice(2, 10).replace(/-/g, '');
  const bytes = random(4);
  const suffix = Array.from(bytes, (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join('');
  return `ILT-${d}-${suffix}`;
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

const labelOf = (options: readonly { value: string; label: string }[], v: string) => options.find((o) => o.value === v)?.label ?? v;

const FORM_TYPE_LABELS: Record<FormType, string> = {
  contact: 'Contact enquiry',
  quote: 'Quote request',
  demo: 'Demo request',
  training: 'Training enquiry',
};

/** Build the notification email sent to the business inbox. */
export function buildNotificationEmail(e: Enquiry, reference: string, receivedAt: Date) {
  const rows: [string, string][] = [
    ['Reference', reference],
    ['Type', FORM_TYPE_LABELS[e.formType]],
    ['Received', receivedAt.toUTCString()],
    ['Name', e.name],
    ['Organisation', e.organisation || '—'],
    ['Email', e.email],
    ['Phone / WhatsApp', e.phone || '—'],
    ['Country', e.country],
    ['Service', labelOf(SERVICE_OPTIONS, e.service)],
    ...(e.course ? ([['Course', e.course]] as [string, string][]) : []),
    ['Budget', e.budget ? labelOf(BUDGET_OPTIONS, e.budget) : '—'],
    ['Timeline', e.timeline ? labelOf(TIMELINE_OPTIONS, e.timeline) : '—'],
    ['Preferred contact', labelOf(CONTACT_METHOD_OPTIONS, e.contactMethod)],
  ];
  const subject = `${FORM_TYPE_LABELS[e.formType]}: ${labelOf(SERVICE_OPTIONS, e.service)} from ${e.name} [${reference}]`;
  const text = [
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    'Message:',
    e.message,
    ...(e.outcome ? ['', 'Desired outcome:', e.outcome] : []),
    '',
    'Reply to this email to respond directly to the sender.',
  ].join('\n');
  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#12161c;line-height:1.5">
<h2 style="color:#00143c;margin:0 0 12px">${escapeHtml(FORM_TYPE_LABELS[e.formType])} ${escapeHtml(reference)}</h2>
<table cellpadding="6" style="border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="color:#4a5363;vertical-align:top"><strong>${escapeHtml(k)}</strong></td><td>${escapeHtml(v)}</td></tr>`)
    .join('')}</table>
<h3 style="color:#00143c">Message</h3><p style="white-space:pre-wrap">${escapeHtml(e.message)}</p>
${e.outcome ? `<h3 style="color:#00143c">Desired outcome</h3><p style="white-space:pre-wrap">${escapeHtml(e.outcome)}</p>` : ''}
<p style="color:#5b6475;font-size:13px">Reply to this email to respond directly to the sender.</p>
</body></html>`;
  return { subject, text, html };
}
