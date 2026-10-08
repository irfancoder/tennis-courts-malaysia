import * as stylex from "@stylexjs/stylex";
import { color, space } from "../styles/tokens.stylex";

export const s = stylex.create({
  notice: {
    backgroundColor: color.warnBg,
    color: color.warnInk,
    borderLeftWidth: 4,
    borderLeftStyle: "solid",
    borderLeftColor: "#C99700",
    paddingBlock: space.sm,
    paddingInline: space.md,
  },
});
