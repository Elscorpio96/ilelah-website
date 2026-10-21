import { describe, it, expect } from 'vitest';
import {
  validateEnquiry,
  isHoneypotTripped,
  isTooFast,
  makeReference,
  buildNotificationEmail,
  escapeHtml,
  MIN_FILL_TIME_MS,
} from '../../src/lib/enquiry';

const valid = {
  formType: 'quote',
  name: 'Amina Yusuf',
  organisation: 'Test Stores Ltd',
  email: 'Amina@Example.com',
  phone: '+234 801 234 5678',
  country: 'Nigeria',
  service: 'business-suite',
  message: 'We need a way to track sales and stock across two shop counters.',
  outcome: '',
  budget: 'under-250k',
  timeline: 'asap',
  contactMethod: 'whatsapp',
  consent: true,
};

describe('validateEnquiry', () => {
  it('accepts a complete, valid enquiry and normalises it', () => {
    const r = validateEnquiry(valid);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.email).toBe('amina@example.com');
      expect(r.data.service).toBe('business-suite');
      expect(r.data.consent).toBe(true);
    }
  });

  it('accepts checkbox-style consent values from form posts', () => {
    expect(validateEnquiry({ ...valid, consent: 'on' }).ok).toBe(true);
  });

  it('rejects missing required fields with helpful messages', () => {
    const r = validateEnquiry({});
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(Object.keys(r.errors).sort()).toEqual(['consent', 'email', 'message', 'name', 'service'].sort());
      expect(r.errors.email).toMatch(/email/i);
    }
  });

  it.each(['plainaddress', 'a@b', 'name@site.c', 'two@@example.com', 'sp ace@example.com', '<x>@example.com'])(
    'rejects invalid email %s',
    (email) => {
      const r = validateEnquiry({ ...valid, email });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.errors.email).toBeDefined();
    },
  );

  it('rejects an unknown service value', () => {
    const r = validateEnquiry({ ...valid, service: 'crypto-mining' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.service).toBeDefined();
  });

  it('rejects a message that is too short or too long', () => {
    const short = validateEnquiry({ ...valid, message: 'Hi' });
    const long = validateEnquiry({ ...valid, message: 'x'.repeat(5001) });
    expect(short.ok).toBe(false);
    expect(long.ok).toBe(false);
  });

  it('requires a phone number when phone or WhatsApp contact is chosen', () => {
    const r = validateEnquiry({ ...valid, phone: '', contactMethod: 'whatsapp' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.phone).toMatch(/phone/i);
    expect(validateEnquiry({ ...valid, phone: '', contactMethod: 'email' }).ok).toBe(true);
  });

  it('accepts Nigerian and international phone formats and rejects junk', () => {
    expect(validateEnquiry({ ...valid, phone: '07066793518' }).ok).toBe(true);
    expect(validateEnquiry({ ...valid, phone: '+44 20 7946 0958' }).ok).toBe(true);
    expect(validateEnquiry({ ...valid, phone: 'call me maybe' }).ok).toBe(false);
    expect(validateEnquiry({ ...valid, phone: '+1234567890123456789' }).ok).toBe(false);
  });

  it('rejects out-of-list budget and timeline values but allows them to be empty', () => {
    expect(validateEnquiry({ ...valid, budget: 'one-billion' }).ok).toBe(false);
    expect(validateEnquiry({ ...valid, timeline: 'yesterday' }).ok).toBe(false);
    expect(validateEnquiry({ ...valid, budget: '', timeline: '' }).ok).toBe(true);
  });

  it('requires consent', () => {
    const r = validateEnquiry({ ...valid, consent: false });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.consent).toBeDefined();
  });

  it('strips control characters and collapses whitespace in single-line fields', () => {
    const r = validateEnquiry({ ...valid, name: '  Amina\u0000\n  Yusuf  ' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.name).toBe('Amina Yusuf');
  });

  it('keeps line breaks in the message', () => {
    const r = validateEnquiry({ ...valid, message: 'Line one is long enough.\nLine two.' });
    expect(r.ok && r.data.message.includes('\n')).toBe(true);
  });

  it('ignores non-string values safely', () => {
    const r = validateEnquiry({ ...valid, name: { $gt: '' }, email: ['x@y.com'] });
    expect(r.ok).toBe(false);
  });

  it('defaults an unknown form type to contact and blank country to Nigeria', () => {
    const r = validateEnquiry({ ...valid, formType: 'admin', country: '' });
    expect(r.ok && r.data.formType).toBe('contact');
    expect(r.ok && r.data.country).toBe('Nigeria');
  });
});

describe('spam checks', () => {
  it('detects a filled honeypot', () => {
    expect(isHoneypotTripped({ website: 'http://spam.example' })).toBe(true);
    expect(isHoneypotTripped({ website: '' })).toBe(false);
    expect(isHoneypotTripped({})).toBe(false);
  });

  it('flags submissions faster than the minimum fill time', () => {
    const now = 1_000_000;
    expect(isTooFast({ startedAt: now - 500 }, now)).toBe(true);
    expect(isTooFast({ startedAt: now - MIN_FILL_TIME_MS - 1 }, now)).toBe(false);
    expect(isTooFast({}, now)).toBe(false);
  });
});

describe('makeReference', () => {
  it('produces a readable dated reference without ambiguous characters', () => {
    const ref = makeReference(new Date('2026-10-21T10:00:00Z'), () => new Uint8Array([0, 1, 2, 31]));
    expect(ref).toBe('ILT-261021-ABC9');
    expect(makeReference()).toMatch(/^ILT-\d{6}-[A-HJ-NP-Z2-9]{4}$/);
  });
});

describe('notification email', () => {
  it('escapes HTML from visitor input', () => {
    const r = validateEnquiry({ ...valid, message: '<script>alert(1)</script> please quote me for this' });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const email = buildNotificationEmail(r.data, 'ILT-261021-TEST', new Date());
    expect(email.html).not.toContain('<script>');
    expect(email.html).toContain('&lt;script&gt;');
    expect(email.subject).toContain('ILT-261021-TEST');
    expect(email.subject).not.toMatch(/[\r\n]/);
  });

  it('escapeHtml covers all special characters', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  });
});
