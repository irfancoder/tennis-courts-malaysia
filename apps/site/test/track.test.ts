import { describe, expect, it } from "vitest";
import { channelHref, withRef } from "../src/lib/format";
import { EVENTS, trackAttrs } from "../src/lib/track";

describe("withRef", () => {
  it("tags commercial booking platforms", () => {
    const url = new URL(withRef("https://www.courtsite.my/venue/abc?x=1"));
    expect(url.searchParams.get("utm_source")).toBe("tennis.irfanismail.com");
    expect(url.searchParams.get("utm_medium")).toBe("referral");
    expect(url.searchParams.get("x")).toBe("1");
  });

  it("tags subdomains of a listed platform", () => {
    expect(withRef("https://rekt-it.rezerv.co/book")).toContain("utm_source=");
  });

  it("leaves council portals and other sites alone", () => {
    for (const href of [
      "https://tempahkl.dbkl.gov.my/",
      "https://stf.kbs.gov.my/x",
      "https://notcourtsite.my/",
    ]) {
      expect(withRef(href)).toBe(href);
    }
  });

  it("keeps an existing utm_source", () => {
    const href = "https://courtsite.my/?utm_source=partner";
    expect(withRef(href)).toBe(href);
  });

  it("ignores non-URLs", () => {
    expect(withRef("tel:+60312345678")).toBe("tel:+60312345678");
  });

  it("is applied to booking channel links", () => {
    expect(channelHref({ type: "app", url: "https://courtsite.my/v" })).toContain(
      "utm_medium=referral",
    );
    expect(channelHref({ type: "whatsapp", number: "+60 12-345 6789" })).toBe(
      "https://wa.me/60123456789",
    );
  });
});

describe("trackAttrs", () => {
  it("builds Umami data attributes and drops undefined props", () => {
    expect(trackAttrs(EVENTS.booking, { venue: "titiwangsa", host: undefined, n: 2 })).toEqual({
      "data-umami-event": "booking_click",
      "data-umami-event-venue": "titiwangsa",
      "data-umami-event-n": "2",
    });
  });
});
