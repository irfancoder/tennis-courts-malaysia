import { pipelineOptions } from "./options";
import { runPipeline } from "./pipeline";

try {
  const venues = await runPipeline(pipelineOptions());
  const stale = venues.filter((v) => v.isStale).length;
  console.log(`✓ ${venues.length} venues → dist/site/venues.json + dist/parquet (${stale} stale)`);
} catch (err) {
  const message = (err as Error).message;
  console.error(message);
  if (process.env.GITHUB_ACTIONS) {
    // Surface each data problem as an annotation on the YAML file in the PR.
    for (const m of message.matchAll(/^ {2}venues\/(\S+): (.+)$/gm)) {
      console.log(`::error file=apps/data/venues/${m[1]}::${m[2]}`);
    }
  }
  process.exit(1);
}
