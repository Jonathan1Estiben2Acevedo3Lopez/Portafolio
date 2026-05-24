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

async function askOptional(label) {
  return (await ask(label)).trim();
}

async function askYesNo(label, fallback = true) {
  const fallbackText = fallback ? "S/n" : "s/N";
  const answer = (await ask(`${label} [${fallbackText}]`)).toLowerCase();

  if (!answer) {
    return fallback;
  }

  return ["s", "si", "y", "yes"].includes(answer);
}

async function askCount(label, fallback = 0) {
  while (true) {
    const answer = await ask(label, String(fallback));
    const count = Number.parseInt(answer, 10);

    if (Number.isInteger(count) && count >= 0) {
      return count;
    }

    console.log("Escribe un numero entero mayor o igual a 0.");
  }
}

function localizedText(es, en) {
  const value = {
    es,
  };

  if (en) {
    value.en = en;
  }

  return value;
}

function addOptionalText(target, key, value) {
  if (value) {
    target[key] = value;
  }
}

function addOptionalList(target, key, value) {
  const list = parseList(value);
  if (list.length > 0) {
    target[key] = list;
  }
}

async function askEnglishText(label) {
  return askOptional(`${label} en ingles (opcional, Enter = usar espanol)`);
}

async function askEnglishList(label) {
  return askOptional(`${label} en ingles separado por coma (opcional, Enter = usar espanol)`);
}

async function askImages(slug, title) {
  const imageCount = await askCount("Cuantas capturas/imagenes tiene este proyecto?", 0);
  const images = [];

  for (let index = 1; index <= imageCount; index += 1) {
    console.log(`\nImagen ${index} de ${imageCount}`);
    const src = await ask(`Ruta o URL de la imagen ${index}`, imageCount === 1 ? `/${slug}.png` : `/${slug}-${index}.png`);
    const altEs = await ask(`Alt en espanol para imagen ${index}`, `${title} captura ${index}`);
    const altEn = await askEnglishText(`Alt para imagen ${index}`);
    const captionEs = await askOptional(`Caption en espanol para imagen ${index} (opcional)`);
    const captionEn = captionEs ? await askEnglishText(`Caption para imagen ${index}`) : "";

    images.push({
      src,
      alt: localizedText(altEs, altEn),
      ...(captionEs ? { caption: localizedText(captionEs, captionEn) } : {}),
    });
  }

  return images;
}

async function askVideos(slug, title) {
  const videoCount = await askCount("Cuantos videos tiene este proyecto?", 0);
  const videos = [];

  for (let index = 1; index <= videoCount; index += 1) {
    console.log(`\nVideo ${index} de ${videoCount}`);
    const src = await ask(`Ruta o URL del video ${index}`, `/${slug}-video-${index}.mp4`);
    const poster = await askOptional(`Poster del video ${index}, opcional`);
    const titleEs = await ask(`Titulo en espanol para video ${index}`, `${title} video ${index}`);
    const titleEn = await askEnglishText(`Titulo para video ${index}`);
    const captionEs = await askOptional(`Caption en espanol para video ${index} (opcional)`);
    const captionEn = captionEs ? await askEnglishText(`Caption para video ${index}`) : "";

    videos.push({
      src,
      ...(poster ? { poster } : {}),
      title: localizedText(titleEs, titleEn),
      ...(captionEs ? { caption: localizedText(captionEs, captionEn) } : {}),
    });
  }

  return videos;
}

