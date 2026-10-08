import * as stylex from "@stylexjs/stylex";
import { color, font, size, space } from "./tokens.stylex";

// Shared building blocks for page bodies.
export const page = stylex.create({
  container: {
    maxWidth: size.page,
    marginInline: "auto",
    paddingInline: space.md,
  },
  section: {
    marginTop: space.xl,
  },
  h2: {
    fontFamily: font.display,
    fontWeight: 700,
    fontSize: "clamp(1.625rem, 4vw, 2.125rem)",
    lineHeight: 1.1,
    marginBottom: space.md,
  },
  h3: {
    fontFamily: font.display,
    fontWeight: 600,
    fontSize: "1.375rem",
    lineHeight: 1.15,
    marginBottom: space.sm,
  },
  prose: {
    maxWidth: size.measure,
    display: "grid",
    gap: space.md,
  },
  muted: {
    color: color.inkSoft,
  },
  link: {
    color: color.blue,
    textUnderlineOffset: "0.15em",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: {
      default: "1fr",
      "@media (min-width: 60rem)": "minmax(0, 3fr) minmax(0, 2fr)",
    },
    columnGap: space.xxl,
    rowGap: space.xl,
    alignItems: "start",
  },
  stack: {
    display: "grid",
    gap: space.md,
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    minHeight: "2.75rem",
    paddingInline: space.lg,
    borderRadius: 999,
    fontWeight: 700,
    textDecoration: "none",
    backgroundColor: { default: color.court, ":hover": color.courtDeep },
    color: color.line,
    borderWidth: 0,
    cursor: "pointer",
    fontSize: "1rem",
    fontFamily: font.body,
  },
  buttonSecondary: {
    backgroundColor: { default: color.surface, ":hover": color.paper },
    color: color.ink,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: color.court,
  },
});
