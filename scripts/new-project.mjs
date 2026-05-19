import { access, writeFile } from "node:fs/promises";
import path from "node:path";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import {
  contentProjectsDir,
  parseList,
  readContentProjects,
  slugify,
  syncGeneratedProjects,
} from "./project-utils.mjs";

const rl = createInterface({ input, output });

async function ask(label, fallback = "") {
  const suffix = fallback ? ` (${fallback})` : "";
  const answer = await rl.question(`${label}${suffix}: `);
  return answer.trim() || fallback;
}

async function askYesNo(label, fallback = true) {
  const fallbackText = fallback ? "S/n" : "s/N";
  const answer = (await ask(`${label} [${fallbackText}]`)).toLowerCase();

  if (!answer) {
    return fallback;
  }

  return ["s", "si", "sí", "y", "yes"].includes(answer);
}

try {
  const existingProjects = await readContentProjects();
  const nextOrder =
    existingProjects.reduce((maxOrder, project) => Math.max(maxOrder, project.order ?? 0), 0) + 10;

  const title = await ask("Nombre del proyecto");
  const slug = slugify(await ask("Slug", slugify(title)));
  const filePath = path.join(contentProjectsDir, `${slug}.json`);

  try {
    await access(filePath);
    throw new Error(`Ya existe un proyecto con el slug "${slug}".`);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  const category = await ask("Categoria", "web");
  const year = await ask("Año", String(new Date().getFullYear()));
  const tag = await ask("Etiqueta", "Web");
  const accent = await ask("Acento", category);
  const description = await ask("Descripcion corta para la card");
  const liveUrl = await ask("URL en vivo, opcional");
  const previewImage = await ask("Imagen en public, opcional", `/${slug}.png`);
  const visualClass = await ask("Clase visual", "visual-brand");
  const showInHome = await askYesNo("Mostrar en la home", true);
  const createDetail = await askYesNo("Crear ficha del proyecto", true);

  const project = {
    slug,
    order: nextOrder,
    category,
    year,
    href: `/proyectos/${slug}`,
    ...(liveUrl ? { liveUrl } : {}),
    ...(previewImage ? { previewImage } : {}),
    visualClass,
    ...(showInHome ? {} : { showInHome: false }),
    copy: {
      es: {
        title,
        tag,
        description,
        accent,
      },
      en: {
        title: await ask("Titulo en ingles", title),
        tag: await ask("Etiqueta en ingles", tag),
        description: await ask("Descripcion corta en ingles", description),
        accent: await ask("Acento en ingles", accent),
      },
    },
  };

  if (createDetail) {
    project.detail = {
      category: await ask("Categoria en la ficha", category),
      summary: await ask("Resumen de la ficha", description),
      overview: await ask("Overview / descripcion larga"),
      challenge: await ask("Reto"),
      solution: await ask("Solucion"),
      results: parseList(await ask("Resultados separados por coma")),
      stack: parseList(await ask("Stack separado por coma")),
      deliverables: parseList(await ask("Entregables separados por coma")),
      ...(liveUrl
        ? {
            interactiveTitle: `Explora ${title} desde el portafolio`,
            interactiveDescription:
              "Esta demo en vivo carga el proyecto publicado para que puedas recorrerlo directamente desde esta ficha.",
          }
        : {}),
    };
  }

  await writeFile(filePath, `${JSON.stringify(project, null, 2)}\n`, "utf8");
  await syncGeneratedProjects();

  console.log(`Proyecto creado: src/content/projects/${slug}.json`);
  console.log("Datos sincronizados en src/data/projects.generated.json");
} finally {
  rl.close();
}
