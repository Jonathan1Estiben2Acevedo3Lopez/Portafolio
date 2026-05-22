import type {
  AssetInput,
  CategoryDefinition,
  ProjectDraft,
  ProjectImage,
  Technology,
  ValidationMessage,
  VisualTemplateDefinition,
} from "../types";

export const statusLabels = {
  completed: "Completado",
  "in-progress": "En progreso",
  paused: "Pausado",
  archived: "Archivado",
  experimental: "Experimental",
  concept: "Concepto",
};

export const featuredLabels = {
  normal: "Normal",
  featured: "Destacado",
  main: "Principal",
};

export const technologyCategories = [
  "frontend",
  "backend",
  "database",
  "mobile",
  "ai",
  "cloud",
  "devops",
  "simulation",
  "design",
  "testing",
  "other",
];

export function slugify(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-") || "nuevo-proyecto"
  );
}

export function extractYoutubeId(url: string) {
  if (!url.trim()) {
    return "";
  }

  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/watch\?[^#]*v=([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/,
  ];

  return patterns.map((pattern) => url.match(pattern)?.[1]).find(Boolean) || "";
}

export function createEmptyProject(categories: CategoryDefinition[], templates: VisualTemplateDefinition[]): ProjectDraft {
  const category = categories[0];
  const template = templates.find((item) => item.id === category.recommendedVisualTemplate) || templates[0];

  return {
    slug: "nuevo-proyecto",
    category: category.id,
    visualTemplate: template.id,
    year: String(new Date().getFullYear()),
    href: "/proyectos/nuevo-proyecto",
    liveUrl: "",
    githubUrl: "",
    previewImage: "",
    visualClass: template.visualClass,
    featuredLevel: "normal",
    status: "completed",
    stack: [],
    pinned: false,
    priority: undefined,
    copy: {
      es: {
        title: "",
        tag: "",
        description: "",
        longDescription: "",
        accent: "",
      },
      en: {
        title: "",
        tag: "",
        description: "",
        longDescription: "",
        accent: "",
      },
    },
    media: {
      cover: "",
      gallery: [],
      video: {
        type: "youtube",
        url: "",
        youtubeId: "",
      },
    },
    visualOptions: {
      heroStyle: "minimal",
      motion: "soft",
      cardStyle: "glass",
    },
    modulesOrder: category.recommendedModules.slice(0, 4),
    modules: {},
  };
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function cleanOptionalUrl(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function localizedValue(value: unknown, lang: "es" | "en", fallback = "") {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object") {
    const localized = value as Record<string, unknown>;
    return asString(localized[lang], asString(localized.es, fallback));
  }

  return fallback;
}

function moduleItemText(item: unknown, lang: "es" | "en") {
  if (typeof item === "string") {
    return item;
  }

  if (!item || typeof item !== "object") {
    return "";
  }

  const record = item as Record<string, unknown>;
  return (
    localizedValue(record.description, lang) ||
    localizedValue(record.title, lang) ||
    localizedValue(record.label, lang) ||
    asString(record.value)
  );
}

function moduleItems(project: ProjectDraft, moduleId: string, lang: "es" | "en") {
  const items = project.modules[moduleId]?.items;

  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => moduleItemText(item, lang)).filter(Boolean);
}

function moduleMetrics(project: ProjectDraft, lang: "es" | "en") {
  const items = project.modules.metrics?.items;

  if (!Array.isArray(items)) {
    return [];
  }

  return items.reduce<Array<{ value: string; label: string }>>((metrics, item) => {
    if (!item || typeof item !== "object") {
      return metrics;
    }

    const record = item as Record<string, unknown>;
    const value = asString(record.value);
    const label = localizedValue(record.label, lang) || localizedValue(record.title, lang) || localizedValue(record.description, lang);

    if (value && label) {
      metrics.push({ value, label });
    }

    return metrics;
  }, []);
}

