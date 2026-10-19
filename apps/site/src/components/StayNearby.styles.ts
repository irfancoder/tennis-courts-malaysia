import * as stylex from "@stylexjs/stylex";
import { color, space } from "../styles/tokens.stylex";

export const s = stylex.create({
  box: {
    display: "grid",
    gap: space.sm,
    padding: space.lg,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.rule,
    borderRadius: 8,
    backgroundColor: color.surface,
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gap: space.xs,
  },
  disclosure: {
    fontSize: "0.875rem",
    color: color.inkSoft,
  },
});
