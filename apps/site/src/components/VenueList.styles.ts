import * as stylex from "@stylexjs/stylex";
import { color, font, space } from "../styles/tokens.stylex";

export const s = stylex.create({
  list: {
    listStyle: "none",
    padding: 0,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: color.rule,
  },
  item: {
    position: "relative",
    paddingBlock: space.md,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: color.rule,
    display: "grid",
    gap: space.xs,
  },
  name: {
    fontFamily: font.display,
    fontWeight: 700,
    fontSize: "1.5rem",
    lineHeight: 1.1,
  },
  link: {
    color: color.ink,
    textDecorationThickness: 2,
    textUnderlineOffset: "0.15em",
    textDecorationColor: { default: color.rule, ":hover": color.court },
  },
  where: {
    color: color.inkSoft,
  },
  facts: {
    display: "flex",
    flexWrap: "wrap",
    columnGap: space.md,
    rowGap: space.xs,
    fontSize: "0.9375rem",
  },
  flag: {
    fontSize: "0.875rem",
    fontWeight: 700,
    paddingInline: space.sm,
    borderRadius: 4,
    backgroundColor: color.warnBg,
    color: color.warnInk,
  },
  played: {
    fontSize: "0.875rem",
    fontWeight: 700,
    paddingInline: space.sm,
    borderRadius: 4,
    backgroundColor: color.ball,
    color: color.ink,
  },
  empty: {
    color: color.inkSoft,
    paddingBlock: space.md,
  },
});