function normalizeGallery(value: unknown): ProjectImage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.reduce<ProjectImage[]>((images, item) => {
    if (typeof item === "string") {
      images.push({ src: item, isExternal: /^https?:\/\//.test(item) });
      return images;
    }

    if (!item || typeof item !== "object") {
      return images;
    }

    const image = item as Record<string, unknown>;
    const src = asString(image.src);
    if (!src) {
      return images;
    }

    images.push({
      src,
      alt: image.alt as ProjectImage["alt"],
      caption: image.caption as ProjectImage["caption"],
      isExternal: /^https?:\/\//.test(src),
    });
    return images;
  }, []);
}

export function normalizeProject(
  rawProject: unknown,
  categories: CategoryDefinition[],
  templates: VisualTemplateDefinition[],
): ProjectDraft {
  const fallback = createEmptyProject(categories, templates);
  const raw = (rawProject || {}) as Record<string, any>;
  const detail = raw.detail || {};
  const copy = raw.copy || {};
  const es = copy.es || {};
  const en = copy.en || {};
  const category = asString(raw.category, fallback.category);
  const template = templates.find((item) => item.id === raw.visualTemplate) || templates.find((item) => item.visualClass === raw.visualClass) || templates[0];
  const slug = asString(raw.slug, fallback.slug);
  const topMedia = raw.media || {};
  const detailImages = detail.media?.images || [];
  const gallery = normalizeGallery(topMedia.gallery?.length ? topMedia.gallery : detailImages);
  const cover = asString(topMedia.cover, gallery[0]?.src || asString(raw.previewImage));
  const youtubeUrl = asString(topMedia.video?.url);
  const youtubeId = asString(topMedia.video?.youtubeId, extractYoutubeId(youtubeUrl));

  return {
    ...fallback,
    ...raw,
    slug,
    category,
    visualTemplate: asString(raw.visualTemplate, template.id),
    year: asString(raw.year, fallback.year),
    href: asString(raw.href, `/proyectos/${slug}`),
    liveUrl: asString(raw.liveUrl || detail.liveUrl),
    githubUrl: asString(raw.githubUrl),
    previewImage: asString(raw.previewImage, cover),
    visualClass: asString(raw.visualClass || detail.visualClass, template.visualClass),
    featuredLevel: raw.featuredLevel || "normal",
    status: raw.status || "completed",
    stack: Array.isArray(raw.stack) && raw.stack.length > 0 ? raw.stack : detail.stack || [],
    pinned: Boolean(raw.pinned),
    priority: Number.isFinite(raw.priority) ? Number(raw.priority) : undefined,
    copy: {
      es: {
        title: asString(es.title, slug),
        tag: asString(es.tag, ""),
        description: asString(es.description, detail.es?.summary || ""),
        longDescription: asString(es.longDescription, detail.es?.overview || ""),
        accent: asString(es.accent, ""),
      },
      en: {
        title: asString(en.title, es.title || slug),
        tag: asString(en.tag, es.tag || ""),
        description: asString(en.description, detail.en?.summary || es.description || ""),
        longDescription: asString(en.longDescription, detail.en?.overview || es.longDescription || detail.es?.overview || ""),
        accent: asString(en.accent, es.accent || ""),
      },
    },
    media: {
      cover,
      gallery,
      video: {
        type: "youtube",
        url: youtubeUrl,
        youtubeId,
      },
    },
    visualOptions: raw.visualOptions || fallback.visualOptions,
    modulesOrder: Array.isArray(raw.modulesOrder) ? raw.modulesOrder : fallback.modulesOrder,
    modules: raw.modules || {},
    detail,
  };
}

export function buildCompatibleProject(project: ProjectDraft, categories: CategoryDefinition[], templates: VisualTemplateDefinition[]) {
  const category = categories.find((item) => item.id === project.category) || categories[0];
  const template = templates.find((item) => item.id === project.visualTemplate) || templates[0];
  const liveUrl = cleanOptionalUrl(project.liveUrl);
  const githubUrl = cleanOptionalUrl(project.githubUrl);
  const previewImage = project.previewImage || project.media.cover || project.media.gallery[0]?.src || "";
  const galleryImages = project.media.gallery.length > 0 ? project.media.gallery : previewImage ? [{ src: previewImage }] : [];
  const detailMetrics = Array.isArray((project.detail as any)?.metrics) && (project.detail as any).metrics.length > 0 ? (project.detail as any).metrics : moduleMetrics(project, "es");
  const problemItemsEs = moduleItems(project, "problem-solution", "es");
  const problemItemsEn = moduleItems(project, "problem-solution", "en");
  const timelineItemsEs = moduleItems(project, "timeline", "es");
  const timelineItemsEn = moduleItems(project, "timeline", "en");
  const metricResultsEs = moduleMetrics(project, "es").map((item) => `${item.value} ${item.label}`);
  const metricResultsEn = moduleMetrics(project, "en").map((item) => `${item.value} ${item.label}`);
  const links = [
    liveUrl
      ? {
          type: "demo",
          href: liveUrl,
          label: { es: "Abrir demo", en: "Open demo" },
        }
      : null,
    githubUrl
      ? {
          type: "repo",
          href: githubUrl,
          label: { es: "Repositorio", en: "Repository" },
        }
      : null,
  ].filter(Boolean);

  return {
    ...project,
    href: `/proyectos/${project.slug}`,
    liveUrl: liveUrl || undefined,
    githubUrl: githubUrl || undefined,
    previewImage,
    media: {
      cover: project.media.cover || "",
      gallery: project.media.gallery.map(({ sourcePath: _sourcePath, isExternal: _isExternal, ...image }) => image),
      video: project.media.video,
    },
    visualClass: template.visualClass,
    showInHome: project.showInHome === false ? false : undefined,
    copy: {
      es: {
        title: project.copy.es.title,
        tag: project.copy.es.tag || category.label.es,
        description: project.copy.es.description || project.copy.es.title,
        accent: project.copy.es.accent || category.label.es,
        longDescription: project.copy.es.longDescription || "",
      },
      en: {
        title: project.copy.en.title || project.copy.es.title,
        tag: project.copy.en.tag || project.copy.es.tag || category.label.en || category.label.es,
        description: project.copy.en.description || project.copy.es.description || project.copy.es.title,
        accent: project.copy.en.accent || category.label.en || category.label.es,
        longDescription: project.copy.en.longDescription || project.copy.es.longDescription || "",
      },
    },
    detail: {
      ...(project.detail || {}),
      category: category.label.es,
      stack: project.stack,
      metrics: detailMetrics,
      media: {
        images: galleryImages.map((image, index) => {
          const normalizedImage: Record<string, unknown> = {
            src: image.src,
            alt: image.alt || {
              es: `${project.copy.es.title || project.slug} captura ${index + 1}`,
              en: `${project.copy.en.title || project.slug} screenshot ${index + 1}`,
            },
          };

          if (image.caption?.es || image.caption?.en) {
            normalizedImage.caption = {
              es: image.caption.es || image.caption.en || "Captura del proyecto",
              en: image.caption.en || image.caption.es,
            };
          }

          return normalizedImage;
        }),
        videos: [],
      },
      links,
      liveUrl: liveUrl || undefined,
      es: {
        summary: project.copy.es.description || project.copy.es.title,
        overview: project.copy.es.longDescription || project.copy.es.description || project.copy.es.title,
        challenge:
          problemItemsEs[0] ||
          (project.detail as any)?.es?.challenge ||
          project.copy.es.description ||
          project.copy.es.title,
        solution:
          problemItemsEs[1] ||
          (project.detail as any)?.es?.solution ||
          project.copy.es.longDescription ||
          project.copy.es.description ||
          project.copy.es.title,
        process: timelineItemsEs.length > 0 ? timelineItemsEs : (project.detail as any)?.es?.process || [],
        results: metricResultsEs.length > 0 ? metricResultsEs : (project.detail as any)?.es?.results || [],
        deliverables: (project.detail as any)?.es?.deliverables || [],
        learnings: (project.detail as any)?.es?.learnings || [],
        interactiveTitle: liveUrl ? `Explora ${project.copy.es.title} desde el portafolio` : undefined,
        interactiveDescription: liveUrl
          ? "Esta demo en vivo carga el proyecto publicado para que puedas recorrerlo directamente desde esta ficha."
          : undefined,
      },
      en: {
        summary: project.copy.en.description || project.copy.es.description || project.copy.es.title,
        overview: project.copy.en.longDescription || project.copy.es.longDescription || project.copy.en.description || project.copy.es.title,
        challenge: problemItemsEn[0] || (project.detail as any)?.en?.challenge || project.copy.en.description || project.copy.es.description || project.copy.es.title,
        solution: problemItemsEn[1] || (project.detail as any)?.en?.solution || project.copy.en.longDescription || project.copy.en.description || project.copy.es.title,
        process: timelineItemsEn.length > 0 ? timelineItemsEn : (project.detail as any)?.en?.process || [],
        results: metricResultsEn.length > 0 ? metricResultsEn : (project.detail as any)?.en?.results || [],
        deliverables: (project.detail as any)?.en?.deliverables || [],
        learnings: (project.detail as any)?.en?.learnings || [],
        interactiveTitle: liveUrl ? `Explore ${project.copy.en.title || project.copy.es.title} from the portfolio` : undefined,
        interactiveDescription: liveUrl
          ? "This live demo loads the published project so you can explore it directly from this case study."
          : undefined,
      },
    },
  };
}

export function retargetProjectAssetPaths<T>(project: T, originalSlug?: string, nextSlug?: string): T {
  if (!originalSlug || !nextSlug || originalSlug === nextSlug) {
    return project;
  }

  const oldPrefix = `/projects/${originalSlug}/`;
  const newPrefix = `/projects/${nextSlug}/`;

  const rewrite = (value: unknown): unknown => {
    if (typeof value === "string") {
      return value.startsWith(oldPrefix) ? `${newPrefix}${value.slice(oldPrefix.length)}` : value;
    }

    if (Array.isArray(value)) {
      return value.map(rewrite);
    }

    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, rewrite(entry)]));
    }

    return value;
  };

  return rewrite(project) as T;
}

