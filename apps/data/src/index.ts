import type { SiteVenue, StateSlug } from "@tennis/schema";
import venuesJson from "../dist/site/venues.json" with { type: "json" };

const venues = venuesJson as unknown as SiteVenue[];

export function getVenues(): SiteVenue[] {
  return venues;
}

export function getVenue(slug: string): SiteVenue | undefined {
  return venues.find((v) => v.slug === slug);
}

export function venuesByState(): Map<StateSlug, SiteVenue[]> {
  return groupBy(venues, (v) => v.stateSlug);
}

export function venuesByCity(state: StateSlug): Map<string, SiteVenue[]> {
  return groupBy(
    venues.filter((v) => v.stateSlug === state),
    (v) => v.citySlug,
  );
}

function groupBy<K, T>(items: T[], key: (t: T) => K): Map<K, T[]> {
  const out = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    const list = out.get(k);
    if (list) list.push(item);
    else out.set(k, [item]);
  }
  return out;
}
