import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import { remarkAlert } from "remark-github-blockquote-alert"
import remarkRewriteLinks from "./src/lib/remark-rewrite-links.mjs"
import rehypeSlug from "rehype-slug"
import rehypeStayDate from "./src/lib/rehype-stay-date.mjs"
import rehypeStayedBadge from "./src/lib/rehype-stayed-badge.mjs"
import rehypeMemoBody from "./src/lib/rehype-memo-body.mjs"

export default defineConfig({
  site: "https://hotel-memo.github.io",
  trailingSlash: "ignore",
  integrations: [mdx(), sitemap()],
  markdown: {
    remarkPlugins: [remarkAlert, remarkRewriteLinks],
    rehypePlugins: [rehypeSlug, rehypeStayDate, rehypeStayedBadge, rehypeMemoBody],
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
