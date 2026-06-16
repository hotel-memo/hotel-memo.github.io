import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import { remarkAlert } from "remark-github-blockquote-alert"
import remarkRewriteLinks from "./src/lib/remark-rewrite-links.mjs"
import rehypeSlug from "rehype-slug"

export default defineConfig({
  site: "https://hotel-memo.github.io",
  trailingSlash: "ignore",
  integrations: [mdx(), sitemap()],
  markdown: {
    remarkPlugins: [remarkAlert, remarkRewriteLinks],
    rehypePlugins: [rehypeSlug],
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
