import type { BookingChannel as Channel, ResolvedLocation, Tristate } from "@tennis/schema";

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

/** Link target for a booking channel, or undefined when the channel happens in person. */
export function channelHref(c: Channel): string | undefined {
  if (c.url) return c.url;
  if (!c.number) return undefined;
  const digits = c.number.replace(/[^\d]/g, "");
  if (c.type === "whatsapp") return `https://wa.me/${digits}`;
  if (c.type === "phone") return `tel:+${digits}`;
  return undefined;
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
