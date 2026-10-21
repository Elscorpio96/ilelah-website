/**
 * Conversion event hooks.
 *
 * Elements with a `data-track="event_name"` attribute, and forms that call
 * `track()`, raise these events. No personal information is ever included:
 * only the event name and a coarse label such as the service chosen.
 *
 * By default nothing is sent anywhere. Cloudflare Web Analytics (the
 * cookieless page-view analytics this site supports) does not record custom
 * events, so these hooks are ready for a privacy-friendly event tool you may
 * add later (see docs/ENVIRONMENT_SETUP.md, "Analytics").
 */
export type TrackEvent =
  | 'contact_form_started'
  | 'contact_form_submitted'
  | 'quote_requested'
  | 'demo_requested'
  | 'training_enquiry_submitted'
  | 'email_click'
  | 'phone_click'
  | 'whatsapp_click'
  | 'portfolio_project_opened';

declare global {
  interface Window {
    ilelahTrack?: (event: TrackEvent, label?: string) => void;
  }
}

export function track(event: TrackEvent, label?: string): void {
  try {
    window.dispatchEvent(new CustomEvent('ilelah:track', { detail: { event, label } }));
    window.ilelahTrack?.(event, label);
    if (import.meta.env.DEV) console.debug('[track]', event, label ?? '');
  } catch {
    /* tracking must never break the page */
  }
}

export function initTracking(): void {
  document.addEventListener('click', (e) => {
    const el = (e.target as Element | null)?.closest<HTMLElement>('[data-track]');
    if (el) track(el.dataset.track as TrackEvent, el.dataset.trackLabel);
  });
}
