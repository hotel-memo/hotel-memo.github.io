import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import remarkRewriteImages from "./src/lib/remark-rewrite-images.mjs"

export default defineConfig({
  site: "https://hotel-memo.github.io",
  trailingSlash: "ignore",
  integrations: [mdx(), sitemap()],
  markdown: {
    remarkPlugins: [remarkRewriteImages],
    shikiConfig: {
      theme: "github-light",
    },
  },
  vite: {
    server: {
      watch: {
        ignored: ["**/.obsidian/**", "**/private/**"],
      },
    },
  },
})