async function askProjectLinks(liveUrl) {
  const links = [];

  if (liveUrl) {
    links.push({
      type: "demo",
      href: liveUrl,
      label: {
        es: "Abrir demo",
        en: "Open demo",
      },
    });
  }

  const repoUrl = await askOptional("URL del repositorio, opcional");
  if (repoUrl) {
    links.push({
      type: "repo",
      href: repoUrl,
      label: {
        es: "Repositorio",
        en: "Repository",
      },
    });
  }

  const docsUrl = await askOptional("URL de documentacion, opcional");
  if (docsUrl) {
    links.push({
      type: "docs",
      href: docsUrl,
      label: {
        es: "Documentacion",
        en: "Documentation",
      },
    });
  }

  const videoUrl = await askOptional("URL de video externo, opcional");
  if (videoUrl) {
    links.push({
      type: "video",
      href: videoUrl,
      label: {
        es: "Ver video",
        en: "Watch video",
      },
    });
  }

  const customCount = await askCount("Cuantos enlaces adicionales quieres agregar?", 0);
  for (let index = 1; index <= customCount; index += 1) {
    console.log(`\nEnlace adicional ${index} de ${customCount}`);
    const href = await ask(`URL del enlace adicional ${index}`);
    const labelEs = await ask(`Texto del enlace adicional ${index} en espanol`, "Abrir enlace");
    const labelEn = await askEnglishText(`Texto del enlace adicional ${index}`);

    links.push({
      type: "custom",
      href,
      label: localizedText(labelEs, labelEn),
    });
  }

  return links;
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

  const category = await ask("Categoria para filtro", "web");
  const year = await ask("Año", String(new Date().getFullYear()));
  const tag = await ask("Etiqueta de la card", "Web");
  const accent = await ask("Acento de la card", category);
  const description = await ask("Descripcion corta para la card");
  const titleEn = await ask("Titulo de la card en ingles", title);
  const tagEn = await ask("Etiqueta de la card en ingles", tag);
  const descriptionEn = await ask("Descripcion corta en ingles", description);
  const accentEn = await ask("Acento de la card en ingles", accent);
  const liveUrl = await askOptional("URL en vivo/demo, opcional");
  const previewImage = await ask("Imagen preview en public o URL, opcional", `/${slug}.png`);
  const visualClass = await ask("Clase visual de respaldo", "visual-brand");
  const showInHome = await askYesNo("Mostrar en la home", true);

  console.log("\nFicha del proyecto en espanol");
  const detailCategory = await ask("Categoria visible en la ficha", category);
  const summary = await ask("Resumen corto de la ficha", description);
  const overview = await ask("Overview / descripcion larga");
  const challenge = await ask("Reto");
  const solution = await ask("Solucion");
  const process = await askOptional("Proceso separado por coma, opcional");
  const results = await askOptional("Resultados separados por coma, opcional");
  const stack = await askOptional("Stack separado por coma, opcional");
  const deliverables = await askOptional("Entregables separados por coma, opcional");
  const learnings = await askOptional("Aprendizajes separados por coma, opcional");

  console.log("\nFicha del proyecto en ingles");
  const summaryEn = await askEnglishText("Resumen corto de la ficha");
  const overviewEn = await askEnglishText("Overview / descripcion larga");
  const challengeEn = await askEnglishText("Reto");
  const solutionEn = await askEnglishText("Solucion");
  const processEn = await askEnglishList("Proceso");
  const resultsEn = await askEnglishList("Resultados");
  const deliverablesEn = await askEnglishList("Entregables");
  const learningsEn = await askEnglishList("Aprendizajes");

  const images = await askImages(slug, title);
  const videos = await askVideos(slug, title);
  const links = await askProjectLinks(liveUrl);

  const detailEs = {
    summary,
    overview,
    challenge,
    solution,
  };
  addOptionalList(detailEs, "process", process);
  addOptionalList(detailEs, "results", results);
  addOptionalList(detailEs, "deliverables", deliverables);
  addOptionalList(detailEs, "learnings", learnings);

  if (liveUrl) {
    detailEs.interactiveTitle = `Explora ${title} desde el portafolio`;
    detailEs.interactiveDescription =
      "Esta demo en vivo carga el proyecto publicado para que puedas recorrerlo directamente desde esta ficha.";
  }

  const detailEn = {};
  addOptionalText(detailEn, "summary", summaryEn);
  addOptionalText(detailEn, "overview", overviewEn);
  addOptionalText(detailEn, "challenge", challengeEn);
  addOptionalText(detailEn, "solution", solutionEn);
  addOptionalList(detailEn, "process", processEn);
  addOptionalList(detailEn, "results", resultsEn);
  addOptionalList(detailEn, "deliverables", deliverablesEn);
  addOptionalList(detailEn, "learnings", learningsEn);

  if (liveUrl && Object.keys(detailEn).length > 0) {
    detailEn.interactiveTitle = `Explore ${titleEn} from the portfolio`;
    detailEn.interactiveDescription =
      "This live demo loads the published project so you can explore it directly from this case study.";
  }

  const media = {};
  if (images.length > 0) {
    media.images = images;
  }
  if (videos.length > 0) {
    media.videos = videos;
  }

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
        title: titleEn,
        tag: tagEn,
        description: descriptionEn,
        accent: accentEn,
      },
    },
    detail: {
      category: detailCategory,
      stack: parseList(stack),
      ...(Object.keys(media).length > 0 ? { media } : {}),
      ...(links.length > 0 ? { links } : {}),
      ...(liveUrl ? { liveUrl } : {}),
      es: detailEs,
      ...(Object.keys(detailEn).length > 0 ? { en: detailEn } : {}),
    },
  };

  await writeFile(filePath, `${JSON.stringify(project, null, 2)}\n`, "utf8");
  await syncGeneratedProjects();

  console.log(`\nProyecto creado: src/content/projects/${slug}.json`);
  console.log("Datos sincronizados en src/data/projects.generated.json");
  console.log("Recuerda guardar imagenes/videos locales en public y referenciarlos con rutas como /mi-captura.png.");
} finally {
  rl.close();
}
