import projectCards from "./projects.generated.json";

const categoryLabels = {
  es: {
    web: "Web",
    branding: "Marca",
    automation: "Automatizacion",
    "web-platform": "Plataforma web",
    "landing-page": "Landing page",
    portfolio: "Portafolio",
    "mobile-app": "App movil",
    simulation: "Simulacion",
    "backend-api": "Backend/API",
    game: "Juego",
    "ui-design": "UI Design",
    "research-project": "Investigacion",
  },
  en: {
    web: "Web",
    branding: "Branding",
    automation: "Automation",
    "web-platform": "Web platform",
    "landing-page": "Landing page",
    portfolio: "Portfolio",
    "mobile-app": "Mobile app",
    simulation: "Simulation",
    "backend-api": "Backend/API",
    game: "Game",
    "ui-design": "UI Design",
    "research-project": "Research project",
  },
};

const linkLabels = {
  es: {
    demo: "Abrir demo",
    site: "Abrir sitio",
    repo: "Repositorio",
    docs: "Documentacion",
    video: "Ver video",
    custom: "Abrir enlace",
  },
  en: {
    demo: "Open demo",
    site: "Open site",
    repo: "Repository",
    docs: "Documentation",
    video: "Watch video",
    custom: "Open link",
  },
};

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function pickText(primary, fallback = "") {
  return hasText(primary) ? primary : fallback;
}

function pickLocalized(value, lang, fallback = "") {
  if (typeof value === "string") {
    return pickText(value, fallback);
  }

  if (!value) {
    return fallback;
  }

  return pickText(value[lang], pickText(value.es, fallback));
}

function pickField(current, fallback, key, defaultValue = "") {
  return pickText(current?.[key], pickText(fallback?.[key], defaultValue));
}

function pickArray(current, fallback, key) {
  const currentValue = current?.[key];
  const fallbackValue = fallback?.[key];

  if (Array.isArray(currentValue) && currentValue.length > 0) {
    return currentValue;
  }

  return Array.isArray(fallbackValue) ? fallbackValue : [];
}

function normalizeLinks(detail, project, lang) {
  const liveUrl = detail.liveUrl ?? project.liveUrl;
  const links = Array.isArray(detail.links) ? detail.links : [];
  const normalizedLinks = links
    .filter((link) => hasText(link?.href))
    .map((link) => {
      const type = link.type || "custom";

      return {
        type,
        href: link.href,
        label: pickLocalized(link.label, lang, linkLabels[lang][type] ?? linkLabels[lang].custom),
      };
    });

  if (liveUrl && !normalizedLinks.some((link) => link.href === liveUrl)) {
    normalizedLinks.unshift({
      type: "demo",
      href: liveUrl,
      label: linkLabels[lang].demo,
    });
  }

  return normalizedLinks;
}

function normalizeMedia(project, detail, lang, title) {
  const media = detail.media ?? {};
  const projectMedia = project.media ?? {};
  const images = Array.isArray(media.images) ? media.images : [];
  const gallery = Array.isArray(projectMedia.gallery) ? projectMedia.gallery : [];
  const projectImages = gallery
    .map((image) => (typeof image === "string" ? { src: image } : image))
    .filter((image) => hasText(image?.src));
  const coverImage = hasText(projectMedia.cover) ? [{ src: projectMedia.cover }] : [];
  const normalizedImages = images.length > 0 ? images : [...coverImage, ...projectImages];
  const videos = Array.isArray(media.videos) ? media.videos : [];
  const projectVideo = projectMedia.video?.youtubeId || projectMedia.video?.url ? [projectMedia.video] : [];

  return {
    images: normalizedImages
      .filter((image) => hasText(image?.src))
      .map((image, index) => ({
        src: image.src,
        alt: pickLocalized(image.alt, lang, `${title} screenshot ${index + 1}`),
        caption: pickLocalized(image.caption, lang, ""),
      })),
    videos: [...videos, ...projectVideo]
      .filter((video) => hasText(video?.src))
      .map((video, index) => ({
        src: video.src,
        poster: video.poster,
        title: pickLocalized(video.title, lang, `${title} video ${index + 1}`),
        caption: pickLocalized(video.caption, lang, ""),
      })),
    youtube: projectMedia.video?.youtubeId
      ? {
          type: "youtube",
          url: projectMedia.video.url,
          youtubeId: projectMedia.video.youtubeId,
        }
      : media.video?.youtubeId
        ? {
            type: "youtube",
            url: media.video.url,
            youtubeId: media.video.youtubeId,
          }
        : null,
  };
}

