// Turns Google Maps links in venue files into coordinates, without an API key.
// Share links (maps.app.goo.gl/…) redirect to a /maps/place/ URL whose data segment carries the
// pin as !3d<lat>!4d<lng> and often the Place ID as !19s<ChIJ…>. Results are cached in a committed
// JSON file so each link is looked up once and builds don't depend on Google.
import { readFile, writeFile } from "node:fs/promises";
import { MY_BOUNDS } from "@tennis/schema";

export type GeoResult = {
  lat: number;
  lng: number;
  placeId?: string;
  /** True when read from the place pin (!3d/!4d); false when only the map viewport (@lat,lng) was available. */
  exact: boolean;
  resolvedUrl: string;
  resolvedOn: string;
};

export type GeoCache = Record<string, GeoResult>;
export type Fetch = (url: string, init?: RequestInit) => Promise<Response>;

const PIN = /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/;
const VIEWPORT = /\/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),/;
const PLACE_ID = /!19s(ChIJ[\w-]+)/;

/** Reads coordinates (and Place ID when present) from a full Google Maps URL. */
export function parsePlaceUrl(url: string): Omit<GeoResult, "resolvedUrl" | "resolvedOn"> | null {
  let decoded = url;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    // Keep the raw URL if it has stray % signs.
  }
  const placeId =
    decoded.match(PLACE_ID)?.[1] ?? new URL(url).searchParams.get("query_place_id") ?? undefined;
  const pin = decoded.match(PIN);
  if (pin)
    return {
      lat: Number(pin[1]),
      lng: Number(pin[2]),
      exact: true,
      ...(placeId ? { placeId } : {}),
    };
  const view = decoded.match(VIEWPORT);
  if (view && decoded.includes("/maps/place/")) {
    return {
      lat: Number(view[1]),
      lng: Number(view[2]),
      exact: false,
      ...(placeId ? { placeId } : {}),
    };
  }
  return null;
}

/** Follows a share link's redirects to the final Google Maps URL. */
export async function expandLink(url: string, fetchImpl: Fetch = fetch): Promise<string> {
  let current = url;
  for (let hop = 0; hop < 8; hop++) {
    const host = new URL(current).hostname;
    if (host === "consent.google.com") {
      const next = new URL(current).searchParams.get("continue");
      if (!next) break;
      current = next;
      continue;
    }
    if (!host.endsWith("goo.gl")) return current;
    const res = await fetchImpl(current, {
      redirect: "manual",
      headers: { "user-agent": "tennis.irfanismail.com data build" },
    });
    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) {
      current = new URL(location, current).toString();
      continue;
    }
    throw new Error(
      `${url} did not redirect (HTTP ${res.status}). Check the link opens in a browser.`,
    );
  }
  return current;
}

export async function resolveLink(
  url: string,
  fetchImpl: Fetch = fetch,
  today = new Date(),
): Promise<GeoResult> {
  const resolvedUrl = await expandLink(url, fetchImpl);
  const parsed = parsePlaceUrl(resolvedUrl);
  if (!parsed) {
    throw new Error(
      `Couldn't read a location from ${url}. Open the place in Google Maps and paste the full address-bar URL, or add lat and lng.`,
    );
  }
  return { ...parsed, resolvedUrl, resolvedOn: today.toISOString().slice(0, 10) };
}

export function inMalaysia(lat: number, lng: number): boolean {
  return (
    lat >= MY_BOUNDS.minLat &&
    lat <= MY_BOUNDS.maxLat &&
    lng >= MY_BOUNDS.minLng &&
    lng <= MY_BOUNDS.maxLng
  );
}

export async function readCache(file: string): Promise<GeoCache> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as GeoCache;
  } catch {
    return {};
  }
}

export async function writeCache(file: string, cache: GeoCache): Promise<void> {
  const sorted = Object.fromEntries(Object.entries(cache).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(file, `${JSON.stringify(sorted, null, 2)}\n`);
}
