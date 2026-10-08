import { fileURLToPath } from "node:url";
import type { PipelineOptions } from "./pipeline";

const root = fileURLToPath(new URL("..", import.meta.url));

/** Paths and flags shared by the one-off build and the dev watcher. */
export function pipelineOptions(): PipelineOptions {
  return {
    venuesDir: `${root}venues`,
    guidesDir: `${root}../site/src/content/guides`,
    outDir: `${root}dist`,
    geoCacheFile: `${root}geo-cache.json`,
    offline: process.env.GEO_OFFLINE === "1",
    today: process.env.BUILD_DATE ? new Date(process.env.BUILD_DATE) : new Date(),
  };
}
