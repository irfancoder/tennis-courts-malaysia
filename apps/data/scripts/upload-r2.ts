// Publishes the parquet views to R2. Content-hashed files are immutable and skipped if already
// uploaded; manifest.json is uploaded last with a short cache so clients pick up new views quickly.
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { ParquetManifest } from "@tennis/schema";
import { exists, uploadAll } from "./r2";

const dir = fileURLToPath(new URL("../dist/parquet/", import.meta.url));
const manifest = JSON.parse(await readFile(`${dir}manifest.json`, "utf8")) as ParquetManifest;

const pending = [];
for (const view of Object.values(manifest.views)) {
  if (await exists(view.path)) continue;
  pending.push({
    key: view.path,
    file: `${dir}${view.path}`,
    contentType: "application/vnd.apache.parquet",
    cacheControl: "public, max-age=31536000, immutable",
  });
}
console.log(`Uploading ${pending.length} new parquet file(s)`);
await uploadAll(pending);
await uploadAll([
  {
    key: "manifest.json",
    file: `${dir}manifest.json`,
    contentType: "application/json",
    cacheControl: "public, max-age=60",
  },
]);
console.log("✓ manifest.json published");
