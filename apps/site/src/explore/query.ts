import { OPEN_ACCESS_TYPES } from "@tennis/schema";

export type Filters = {
  q: string;
  anyone: boolean;
  region: string;
  covered: boolean;
  lit: boolean;
  surface: string;
  price: string;
  channel: string;
  visitor: boolean;
  near: { lat: number; lng: number; label: string } | null;
};

export const DEFAULT_FILTERS: Filters = {
  q: "",
  anyone: true,
  region: "",
  covered: false,
  lit: false,
  surface: "",
  price: "",
  channel: "",
  visitor: false,
  near: null,
};

export type Result = {
  slug: string;
  name: string;
  url: string;
  lat: number;
  lng: number;
  city: string;
  region: string;
  access_type: string;
  status: string;
  has_covered: boolean;
  has_lit: boolean;
  court_count: number;
  price_day: number | null;
  price_night: number | null;
  played_here: boolean;
  is_stale: boolean;
  distance_km: number | null;
};

/** Builds the venues_search query for a set of filters. Every user value is a bound parameter. */
export function buildQuery(f: Filters): { sql: string; params: unknown[] } {
  const where: string[] = ["status <> 'closed'"];
  const params: unknown[] = [];
  if (f.q.trim()) {
    where.push("search_text LIKE ?");
    params.push(`%${f.q.trim().toLowerCase()}%`);
  }
  if (f.anyone) where.push(`access_type IN (${OPEN_ACCESS_TYPES.map((t) => `'${t}'`).join(", ")})`);
  if (f.region) {
    where.push("region = ?");
    params.push(f.region);
  }
  if (f.covered) where.push("has_covered");
  if (f.lit) where.push("has_lit");
  if (f.surface) {
    where.push("list_contains(surfaces, ?)");
    params.push(f.surface);
  }
  if (f.price) {
    where.push("price_band = ?");
    params.push(f.price);
  }
  if (f.channel) {
    where.push("list_contains(booking_channels, ?)");
    params.push(f.channel);
  }
  if (f.visitor) where.push("foreigner_friendly = 'yes'");

  let distance = "NULL::DOUBLE";
  const distParams: unknown[] = [];
  if (f.near) {
    // Haversine distance in km.
    distance =
      "6371 * 2 * asin(sqrt(pow(sin(radians(lat - ?) / 2), 2) + cos(radians(?)) * cos(radians(lat)) * pow(sin(radians(lng - ?) / 2), 2)))";
    distParams.push(f.near.lat, f.near.lat, f.near.lng);
  }
  const sql = `
    SELECT slug, name, url, lat, lng, city, region, access_type, status, has_covered, has_lit,
           court_count, price_day, price_night, played_here, is_stale, ${distance} AS distance_km
    FROM venues_search
    WHERE ${where.join(" AND ")}
    ORDER BY ${f.near ? "distance_km" : "region, city, name"}
    LIMIT 500`;
  return { sql, params: [...distParams, ...params] };
}

const BOOL_KEYS = ["covered", "lit", "visitor"] as const;
const STR_KEYS = ["q", "region", "surface", "price", "channel"] as const;

export function filtersFromUrl(search: string): Filters {
  const p = new URLSearchParams(search);
  const f: Filters = { ...DEFAULT_FILTERS };
  for (const k of STR_KEYS) f[k] = p.get(k) ?? "";
  for (const k of BOOL_KEYS) f[k] = p.get(k) === "1";
  f.anyone = p.get("anyone") !== "0";
  const lat = Number(p.get("lat"));
  const lng = Number(p.get("lng"));
  if (p.has("lat") && Number.isFinite(lat) && Number.isFinite(lng)) {
    f.near = { lat, lng, label: p.get("near") ?? "the selected place" };
  }
  return f;
}

export function filtersToUrl(f: Filters): string {
  const p = new URLSearchParams();
  for (const k of STR_KEYS) if (f[k]) p.set(k, f[k]);
  for (const k of BOOL_KEYS) if (f[k]) p.set(k, "1");
  if (!f.anyone) p.set("anyone", "0");
  if (f.near) {
    p.set("lat", f.near.lat.toFixed(4));
    p.set("lng", f.near.lng.toFixed(4));
    p.set("near", f.near.label);
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}
