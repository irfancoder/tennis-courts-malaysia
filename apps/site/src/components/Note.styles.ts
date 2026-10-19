import * as stylex from "@stylexjs/stylex";
import { color, space } from "../styles/tokens.stylex";

/** Lets the tooltip open when its wrapper is hovered or holds focus. */
export const marker = stylex.defaultMarker();

export const s = stylex.create({
  // The wrapper has no text, so its baseline is its bottom edge. Dropping that 0.15em below the
  // text baseline centres the icon on the capital letters at any font size.
  wrap: {
    position: "relative",
    display: "inline-block",
    marginLeft: "0.125em",
    verticalAlign: "-0.15em",
  },
  button: {
    display: "block",
    padding: 0,
    borderWidth: 0,
    borderRadius: "50%",
    backgroundColor: "transparent",
    color: color.inkSoft,
    fontSize: "inherit",
    cursor: "help",
    outlineOffset: 1,
  },
  // The icon's circle fills about 83% of its box, so it draws slightly smaller than the text.
  icon: {
    display: "block",
    width: "1em",
    height: "1em",
    fill: "currentColor",
  },
  tip: {
    display: {
      default: "none",
      [stylex.when.ancestor(":hover")]: "block",
      [stylex.when.ancestor(":focus-within")]: "block",
    },
    position: "absolute",
    zIndex: 10,
    top: "calc(100% + 0.375rem)",
    left: "-0.5rem",
    width: "max-content",
    maxWidth: "min(16rem, 80vw)",
    paddingBlock: space.sm,
    paddingInline: space.md,
    backgroundColor: color.surface,
    color: color.ink,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.rule,
    borderRadius: 8,
    boxShadow: "0 4px 16px rgba(16, 36, 26, 0.12)",
    fontSize: "0.875rem",
    fontWeight: 400,
    lineHeight: 1.4,
    whiteSpace: "normal",
  },
});
