import { ACCESS, type AccessGroup, type SiteVenue } from "@tennis/schema";

const SECTIONS: { id: string; title: string; groups: AccessGroup[] }[] = [
  { id: "open", title: "Open to anyone", groups: ["open", "premium"] },
  { id: "members", title: "Members and their guests", groups: ["members"] },
  { id: "hotels", title: "Hotel courts", groups: ["guests"] },
  { id: "restricted", title: "Residents, students and staff", groups: ["restricted"] },
];

/** Splits venues into the sections hub pages show, skipping empty ones. */
export function groupByAccess(venues: SiteVenue[]) {
  return SECTIONS.map((section) => ({
    ...section,
    venues: venues.filter((v) => section.groups.includes(ACCESS[v.access.type].group)),
  })).filter((section) => section.venues.length > 0);
}

export function isOpen(v: SiteVenue): boolean {
  const group = ACCESS[v.access.type].group;
  return group === "open" || group === "premium";
}

export function cheapestOpen(venues: SiteVenue[]): SiteVenue | undefined {
  return venues
    .filter((v) => isOpen(v) && v.status.value === "open" && v.pricing.day !== undefined)
    .sort((a, b) => (a.pricing.day ?? 0) - (b.pricing.day ?? 0))[0];
}
