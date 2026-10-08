import * as stylex from "@stylexjs/stylex";
import { color, font, space } from "../styles/tokens.stylex";

export const s = stylex.create({
  form: {
    display: "grid",
    gap: space.lg,
    maxWidth: "36rem",
  },
  fieldset: {
    borderWidth: 0,
    padding: 0,
    margin: 0,
    display: "grid",
    gap: space.sm,
  },
  textarea: {
    paddingBlock: space.sm,
    resize: "vertical",
    lineHeight: 1.5,
  },
  hint: {
    fontSize: "0.875rem",
    color: color.inkSoft,
  },
  submit: {
    justifySelf: "start",
    minHeight: "3rem",
    paddingInline: space.xl,
    borderRadius: 999,
    borderWidth: 0,
    backgroundColor: {
      default: color.court,
      ":hover": color.courtDeep,
      ":disabled": color.inkSoft,
    },
    color: color.line,
    fontWeight: 700,
    fontSize: "1.0625rem",
    fontFamily: font.body,
    cursor: "pointer",
  },
  done: {
    backgroundColor: color.surface,
    borderLeftWidth: 4,
    borderLeftStyle: "solid",
    borderLeftColor: color.court,
    padding: space.lg,
    display: "grid",
    gap: space.sm,
    maxWidth: "36rem",
  },
  doneTitle: {
    fontFamily: font.display,
    fontWeight: 700,
    fontSize: "1.5rem",
  },
});
