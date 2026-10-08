import { type Venue, VenueSchema } from "@tennis/schema";
import * as v from "valibot";
import type { RawVenueFile } from "./load";

export type ValidatedVenue = { file: string; slug: string; venue: Venue };
export type ValidationError = { file: string; path: string; message: string };

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateVenues(
  raws: RawVenueFile[],
  opts: { knownGuides?: Set<string> } = {},
): { venues: ValidatedVenue[]; errors: ValidationError[] } {
  const venues: ValidatedVenue[] = [];
  const errors: ValidationError[] = [];

  for (const raw of raws) {
    if (!SLUG.test(raw.slug)) {
      errors.push({ file: raw.file, path: "(filename)", message: "Use lowercase-kebab-case" });
    }
    const result = v.safeParse(VenueSchema, raw.data);
    if (!result.success) {
      for (const issue of result.issues) {
        errors.push({
          file: raw.file,
          path: v.getDotPath(issue) ?? "(root)",
          message: issue.message,
        });
      }
      continue;
    }
    const venue = result.output;
    if (venue.location.state !== raw.stateDir) {
      errors.push({
        file: raw.file,
        path: "location.state",
        message: `"${venue.location.state}" does not match folder "${raw.stateDir}"`,
      });
    }
    if (opts.knownGuides) {
      venue.booking.channels.forEach((c, i) => {
        if (c.guide && !opts.knownGuides?.has(c.guide)) {
          errors.push({
            file: raw.file,
            path: `booking.channels.${i}.guide`,
            message: `No guide named "${c.guide}" in apps/site/src/content/guides`,
          });
        }
      });
    }
    venues.push({ file: raw.file, slug: raw.slug, venue });
  }

  // Cross-file checks: slugs and names/aliases must be unique so URLs and search stay unambiguous.
  const seenSlug = new Map<string, string>();
  const seenName = new Map<string, string>();
  for (const { file, slug, venue } of venues) {
    const prev = seenSlug.get(slug);
    if (prev)
      errors.push({ file, path: "(filename)", message: `Slug "${slug}" also used by ${prev}` });
    seenSlug.set(slug, file);
    for (const n of [venue.name, ...venue.aliases]) {
      const key = n.toLowerCase();
      const other = seenName.get(key);
      if (other && other !== file) {
        errors.push({ file, path: "name/aliases", message: `"${n}" also used by ${other}` });
      }
      seenName.set(key, file);
    }
  }

  return { venues, errors };
}

export function formatErrors(errors: ValidationError[]): string {
  return errors.map((e) => `  venues/${e.file}: ${e.path} — ${e.message}`).join("\n");
}
