import * as stylex from "@stylexjs/stylex";
import { color, font, space } from "../../styles/tokens.stylex";

// MDX renders plain HTML elements, which StyleX cannot target by selector,
// so each element is mapped to a component carrying these styles.
export const s = stylex.create({
  h2: {
    fontFamily: font.display,
    fontWeight: 700,
    fontSize: "1.875rem",
    lineHeight: 1.1,
    marginTop: space.xl,
    marginBottom: space.sm,
  },
  h3: {
    fontFamily: font.display,
    fontWeight: 600,
    fontSize: "1.375rem",
    marginTop: space.lg,
    marginBottom: space.xs,
  },
  p: {
    marginBottom: space.md,
  },
  a: {
    color: color.blue,
    textUnderlineOffset: "0.15em",
  },
  list: {
    paddingLeft: space.lg,
    marginBottom: space.md,
    display: "grid",
    gap: space.sm,
  },
  tableWrap: {
    overflowX: "auto",
    marginBottom: space.md,
  },
  table: {
    borderCollapse: "collapse",
    minWidth: "20rem",
  },
  th: {
    textAlign: "left",
    paddingBlock: space.sm,
    paddingInline: space.md,
    backgroundColor: color.courtDeep,
    color: color.line,
  },
  td: {
    paddingBlock: space.sm,
    paddingInline: space.md,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: color.rule,
  },
});
