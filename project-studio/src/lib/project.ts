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
  const previewImage = project.previewImage || project.media.cover || project.media.gallery[0]?.src || "";
  const galleryImages = project.media.gallery.length > 0 ? project.media.gallery : previewImage ? [{ src: previewImage }] : [];
  const links = [
    project.liveUrl
      ? {
          type: "demo",
          href: project.liveUrl,
          label: { es: "Abrir demo", en: "Open demo" },
        }
      : null,
    project.githubUrl
      ? {
          type: "repo",
          href: project.githubUrl,
          label: { es: "Repositorio", en: "Repository" },
        }
      : null,
  ].filter(Boolean);

  return {
    ...project,
    href: `/proyectos/${project.slug}`,
    liveUrl: project.liveUrl || undefined,
    githubUrl: project.githubUrl || undefined,
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
      liveUrl: project.liveUrl || undefined,
      es: {
        summary: project.copy.es.description || project.copy.es.title,
        overview: project.copy.es.longDescription || project.copy.es.description || project.copy.es.title,
        challenge:
          (project.modules["problem-solution"]?.items?.[0] as any)?.description ||
          (project.detail as any)?.es?.challenge ||
          project.copy.es.description ||
          project.copy.es.title,
        solution:
          (project.modules["problem-solution"]?.items?.[1] as any)?.description ||
          (project.detail as any)?.es?.solution ||
          project.copy.es.longDescription ||
          project.copy.es.description ||
          project.copy.es.title,
        process: Array.isArray(project.modules.timeline?.items)
          ? project.modules.timeline.items.map((item: any) => item.description || item.title || item)
          : (project.detail as any)?.es?.process || [],
        results: Array.isArray(project.modules.metrics?.items)
          ? project.modules.metrics.items.map((item: any) => `${item.value || ""} ${item.label || ""}`.trim())
          : (project.detail as any)?.es?.results || [],
        deliverables: (project.detail as any)?.es?.deliverables || [],
        learnings: (project.detail as any)?.es?.learnings || [],
        interactiveTitle: project.liveUrl ? `Explora ${project.copy.es.title} desde el portafolio` : undefined,
        interactiveDescription: project.liveUrl
          ? "Esta demo en vivo carga el proyecto publicado para que puedas recorrerlo directamente desde esta ficha."
          : undefined,
      },
      en: {
        summary: project.copy.en.description || project.copy.es.description || project.copy.es.title,
        overview: project.copy.en.longDescription || project.copy.es.longDescription || project.copy.en.description || project.copy.es.title,
        challenge: (project.detail as any)?.en?.challenge || project.copy.en.description || project.copy.es.description || project.copy.es.title,
        solution: (project.detail as any)?.en?.solution || project.copy.en.longDescription || project.copy.en.description || project.copy.es.title,
        process: (project.detail as any)?.en?.process || [],
        results: (project.detail as any)?.en?.results || [],
        deliverables: (project.detail as any)?.en?.deliverables || [],
        learnings: (project.detail as any)?.en?.learnings || [],
        interactiveTitle: project.liveUrl ? `Explore ${project.copy.en.title || project.copy.es.title} from the portfolio` : undefined,
        interactiveDescription: project.liveUrl
          ? "This live demo loads the published project so you can explore it directly from this case study."
          : undefined,
      },
    },
  };
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
    const targetName = image.src.includes("preview.webp")
      ? "preview.webp"
      : image.src.includes("cover.webp")
        ? "cover.webp"
        : `gallery-${String(index + 1).padStart(2, "0")}.webp`;

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
