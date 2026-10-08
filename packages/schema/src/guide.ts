import * as v from "valibot";

export const GUIDE_KINDS = ["booking-system", "access", "traveller"] as const;

/** Frontmatter for MDX guides in apps/site/src/content/guides. */
export const GuideFrontmatterSchema = v.strictObject({
  title: v.pipe(v.string(), v.minLength(1)),
  description: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  kind: v.picklist(GUIDE_KINDS),
  // YAML frontmatter turns 2026-10-07 into a Date; normalise either form to an ISO date string.
  updated: v.union([
    v.pipe(v.string(), v.isoDate()),
    v.pipe(
      v.date(),
      v.transform((d) => d.toISOString().slice(0, 10)),
    ),
  ]),
  draft: v.optional(v.boolean(), false),
  order: v.optional(v.number(), 100),
});

export type GuideFrontmatter = v.InferOutput<typeof GuideFrontmatterSchema>;
