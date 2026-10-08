import type { Region, StateSlug, Surface } from "./taxonomy";
import type { Venue } from "./venue";

/** Location after the pipeline has turned a Google Maps link into coordinates. */
export type ResolvedLocation = Venue["location"] & {
  lat: number;
  lng: number;
  /** Google Place ID (ChIJ…) when the link carried one; used for exact Maps links. */
  placeId?: string;
};

/** A validated venue plus fields computed by the data pipeline. This is what the site renders. */
export type SiteVenue = Omit<Venue, "location"> & {
  location: ResolvedLocation;
  slug: string;
  stateSlug: StateSlug;
  stateName: string;
  citySlug: string;
  region: Region;
  url: string;
  courtCount: number;
  coveredCount: number;
  hasCovered: boolean;
  hasLit: boolean;
  surfaces: Surface[];
  isStale: boolean;
  verifiedAgeDays: number;
};

/** One row of the venues_search parquet view, flattened for client-side filtering. */
export type VenueSearchRow = {
  slug: string;
  name: string;
  url: string;
  lat: number;
  lng: number;
  state: StateSlug;
  city: string;
  region: Region;
  category: string;
  access_type: string;
  status: string;
  has_covered: boolean;
  has_lit: boolean;
  surfaces: string[];
  court_count: number;
  price_day: number | null;
  price_night: number | null;
  price_band: PriceBand;
  booking_channels: string[];
  foreigner_friendly: string;
  is_stale: boolean;
  played_here: boolean;
  verified_on: string;
  search_text: string;
};

export const PRICE_BANDS = ["budget", "mid", "premium", "unknown"] as const;
export type PriceBand = (typeof PRICE_BANDS)[number];
export const PRICE_BAND_LABEL: Record<PriceBand, string> = {
  budget: "Under RM20/hr",
  mid: "RM20–50/hr",
  premium: "Over RM50/hr",
  unknown: "Price unknown",
};

/** Venues not verified within this many days are flagged as stale. */
export const STALE_AFTER_DAYS = 365;

export type ParquetManifest = {
  generatedAt: string;
  views: Record<string, { path: string; rows: number }>;
};
