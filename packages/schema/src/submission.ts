import * as v from "valibot";

/** Payload accepted by POST /api/submit (corrections and new-court suggestions). */
export const SubmissionSchema = v.strictObject({
  kind: v.picklist(["edit", "new"]),
  venueSlug: v.optional(v.pipe(v.string(), v.regex(/^[a-z0-9-]+$/), v.maxLength(120))),
  venueName: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(200))),
  message: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(10, "Tell us a bit more (10+ characters)"),
    v.maxLength(4000),
  ),
  source: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(500))),
  contact: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(200))),
  turnstileToken: v.pipe(v.string(), v.minLength(1, "Please complete the verification")),
});

export type Submission = v.InferOutput<typeof SubmissionSchema>;
