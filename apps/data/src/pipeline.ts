import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import type { SiteVenue } from "@tennis/schema";
import { deriveVenue, sortVenues, toSearchRow } from "./derive";
import { emitParquet, emitSiteJson } from "./emit";
import type { Fetch } from "./geo";
import { loadVenueFiles } from "./load";
import { resolveLocations } from "./resolve";
import { formatErrors, validateVenues } from "./validate";

export type PipelineOptions = {
  venuesDir: string;
  guidesDir?: string;
  outDir: string;
  /** Committed cache of Google Maps link lookups. */
  geoCacheFile: string;
  today?: Date;
  fetch?: Fetch;
  offline?: boolean;
};

export async function listGuideSlugs(guidesDir: string): Promise<Set<string>> {
  const files = await readdir(guidesDir);
  return new Set(files.filter((f) => /\.mdx?$/.test(f)).map((f) => f.replace(/\.mdx?$/, "")));
}

export async function runPipeline(opts: PipelineOptions): Promise<SiteVenue[]> {
  const raws = await loadVenueFiles(opts.venuesDir);
  const knownGuides =
    opts.guidesDir && existsSync(opts.guidesDir) ? await listGuideSlugs(opts.guidesDir) : undefined;
  const validated = validateVenues(raws, { knownGuides });
  const today = opts.today ?? new Date();
  const resolved = await resolveLocations(validated.venues, {
    cacheFile: opts.geoCacheFile,
    fetch: opts.fetch,
    offline: opts.offline,
    today,
  });
  const errors = [...validated.errors, ...resolved.errors];
  if (errors.length > 0) {
    throw new Error(`Venue data has ${errors.length} problem(s):\n${formatErrors(errors)}`);
  }
  const site = sortVenues(resolved.venues.map((v) => deriveVenue(v, today)));
  await emitSiteJson(join(opts.outDir, "site"), site);
  await emitParquet(join(opts.outDir, "parquet"), site.map(toSearchRow));
  return site;
}
