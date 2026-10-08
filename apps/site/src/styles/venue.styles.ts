import * as stylex from "@stylexjs/stylex";
import { color, font, space } from "./tokens.stylex";

export const s = stylex.create({
  aliases: {
    marginTop: space.sm,
    opacity: 0.9,
  },
  answer: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.rule,
    borderRadius: 8,
    padding: space.lg,
    marginTop: { default: space.lg, "@media (min-width: 48rem)": `calc(-1 * ${space.xl})` },
    position: "relative",
    display: "grid",
    gap: space.md,
    maxWidth: "46rem",
  },
  question: {
    fontFamily: font.display,
    fontWeight: 600,
    fontSize: "1.25rem",
    color: color.inkSoft,
  },
  steps: {
    paddingLeft: space.lg,
    display: "grid",
    gap: space.sm,
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: space.sm,
  },
  inPerson: {
    fontWeight: 600,
  },
  requirements: {
    display: "grid",
    gap: space.xs,
    paddingLeft: 0,
    listStyle: "none",
  },
  scoreboard: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(9rem, 1fr))",
    backgroundColor: color.courtDeep,
    color: color.line,
    borderRadius: 8,
    overflow: "hidden",
  },
  stat: {
    paddingBlock: space.md,
    paddingInline: space.md,
    borderRightWidth: 1,
    borderRightStyle: "solid",
    borderRightColor: "rgba(255,255,255,0.18)",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "rgba(255,255,255,0.18)",
  },
  statLabel: {
    fontSize: "0.875rem",
    opacity: 0.85,
  },
  statValue: {
    fontFamily: font.display,
    fontWeight: 700,
    fontSize: "1.75rem",
    lineHeight: 1.1,
    color: color.ball,
  },
  statValueText: {
    fontSize: "1.25rem",
  },
  dl: {
    display: "grid",
    gridTemplateColumns: { default: "1fr", "@media (min-width: 36rem)": "11rem 1fr" },
    columnGap: space.md,
    rowGap: { default: space.xs, "@media (min-width: 36rem)": space.sm },
  },
  dt: {
    fontWeight: 700,
    marginTop: { default: space.sm, "@media (min-width: 36rem)": 0 },
  },
  played: {
    backgroundColor: color.ball,
    color: color.ink,
    borderRadius: 8,
    padding: space.lg,
    display: "grid",
    gap: space.sm,
  },
  courtGroups: {
    listStyle: "none",
    padding: 0,
    display: "grid",
    gap: space.xs,
  },
  changelog: {
    paddingLeft: space.lg,
    display: "grid",
    gap: space.xs,
  },
});
