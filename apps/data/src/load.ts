import { readdir, readFile } from "node:fs/promises";
import { basename, dirname, join, relative } from "node:path";
import { parse } from "yaml";

export type RawVenueFile = {
  /** Path relative to the venues root, used in error messages. */
  file: string;
  /** Directory name, which must match location.state. */
  stateDir: string;
  /** Filename without extension; becomes the URL slug. */
  slug: string;
  data: unknown;
};

export async function loadVenueFiles(root: string): Promise<RawVenueFile[]> {
  const entries = await readdir(root, { recursive: true });
  const files = entries.filter((f) => f.endsWith(".yaml") || f.endsWith(".yml")).sort();
  return Promise.all(
    files.map(async (f) => {
      const abs = join(root, f);
      const text = await readFile(abs, "utf8");
      return {
        file: relative(root, abs),
        stateDir: basename(dirname(abs)),
        slug: basename(f).replace(/\.ya?ml$/, ""),
        data: parse(text),
      };
    }),
  );
}
