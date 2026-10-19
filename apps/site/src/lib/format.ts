import {
  AMENITIES,
  AMENITY_LABEL,
  type Amenities,
  type Amenity,
  type BookingChannel as Channel,
  PARKING_LABEL,
  type ResolvedLocation,
  type Tristate,
} from "@tennis/schema";

const dateFmt = new Intl.DateTimeFormat("en-MY", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Kuala_Lumpur",
});

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(`${iso}T00:00:00+08:00`));
}

export function rm(
  amount: number | undefined,
  unit: "hour" | "session" = "hour",
): string | undefined {
  if (amount === undefined) return undefined;
  if (amount === 0) return "Free";
  const n = Number.isInteger(amount) ? amount.toString() : amount.toFixed(2);
  return `RM${n}/${unit === "hour" ? "hr" : "session"}`;
}

export function yesNo(t: Tristate, yes: string, no: string, unknown = "Not confirmed yet"): string {
  return t === "yes" ? yes : t === "no" ? no : unknown;
}

export type AmenityItem = {
  key: "parking" | Amenity;
  text: string;
  available: boolean;
  note?: string;
};

/** Amenities that have been checked, parking first, in display order. A "no" reads as "No showers". */
export function amenityList(a: Amenities): AmenityItem[] {
  const parking: AmenityItem[] = a.parking
    ? [
        {
          key: "parking",
          text: PARKING_LABEL[a.parking.value],
          available: a.parking.value !== "none",
          note: a.parking.note,
        },
      ]
    : [];
  return parking.concat(
    AMENITIES.flatMap((key) => {
      const entry = a[key];
      if (!entry) return [];
      const available = entry.value === "yes";
      const label = AMENITY_LABEL[key];
      const text = available ? label : `No ${label.toLowerCase()}`;
      return [{ key, text, available, note: entry.note }];
    }),
  );
}

/** Link target for a booking channel, or undefined when the channel happens in person. */
export function channelHref(c: Channel): string | undefined {
  if (c.url) return withRef(c.url);
  if (!c.number) return undefined;
  const digits = c.number.replace(/[^\d]/g, "");
  if (c.type === "whatsapp") return `https://wa.me/${digits}`;
  if (c.type === "phone") return `tel:+${digits}`;
  return undefined;
}

/**
 * Commercial booking platforms that read UTM tags, so they can see the bookings we send them.
 * Council and government portals are left out: unknown query params can break them.
 */
const REF_HOSTS = ["courtsite.my", "rezerv.co"];

/** Tags a link to a known booking platform with our referral; any other link is returned as-is. */
export function withRef(href: string): string {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return href;
  }
  const host = url.hostname.replace(/^www\./, "");
  if (!REF_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return href;
  if (!url.searchParams.has("utm_source")) {
    url.searchParams.set("utm_source", "tennis.irfanismail.com");
    url.searchParams.set("utm_medium", "referral");
  }
  return url.toString();
}

/** Host without "www.", for analytics labels. */
export function hostOf(href: string): string | undefined {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

/** Opens the venue's Google Maps place (with reviews and photos) when we have its link or Place ID. */
export function mapsUrl(loc: ResolvedLocation): string {
  if (loc.googleMaps) return loc.googleMaps;
  const place = loc.placeId ? `&query_place_id=${loc.placeId}` : "";
  return `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}${place}`;
}

export function directionsUrl(loc: ResolvedLocation): string {
  const place = loc.placeId ? `&destination_place_id=${loc.placeId}` : "";
  return `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}${place}`;
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}
