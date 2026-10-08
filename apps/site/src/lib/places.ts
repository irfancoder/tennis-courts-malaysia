import type { SiteVenue } from "@tennis/schema";

// Places visitors are likely to stay near, for "sort by distance". Approximate centres.
const AREAS: { label: string; lat: number; lng: number }[] = [
  { label: "KLCC, Kuala Lumpur", lat: 3.1579, lng: 101.7123 },
  { label: "Bukit Bintang, Kuala Lumpur", lat: 3.1466, lng: 101.7101 },
  { label: "Mont Kiara, Kuala Lumpur", lat: 3.17, lng: 101.651 },
  { label: "Bangsar, Kuala Lumpur", lat: 3.13, lng: 101.678 },
  { label: "Cheras, Kuala Lumpur", lat: 3.087, lng: 101.744 },
  { label: "Ampang", lat: 3.15, lng: 101.76 },
  { label: "Petaling Jaya", lat: 3.1073, lng: 101.6067 },
  { label: "Subang Jaya", lat: 3.0565, lng: 101.5851 },
  { label: "Puchong", lat: 3.03, lng: 101.617 },
  { label: "Shah Alam", lat: 3.0733, lng: 101.5185 },
  { label: "Putrajaya", lat: 2.9264, lng: 101.6964 },
  { label: "Cyberjaya", lat: 2.9213, lng: 101.6559 },
  { label: "George Town, Penang", lat: 5.4141, lng: 100.3288 },
  { label: "Batu Ferringhi, Penang", lat: 5.4721, lng: 100.2486 },
  { label: "Bayan Lepas, Penang", lat: 5.2945, lng: 100.2593 },
  { label: "Pantai Cenang, Langkawi", lat: 6.2914, lng: 99.7287 },
  { label: "Kuah, Langkawi", lat: 6.32, lng: 99.843 },
  { label: "Johor Bahru", lat: 1.4927, lng: 103.7414 },
  { label: "Iskandar Puteri", lat: 1.426, lng: 103.635 },
  { label: "Kota Kinabalu", lat: 5.9804, lng: 116.0735 },
  { label: "Seremban", lat: 2.7297, lng: 101.9381 },
  { label: "Ipoh", lat: 4.5975, lng: 101.0901 },
  { label: "Melaka", lat: 2.1896, lng: 102.2501 },
  { label: "Kuching", lat: 1.5535, lng: 110.3593 },
];

/** Curated areas plus the centre of every city that has courts, sorted by name. */
export function getPlaces(venues: SiteVenue[]) {
  const byLabel = new Map(AREAS.map((a) => [a.label, a]));
  const cities = new Map<string, SiteVenue[]>();
  for (const v of venues) {
    const list = cities.get(v.location.city) ?? [];
    list.push(v);
    cities.set(v.location.city, list);
  }
  for (const [city, list] of cities) {
    if ([...byLabel.keys()].some((l) => l.startsWith(city))) continue;
    byLabel.set(city, {
      label: city,
      lat: list.reduce((n, v) => n + v.location.lat, 0) / list.length,
      lng: list.reduce((n, v) => n + v.location.lng, 0) / list.length,
    });
  }
  return [...byLabel.values()].sort((a, b) => a.label.localeCompare(b.label));
}
