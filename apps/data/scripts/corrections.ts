// Review helper for submissions sent from /suggest/.
//   pnpm --filter @tennis/data corrections            list pending
//   pnpm --filter @tennis/data corrections applied 12 mark #12 as applied
//   pnpm --filter @tennis/data corrections rejected 12
import { execFileSync } from "node:child_process";

const [action, id] = process.argv.slice(2);
const local = process.env.LOCAL === "1" ? "--local" : "--remote";

function d1(sql: string): Record<string, unknown>[] {
  const out = execFileSync(
    "pnpm",
    [
      "-s",
      "--filter",
      "@tennis/site",
      "exec",
      "wrangler",
      "d1",
      "execute",
      "tennis-submissions",
      local,
      "--json",
      "--command",
      sql,
    ],
    { encoding: "utf8" },
  );
  return (JSON.parse(out) as { results: Record<string, unknown>[] }[])[0]?.results ?? [];
}

if (action === "applied" || action === "rejected") {
  if (!id || !/^\d+$/.test(id)) throw new Error("Give a numeric submission id");
  d1(
    `UPDATE submissions SET status = '${action}', reviewed_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = ${id}`,
  );
  console.log(`✓ #${id} marked ${action}`);
} else {
  const rows = d1(
    "SELECT id, kind, venue_slug, venue_name, message, source, contact, created_at FROM submissions WHERE status = 'pending' ORDER BY created_at",
  );
  if (rows.length === 0) console.log("No pending submissions.");
  for (const r of rows) {
    console.log(`\n#${r.id} ${r.kind === "new" ? "NEW COURT" : "EDIT"} · ${r.created_at}`);
    if (r.venue_slug)
      console.log(`  venue:   ${r.venue_slug} (apps/data/venues/*/${r.venue_slug}.yaml)`);
    if (r.venue_name) console.log(`  name:    ${r.venue_name}`);
    console.log(`  message: ${String(r.message).replaceAll("\n", "\n           ")}`);
    if (r.source) console.log(`  source:  ${r.source}`);
    if (r.contact) console.log(`  contact: ${r.contact}`);
  }
}
