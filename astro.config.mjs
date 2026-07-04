import { defineConfig } from "astro/config";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "Portafolio";
const isGitHubPages = process.env.GITHUB_ACTIONS === "true" && repositoryName === "Portafolio";
const base = process.env.ASTRO_BASE ?? (isGitHubPages ? `/${repositoryName}` : "/");
const site = process.env.ASTRO_SITE ?? (isGitHubPages ? `https://${process.env.GITHUB_REPOSITORY_OWNER}.github.io` : undefined);

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
});
