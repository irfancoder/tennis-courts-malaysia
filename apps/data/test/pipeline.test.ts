import { copyFile, mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { DuckDBInstance } from "@duckdb/node-api";
import type { ParquetManifest } from "@tennis/schema";
import { describe, expect, it } from "vitest";
import { deriveVenue, priceBand, regionFor } from "../src/derive";
import { loadVenueFiles } from "../src/load";
import { runPipeline } from "../src/pipeline";
import type { ResolvedVenue } from "../src/resolve";
import { validateVenues } from "../src/validate";

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const TODAY = new Date("2026-10-07T00:00:00Z");

describe("validation", () => {
  it("accepts every seed venue", async () => {
    const { venues, errors } = validateVenues(await loadVenueFiles(here("../venues")));
    expect(errors).toEqual([]);
    expect(venues.length).toBeGreaterThanOrEqual(6);
  });

  it("reports readable file + path errors", async () => {
    const raws = await loadVenueFiles(here("./fixtures/bad"));
    const { errors } = validateVenues(raws, { knownGuides: new Set(["dbkl"]) });
    expect(errors).toContainEqual(
      expect.objectContaining({ file: "selangor/broken-court.yaml", path: "pricing.day" }),
    );

    // Schema errors short-circuit cross-checks, so fix pricing and re-check the rest.
    const fixed = raws.map((r) => ({
      ...r,
      data: { ...(r.data as object), pricing: { day: 10 } },
    }));
    const second = validateVenues(fixed, { knownGuides: new Set(["dbkl"]) }).errors;
    expect(second.map((e) => e.path)).toEqual(
      expect.arrayContaining(["location.state", "booking.channels.0.guide"]),
    );
  });

  it("asks for a Google Maps link or coordinates", async () => {
    const [raw] = await loadVenueFiles(here("../venues/selangor"));
    if (!raw) throw new Error("no seed venue");
    const data = raw.data as { location: Record<string, unknown> };
    const { googleMaps: _, lat: _lat, lng: _lng, ...noPlace } = data.location;
    const { errors } = validateVenues([{ ...raw, data: { ...data, location: noPlace } }]);
    expect(errors).toContainEqual(
      expect.objectContaining({
        path: "location",
        message: "Add a googleMaps link, or both lat and lng",
      }),
    );
  });

  describe("amenities", () => {
    const withAmenities = async (amenities: unknown) => {
      const [raw] = await loadVenueFiles(here("../venues/selangor"));
      if (!raw) throw new Error("no seed venue");
      return validateVenues([{ ...raw, data: { ...(raw.data as object), amenities } }]);
    };

    it("accepts a bare value or a value with a note, and stores both as objects", async () => {
      const { venues, errors } = await withAmenities({
        parking: { value: "both", note: "Free at the field; paid in the mall." },
        shower: "yes",
        surau: "no",
      });
      expect(errors).toEqual([]);
      expect(venues[0]?.venue.amenities).toEqual({
        parking: { value: "both", note: "Free at the field; paid in the mall." },
        shower: { value: "yes" },
        surau: { value: "no" },
      });
    });

    it("defaults to no amenities", async () => {
      const { venues } = await withAmenities(undefined);
      expect(venues[0]?.venue.amenities).toEqual({});
    });

    it.each([
      [{ jacuzzi: "yes" }, "amenities"],
      [{ parking: "yes" }, "amenities.parking"],
      [{ shower: "maybe" }, "amenities.shower"],
      [{ shower: { value: "yes", note: "" } }, "amenities.shower"],
    ])("rejects %j", async (amenities, path) => {
      const { errors } = await withAmenities(amenities);
      expect(errors).toContainEqual(
        expect.objectContaining({ path: expect.stringContaining(path) }),
      );
    });
  });
});

describe("derive", () => {
  it("flags venues verified more than 12 months ago as stale", async () => {
    const { venues } = validateVenues(await loadVenueFiles(here("../venues")));
    const first = venues[0];
    if (!first) throw new Error("no venues");
    const current: ResolvedVenue = {
      ...first,
      venue: { ...first.venue, location: { ...first.venue.location, lat: 3.1, lng: 101.6 } },
    };
    const old: ResolvedVenue = {
      ...current,
      venue: { ...current.venue, verified: { ...current.venue.verified, date: "2025-09-01" } },
    };
    expect(deriveVenue(old, TODAY).isStale).toBe(true);
    expect(deriveVenue(current, TODAY).isStale).toBe(false);
  });

  it("maps regions and price bands", () => {
    expect(regionFor("selangor", "shah-alam")).toBe("klang-valley");
    expect(regionFor("kedah", "langkawi")).toBe("langkawi");
    expect(regionFor("kedah", "alor-setar")).toBe("other");
    expect(priceBand(10, 20)).toBe("budget");
    expect(priceBand(undefined, 45)).toBe("mid");
    expect(priceBand(120)).toBe("premium");
    expect(priceBand()).toBe("unknown");
  });
});

describe("parquet views", () => {
  it("answers the explore page's default query", async () => {
    const outDir = await mkdtemp(join(tmpdir(), "tennis-data-"));
    await copyFile(here("../geo-cache.json"), join(outDir, "geo-cache.json"));
    await runPipeline({
      venuesDir: here("../venues"),
      outDir,
      geoCacheFile: join(outDir, "geo-cache.json"),
      today: TODAY,
    });
    const manifest = JSON.parse(
      await readFile(join(outDir, "parquet", "manifest.json"), "utf8"),
    ) as ParquetManifest;
    const file = join(outDir, "parquet", manifest.views.venues_search?.path ?? "");

    const db = await (await DuckDBInstance.create()).connect();
    const result = await db.runAndReadAll(
      `SELECT slug FROM '${file}' WHERE access_type LIKE 'open_%' AND has_covered ORDER BY slug`,
    );
    expect(result.getRowObjects().map((r) => r.slug)).toEqual([
      "kuala-lumpur-indoor-courts-klic",
      "rekt-it-club",
      "tun-razak-national-tennis-centre",
    ]);

    const residents = await db.runAndReadAll(
      `SELECT count(*)::INTEGER AS n FROM '${file}' WHERE access_type = 'residents_only'`,
    );
    expect(residents.getRowObjects()[0]?.n).toBe(3);
  });
});
