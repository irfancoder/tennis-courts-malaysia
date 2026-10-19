import * as v from "valibot";
import {
  ACCESS_TYPES,
  CATEGORIES,
  CHANNELS,
  PARKING,
  PAYMENTS,
  STATE_SLUGS,
  STATUSES,
  SURFACES,
  TRISTATES,
  VERIFICATION_SOURCES,
  YES_NO,
} from "./taxonomy";

const isoDate = v.pipe(v.string(), v.isoDate("Expected a date like 2026-10-07"));
const text = v.pipe(v.string(), v.trim(), v.minLength(1));
const tristate = v.optional(v.picklist(TRISTATES), "unknown");
const rm = v.pipe(v.number(), v.minValue(0));

// Malaysia's bounding box, incl. Sabah/Sarawak/Labuan.
export const MY_BOUNDS = { minLat: 0.8, maxLat: 7.5, minLng: 99.5, maxLng: 119.5 } as const;
const lat = v.pipe(v.number(), v.minValue(MY_BOUNDS.minLat), v.maxValue(MY_BOUNDS.maxLat));
const lng = v.pipe(v.number(), v.minValue(MY_BOUNDS.minLng), v.maxValue(MY_BOUNDS.maxLng));

/** Google Maps share links (maps.app.goo.gl, goo.gl/maps) and full /maps/place/ URLs. */
export const GOOGLE_MAPS_URL =
  /^https:\/\/(maps\.app\.goo\.gl\/|goo\.gl\/maps\/|(www\.)?google\.[a-z.]+\/maps\/place\/)/;

export const LocationSchema = v.pipe(
  v.strictObject({
    address: text,
    state: v.picklist(STATE_SLUGS),
    city: text,
    area: v.optional(text),
    /** Paste the link from Google Maps' Share button; the build reads the pin from it. */
    googleMaps: v.optional(
      v.pipe(
        v.string(),
        v.url(),
        v.regex(
          GOOGLE_MAPS_URL,
          "Use a Google Maps share link (maps.app.goo.gl/…) or a /maps/place/ URL",
        ),
      ),
    ),
    /** Optional when googleMaps is set. If given, these override the coordinates from the link. */
    lat: v.optional(lat),
    lng: v.optional(lng),
    coordsApproximate: v.optional(v.boolean(), false),
    nearestTransit: v.optional(text),
  }),
  v.check(
    (l) => Boolean(l.googleMaps) || (l.lat !== undefined && l.lng !== undefined),
    "Add a googleMaps link, or both lat and lng",
  ),
  v.check((l) => (l.lat === undefined) === (l.lng === undefined), "Give lat and lng together"),
);

export const CourtGroupSchema = v.strictObject({
  count: v.pipe(v.number(), v.integer(), v.minValue(1)),
  surface: v.optional(v.picklist(SURFACES)),
  covered: v.optional(v.boolean(), false),
  lit: tristate,
  note: v.optional(text),
});

export const AccessSchema = v.strictObject({
  type: v.picklist(ACCESS_TYPES),
  whoCanPlay: v.optional(text),
  whatToBring: v.optional(text),
  dressCode: v.optional(text),
  nonGuestBookable: v.optional(v.picklist(TRISTATES)),
  publicWindow: v.optional(text),
});

export const StatusSchema = v.strictObject({
  value: v.picklist(STATUSES),
  since: v.optional(isoDate),
  note: v.optional(text),
});

/** Accepts `shower: "yes"` or `shower: { value: "yes", note: "Cold water only." }`; both become the object form. */
function noted<const T extends readonly [string, ...string[]]>(values: T) {
  const value = v.picklist(values);
  return v.optional(
    v.pipe(
      v.union([value, v.strictObject({ value, note: v.optional(text) })]),
      v.transform((a) => (typeof a === "string" ? { value: a } : a)),
    ),
  );
}

const yesNo = () => noted(YES_NO);

/** Leave an amenity out when it hasn't been checked; "no" is shown to players. */
export const AmenitiesSchema = v.strictObject({
  parking: noted(PARKING),
  toilet: yesNo(),
  shower: yesNo(),
  surau: yesNo(),
  waterFountain: yesNo(),
  vendingMachine: yesNo(),
  convenienceStore: yesNo(),
  seating: yesNo(),
  tennisWall: yesNo(),
  ballMachine: yesNo(),
  racquetRental: yesNo(),
});

export const ChannelSchema = v.strictObject({
  type: v.picklist(CHANNELS),
  label: v.optional(text),
  url: v.optional(v.pipe(v.string(), v.url())),
  number: v.optional(
    v.pipe(
      v.string(),
      v.regex(/^\+\d[\d -]{6,}$/, "Use international format, e.g. +60 3-6206 1237"),
    ),
  ),
  guide: v.optional(v.pipe(v.string(), v.regex(/^[a-z0-9-]+$/))),
});

export const BookingSchema = v.strictObject({
  channels: v.pipe(v.array(ChannelSchema), v.minLength(1)),
  steps: v.optional(v.array(text)),
  advanceDays: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0))),
  maxHours: v.optional(v.pipe(v.number(), v.minValue(0.5))),
  cancellation: v.optional(text),
  requiresMyKad: tristate,
  requiresLocalNumber: tristate,
  foreignerFriendly: tristate,
  note: v.optional(text),
});

export const PricingSchema = v.strictObject({
  /** Typical hourly rates, used for the court facts, price filter and price bands. */
  day: v.optional(rm),
  night: v.optional(rm),
  guestFee: v.optional(rm),
  unit: v.optional(v.picklist(["hour", "session"]), "hour"),
  /** A short summary for the page. Keep it brief: detailed rate cards change often. */
  note: v.optional(text),
  observedOn: v.optional(isoDate),
});

export const VerificationSchema = v.strictObject({
  date: isoDate,
  source: v.picklist(VERIFICATION_SOURCES),
  by: v.optional(text),
  note: v.optional(text),
});

export const PhotoSchema = v.strictObject({
  key: text,
  alt: text,
  credit: v.optional(text),
  consent: v.boolean(),
});

export const VenueSchema = v.strictObject({
  name: text,
  aliases: v.optional(v.array(text), []),
  category: v.picklist(CATEGORIES),
  operator: v.optional(text),
  website: v.optional(v.pipe(v.string(), v.url())),
  location: LocationSchema,
  courts: v.pipe(v.array(CourtGroupSchema), v.minLength(1)),
  access: AccessSchema,
  status: v.optional(StatusSchema, { value: "open" }),
  booking: BookingSchema,
  pricing: v.optional(PricingSchema, {}),
  payment: v.optional(v.array(v.picklist(PAYMENTS)), []),
  hours: v.optional(text),
  amenities: v.optional(AmenitiesSchema, {}),
  photos: v.optional(v.array(PhotoSchema), []),
  verified: VerificationSchema,
  changelog: v.optional(v.array(v.strictObject({ date: isoDate, note: text })), []),
  playedHere: v.optional(
    v.strictObject({
      note: v.optional(text),
      bestTime: v.optional(text),
      lastPlayed: v.optional(isoDate),
    }),
  ),
});

export type VenueInput = v.InferInput<typeof VenueSchema>;
export type Venue = v.InferOutput<typeof VenueSchema>;
export type BookingChannel = v.InferOutput<typeof ChannelSchema>;
export type Amenities = v.InferOutput<typeof AmenitiesSchema>;
