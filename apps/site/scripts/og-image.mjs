// Generates public/og.png, the default social share image. Run when the branding changes:
//   node scripts/og-image.mjs
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require(require.resolve("sharp", { paths: [require.resolve("astro")] }));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#2D5B45"/>
  <g fill="none" stroke="#fff" stroke-opacity="0.92">
    <rect x="48" y="48" width="1104" height="534" stroke-width="6"/>
    <line x1="843" y1="48" x2="843" y2="582" stroke-width="8"/>
    <line x1="995" y1="48" x2="995" y2="582" stroke-width="5"/>
    <line x1="843" y1="315" x2="995" y2="315" stroke-width="5"/>
  </g>
  <circle cx="1060" cy="160" r="38" fill="#DDEB3A"/>
  <text x="110" y="250" font-family="Helvetica Neue, Arial, sans-serif" font-weight="800" font-size="84" fill="#fff">Tennis Courts</text>
  <text x="110" y="345" font-family="Helvetica Neue, Arial, sans-serif" font-weight="800" font-size="84" fill="#fff">Malaysia</text>
  <text x="110" y="430" font-family="Helvetica Neue, Arial, sans-serif" font-size="34" fill="#DDEB3A">Every court, and how to get on it</text>
</svg>`;

await sharp(Buffer.from(svg))
  .png()
  .toFile(new URL("../public/og.png", import.meta.url).pathname);
console.log("✓ public/og.png");
