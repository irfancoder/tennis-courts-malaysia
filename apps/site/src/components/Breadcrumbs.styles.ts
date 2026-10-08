import * as stylex from "@stylexjs/stylex";
import { color, size, space } from "../styles/tokens.stylex";

export const s = stylex.create({
  nav: {
    maxWidth: size.page,
    marginInline: "auto",
    paddingInline: space.md,
    paddingBlock: space.sm,
    fontSize: "0.9375rem",
  },
  list: {
    listStyle: "none",
    padding: 0,
    display: "flex",
    flexWrap: "wrap",
    gap: space.sm,
  },
  item: {
    color: color.inkSoft,
    display: "flex",
    gap: space.sm,
  },
  sep: {
    color: color.inkSoft,
  },
  link: {
    color: color.blue,
  },
});
