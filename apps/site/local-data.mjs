// Dev only: serves apps/data/dist/parquet at /data/ so /explore uses your local edits
// instead of the published data on R2 (map tiles still come from R2), and reloads open
// pages whenever the data watcher writes a new venues.json.
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../data/dist/parquet/", import.meta.url));
const venuesJson = fileURLToPath(new URL("../data/dist/site/venues.json", import.meta.url));
const TYPES = { ".json": "application/json", ".parquet": "application/vnd.apache.parquet" };

/** @returns {import("vite").Plugin} */
export function localData() {
  return {
    name: "tennis-local-data",
    apply: "serve",
    configureServer(server) {
      server.watcher.add(venuesJson);
      server.watcher.on("change", (file) => {
        if (file !== venuesJson) return;
        // Drop cached page modules that imported the old data, then refresh the browser.
        server.moduleGraph.invalidateAll();
        server.ws.send({ type: "full-reload" });
        server.config.logger.info("[data] venues.json changed, reloading pages", {
          timestamp: true,
        });
      });
      server.middlewares.use("/data", (req, res, next) => {
        const rel = normalize(decodeURIComponent((req.url ?? "/").split("?")[0] ?? "/")).replace(
          /^(\.\.[/\\])+/,
          "",
        );
        const file = join(root, rel);
        if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) return next();
        res.setHeader("content-type", TYPES[extname(file)] ?? "application/octet-stream");
        res.setHeader("cache-control", "no-store");
        createReadStream(file).pipe(res);
      });
    },
  };
}
