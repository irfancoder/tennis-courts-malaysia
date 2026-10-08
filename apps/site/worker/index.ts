import { EmailMessage } from "cloudflare:email";
import { type Submission, SubmissionSchema } from "@tennis/schema";
import { createMimeMessage } from "mimetext";
import * as v from "valibot";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  SUBMIT_LIMITER: RateLimit;
  NOTIFY: SendEmail;
  TURNSTILE_SECRET: string;
  NOTIFY_FROM: string;
  NOTIFY_TO: string;
}

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "cache-control": "no-store" } });

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/submit") {
      if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
      return handleSubmit(request, env, ctx);
    }
    if (url.pathname.startsWith("/api/")) return json({ error: "not_found" }, 404);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

async function handleSubmit(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const parsed = v.safeParse(SubmissionSchema, body);
  if (!parsed.success) {
    const issues = parsed.issues.map((i) => ({ field: v.getDotPath(i), message: i.message }));
    return json({ error: "invalid", issues }, 400);
  }
  const sub = parsed.output;

  const { success: underLimit } = await env.SUBMIT_LIMITER.limit({ key: ip });
  if (!underLimit)
    return json(
      { error: "rate_limited", message: "Too many submissions. Try again in a minute." },
      429,
    );

  if (!(await verifyTurnstile(sub.turnstileToken, ip, env.TURNSTILE_SECRET))) {
    return json(
      {
        error: "verification_failed",
        message: "Verification failed. Reload the page and try again.",
      },
      403,
    );
  }

  const ipHash = await sha256(`${ip}|tennis-submissions`);
  const row = await env.DB.prepare(
    `INSERT INTO submissions (kind, venue_slug, venue_name, message, source, contact, ip_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`,
  )
    .bind(
      sub.kind,
      sub.venueSlug ?? null,
      sub.venueName ?? null,
      sub.message,
      sub.source ?? null,
      sub.contact ?? null,
      ipHash.slice(0, 16),
    )
    .first<{ id: number }>();

  // Email is a convenience; a failure here must not lose the submission.
  ctx.waitUntil(notify(env, sub, row?.id).catch((e) => console.error("notify failed", e)));
  return json({ ok: true, id: row?.id });
}

async function verifyTurnstile(token: string, ip: string, secret: string): Promise<boolean> {
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  form.append("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });
  const outcome = (await res.json()) as { success: boolean };
  return outcome.success === true;
}

async function notify(env: Env, sub: Submission, id: number | undefined): Promise<void> {
  const what =
    sub.kind === "new"
      ? `New court: ${sub.venueName ?? "(no name)"}`
      : `Edit: ${sub.venueSlug ?? sub.venueName ?? "(no venue)"}`;
  const msg = createMimeMessage();
  msg.setSender({ name: "Tennis Courts Malaysia", addr: env.NOTIFY_FROM });
  msg.setRecipient(env.NOTIFY_TO);
  msg.setSubject(`[courts] ${what}`);
  msg.addMessage({
    contentType: "text/plain",
    data: [
      `Submission #${id ?? "?"} (${sub.kind})`,
      sub.venueSlug
        ? `Venue: https://tennis.irfanismail.com/explore/?q=${encodeURIComponent(sub.venueSlug)}`
        : "",
      sub.venueName ? `Name: ${sub.venueName}` : "",
      "",
      sub.message,
      "",
      sub.source ? `Source: ${sub.source}` : "",
      sub.contact ? `Contact: ${sub.contact}` : "",
      "",
      "Review with: pnpm --filter @tennis/data corrections",
    ]
      .filter((line, i, all) => line !== "" || all[i - 1] !== "")
      .join("\n"),
  });
  await env.NOTIFY.send(new EmailMessage(env.NOTIFY_FROM, env.NOTIFY_TO, msg.asRaw()));
}

async function sha256(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
