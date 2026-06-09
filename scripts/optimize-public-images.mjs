import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { contentProjectsDir, generatedProjectsFile, rootDir } from "./project-utils.mjs";

const publicDir = path.join(rootDir, "public");
const rasterImagePattern = /\/(?:[^"'\s]+)\.(?:png|jpe?g)/gi;

const staticJsonFiles = [
  path.join(rootDir, "src", "data", "development.json"),
  path.join(rootDir, "src", "data", "interests.json"),
  path.join(rootDir, "src", "data", "project-studio-preview.generated.json"),
  generatedProjectsFile,
  path.join(publicDir, "project-studio-preview.json"),
];

async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getProjectJsonFiles() {
  try {
    const entries = await readdir(contentProjectsDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => path.join(contentProjectsDir, entry.name));
  } catch {
    return [];
  }
}

function toWebpPublicPath(publicPath) {
  return publicPath.replace(/\.(png|jpe?g)$/i, ".webp");
}

function resolvePublicPath(publicPath) {
  return path.join(publicDir, publicPath.slice(1).replaceAll("/", path.sep));
}

async function optimizeImage(sourcePath, targetPath) {
  const sourceStat = await stat(sourcePath);
  const targetStat = (await fileExists(targetPath)) ? await stat(targetPath) : null;

  if (targetStat && targetStat.mtimeMs >= sourceStat.mtimeMs) {
    return false;
  }

  const metadata = await sharp(sourcePath).metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;
  const targetWidth = height > width * 1.45 ? 900 : Math.min(width || 1400, 1400);

  await mkdir(path.dirname(targetPath), { recursive: true });
  await sharp(sourcePath)
    .rotate()
    .resize({ width: targetWidth, withoutEnlargement: true })
    .webp({ quality: 76, effort: 6 })
    .toFile(targetPath);

  return true;
}

async function optimizeReferencesInFile(filePath) {
  if (!(await fileExists(filePath))) {
    return { converted: 0, updated: 0 };
  }

  const original = await readFile(filePath, "utf8");
  let next = original;
  let converted = 0;
  let updated = 0;
  const references = [...new Set(original.match(rasterImagePattern) || [])];

  for (const publicPath of references) {
    const sourcePath = resolvePublicPath(publicPath);
    const webpPublicPath = toWebpPublicPath(publicPath);
    const targetPath = resolvePublicPath(webpPublicPath);

    if (await fileExists(sourcePath)) {
      converted += (await optimizeImage(sourcePath, targetPath)) ? 1 : 0;
    }

    if (await fileExists(targetPath)) {
      next = next.split(publicPath).join(webpPublicPath);
      updated += original.includes(publicPath) ? 1 : 0;
    }
  }

  if (next !== original) {
    await writeFile(filePath, next, "utf8");
  }

  return { converted, updated };
}

const jsonFiles = [...(await getProjectJsonFiles()), ...staticJsonFiles];
let converted = 0;
let updated = 0;

for (const filePath of jsonFiles) {
  const result = await optimizeReferencesInFile(filePath);
  converted += result.converted;
  updated += result.updated;
}

console.log(`Imagenes optimizadas: ${converted}; referencias actualizadas: ${updated}`);
