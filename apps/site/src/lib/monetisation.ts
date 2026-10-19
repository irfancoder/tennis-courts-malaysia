/**
 * Affiliate links, featured badges and the partners page stay hidden until this is on.
 * Turn it on only once the PRD §9 "genuine interest" thresholds have held for 3 months.
 */
export const monetisationOn = import.meta.env.PUBLIC_MONETISATION === "1";

/** A featured placement is shown only while monetisation is on and before its end date. */
export function isFeatured(featured: { until: string } | undefined, today = new Date()): boolean {
  if (!monetisationOn || !featured) return false;
  return new Date(`${featured.until}T23:59:59+08:00`) >= today;
}
