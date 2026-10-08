import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { DuckDBInstance } from "@duckdb/node-api";
import type { ParquetManifest, SiteVenue, VenueSearchRow } from "@tennis/schema";

export async function emitSiteJson(outDir: string, venues: SiteVenue[]): Promise<string> {
  await mkdir(outDir, { recursive: true });
  const file = join(outDir, "venues.json");
  await writeFile(file, `${JSON.stringify(venues, null, 2)}\n`);
  return file;
}

// Explicit column types keep the parquet schema stable even when a column is all-null.
const SEARCH_COLUMNS = {
  slug: "VARCHAR",
  name: "VARCHAR",
  url: "VARCHAR",
  lat: "DOUBLE",
  lng: "DOUBLE",
  state: "VARCHAR",
  city: "VARCHAR",
  region: "VARCHAR",
  category: "VARCHAR",
  access_type: "VARCHAR",
  status: "VARCHAR",
  has_covered: "BOOLEAN",
  has_lit: "BOOLEAN",
  surfaces: "VARCHAR[]",
  court_count: "INTEGER",
  price_day: "DOUBLE",
  price_night: "DOUBLE",
  price_band: "VARCHAR",
  booking_channels: "VARCHAR[]",
  foreigner_friendly: "VARCHAR",
  is_stale: "BOOLEAN",
  played_here: "BOOLEAN",
  verified_on: "DATE",
  search_text: "VARCHAR",
} satisfies Record<keyof VenueSearchRow, string>;

const sqlStr = (s: string) => `'${s.replaceAll("'", "''")}'`;

/**
 * Writes query-shaped parquet views plus a manifest. Each file lives under a content hash
 * (v/<hash>/<name>.parquet) so it can be cached forever; only manifest.json changes per build.
 */
/** Removes hashed view folders the new manifest no longer points to. */
async function pruneVersions(outDir: string, manifest: ParquetManifest): Promise<void> {
  const keep = new Set(Object.values(manifest.views).map((v) => v.path.split("/")[1]));
  const dirs = await readdir(join(outDir, "v")).catch(() => [] as string[]);
  await Promise.all(
    dirs
      .filter((d) => !keep.has(d))
      .map((d) => rm(join(outDir, "v", d), { recursive: true, force: true })),
  );
}

export async function emitParquet(
  outDir: string,
  rows: VenueSearchRow[],
): Promise<ParquetManifest> {
  // Each run gets its own scratch dir, so two pipelines (e.g. a build and the dev watcher)
  // never fight over DuckDB's file locks.
  const tmpDir = join(outDir, `.tmp-${process.pid}-${Date.now()}`);
  await mkdir(tmpDir, { recursive: true });
  const ndjson = join(tmpDir, "venues_search.ndjson");
  await writeFile(ndjson, rows.map((r) => JSON.stringify(r)).join("\n"));

  const instance = await DuckDBInstance.create(":memory:");
  const db = await instance.connect();
  try {
    const columns = Object.entries(SEARCH_COLUMNS)
      .map(([k, t]) => `${sqlStr(k)}: ${sqlStr(t)}`)
      .join(", ");
    await db.run(
      `CREATE TABLE venues_search AS SELECT * FROM read_json(${sqlStr(ndjson)}, format = 'newline_delimited', columns = {${columns}})`,
    );
    await db.run(`
      CREATE TABLE facets AS
        SELECT 'region' AS facet, region AS value, count(*)::INTEGER AS n FROM venues_search GROUP BY ALL
        UNION ALL SELECT 'state', state, count(*)::INTEGER FROM venues_search GROUP BY ALL
        UNION ALL SELECT 'city', city, count(*)::INTEGER FROM venues_search GROUP BY ALL
        UNION ALL SELECT 'access_type', access_type, count(*)::INTEGER FROM venues_search GROUP BY ALL
        UNION ALL SELECT 'price_band', price_band, count(*)::INTEGER FROM venues_search GROUP BY ALL
        ORDER BY facet, value`);

    const manifest: ParquetManifest = { generatedAt: new Date().toISOString(), views: {} };
    for (const view of ["venues_search", "facets"]) {
      const tmp = join(tmpDir, `${view}.parquet`);
      await db.run(
        `COPY (SELECT * FROM ${view} ORDER BY ALL) TO ${sqlStr(tmp)} (FORMAT parquet, COMPRESSION zstd)`,
      );
      const bytes = await readFile(tmp);
      const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
      const rel = `v/${hash}/${view}.parquet`;
      await mkdir(join(outDir, "v", hash), { recursive: true });
      await writeFile(join(outDir, rel), bytes);
      const count = await db.runAndReadAll(`SELECT count(*)::INTEGER AS n FROM ${view}`);
      manifest.views[view] = { path: rel, rows: Number(count.getRowObjects()[0]?.n ?? 0) };
    }
    await writeFile(join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
    await pruneVersions(outDir, manifest);
    return manifest;
  } finally {
    db.closeSync();
    instance.closeSync();
    await rm(tmpDir, { recursive: true, force: true });
  }
}
