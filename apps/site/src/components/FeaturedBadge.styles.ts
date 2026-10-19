import * as stylex from "@stylexjs/stylex";
import { color, space } from "../styles/tokens.stylex";

export const s = stylex.create({
  badge: {
    display: "inline-block",
    paddingBlock: "0.125rem",
    paddingInline: space.sm,
    borderRadius: 999,
    backgroundColor: color.ball,
    color: color.ink,
    fontSize: "0.8125rem",
    fontWeight: 700,
    letterSpacing: "0.02em",
    textDecoration: "none",
  },
});
