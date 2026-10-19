import * as stylex from "@stylexjs/stylex";
import { color, space } from "../styles/tokens.stylex";

export const s = stylex.create({
  list: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(9.5rem, 1fr))",
    gap: space.sm,
    paddingLeft: 0,
    listStyle: "none",
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
    paddingBlock: space.sm,
    paddingInline: space.sm,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.rule,
    borderRadius: 8,
    fontSize: { default: "1rem", "@media (max-width: 30rem)": "0.875rem" },
    lineHeight: 1.3,
  },
  itemNo: {
    backgroundColor: "transparent",
    borderStyle: "dashed",
    color: color.inkSoft,
  },
  icon: {
    position: "relative",
    flexShrink: 0,
    display: "grid",
    placeItems: "center",
    width: { default: "2.5rem", "@media (max-width: 30rem)": "2rem" },
    height: { default: "2.5rem", "@media (max-width: 30rem)": "2rem" },
    borderRadius: "50%",
    backgroundColor: color.court,
    color: color.line,
  },
  iconNo: {
    backgroundColor: color.rule,
    color: color.inkSoft,
  },
  svg: {
    width: { default: "1.5rem", "@media (max-width: 30rem)": "1.25rem" },
    height: { default: "1.5rem", "@media (max-width: 30rem)": "1.25rem" },
    fill: "currentColor",
  },
  // A diagonal line through the icon for "not available".
  slash: {
    position: "absolute",
    width: { default: "2.25rem", "@media (max-width: 30rem)": "1.75rem" },
    height: 2,
    backgroundColor: color.inkSoft,
    transform: "rotate(-45deg)",
    boxShadow: `0 0 0 1.5px ${color.rule}`,
  },
});
