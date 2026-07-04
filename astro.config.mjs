import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "Portafolio";
const isGitHubPages = process.env.GITHUB_ACTIONS === "true" && repositoryName === "Portafolio";
const base = process.env.ASTRO_BASE ?? (isGitHubPages ? `/${repositoryName}` : "/");
const site = process.env.ASTRO_SITE ?? (isGitHubPages ? `https://${process.env.GITHUB_REPOSITORY_OWNER}.github.io` : undefined);
const blogDataFile = fileURLToPath(new URL("./src/data/blog.json", import.meta.url));

function refreshBlogRoutesOnDataChange() {
  return {
    name: "portfolio-refresh-blog-routes",
    apply: "serve",
    handleHotUpdate({ file, server }) {
      if (path.normalize(file) !== path.normalize(blogDataFile)) {
        return;
      }

      server.ws.send({
        type: "custom",
        event: "astro:content-changed",
        data: { file },
      });
      server.ws.send({ type: "full-reload" });
    },
  };
}

export default defineConfig({
  ...(site ? { site } : {}),
  base,
  trailingSlash: "ignore",
  build: {
    format: "file",
  },
  server: {
    host: true,
  },
  vite: {
    plugins: [refreshBlogRoutesOnDataChange()],
  },
});
