import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

// No Astro schema here: frontmatter is validated with valibot in src/lib/guides.ts
// so the whole repo uses one validation library.
export const collections = {
  guides: defineCollection({
    loader: glob({ pattern: "*.mdx", base: "./src/content/guides" }),
  }),
};
