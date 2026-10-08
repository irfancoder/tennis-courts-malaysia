import * as stylex from "@stylexjs/stylex";
import { access, color, space } from "../styles/tokens.stylex";

export const s = stylex.create({
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.sm,
    fontWeight: 700,
    lineHeight: 1.2,
    color: color.ink,
  },
  dot: {
    width: "0.8em",
    height: "0.8em",
    borderRadius: "50%",
    flexShrink: 0,
    boxShadow: "0 0 0 2px #fff",
  },
  large: {
    fontSize: "1.25rem",
  },
  open: { backgroundColor: access.open },
  premium: { backgroundColor: access.premium },
  members: { backgroundColor: access.members },
  guests: { backgroundColor: access.guests },
  restricted: { backgroundColor: access.restricted },
});
