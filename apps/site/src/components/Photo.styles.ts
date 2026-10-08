import * as stylex from "@stylexjs/stylex";
import { color, space } from "../styles/tokens.stylex";

export const s = stylex.create({
  gallery: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(16rem, 1fr))",
    gap: space.md,
  },
  figure: {
    display: "grid",
    gap: space.xs,
  },
  img: {
    width: "100%",
    aspectRatio: "4 / 3",
    objectFit: "cover",
    borderRadius: 8,
    backgroundColor: color.rule,
  },
  caption: {
    fontSize: "0.875rem",
    color: color.inkSoft,
  },
});
