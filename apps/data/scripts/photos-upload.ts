// Uploads venue photos to the tennis-media R2 bucket.
// Put files in apps/data/photos/<venue-slug>/, then reference them in the venue YAML as
//   photos: [{ key: venues/<venue-slug>/<file>, alt: "...", consent: true }]
// Files already on R2 are skipped. Photos must not show identifiable people without consent.
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { type Upload, uploadAll } from "./r2";

const root = fileURLToPath(new URL("../photos/", import.meta.url));
const media = process.env.PUBLIC_MEDIA_BASE ?? "https://media.tennis.irfanismail.com";
const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

if (!existsSync(root)) {
  console.log("No apps/data/photos folder yet. Nothing to upload.");
  process.exit(0);
}

const pending: Upload[] = [];
for (const f of await readdir(root, { recursive: true })) {
  const ext = f.split(".").pop()?.toLowerCase() ?? "";
  if (!TYPES[ext]) continue;
  const key = `venues/${f.replaceAll("\\", "/")}`;
  if ((await fetch(`${media}/${key}`, { method: "HEAD" })).ok) continue;
  pending.push({
    key,
    file: join(root, f),
    contentType: TYPES[ext],
    cacheControl: "public, max-age=31536000, immutable",
  });
}
console.log(`Uploading ${pending.length} photo(s)`);
await uploadAll(
  pending.map((u) => ({ ...u, bucket: "tennis-media" })),
  4,
);
console.log("✓ photos uploaded");