export function validateProject(project: ProjectDraft, existingSlugs: string[], originalSlug?: string): ValidationMessage[] {
  const messages: ValidationMessage[] = [];

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)) {
    messages.push({ level: "error", message: "El slug solo puede tener minúsculas, números y guiones." });
  }

  if (existingSlugs.includes(project.slug) && project.slug !== originalSlug) {
    messages.push({ level: "error", message: "Ya existe otro proyecto con ese slug." });
  }

  if (!project.copy.es.title.trim()) {
    messages.push({ level: "error", message: "El título en español es obligatorio." });
  }

  if (!project.copy.en.title.trim() || !project.copy.en.description.trim()) {
    messages.push({ level: "warning", message: "Falta contenido en inglés. Puedes guardar, pero se verá incompleto." });
  }

  const liveUrl = cleanOptionalUrl(project.liveUrl);
  if (liveUrl && !isValidHttpUrl(liveUrl)) {
    messages.push({ level: "error", message: "La URL demo debe ser http/https valida o quedar vacia." });
  }

  if (!project.previewImage && !project.media.cover && project.media.gallery.length === 0) {
    messages.push({ level: "warning", message: "No hay preview principal. Se usará un visual de respaldo." });
  }

  if (project.media.video.url && !extractYoutubeId(project.media.video.url)) {
    messages.push({ level: "error", message: "La URL de YouTube no es válida." });
  }

  Object.entries(project.modules).forEach(([id, module]) => {
    const hasBody = Boolean(module.body?.es || module.body?.en);
    const hasItems = Array.isArray(module.items) && module.items.length > 0;
    const hasCode = Boolean(module.code);
    const hasLinks = Array.isArray(module.links) && module.links.length > 0;
    if (!hasBody && !hasItems && !hasCode && !hasLinks) {
      messages.push({ level: "warning", message: `El módulo "${id}" está vacío y no se renderizará.` });
    }
  });

  messages.push({ level: "info", message: "Los proyectos nuevos se publican en la home por defecto." });
  return messages;
}

export function buildAssetInputs(project: ProjectDraft): AssetInput[] {
  const inputs: AssetInput[] = [];
  const localGallery = project.media.gallery.filter((image) => image.sourcePath && !image.isExternal);

  localGallery.forEach((image, index) => {
    const projectAssetMatch = image.src.match(/^\/projects\/[^/]+\/([^/]+)$/);
    const targetName = projectAssetMatch?.[1] || `gallery-${String(index + 1).padStart(2, "0")}.webp`;

    inputs.push({
      sourcePath: image.sourcePath || "",
      targetName,
    });
  });

  return inputs;
}

export function addTechnology(existing: Technology[], name: string): Technology {
  const slug = slugify(name);
  const found = existing.find((item) => item.slug === slug);
  if (found) {
    return found;
  }

  return {
    name,
    slug,
    icon: "",
    color: "#8B7CF6",
    category: "other",
  };
}