function normalizeModuleItem(item, lang) {
  if (typeof item === "string") {
    return item;
  }

  if (!item || typeof item !== "object") {
    return "";
  }

  return {
    ...item,
    title: pickLocalized(item.title, lang, item.title ?? ""),
    label: pickLocalized(item.label, lang, item.label ?? ""),
    description: pickLocalized(item.description, lang, item.description ?? ""),
    value: item.value ?? "",
  };
}

function normalizeModules(project, lang) {
  const modules = project.modules ?? {};
  const entries = Object.entries(modules);

  return entries.reduce((accumulator, [id, module]) => {
    if (!module || typeof module !== "object") {
      return accumulator;
    }

    accumulator[id] = {
      ...module,
      title: pickLocalized(module.title, lang, id),
      body: pickLocalized(module.body, lang, ""),
      items: Array.isArray(module.items) ? module.items.map((item) => normalizeModuleItem(item, lang)).filter(Boolean) : [],
      links: Array.isArray(module.links)
        ? module.links.map((link) => ({
            ...link,
            label: pickLocalized(link.label, lang, link.href),
          }))
        : [],
    };

    return accumulator;
  }, {});
}

function buildLocale(project, lang) {
  const copy = project.copy?.[lang] ?? project.copy?.es ?? {};
  const fallbackCopy = project.copy?.es ?? {};
  const detail = project.detail ?? {};
  const detailEs = detail.es ?? {};
  const detailLang = detail[lang] ?? {};
  const title = pickField(detailLang, detailEs, "title", pickText(copy.title, pickText(fallbackCopy.title, project.slug)));
  const accent = pickField(detailLang, detailEs, "accent", pickText(copy.accent, fallbackCopy.accent ?? ""));
  const tag = pickField(detailLang, detailEs, "tag", pickText(copy.tag, fallbackCopy.tag ?? ""));
  const summary = pickField(detailLang, detailEs, "summary", pickText(copy.description, fallbackCopy.description ?? ""));
  const overview = pickField(detailLang, detailEs, "overview", pickText(copy.longDescription, pickText(fallbackCopy.longDescription, "")));

  return {
    title,
    accent,
    tag,
    description: pickText(copy.description, fallbackCopy.description ?? summary),
    category: detail.category ?? categoryLabels[lang][project.category] ?? project.category,
    summary,
    overview,
    challenge: pickField(detailLang, detailEs, "challenge"),
    solution: pickField(detailLang, detailEs, "solution"),
    process: pickArray(detailLang, detailEs, "process"),
    results: pickArray(detailLang, detailEs, "results"),
    deliverables: pickArray(detailLang, detailEs, "deliverables"),
    learnings: pickArray(detailLang, detailEs, "learnings"),
    interactiveTitle: pickField(detailLang, detailEs, "interactiveTitle", `${title}`),
    interactiveDescription: pickField(detailLang, detailEs, "interactiveDescription"),
    stack: Array.isArray(project.stack) && project.stack.length > 0 ? project.stack : Array.isArray(detail.stack) ? detail.stack : [],
    metrics: Array.isArray(detail.metrics) ? detail.metrics : [],
    links: normalizeLinks(detail, project, lang),
    media: normalizeMedia(project, detail, lang, title),
    modules: normalizeModules(project, lang),
    modulesOrder: Array.isArray(project.modulesOrder) ? project.modulesOrder : [],
  };
}

function buildProjectDetail(project) {
  const detail = project.detail ?? {};
  const locales = {
    es: buildLocale(project, "es"),
    en: buildLocale(project, "en"),
  };
  const defaultLocale = locales.es;

  return {
    ...project,
    ...defaultLocale,
    locales,
    previewImage: detail.previewImage ?? project.previewImage,
    visualClass: detail.visualClass ?? project.visualClass,
    liveUrl: detail.liveUrl ?? project.liveUrl,
    githubUrl: project.githubUrl,
    visualTemplate: project.visualTemplate ?? "minimal",
    featuredLevel: project.featuredLevel ?? "normal",
    status: project.status ?? "completed",
    pinned: Boolean(project.pinned),
    priority: Number.isFinite(project.priority) ? project.priority : undefined,
    modulesOrder: Array.isArray(project.modulesOrder) ? project.modulesOrder : [],
    modules: project.modules ?? {},
  };
}

export const projectDetails = projectCards.filter((project) => project.detail).map(buildProjectDetail);

export function getProjectDetailBySlug(slug) {
  return projectDetails.find((project) => project.slug === slug);
}
