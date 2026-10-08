import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { type Upload, uploadAll } from "./r2";

const assetsDir = process.env.ASSETS_DIR;
const tilesFile = process.env.TILES_FILE;
if (!assetsDir || !tilesFile) throw new Error("Set ASSETS_DIR and TILES_FILE");

const DAY = 86_400;
const uploads: Upload[] = [];
for (const sub of ["fonts", "sprites/v4"]) {
  const root = join(assetsDir, sub);
  for (const f of await readdir(root, { recursive: true })) {
    if (!/\.(pbf|json|png)$/.test(f)) continue;
    uploads.push({
      key: `basemaps-assets/${relative(assetsDir, join(root, f))}`,
      file: join(root, f),
      contentType: f.endsWith(".pbf")
        ? "application/x-protobuf"
        : f.endsWith(".json")
          ? "application/json"
          : "image/png",
      cacheControl: `public, max-age=${30 * DAY}`,
    });
  }
}
console.log(`Uploading ${uploads.length} font/sprite files`);
await uploadAll(uploads, 16);
if (process.env.SKIP_TILES !== "1") {
  console.log("Uploading tiles (this is the big one)");
  await uploadAll([
    {
      key: "tiles/malaysia.pmtiles",
      file: tilesFile,
      contentType: "application/vnd.pmtiles",
      cacheControl: `public, max-age=${7 * DAY}`,
    },
  ]);
}
console.log("✓ basemap published");
