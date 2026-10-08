import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { expandLink, type Fetch, parsePlaceUrl, resolveLink } from "../src/geo";
import { resolveLocations } from "../src/resolve";
import type { ValidatedVenue } from "../src/validate";

const NTC =
  "https://www.google.com/maps/place/Tun+Razak+National+Tennis+Centre+-+Jalan+Duta/data=!4m7!3m6!1s0x31cc48507b85b503:0x34e86ecc32a36849!8m2!3d3.17427!4d101.6765369!16s%2Fg%2F1pzxg8x5_!19sChIJA7WFe1BIzDERSWijMsxu6DQ";
const SHORT = "https://maps.app.goo.gl/TestLink123";

/** Fake fetch: the short link redirects once to the full place URL. */
const redirecting: Fetch = async (url) =>
  url === SHORT
    ? new Response(null, { status: 302, headers: { location: NTC } })
    : new Response(null, { status: 404 });
const failing: Fetch = async () => {
  throw new Error("network should not be used");
};

function venue(location: Record<string, unknown>): ValidatedVenue {
  return {
    file: "kuala-lumpur/test.yaml",
    slug: "test",
    venue: {
      location: {
        address: "x",
        state: "kuala-lumpur",
        city: "Kuala Lumpur",
        coordsApproximate: false,
        ...location,
      },
    },
  } as unknown as ValidatedVenue;
}

describe("parsePlaceUrl", () => {
  it("reads the exact pin and Place ID from a place URL", () => {
    expect(parsePlaceUrl(NTC)).toEqual({
      lat: 3.17427,
      lng: 101.6765369,
      exact: true,
      placeId: "ChIJA7WFe1BIzDERSWijMsxu6DQ",
    });
  });

  it("falls back to the viewport, marked inexact, when there is no pin", () => {
    expect(
      parsePlaceUrl("https://www.google.com/maps/place/Somewhere/@3.1,101.6,17z"),
    ).toMatchObject({
      lat: 3.1,
      lng: 101.6,
      exact: false,
    });
  });

  it("rejects search URLs, whose viewport is not the place", () => {
    expect(parsePlaceUrl("https://www.google.com/maps/search/tennis/@3.1,101.6,13z")).toBeNull();
  });
});

describe("share links", () => {
  it("follows the redirect to the place", async () => {
    expect(await expandLink(SHORT, redirecting)).toBe(NTC);
    expect(await resolveLink(SHORT, redirecting)).toMatchObject({ lat: 3.17427, exact: true });
  });

  it("explains dead links", async () => {
    await expect(resolveLink("https://maps.app.goo.gl/gone", redirecting)).rejects.toThrow(
      /did not redirect \(HTTP 404\)/,
    );
  });
});

describe("resolveLocations", () => {
  it("resolves once, caches, then works offline", async () => {
    const cacheFile = join(await mkdtemp(join(tmpdir(), "geo-")), "geo-cache.json");
    const first = await resolveLocations([venue({ googleMaps: SHORT })], {
      cacheFile,
      fetch: redirecting,
    });
    expect(first.errors).toEqual([]);
    expect(first.venues[0]?.venue.location).toMatchObject({
      lat: 3.17427,
      lng: 101.6765369,
      placeId: "ChIJA7WFe1BIzDERSWijMsxu6DQ",
    });
    expect(JSON.parse(await readFile(cacheFile, "utf8"))[SHORT].lat).toBe(3.17427);

    const second = await resolveLocations([venue({ googleMaps: SHORT })], {
      cacheFile,
      fetch: failing,
      offline: true,
    });
    expect(second.venues[0]?.venue.location.lat).toBe(3.17427);
  });

  it("lets hand-entered coordinates override the link", async () => {
    const cacheFile = join(await mkdtemp(join(tmpdir(), "geo-")), "geo-cache.json");
    const { venues } = await resolveLocations([venue({ googleMaps: NTC, lat: 3.2, lng: 101.7 })], {
      cacheFile,
    });
    expect(venues[0]?.venue.location).toMatchObject({
      lat: 3.2,
      lng: 101.7,
      placeId: "ChIJA7WFe1BIzDERSWijMsxu6DQ",
    });
  });

  it("reports uncached links when offline", async () => {
    const cacheFile = join(await mkdtemp(join(tmpdir(), "geo-")), "geo-cache.json");
    const { errors } = await resolveLocations([venue({ googleMaps: SHORT })], {
      cacheFile,
      offline: true,
    });
    expect(errors[0]).toMatchObject({ path: "location.googleMaps" });
  });

  it("rejects places outside Malaysia", async () => {
    const cacheFile = join(await mkdtemp(join(tmpdir(), "geo-")), "geo-cache.json");
    const london = "https://www.google.com/maps/place/Wimbledon/data=!3d51.4343!4d-0.2141";
    const { errors } = await resolveLocations([venue({ googleMaps: london })], { cacheFile });
    expect(errors[0]?.message).toMatch(/outside Malaysia/);
  });
});
