import type { ResolvedLocation, Venue } from "@tennis/schema";
import { type Fetch, type GeoCache, inMalaysia, readCache, resolveLink, writeCache } from "./geo";
import type { ValidatedVenue, ValidationError } from "./validate";

export type ResolvedVenue = {
  file: string;
  slug: string;
  venue: Omit<Venue, "location"> & { location: ResolvedLocation };
};

export type ResolveOptions = {
  cacheFile: string;
  fetch?: Fetch;
  /** When true, never call Google: links must already be in the cache. */
  offline?: boolean;
  today?: Date;
};

/** Gives every venue coordinates: hand-entered lat/lng win, otherwise the Google Maps link is used. */
export async function resolveLocations(
  venues: ValidatedVenue[],
  opts: ResolveOptions,
): Promise<{ venues: ResolvedVenue[]; errors: ValidationError[] }> {
  const cache: GeoCache = await readCache(opts.cacheFile);
  let changed = false;
  const errors: ValidationError[] = [];
  const out: ResolvedVenue[] = [];

  for (const { file, slug, venue } of venues) {
    const loc = venue.location;
    const link = loc.googleMaps;
    let geo = link ? cache[link] : undefined;

    if (link && !geo && !opts.offline) {
      try {
        geo = await resolveLink(link, opts.fetch, opts.today);
        cache[link] = geo;
        changed = true;
      } catch (e) {
        // A failed lookup only matters when there are no hand-entered coordinates to fall back on.
        if (loc.lat === undefined) {
          errors.push({ file, path: "location.googleMaps", message: (e as Error).message });
          continue;
        }
      }
    }

    let lat = loc.lat;
    let lng = loc.lng;
    let approximate = loc.coordsApproximate;
    if (lat === undefined || lng === undefined) {
      if (!geo) {
        errors.push({
          file,
          path: "location.googleMaps",
          message:
            "Link not in geo-cache.json yet. Run `pnpm --filter @tennis/data build` with internet access.",
        });
        continue;
      }
      lat = geo.lat;
      lng = geo.lng;
      approximate ||= !geo.exact;
    }
    if (!inMalaysia(lat, lng)) {
      errors.push({
        file,
        path: "location",
        message: `${lat}, ${lng} is outside Malaysia. Check the link or coordinates.`,
      });
      continue;
    }
    out.push({
      file,
      slug,
      venue: {
        ...venue,
        location: {
          ...loc,
          lat,
          lng,
          coordsApproximate: approximate,
          ...(geo?.placeId ? { placeId: geo.placeId } : {}),
        },
      },
    });
  }

  if (changed) await writeCache(opts.cacheFile, cache);
  return { venues: out, errors };
}
