import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "preact/hooks";
import { s as ex } from "../explore/explore.styles";
import { s } from "./suggest.styles";

type Props = {
  venues: { slug: string; name: string }[];
  siteKey: string;
};

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export default function SuggestForm({ venues, siteKey }: Props) {
  const [kind, setKind] = useState<"edit" | "new">("edit");
  const [venueSlug, setVenueSlug] = useState("");
  const [venueName, setVenueName] = useState("");
  const [message, setMessage] = useState("");
  const [source, setSource] = useState("");
  const [contact, setContact] = useState("");
  const [token, setToken] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const widget = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string>();

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    if (p.get("kind") === "new") setKind("new");
    const v = p.get("venue");
    if (v && venues.some((x) => x.slug === v)) setVenueSlug(v);
  }, [venues]);

  useEffect(() => {
    const render = () => {
      if (!widget.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(widget.current, {
        sitekey: siteKey,
        callback: (t: string) => setToken(t),
        "expired-callback": () => setToken(""),
      });
    };
    if (window.turnstile) return render();
    const script = document.createElement("script");
    script.src = TURNSTILE_SRC;
    script.async = true;
    script.onload = render;
    document.head.append(script);
  }, [siteKey]);

  async function submit(e: Event) {
    e.preventDefault();
    setError(null);
    if (!token) return setError("Please complete the verification check first.");
    setState("sending");
    const body = {
      kind,
      venueSlug: kind === "edit" && venueSlug ? venueSlug : undefined,
      venueName: kind === "new" ? venueName : venues.find((v) => v.slug === venueSlug)?.name,
      message,
      source: source || undefined,
      contact: contact || undefined,
      turnstileToken: token,
    };
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { message?: string; issues?: { message: string }[] };
      if (!res.ok) {
        setState("idle");
        setToken("");
        window.turnstile?.reset(widgetId.current);
        return setError(
          data.issues?.map((i) => i.message).join(". ") ??
            data.message ??
            "Something went wrong. Try again.",
        );
      }
      setState("sent");
    } catch {
      setState("idle");
      setError("Couldn't send. Check your connection and try again.");
    }
  }

  if (state === "sent") {
    return (
      <div {...stylex.props(s.done)} role="status">
        <p {...stylex.props(s.doneTitle)}>Thanks, suggestion sent.</p>
        <p>Irfan checks every suggestion before changing the site, usually within two weeks.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} {...stylex.props(s.form)}>
      <fieldset {...stylex.props(s.fieldset)}>
        <legend {...stylex.props(ex.label)}>What would you like to do?</legend>
        <label {...stylex.props(ex.check)}>
          <input
            type="radio"
            name="kind"
            checked={kind === "edit"}
            onChange={() => setKind("edit")}
            {...stylex.props(ex.checkbox)}
          />
          <span>Fix something on an existing court</span>
        </label>
        <label {...stylex.props(ex.check)}>
          <input
            type="radio"
            name="kind"
            checked={kind === "new"}
            onChange={() => setKind("new")}
            {...stylex.props(ex.checkbox)}
          />
          <span>Add a court that's missing</span>
        </label>
      </fieldset>
      {kind === "edit" ? (
        <label {...stylex.props(ex.field)}>
          <span {...stylex.props(ex.label)}>Court</span>
          <select
            required
            value={venueSlug}
            onChange={(e) => setVenueSlug(e.currentTarget.value)}
            {...stylex.props(ex.input)}
          >
            <option value="">Choose a court…</option>
            {venues.map((v) => (
              <option value={v.slug}>{v.name}</option>
            ))}
          </select>
        </label>
      ) : (
        <label {...stylex.props(ex.field)}>
          <span {...stylex.props(ex.label)}>Court name and area</span>
          <input
            required
            maxLength={200}
            value={venueName}
            onInput={(e) => setVenueName(e.currentTarget.value)}
            placeholder="e.g. Taman Tun Dr Ismail public courts"
            {...stylex.props(ex.input)}
          />
        </label>
      )}
      <label {...stylex.props(ex.field)}>
        <span {...stylex.props(ex.label)}>
          {kind === "edit" ? "What's wrong or changed?" : "What should players know?"}
        </span>
        <textarea
          required
          minLength={10}
          maxLength={4000}
          rows={6}
          value={message}
          onInput={(e) => setMessage(e.currentTarget.value)}
          placeholder={
            kind === "edit"
              ? "e.g. Night rate is now RM25/hr, and courts 3 and 4 are closed for resurfacing."
              : "Who can play, how to book, price, number of courts, lights, covered or not."
          }
          {...stylex.props(ex.input, s.textarea)}
        />
      </label>
      <label {...stylex.props(ex.field)}>
        <span {...stylex.props(ex.label)}>How do you know? (optional)</span>
        <input
          maxLength={500}
          value={source}
          onInput={(e) => setSource(e.currentTarget.value)}
          placeholder="Played there last week, venue website link, called the venue…"
          {...stylex.props(ex.input)}
        />
      </label>
      <label {...stylex.props(ex.field)}>
        <span {...stylex.props(ex.label)}>Email, if you'd like a reply (optional)</span>
        <input
          type="email"
          maxLength={200}
          value={contact}
          onInput={(e) => setContact(e.currentTarget.value)}
          {...stylex.props(ex.input)}
        />
        <span {...stylex.props(s.hint)}>
          Only used to follow up on this suggestion. Never published.
        </span>
      </label>
      <div ref={widget} />
      {error && (
        <p role="alert" {...stylex.props(ex.error)}>
          {error}
        </p>
      )}
      <button type="submit" disabled={state === "sending"} {...stylex.props(s.submit)}>
        {state === "sending" ? "Sending…" : "Send suggestion"}
      </button>
    </form>
  );
}
