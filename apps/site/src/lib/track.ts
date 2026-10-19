/** Umami custom events. Names are fixed here so dashboards and goals stay stable. */
export const EVENTS = {
  booking: "booking_click",
  website: "website_click",
  directions: "directions_click",
  maps: "maps_click",
  guideOutbound: "guide_outbound",
  search: "search",
  filter: "filter_apply",
  view: "view_toggle",
  nearMe: "near_me",
  suggestion: "suggestion_submit",
  affiliate: "affiliate_click",
  featured: "featured_click",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, string | number | boolean>) => void };
  }
}

function clean(props: Props): Record<string, string | number | boolean> {
  return Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined)) as Record<
    string,
    string | number | boolean
  >;
}

/** Attributes for a link in .astro markup; Umami records the click without any page JS. */
export function trackAttrs(event: EventName, props: Props = {}): Record<string, string> {
  const attrs: Record<string, string> = { "data-umami-event": event };
  for (const [key, value] of Object.entries(clean(props))) {
    attrs[`data-umami-event-${key}`] = String(value);
  }
  return attrs;
}

/** Records an event from an island. A no-op when Umami isn't loaded (dev, blocked). */
export function track(event: EventName, props: Props = {}): void {
  try {
    window.umami?.track(event, clean(props));
  } catch {
    // Analytics must never break the page.
  }
}
