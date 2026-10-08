import * as stylex from "@stylexjs/stylex";
import { color, font, size, space } from "../styles/tokens.stylex";

// The court band: a hard court seen from above. Outer tramlines, net, and a centre
// service line drawn with borders and pseudo-elements. Content sits in the near court.
export const s = stylex.create({
  band: {
    backgroundColor: color.court,
    color: color.line,
    paddingInline: space.md,
    paddingBlock: { default: space.lg, "@media (min-width: 48rem)": space.xl },
  },
  court: {
    position: "relative",
    maxWidth: size.page,
    marginInline: "auto",
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: "rgba(255,255,255,0.92)",
    paddingInline: { default: space.md, "@media (min-width: 48rem)": space.xl },
    paddingBlock: { default: space.lg, "@media (min-width: 48rem)": space.xl },
    paddingRight: { "@media (min-width: 48rem)": "32%" },
    // Net: a vertical line near the far end, desktop only, leaving the near court for content.
    "::before": {
      content: '""',
      position: "absolute",
      top: 0,
      bottom: 0,
      left: "72%",
      width: 4,
      backgroundColor: "rgba(255,255,255,0.92)",
      display: { default: "none", "@media (min-width: 48rem)": "block" },
    },
    // Centre service line on the far side of the net.
    "::after": {
      content: '""',
      position: "absolute",
      top: "50%",
      left: "72%",
      right: "14%",
      height: 3,
      backgroundColor: "rgba(255,255,255,0.92)",
      display: { default: "none", "@media (min-width: 48rem)": "block" },
    },
  },
  serviceLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: "14%",
    width: 3,
    backgroundColor: "rgba(255,255,255,0.92)",
    display: { default: "none", "@media (min-width: 48rem)": "block" },
  },
  kicker: {
    fontWeight: 600,
    color: color.ball,
    marginBottom: space.sm,
  },
  title: {
    fontFamily: font.display,
    fontWeight: 700,
    fontSize: "clamp(2.25rem, 7vw, 4rem)",
    lineHeight: 1,
    letterSpacing: "-0.005em",
    textWrap: "balance",
  },
  lead: {
    marginTop: space.md,
    fontSize: "1.125rem",
    maxWidth: size.measure,
    opacity: 0.95,
  },
  slot: {
    marginTop: space.lg,
  },
});
