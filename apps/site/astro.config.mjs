// @ts-check
import mdx from "@astrojs/mdx";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import stylex from "@stylexjs/unplugin";
import { defineConfig } from "astro/config";
import { localData } from "./local-data.mjs";

export default defineConfig({
  site: "https://tennis.irfanismail.com",
  output: "static",
  trailingSlash: "always",
  build: { inlineStylesheets: "never" },
  integrations: [
    mdx(),
    preact(),
    // The partners page stays out of search until monetisation is switched on.
    sitemap({
      filter: (page) => process.env.PUBLIC_MONETISATION === "1" || !page.endsWith("/partners/"),
    }),
  ],
  vite: {
    plugins: [
      localData(),
      stylex.vite({
        // Append StyleX rules to the site stylesheet, never to a lazily loaded vendor CSS file.
        cssInjectionTarget: (fileName) => !fileName.includes("maplibre"),
      }),
    ],
  },
});
