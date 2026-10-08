// Client-only: boots DuckDB-wasm and registers the parquet views listed in the R2 manifest.
import type { ParquetManifest } from "@tennis/schema";

type Duck = typeof import("@duckdb/duckdb-wasm");
export type Conn = Awaited<ReturnType<InstanceType<Duck["AsyncDuckDB"]>["connect"]>>;

export type Stage = "engine" | "data";

let ready: Promise<Conn> | undefined;

// Generous: the engine is a ~7 MB download on first visit, often over mobile data.
const ENGINE_TIMEOUT_MS = 60_000;

export function connect(dataBase: string, onStage?: (stage: Stage) => void): Promise<Conn> {
  ready ??= boot(dataBase, onStage).catch((err: unknown) => {
    // Let a later call (e.g. a "Try again" click) start over instead of reusing the failure.
    ready = undefined;
    console.error("[explore] live filters failed to load", err);
    throw err;
  });
  return ready;
}

async function boot(dataBase: string, onStage?: (stage: Stage) => void): Promise<Conn> {
  onStage?.("engine");
  const duckdb = await import("@duckdb/duckdb-wasm");
  // The wasm builds are ~34 MB, over the Workers static-asset limit, so they load from jsDelivr.
  const bundle = await duckdb.selectBundle(duckdb.getJsDelivrBundles());
  if (!bundle.mainWorker) throw new Error("No DuckDB worker bundle for this browser");
  const workerUrl = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker}");`], { type: "text/javascript" }),
  );
  const worker = new Worker(workerUrl);
  const db = new duckdb.AsyncDuckDB(new duckdb.VoidLogger(), worker);

  // DuckDB never rejects if its worker fails to load (blocked CDN, offline, filtered network);
  // instantiate() just waits forever. Race it against the worker's error event and a timeout.
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      db.instantiate(bundle.mainModule, bundle.pthreadWorker),
      new Promise<never>((_, reject) => {
        worker.addEventListener("error", () =>
          reject(new Error("the search engine couldn't be downloaded from cdn.jsdelivr.net")),
        );
        timer = setTimeout(
          () => reject(new Error("the search engine took too long to download")),
          ENGINE_TIMEOUT_MS,
        );
      }),
    ]);
  } catch (err) {
    worker.terminate();
    throw err;
  } finally {
    clearTimeout(timer);
    URL.revokeObjectURL(workerUrl);
  }

  onStage?.("data");
  const manifestRes = await fetch(`${dataBase}/manifest.json`, { cache: "no-cache" });
  if (!manifestRes.ok) throw new Error(`court data index returned HTTP ${manifestRes.status}`);
  const manifest = (await manifestRes.json()) as ParquetManifest;
  // Views are a few KB, so fetch them whole instead of relying on HTTP range requests.
  await Promise.all(
    Object.entries(manifest.views).map(async ([name, view]) => {
      const res = await fetch(`${dataBase}/${view.path}`);
      if (!res.ok) throw new Error(`court data (${name}) returned HTTP ${res.status}`);
      await db.registerFileBuffer(`${name}.parquet`, new Uint8Array(await res.arrayBuffer()));
    }),
  );
  const conn = await db.connect();
  for (const name of Object.keys(manifest.views)) {
    await conn.query(`CREATE VIEW ${name} AS SELECT * FROM '${name}.parquet'`);
  }
  return conn;
}

/** Runs a parameterised query and returns plain objects. */
export async function rows<T>(conn: Conn, sql: string, params: unknown[] = []): Promise<T[]> {
  const stmt = await conn.prepare(sql);
  try {
    const table = await stmt.query(...params);
    return table.toArray().map((r) => {
      const obj = r.toJSON() as Record<string, unknown>;
      for (const [k, v] of Object.entries(obj)) {
        if (v && typeof v === "object" && "toArray" in v)
          obj[k] = Array.from((v as { toArray(): unknown[] }).toArray());
        if (typeof v === "bigint") obj[k] = Number(v);
      }
      return obj as T;
    });
  } finally {
    await stmt.close();
  }
}
