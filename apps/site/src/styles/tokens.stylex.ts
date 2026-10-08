import * as stylex from "@stylexjs/stylex";

// Palette taken from Malaysian acrylic hard courts: court green, surround blue, line white, optic ball.
export const color = stylex.defineVars({
  paper: "#F4F6F2",
  surface: "#FFFFFF",
  ink: "#10241A",
  inkSoft: "#4A5C52",
  rule: "#D5DDD7",
  court: "#2D5B45",
  courtDeep: "#21463A",
  line: "#FFFFFF",
  blue: "#1F4C78",
  ball: "#DDEB3A",
  warnBg: "#FFF4D6",
  warnInk: "#6B4A00",
});

// One colour per access group, used by badges, list markers and map pins.
export const access = stylex.defineVars({
  open: "#1E7A4C",
  premium: "#1F4C78",
  members: "#9A5B00",
  guests: "#6A4C9C",
  restricted: "#8C3B3B",
});

export const font = stylex.defineVars({
  display: "'Barlow Condensed', 'Arial Narrow', sans-serif",
  body: "'Atkinson Hyperlegible Next Variable', system-ui, -apple-system, 'Segoe UI', sans-serif",
});

export const space = stylex.defineVars({
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2.5rem",
  xxl: "4rem",
});

export const size = stylex.defineVars({
  page: "68rem",
  measure: "40rem",
});
