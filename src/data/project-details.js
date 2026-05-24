import projectCards from "./projects.generated.json";
import projectStudioPreview from "./project-studio-preview.generated.json";

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
  const projectVideo = projectMedia.video?.youtubeId || projectMedia.video?.playlistId || projectMedia.video?.url ? [projectMedia.video] : [];
  const youtubeSource = projectMedia.video?.youtubeId || projectMedia.video?.playlistId ? projectMedia.video : media.video;

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
    youtube: youtubeSource?.youtubeId || youtubeSource?.playlistId
      ? {
          type: "youtube",
          url: youtubeSource.url,
          youtubeId: youtubeSource.youtubeId || "",
          playlistId: youtubeSource.playlistId || "",
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

function fallbackProjectModules(project) {
  const detail = project.detail ?? {};
  const modules = {};
  const modulesOrder = [];

  if (Array.isArray(detail.modules)) {
    detail.modules.forEach((module, index) => {
      if (!module || typeof module !== "object") {
        return;
      }

      const id = `studio-module-${index + 1}`;
      modules[id] = {
        label: "Modulo",
        title: module.title ?? `Modulo ${index + 1}`,
        body: module.body ?? module.description ?? "",
      };
      modulesOrder.push(id);
    });
  }

  if (Array.isArray(detail.flow) && detail.flow.length > 0) {
    modules.timeline = {
      label: "Flujo",
      title: "Flujo",
      body: "Linea de tiempo del recorrido o proceso del proyecto.",
      items: detail.flow.map((step) => ({
        label: step.step,
        title: step.title,
        description: step.description,
      })),
    };
    modulesOrder.push("timeline");
  }

  return { modules, modulesOrder };
}

function normalizeModules(project, lang) {
  const fallbackModules = fallbackProjectModules(project);
  const hasProjectModules = project.modules && Object.keys(project.modules).length > 0;
  const modules = hasProjectModules ? project.modules : fallbackModules.modules;
  const entries = Object.entries(modules);

  return entries.reduce((accumulator, [id, module]) => {
    if (!module || typeof module !== "object") {
      return accumulator;
    }

    accumulator[id] = {
      ...module,
      label: pickLocalized(module.label, lang, ""),
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

function normalizeModulesOrder(project) {
  const fallbackModules = fallbackProjectModules(project);
  const modulesOrder = Array.isArray(project.modulesOrder) && project.modulesOrder.length > 0 ? project.modulesOrder : fallbackModules.modulesOrder;
  const modules = project.modules && Object.keys(project.modules).length > 0 ? project.modules : fallbackModules.modules;

  return modulesOrder.filter((id) => modules[id]);
}

function normalizeSectionOrder(value) {
  const defaultOrder = ["images", "videos", "modules"];
  const order = Array.isArray(value) ? value.filter((item) => defaultOrder.includes(item)) : [];

  return [...order, ...defaultOrder.filter((item) => !order.includes(item))];
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
  const longDescription = pickField(detailLang, detailEs, "longDescription", "");

  return {
    title,
    accent,
    tag,
    description: pickText(copy.description, fallbackCopy.description ?? summary),
    category: pickLocalized(detail.category, lang, categoryLabels[lang][project.category] ?? project.category),
    summary,
    overview,
    longDescription,
    challenge: pickField(detailLang, detailEs, "challenge"),
    solution: pickField(detailLang, detailEs, "solution"),
    process: pickArray(detailLang, detailEs, "process"),
    results: pickArray(detailLang, detailEs, "results"),
    deliverables: pickArray(detailLang, detailEs, "deliverables"),
    learnings: pickArray(detailLang, detailEs, "learnings"),
    interactiveTitle: pickField(detailLang, detailEs, "interactiveTitle", `${title}`),
    interactiveDescription: pickField(detailLang, detailEs, "interactiveDescription"),
    stack: Array.isArray(project.stack) && project.stack.length > 0 ? project.stack : Array.isArray(detail.stack) ? detail.stack : [],
    metrics: Array.isArray(detail.metrics)
      ? detail.metrics.map((metric) => ({
          ...metric,
          label: pickLocalized(metric.label, lang, metric.label ?? ""),
        }))
      : [],
    links: normalizeLinks(detail, project, lang),
    media: normalizeMedia(project, detail, lang, title),
    modules: normalizeModules(project, lang),
    modulesOrder: normalizeModulesOrder(project),
    sectionOrder: normalizeSectionOrder(project.sectionOrder ?? detail.sectionOrder),
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
    modulesOrder: defaultLocale.modulesOrder,
    modules: defaultLocale.modules,
    sectionOrder: defaultLocale.sectionOrder,
  };
}

const previewProjectCards = import.meta.env.DEV && projectStudioPreview?.detail ? [projectStudioPreview] : [];
const allProjectCards = [...projectCards, ...previewProjectCards];

export const projectDetails = allProjectCards.filter((project) => project.detail).map(buildProjectDetail);

export function getProjectDetailBySlug(slug) {
  return projectDetails.find((project) => project.slug === slug);
}
