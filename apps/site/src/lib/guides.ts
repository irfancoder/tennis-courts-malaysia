import { type CollectionEntry, getCollection } from "astro:content";
import { type GuideFrontmatter, GuideFrontmatterSchema } from "@tennis/schema";
import * as v from "valibot";

export type Guide = {
  id: string;
  url: string;
  data: GuideFrontmatter;
  entry: CollectionEntry<"guides">;
};

let cache: Guide[] | undefined;

export async function getGuides(): Promise<Guide[]> {
  if (cache) return cache;
  const entries = await getCollection("guides");
  cache = entries
    .map((entry) => {
      const result = v.safeParse(GuideFrontmatterSchema, entry.data);
      if (!result.success) {
        const issues = result.issues.map((i) => `${v.getDotPath(i) ?? "(root)"}: ${i.message}`);
        throw new Error(`Guide "${entry.id}" has invalid frontmatter:\n  ${issues.join("\n  ")}`);
      }
      return { id: entry.id, url: `/guides/${entry.id}/`, data: result.output, entry };
    })
    .filter((g) => !g.data.draft || import.meta.env.DEV)
    .sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
  return cache;
}

export async function getGuideMap(): Promise<Map<string, Guide>> {
  return new Map((await getGuides()).map((g) => [g.id, g]));
}
