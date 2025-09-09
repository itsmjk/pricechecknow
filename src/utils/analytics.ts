type EventName = 'cta_click_ios_a2hs' | 'cta_click_android_pwa' | 'cta_click_desktop_bookmark';
const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3001';

export function trackEvent(name: EventName, data?: Record<string, unknown>) {
  try {
    const payload = { name, data: data || {}, ts: Date.now() };
    const json = JSON.stringify(payload);
    const url = `${API_BASE.replace(/\/$/, '')}/api/cta-analytics`;

    // Client-side de-dupe: ignore same event within 800ms window
    const w = window as any;
    w.__ctaDedup = w.__ctaDedup || new Map<string, number>();
    const last = w.__ctaDedup.get(name) || 0;
    const now = Date.now();
    if (now - last < 800) return;
    w.__ctaDedup.set(name, now);

    if (navigator.sendBeacon) {
      const blob = new Blob([json], { type: 'text/plain' });
      navigator.sendBeacon(url, blob);
    } else {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: json,
        keepalive: true
      }).catch(() => {});
    }
  } catch {
    // no-op
  }
}


