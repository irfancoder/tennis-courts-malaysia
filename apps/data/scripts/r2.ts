// Thin wrapper over `wrangler r2 object put`, so uploads use the same Cloudflare login as deploys.
import { spawn } from "node:child_process";

export const BUCKET = process.env.R2_BUCKET ?? "tennis-data";

export type Upload = {
  key: string;
  file: string;
  contentType: string;
  cacheControl: string;
  bucket?: string;
};

function put(u: Upload): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      "wrangler",
      "r2",
      "object",
      "put",
      `${u.bucket ?? BUCKET}/${u.key}`,
      "--file",
      u.file,
      "--content-type",
      u.contentType,
      "--cache-control",
      u.cacheControl,
      "--remote",
    ];
    const child = spawn("pnpm", ["-s", "--filter", "@tennis/site", "exec", ...args], {
      stdio: ["ignore", "ignore", "pipe"],
    });
    let err = "";
    child.stderr.on("data", (d) => {
      err += d;
    });
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`${u.key}: ${err.trim()}`)),
    );
  });
}

export async function uploadAll(uploads: Upload[], concurrency = 8): Promise<void> {
  let next = 0;
  let done = 0;
  const worker = async () => {
    while (next < uploads.length) {
      const u = uploads[next++];
      if (!u) break;
      await put(u);
      done++;
      if (done % 50 === 0 || done === uploads.length) console.log(`  ${done}/${uploads.length}`);
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
}

export async function exists(key: string): Promise<boolean> {
  const base = process.env.PUBLIC_DATA_BASE ?? "https://data.tennis.irfanismail.com";
  const res = await fetch(`${base}/${key}`, { method: "HEAD" });
  return res.ok;
}
