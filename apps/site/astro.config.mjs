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
  integrations: [mdx(), preact(), sitemap()],
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
