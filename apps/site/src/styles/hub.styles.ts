import * as stylex from "@stylexjs/stylex";
import { color, font, space } from "./tokens.stylex";

export const s = stylex.create({
  highlights: {
    listStyle: "none",
    padding: 0,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))",
    gap: space.md,
  },
  highlight: {
    borderLeftWidth: 4,
    borderLeftStyle: "solid",
    borderLeftColor: color.court,
    paddingLeft: space.md,
    display: "grid",
    gap: space.xs,
  },
  highlightLabel: {
    color: color.inkSoft,
    fontSize: "0.9375rem",
  },
  highlightName: {
    fontFamily: font.display,
    fontWeight: 700,
    fontSize: "1.375rem",
    lineHeight: 1.1,
  },
  jump: {
    display: "flex",
    flexWrap: "wrap",
    gap: space.md,
  },
  cities: {
    listStyle: "none",
    padding: 0,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(13rem, 1fr))",
    columnGap: space.xl,
    rowGap: space.sm,
  },
  city: {
    display: "flex",
    justifyContent: "space-between",
    gap: space.sm,
    paddingBlock: space.sm,
    borderBottomWidth: 2,
    borderBottomStyle: "solid",
    borderBottomColor: color.court,
    color: color.ink,
    textDecoration: "none",
    fontWeight: 700,
  },
  count: {
    color: color.inkSoft,
    fontWeight: 400,
  },
});
