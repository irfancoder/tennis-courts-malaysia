// Guards against StyleX output going missing from the build, which fails silently
// (pages render unstyled). Every page must link a stylesheet that contains StyleX rules.
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const dist = new URL("../dist/", import.meta.url).pathname;
const files = (await readdir(dist, { recursive: true })).filter((f) => f.endsWith(".html"));
const cssHasStylex = new Map();
const problems = [];

for (const file of files) {
  const html = await readFile(join(dist, file), "utf8");
  const hrefs = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1]);
  let ok = false;
  for (const href of hrefs) {
    if (!cssHasStylex.has(href)) {
      const css = await readFile(join(dist, href), "utf8").catch(() => "");
      cssHasStylex.set(href, css.includes(":not(#\\#)"));
    }
    ok ||= cssHasStylex.get(href);
  }
  if (!ok) problems.push(file);
}

if (problems.length) {
  console.error(`✗ ${problems.length} page(s) have no StyleX CSS:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`✓ StyleX CSS linked on all ${files.length} pages`);
