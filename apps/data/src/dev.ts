// Rebuilds venues.json and the parquet views whenever venue YAML or guides change.
// Run through `tsx watch`, which also restarts this process when pipeline code changes.
// Data errors are printed and the watcher keeps going; the site keeps the last good build.
import { watch } from "node:fs";
import { relative } from "node:path";
import { pipelineOptions } from "./options";
import { runPipeline } from "./pipeline";

const opts = pipelineOptions();
const WATCHED = /\.(ya?ml|mdx?)$/;

let running = false;
let queued: string | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;

async function rebuild(reason: string) {
  if (running) {
    queued = reason;
    return;
  }
  running = true;
  const started = performance.now();
  try {
    // Fresh date each run so "needs re-checking" flags stay right in long sessions.
    const venues = await runPipeline({ ...opts, today: new Date() });
    const ms = Math.round(performance.now() - started);
    console.log(`[data] ✓ ${venues.length} venues rebuilt in ${ms}ms (${reason})`);
  } catch (err) {
    console.error(
      `[data] ✗ ${reason}\n${(err as Error).message}\n[data] Keeping the last good build. Fix the file and save again.`,
    );
  } finally {
    running = false;
    if (queued) {
      const next = queued;
      queued = null;
      void rebuild(next);
    }
  }
}

function onChange(dir: string) {
  return (_event: string, file: string | null) => {
    if (!file || !WATCHED.test(file)) return;
    clearTimeout(timer);
    // Editors often write a file in several steps; wait for them to settle.
    timer = setTimeout(() => void rebuild(relative(process.cwd(), `${dir}/${file}`)), 150);
  };
}

await rebuild("startup");
watch(opts.venuesDir, { recursive: true }, onChange(opts.venuesDir));
if (opts.guidesDir) watch(opts.guidesDir, { recursive: true }, onChange(opts.guidesDir));
console.log("[data] Watching venues/ and site guides for changes");
