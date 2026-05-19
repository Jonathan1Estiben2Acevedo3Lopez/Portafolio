import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
export const rootDir = path.resolve(scriptsDir, "..");
export const contentProjectsDir = path.join(rootDir, "src", "content", "projects");
export const generatedProjectsFile = path.join(rootDir, "src", "data", "projects.generated.json");

export function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-") || "nuevo-proyecto";
}

export function parseList(value) {
  return value
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function readContentProjects() {
  await mkdir(contentProjectsDir, { recursive: true });

  const entries = await readdir(contentProjectsDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const projects = [];

  for (const fileName of files) {
    const filePath = path.join(contentProjectsDir, fileName);
    const project = JSON.parse(await readFile(filePath, "utf8"));
    const expectedSlug = path.basename(fileName, ".json");

    if (project.slug !== expectedSlug) {
      throw new Error(`El archivo ${fileName} debe tener "slug": "${expectedSlug}".`);
    }

    projects.push(project);
  }

  return projects.sort((a, b) => {
    const orderA = Number.isFinite(a.order) ? a.order : Number.MAX_SAFE_INTEGER;
    const orderB = Number.isFinite(b.order) ? b.order : Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return a.slug.localeCompare(b.slug);
  });
}

export async function syncGeneratedProjects() {
  const projects = await readContentProjects();
  await mkdir(path.dirname(generatedProjectsFile), { recursive: true });
  await writeFile(generatedProjectsFile, `${JSON.stringify(projects, null, 2)}\n`, "utf8");

  return projects;
}
