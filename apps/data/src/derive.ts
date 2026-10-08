import {
  type PriceBand,
  type Region,
  type SiteVenue,
  STALE_AFTER_DAYS,
  STATES,
  type Surface,
  type VenueSearchRow,
} from "@tennis/schema";
import type { ResolvedVenue } from "./resolve";

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

const JB_CITIES = new Set(["johor-bahru", "iskandar-puteri", "skudai", "pasir-gudang", "nusajaya"]);

export function regionFor(state: string, citySlug: string): Region {
  if (state === "kuala-lumpur" || state === "putrajaya" || state === "selangor")
    return "klang-valley";
  if (state === "penang") return "penang";
  if (state === "kedah" && citySlug === "langkawi") return "langkawi";
  if (state === "johor" && JB_CITIES.has(citySlug)) return "johor-bahru";
  if (state === "sabah" && citySlug === "kota-kinabalu") return "kota-kinabalu";
  return "other";
}

export function priceBand(day?: number, night?: number): PriceBand {
  const prices = [day, night].filter((p): p is number => typeof p === "number");
  if (prices.length === 0) return "unknown";
  const min = Math.min(...prices);
  if (min < 20) return "budget";
  if (min <= 50) return "mid";
  return "premium";
}

const DAY_MS = 86_400_000;

export function deriveVenue({ slug, venue }: ResolvedVenue, today: Date): SiteVenue {
  const stateSlug = venue.location.state;
  const citySlug = slugify(venue.location.city);
  const surfaces = [
    ...new Set(venue.courts.map((c) => c.surface).filter((s): s is Surface => Boolean(s))),
  ];
  const verifiedAgeDays = Math.floor(
    (today.getTime() - Date.parse(`${venue.verified.date}T00:00:00Z`)) / DAY_MS,
  );
  return {
    ...venue,
    slug,
    stateSlug,
    stateName: STATES[stateSlug],
    citySlug,
    region: regionFor(stateSlug, citySlug),
    url: `/courts/${stateSlug}/${citySlug}/${slug}/`,
    courtCount: venue.courts.reduce((n, c) => n + c.count, 0),
    coveredCount: venue.courts.reduce((n, c) => n + (c.covered ? c.count : 0), 0),
    hasCovered: venue.courts.some((c) => c.covered),
    hasLit: venue.courts.some((c) => c.lit === "yes"),
    surfaces,
    isStale: verifiedAgeDays > STALE_AFTER_DAYS,
    verifiedAgeDays,
  };
}

export function toSearchRow(v: SiteVenue): VenueSearchRow {
  return {
    slug: v.slug,
    name: v.name,
    url: v.url,
    lat: v.location.lat,
    lng: v.location.lng,
    state: v.stateSlug,
    city: v.location.city,
    region: v.region,
    category: v.category,
    access_type: v.access.type,
    status: v.status.value,
    has_covered: v.hasCovered,
    has_lit: v.hasLit,
    surfaces: v.surfaces,
    court_count: v.courtCount,
    price_day: v.pricing.day ?? null,
    price_night: v.pricing.night ?? null,
    price_band: priceBand(v.pricing.day, v.pricing.night),
    booking_channels: [...new Set(v.booking.channels.map((c) => c.type))],
    foreigner_friendly: v.booking.foreignerFriendly,
    is_stale: v.isStale,
    played_here: Boolean(v.playedHere),
    verified_on: v.verified.date,
    search_text: [v.name, ...v.aliases, v.location.city, v.location.area ?? "", v.operator ?? ""]
      .join(" ")
      .toLowerCase(),
  };
}

export function sortVenues(venues: SiteVenue[]): SiteVenue[] {
  return [...venues].sort(
    (a, b) =>
      a.stateSlug.localeCompare(b.stateSlug) ||
      a.citySlug.localeCompare(b.citySlug) ||
      a.name.localeCompare(b.name),
  );
}
