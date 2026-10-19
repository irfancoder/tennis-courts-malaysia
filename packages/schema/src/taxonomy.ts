// User-facing labels and explanations for every enum in the venue schema.
// The site, data pipeline and Worker all read copy from here so wording stays consistent.

export const ACCESS_TYPES = [
  "open_online",
  "open_walkin",
  "open_message",
  "open_premium",
  "guest_of_member",
  "reciprocal",
  "membership",
  "hotel_guest",
  "institution",
  "residents_only",
] as const;
export type AccessType = (typeof ACCESS_TYPES)[number];

export type AccessGroup = "open" | "premium" | "members" | "guests" | "restricted";

export const ACCESS: Record<
  AccessType,
  { label: string; group: AccessGroup; short: string; howToGetIn: string }
> = {
  open_online: {
    label: "Open – book online",
    group: "open",
    short: "Anyone can book through an app or booking portal.",
    howToGetIn: "Book a slot online, then show your booking at the counter if asked.",
  },
  open_walkin: {
    label: "Open – walk-in",
    group: "open",
    short: "Anyone can turn up and pay at the counter, first come first served.",
    howToGetIn: "Go to the counter during opening hours and pay for a court.",
  },
  open_message: {
    label: "Open – book by WhatsApp/phone",
    group: "open",
    short: "Anyone can book by messaging or calling the operator.",
    howToGetIn:
      "Message or call to reserve a slot. A local (+60) number helps but is not always needed.",
  },
  open_premium: {
    label: "Open – premium",
    group: "premium",
    short: "Privately run and open to anyone, usually at a higher price.",
    howToGetIn: "Book directly with the operator.",
  },
  guest_of_member: {
    label: "Guest of a member",
    group: "members",
    short: "A member must sign you in and usually pays a guest fee.",
    howToGetIn: "Play with a member who signs you in at reception.",
  },
  reciprocal: {
    label: "Reciprocal clubs",
    group: "members",
    short: "Open to members of affiliated clubs, usually without bringing guests.",
    howToGetIn: "Bring a reciprocal introduction letter and membership card from your home club.",
  },
  membership: {
    label: "Membership required",
    group: "members",
    short: "Only members can book. Some clubs sell short-term or non-resident memberships.",
    howToGetIn: "Join the club, or ask about short-term membership.",
  },
  hotel_guest: {
    label: "Hotel guests",
    group: "guests",
    short: "Mainly for hotel guests. Some hotels let non-guests book for a fee.",
    howToGetIn: "Stay at the hotel, or contact the hotel to ask whether non-guests can book.",
  },
  institution: {
    label: "University / school",
    group: "restricted",
    short: "For students and staff, sometimes with public booking windows.",
    howToGetIn: "Check whether the institution opens bookings to the public.",
  },
  residents_only: {
    label: "Residents & invited guests only",
    group: "restricted",
    short: "Private residential courts. Only residents and the guests they invite can play.",
    howToGetIn:
      "You can only play here if a resident invites you and books the court. Access is subject to building rules.",
  },
};

/** Hex colours per access group, for map pins. Keep in sync with `access` in apps/site tokens.stylex.ts. */
export const ACCESS_GROUP_COLOR: Record<AccessGroup, string> = {
  open: "#1E7A4C",
  premium: "#1F4C78",
  members: "#9A5B00",
  guests: "#6A4C9C",
  restricted: "#8C3B3B",
};

export const OPEN_ACCESS_TYPES: readonly AccessType[] = ACCESS_TYPES.filter(
  (t) => ACCESS[t].group === "open" || ACCESS[t].group === "premium",
);

export const STATUSES = [
  "open",
  "temp_closed",
  "renovating",
  "converted_pickleball",
  "closed",
] as const;
export type Status = (typeof STATUSES)[number];
export const STATUS_LABEL: Record<Status, string> = {
  open: "Open",
  temp_closed: "Temporarily closed",
  renovating: "Under renovation",
  converted_pickleball: "Converted to pickleball",
  closed: "Permanently closed",
};

export const CATEGORIES = [
  "federal",
  "council",
  "club",
  "hotel",
  "university",
  "school",
  "condo",
  "commercial",
  "academy",
] as const;
export type Category = (typeof CATEGORIES)[number];
export const CATEGORY_LABEL: Record<Category, string> = {
  federal: "National / federal venue",
  council: "Local council court",
  club: "Private club",
  hotel: "Hotel / resort",
  university: "University",
  school: "School",
  condo: "Condominium",
  commercial: "Commercial centre",
  academy: "Tennis academy",
};

export const SURFACES = ["hard", "artificial_grass", "clay", "carpet", "other"] as const;
export type Surface = (typeof SURFACES)[number];
export const SURFACE_LABEL: Record<Surface, string> = {
  hard: "Hard court",
  artificial_grass: "Artificial grass",
  clay: "Clay",
  carpet: "Carpet",
  other: "Other",
};

export const CHANNELS = [
  "portal",
  "app",
  "whatsapp",
  "phone",
  "counter",
  "walkin",
  "resident",
] as const;
export type Channel = (typeof CHANNELS)[number];
export const CHANNEL_LABEL: Record<Channel, string> = {
  portal: "Book online",
  app: "Book in app",
  whatsapp: "WhatsApp",
  phone: "Call",
  counter: "At the counter",
  walkin: "Walk in",
  resident: "Booked by a resident",
};

export const PAYMENTS = ["cash", "fpx", "tng", "duitnow", "card"] as const;
export type Payment = (typeof PAYMENTS)[number];
export const PAYMENT_LABEL: Record<Payment, string> = {
  cash: "Cash",
  fpx: "FPX online banking",
  tng: "Touch 'n Go eWallet",
  duitnow: "DuitNow QR",
  card: "Credit/debit card",
};

export const TRISTATES = ["yes", "no", "unknown"] as const;
export type Tristate = (typeof TRISTATES)[number];

export const YES_NO = ["yes", "no"] as const;

export const PARKING = ["free", "paid", "both", "none"] as const;
export type Parking = (typeof PARKING)[number];
export const PARKING_LABEL: Record<Parking, string> = {
  free: "Free parking",
  paid: "Paid parking",
  both: "Free and paid parking",
  none: "No parking",
};

/** In display order. Labels are plural nouns so "No …" reads naturally. */
export const AMENITIES = [
  "toilet",
  "shower",
  "surau",
  "waterFountain",
  "vendingMachine",
  "convenienceStore",
  "seating",
  "tennisWall",
  "ballMachine",
  "racquetRental",
] as const;
export type Amenity = (typeof AMENITIES)[number];
export const AMENITY_LABEL: Record<Amenity, string> = {
  toilet: "Toilets & changing rooms",
  shower: "Showers",
  surau: "Surau",
  waterFountain: "Water fountain",
  vendingMachine: "Drinks vending machine",
  convenienceStore: "Convenience store",
  seating: "Seating & shade",
  tennisWall: "Tennis wall",
  ballMachine: "Ball machine for rent",
  racquetRental: "Racquets for rent",
};

export const VERIFICATION_SOURCES = [
  "visited",
  "called",
  "official_site",
  "user_report",
  "desk_research",
] as const;
export type VerificationSource = (typeof VERIFICATION_SOURCES)[number];
export const VERIFICATION_LABEL: Record<VerificationSource, string> = {
  visited: "Visited in person",
  called: "Confirmed with the venue",
  official_site: "Official website",
  user_report: "Player report (unconfirmed)",
  desk_research: "Desk research (unconfirmed)",
};

export const STATES = {
  johor: "Johor",
  kedah: "Kedah",
  kelantan: "Kelantan",
  "kuala-lumpur": "Kuala Lumpur",
  labuan: "Labuan",
  melaka: "Melaka",
  "negeri-sembilan": "Negeri Sembilan",
  pahang: "Pahang",
  penang: "Penang",
  perak: "Perak",
  perlis: "Perlis",
  putrajaya: "Putrajaya",
  sabah: "Sabah",
  sarawak: "Sarawak",
  selangor: "Selangor",
  terengganu: "Terengganu",
} as const;
export type StateSlug = keyof typeof STATES;
export const STATE_SLUGS = Object.keys(STATES) as StateSlug[];

export const REGIONS = {
  "klang-valley": "Klang Valley",
  penang: "Penang",
  langkawi: "Langkawi",
  "johor-bahru": "Johor Bahru",
  "kota-kinabalu": "Kota Kinabalu",
  other: "Rest of Malaysia",
} as const;
export type Region = keyof typeof REGIONS;
