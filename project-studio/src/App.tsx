import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  CheckCircle2,
  ChevronRight,
  ChevronUp,
  CircleDot,
  Eye,
  EyeOff,
  ExternalLink,
  FolderOpen,
  FolderCog,
  HelpCircle,
  ImagePlus,
  Moon,
  Plus,
  Save,
  Sun,
  Table2,
  Trash2,
  X,
} from "lucide-react";
import { getSectionById, studioSections } from "./lib/project";
import type {
  AboutFormState,
  AboutGroupKind,
  BlogFormState,
  CertificateFormState,
  ContentKind,
  CreatedProject,
  DevelopmentFormState,
  InterestFormState,
  ProfileFormState,
  PickedCertificateFile,
  ProjectPreviewResult,
  ProjectExtraLink,
  ProjectCollaborator,
  ProjectFlowStep,
  ProjectFormState,
  ProjectImage,
  ProjectListItem,
  ProjectMetric,
  ProjectModule,
  ProjectPreviewSection,
  ProjectVideo,
  SavedContent,
  StudioContentItem,
  StudioSectionId,
} from "./types";

const currentYear = String(new Date().getFullYear());

const defaultProjectForm = (): ProjectFormState => ({
  title: "",
  slug: "",
  category: "web",
  year: currentYear,
  tag: "Web",
  accent: "Producto digital",
  description: "",
  titleEn: "",
  tagEn: "",
  accentEn: "",
  descriptionEn: "",
  detailCategory: "Producto digital",
  detailCategoryEn: "Digital product",
  summary: "",
  summaryEn: "",
  overview: "",
  overviewEn: "",
  challenge: "",
  challengeEn: "",
  solution: "",
  solutionEn: "",
  process: [],
  processEn: [],
  results: "",
  resultsEn: "",
  stack: "",
  deliverables: "",
  deliverablesEn: "",
  learnings: "",
  learningsEn: "",
  liveUrl: "",
  repoUrl: "",
  previewImage: "",
  visualClass: "visual-brand",
  showInHome: true,
  status: "completed",
  featuredLevel: "",
  extraLinks: [],
  metrics: [],
  modules: [],
  flow: [],
  images: [],
  videos: [],
  collaborators: [],
  sectionOrder: ["images", "videos", "modules"],
});

const defaultCertificateForm = (): CertificateFormState => ({
  id: "",
  fileName: "",
  certificateType: "pdf",
  mime: "application/pdf",
  issued: currentYear,
  status: "completed",
  hidden: false,
  title: "",
  issuer: "Formacion",
  tags: "PDF",
  titleEn: "",
  issuerEn: "Training",
  tagsEn: "",
});

const defaultDevelopmentForm = (): DevelopmentFormState => ({
  id: "",
  kind: "project",
  cover: "",
  progress: "35",
  certificateUrl: "",
  hidden: false,
  title: "",
  description: "",
  titleEn: "",
  descriptionEn: "",
});

const defaultBlogForm = (): BlogFormState => ({
  slug: "",
  filter: "Contenido",
  visualClass: "visual-notes",
  cover: "",
  articleImage: "",
  category: "Contenido",
  date: "Mayo 2026",
  readTime: "4 min de lectura",
  title: "",
  phrase: "",
  excerpt: "",
  body: "",
  introduction: "",
  paragraphs: "",
  highlights: "",
  categoryEn: "Content",
  dateEn: "May 2026",
  readTimeEn: "4 min read",
  titleEn: "",
  phraseEn: "",
  excerptEn: "",
  bodyEn: "",
  introductionEn: "",
  paragraphsEn: "",
  highlightsEn: "",
  imageCredit: "",
  imageCreditEn: "",
});

const defaultInterestForm = (): InterestFormState => ({
  filter: "movies",
  visualClass: "visual-cinema",
  image: "",
  category: "Peliculas",
  title: "",
  meta: "",
  description: "",
  body: "",
  tags: "",
  categoryEn: "Movies",
  titleEn: "",
  metaEn: "",
  descriptionEn: "",
  bodyEn: "",
  tagsEn: "",
});

const defaultProfileForm = (): ProfileFormState => ({
  name: "JONATHAN ACEVEDO",
  fullName: "Jonathan Estiben Acevedo López",
  initials: "JEAL",
  email: "jonalopezacevedo@gmail.com",
  linkedin: "https://www.linkedin.com/in/jonathan-estiben-acevedo-l%C3%B3pez-066b3226a",
  github: "https://github.com/Jonathan1Estiben2Acevedo3Lopez",
  gitlab: "https://gitlab.com/JonathanAcevedo",
  cvPath: "/CV_Jonathan_Acevedo.pdf",
  description:
    "Me considero una persona curiosa, apasionada por los retos y por encontrar soluciones innovadoras. Disfruto relacionarme con las personas, enfrentar nuevos desafíos y trabajar en equipo para crecer, aportar y generar un impacto positivo.",
  focus: "\"Lo profesional empieza por lo humano.\"",
  descriptionEn:
    "I consider myself a curious person, passionate about challenges and about finding innovative solutions. I enjoy connecting with people, facing new challenges and working as a team to grow, contribute and create a positive impact.",
  focusEn: "\"Professional work starts with the human side.\"",
});

const defaultAboutForm = (group: AboutGroupKind = "education"): AboutFormState => ({
  group,
  period: currentYear,
  title: "",
  category: "",
  institution: "",
  detail: "",
  skills: "",
  stack: "",
  focus: "",
  detailPlacement: "",
  titleEn: "",
  categoryEn: "",
  institutionEn: "",
  detailEn: "",
  skillsEn: "",
  focusEn: "",
});

const contentSectionKinds: Partial<Record<StudioSectionId, ContentKind>> = {
  about: "about",
  development: "development",
  certificates: "certificates",
  blog: "blog",
  interests: "interests",
};

const completedStatuses = new Set([
  "completed",
  "complete",
  "done",
  "finished",
  "published",
  "terminado",
  "terminada",
  "completado",
  "completada",
  "finalizado",
  "finalizada",
  "publicado",
  "publicada",
]);

const developmentStatuses = new Set([
  "in-progress",
  "in progress",
  "progress",
  "pending",
  "wip",
  "draft",
  "concept",
  "concepto",
  "planned",
  "en-progreso",
  "en progreso",
  "en-desarrollo",
  "en desarrollo",
  "pendiente",
  "por terminar",
]);

const isDevelopmentStatus = (value: string | null | undefined) => {
  const status = String(value || "").trim().toLowerCase();

  if (!status) {
    return false;
  }

  return developmentStatuses.has(status) || !completedStatuses.has(status);
};

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const fieldHints = {
  title: "Nombre publico del proyecto. Es el titulo que vera la persona en la tarjeta y en la ficha.",
  slug: "Identificador de la URL. Usa minusculas, numeros y guiones. Ejemplo: docqee-panel-medico.",
  year: "Año que aparecera asociado al proyecto. Normalmente el año de publicacion o cierre.",
  category: "Grupo usado para filtrar proyectos en el portafolio.",
  tag: "Etiqueta corta que aparece arriba del titulo de la tarjeta. Ejemplo: Web, Producto digital, IA.",
  accent: "Frase breve que define el enfoque visual o conceptual del proyecto. Ejemplo: Producto digital, Dashboard, Automatizacion.",
  visualClass: "Estilo visual de respaldo para la tarjeta cuando no hay imagen preview.",
  description: "Texto corto que aparece bajo el titulo del proyecto y en la tarjeta. Debe explicar el valor en una o dos frases.",
  detailCategory: "Categoria visible dentro de la pagina individual del proyecto.",
  stack: "Selecciona tecnologias de la lista o agrega una nueva si no aparece.",
  summary: "Resumen que aparece dentro del bloque Resumen de la ficha del proyecto.",
  overview: "Descripcion amplia del proyecto: contexto, objetivo y que construiste. Aparece en su propio bloque.",
  challenge: "Problema principal o reto que resolviste.",
  solution: "Como resolviste el reto: decisiones, flujo, interfaz o arquitectura.",
  process: "Agrega cada paso del proceso por separado. En el preview se vera como una linea de tiempo numerada.",
  results: "Resultados o mejoras obtenidas en formato de parrafo.",
  liveUrl: "Enlace a la demo o sitio publicado. Debe empezar por https:// si es externo.",
  repoUrl: "Enlace al repositorio del proyecto, si lo quieres mostrar.",
  previewImage: "Ruta de imagen en public o URL externa. Ejemplo: /docqee-preview.png.",
  developmentCover: "Imagen de portada para la tarjeta de En desarrollo. Puede ser una ruta de public o una URL.",
  developmentProgress: "Porcentaje de avance visible en la tarjeta. Usa un numero entre 0 y 100.",
  developmentCertificateUrl: "Enlace opcional al certificado online. Solo se muestra cuando el tipo es Certificado.",
  interestImage: "Imagen de portada del interes. Puede ser una ruta de public o una URL externa.",
  profileDescription: "Texto principal que aparece en el hero del portafolio.",
  profileFocus: "Frase corta que aparece en la tarjeta de enfoque del hero.",
  profileCvPath: "Ruta del CV en public o URL externa. Ejemplo: /CV_Jonathan_Acevedo.pdf.",
  profileLink: "Enlace usado en los botones y en la seccion de contacto.",
  blogTitle: "Titulo publico de la nota. Aparece en la lista, en el destacado y en la pagina del blog.",
  blogSlug: "Identificador de la URL. Usa minusculas, numeros y guiones. Ejemplo: automatizaciones-qa.",
  blogCategory: "Categoria visible y filtro publico de la nota. Ejemplo: Automatizaciones, QA, Diseno.",
  blogDate: "Fecha visible de publicacion. Ejemplo: Mayo 2026.",
  blogReadTime: "Tiempo estimado de lectura. Ejemplo: 6 min de lectura.",
  blogVisualClass: "Estilo visual de respaldo si no agregas portada. Ejemplo: visual-notes.",
  blogCover: "Imagen de portada para el destacado y la tarjeta del blog. Usa una ruta de public o importa una imagen.",
  blogArticleImage: "Imagen horizontal para la pagina del articulo. Recomendado: formato 16:9 o panoramico.",
  blogPhrase: "Frase editorial que aparece bajo el titulo en el articulo completo. Es obligatoria y debe ser breve.",
  blogExcerpt: "Texto para las cards iniciales/listado del blog en el portafolio.",
  blogBody: "Texto inicial de la pagina completa del blog. Va sin titulo y aparece antes de la introduccion.",
  blogIntroduction: "Introduccion de la pagina completa del blog. No se usa en las cards.",
  blogParagraphs: "Bloques principales del blog completo. Usa # Titulo, ## Subtitulo, - item para listas, 1. item para listas numeradas y tablas con columnas separadas por |.",
  blogHighlights: "Ideas clave mostradas en la pagina individual. Escribe un punto por linea.",
  blogImageCredit: "Nombre, herramienta o fuente que creo la imagen del articulo. Aparece debajo de la imagen.",
  contentHidden: "Oculta este contenido del portafolio publico sin eliminarlo del archivo. Puedes volver a mostrarlo cuando quieras.",
  status: "Estado interno o publico del proyecto: completado, en progreso, concepto, etc.",
  featuredLevel: "Nivel de destaque en el portafolio. Principal debe reservarse para el proyecto mas importante.",
  showInHome: "Activalo si este proyecto debe aparecer en la pagina principal del portafolio.",
  extraLinks: "Enlaces adicionales como documentacion, articulo, video externo o landing relacionada.",
  metrics: "Datos destacados del resultado. Ejemplo: +35%, 4 modulos, 2 semanas.",
  modules: "Partes funcionales del proyecto. Ejemplo: Panel administrativo, autenticacion, reportes.",
  flow: "Pasos del recorrido o proceso del proyecto. Sirve para explicar la evolucion de la solucion.",
  images: "Capturas o imagenes que apareceran en la ficha. Usa rutas de public como /captura.png.",
  videos: "Videos locales o URLs que documenten el proyecto.",
  collaborators: "Personas que colaboraron en el proyecto. Puedes agregar foto y enlaces externos.",
  sectionOrder: "Orden en que apareceran estas secciones en el preview. Las secciones sin contenido se ocultan solas.",
  englishFallback: "Version en ingles. Si queda vacio, el portafolio usara el texto en espanol como respaldo.",
} as const;

type OptionalListKey = "extraLinks" | "metrics" | "modules" | "flow" | "images" | "videos" | "collaborators";

type OptionalListItem = ProjectExtraLink | ProjectMetric | ProjectModule | ProjectFlowStep | ProjectImage | ProjectVideo | ProjectCollaborator;

type ImagePickSource = "import" | "existing";

type ImagePickTarget =
  | { kind: "preview" }
  | { kind: "developmentCover" }
  | { kind: "blogCover" }
  | { kind: "blogArticleImage" }
  | { kind: "interestImage" }
  | { kind: "gallery"; index: number }
  | { kind: "videoPoster"; index: number }
  | { kind: "collaboratorPhoto"; index: number };

const optionalListItems = {
  extraLinks: (): ProjectExtraLink => ({ type: "custom", href: "", labelEs: "", labelEn: "" }),
  metrics: (): ProjectMetric => ({ value: "", label: "", labelEn: "" }),
  modules: (): ProjectModule => ({ title: "", titleEn: "", description: "", descriptionEn: "" }),
  flow: (): ProjectFlowStep => ({ step: "", title: "", titleEn: "", description: "", descriptionEn: "" }),
  images: (): ProjectImage => ({ src: "", altEs: "", altEn: "", captionEs: "", captionEn: "" }),
  videos: (): ProjectVideo => ({ src: "", poster: "", titleEs: "", titleEn: "", captionEs: "", captionEn: "" }),
  collaborators: (): ProjectCollaborator => ({
    name: "",
    role: "",
    roleEn: "",
    photo: "",
    portfolioUrl: "",
    githubUrl: "",
    linkedinUrl: "",
  }),
};

const previewSectionOptions: Array<{ id: ProjectPreviewSection; label: string; detail: string }> = [
  { id: "images", label: "Imagenes", detail: "Carrusel de capturas y mockups" },
  { id: "videos", label: "Videos", detail: "Carrusel de demos o videos" },
  { id: "modules", label: "Modulos y flujo", detail: "Bloques funcionales y pasos extra" },
];

const stackCatalog = [
  "Astro",
  "React",
  "TypeScript",
  "JavaScript",
  "HTML",
  "CSS",
  "Tailwind CSS",
  "Node.js",
  "Vite",
  "Tauri",
  "Rust",
  "Python",
  "FastAPI",
  "Django",
  "Next.js",
  "Express",
  "Supabase",
  "Firebase",
  "PostgreSQL",
  "MongoDB",
  "SQLite",
  "Prisma",
  "GraphQL",
  "REST API",
  "OpenAI",
  "Figma",
  "Git",
  "GitHub",
  "Docker",
  "Vercel",
  "Netlify",
];

const normalizeStackKey = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

const splitStackItems = (value: string) =>
  value
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const uniqueStackItems = (items: string[]) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = normalizeStackKey(item);
    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const formatStackItems = (items: string[]) => uniqueStackItems(items).join(", ");

const uniqueTextOptions = (items: Array<string | null | undefined>) => {
  const seen = new Set<string>();

  return items
    .map((item) => String(item || "").trim())
    .filter((item) => {
      const key = normalizeStackKey(item);
      if (!key || seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .sort((itemA, itemB) => itemA.localeCompare(itemB, "es", { sensitivity: "base" }));
};

const localizedValue = (value: unknown, lang: "es" | "en", fallback = "") => {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const localized = record[lang];
    const es = record.es;

    return typeof localized === "string" && localized.trim()
      ? localized
      : typeof es === "string"
        ? es
        : fallback;
  }

  return fallback;
};

const textBlockValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string").join("\n");
  }

  return typeof value === "string" ? value : "";
};

const stringListValue = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

const normalizeProjectToForm = (project: Record<string, any>): ProjectFormState => {
  const form = defaultProjectForm();
  const detail = project.detail ?? {};
  const detailEs = detail.es ?? {};
  const detailEn = detail.en ?? {};
  const copyEs = project.copy?.es ?? {};
  const copyEn = project.copy?.en ?? {};
  const links = Array.isArray(detail.links) ? detail.links : [];
  const media = detail.media ?? {};

  return {
    ...form,
    title: copyEs.title ?? project.slug ?? "",
    slug: project.slug ?? "",
    category: project.category ?? form.category,
    year: project.year ?? form.year,
    tag: copyEs.tag ?? form.tag,
    accent: copyEs.accent ?? form.accent,
    description: copyEs.description ?? "",
    titleEn: copyEn.title ?? "",
    tagEn: copyEn.tag ?? "",
    accentEn: copyEn.accent ?? "",
    descriptionEn: copyEn.description ?? "",
    detailCategory: localizedValue(detail.category, "es", form.detailCategory),
    detailCategoryEn: localizedValue(detail.category, "en", form.detailCategoryEn),
    summary: detailEs.overview ?? "",
    summaryEn: detailEn.overview ?? "",
    overview: detailEs.longDescription ?? "",
    overviewEn: detailEn.longDescription ?? "",
    challenge: detailEs.challenge ?? "",
    challengeEn: detailEn.challenge ?? "",
    solution: detailEs.solution ?? "",
    solutionEn: detailEn.solution ?? "",
    process: stringListValue(detailEs.process),
    processEn: stringListValue(detailEn.process),
    results: textBlockValue(detailEs.results),
    resultsEn: textBlockValue(detailEn.results),
    stack: formatStackItems(Array.isArray(project.stack) && project.stack.length > 0 ? project.stack : Array.isArray(detail.stack) ? detail.stack : []),
    deliverables: stringListValue(detailEs.deliverables).join(", "),
    deliverablesEn: stringListValue(detailEn.deliverables).join(", "),
    learnings: stringListValue(detailEs.learnings).join(", "),
    learningsEn: stringListValue(detailEn.learnings).join(", "),
    liveUrl: detail.liveUrl ?? project.liveUrl ?? "",
    repoUrl: project.githubUrl ?? "",
    previewImage: detail.previewImage ?? project.previewImage ?? "",
    visualClass: detail.visualClass ?? project.visualClass ?? form.visualClass,
    showInHome: project.showInHome !== false,
    status: project.status ?? form.status,
    featuredLevel: project.featuredLevel ?? "",
    extraLinks: links
      .filter((link: any) => link?.href && !["demo", "repo"].includes(link.type ?? "custom"))
      .map((link: any) => ({
        type: link.type ?? "custom",
        href: link.href ?? "",
        labelEs: localizedValue(link.label, "es", "Abrir enlace"),
        labelEn: localizedValue(link.label, "en", ""),
      })),
    metrics: (Array.isArray(detail.metrics) ? detail.metrics : []).map((metric: any) => ({
      value: metric.value ?? "",
      label: localizedValue(metric.label, "es"),
      labelEn: localizedValue(metric.label, "en", ""),
    })),
    modules: (Array.isArray(detail.modules) ? detail.modules : []).map((module: any) => ({
      title: localizedValue(module.title, "es"),
      titleEn: localizedValue(module.title, "en", ""),
      description: localizedValue(module.description, "es"),
      descriptionEn: localizedValue(module.description, "en", ""),
    })),
    flow: (Array.isArray(detail.flow) ? detail.flow : []).map((step: any) => ({
      step: step.step ?? "",
      title: localizedValue(step.title, "es"),
      titleEn: localizedValue(step.title, "en", ""),
      description: localizedValue(step.description, "es"),
      descriptionEn: localizedValue(step.description, "en", ""),
    })),
    images: (Array.isArray(media.images) ? media.images : []).map((image: any) => ({
      src: image.src ?? "",
      altEs: localizedValue(image.alt, "es"),
      altEn: localizedValue(image.alt, "en", ""),
      captionEs: localizedValue(image.caption, "es"),
      captionEn: localizedValue(image.caption, "en", ""),
    })),
    videos: (Array.isArray(media.videos) ? media.videos : []).map((video: any) => ({
      src: video.src ?? "",
      poster: video.poster ?? "",
      titleEs: localizedValue(video.title, "es"),
      titleEn: localizedValue(video.title, "en", ""),
      captionEs: localizedValue(video.caption, "es"),
      captionEn: localizedValue(video.caption, "en", ""),
    })),
    collaborators: (Array.isArray(detail.collaborators) ? detail.collaborators : []).map((collaborator: any) => ({
      name: collaborator.name ?? "",
      role: localizedValue(collaborator.role, "es"),
      roleEn: localizedValue(collaborator.role, "en", ""),
      photo: collaborator.photo ?? "",
      portfolioUrl: collaborator.portfolioUrl ?? "",
      githubUrl: collaborator.githubUrl ?? "",
      linkedinUrl: collaborator.linkedinUrl ?? "",
    })),
    sectionOrder: Array.isArray(project.sectionOrder) && project.sectionOrder.length > 0 ? project.sectionOrder : form.sectionOrder,
  };
};

const blogBlocksPrefix = "<!-- blog-blocks -->\n";
const blogBlockSeparator = "\n<!-- blog-block -->\n";

const serializeTextBlocks = (blocks: string[]) => `${blogBlocksPrefix}${blocks.join(blogBlockSeparator)}`;

const joinTextLines = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").join("\n") : "";

const joinTextBlocks = (value: unknown) =>
  Array.isArray(value) ? serializeTextBlocks(value.filter((item): item is string => typeof item === "string")) : "";

const joinCommaList = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").join(", ") : "";

const splitTextBlocks = (value: string) =>
  value
    ? value.startsWith(blogBlocksPrefix)
      ? value.slice(blogBlocksPrefix.length).split(blogBlockSeparator)
      : value
          .split(/\r?\n\s*\r?\n/)
          .map((block) => block.trim())
          .filter(Boolean)
    : [];

type BlogTableDraft = {
  headers: string[];
  rows: string[][];
};

const createBlogTableDraft = (lang: "es" | "en"): BlogTableDraft => ({
  headers: lang === "es" ? ["Campo", "Descripcion"] : ["Field", "Description"],
  rows: [
    ["", ""],
    ["", ""],
  ],
});

const tableCellToMarkdown = (value: string) => value.replace(/\|/g, "/").replace(/\r?\n/g, " ").trim();

const buildBlogTableMarkdown = (draft: BlogTableDraft, lang: "es" | "en" = "es") => {
  const defaultHeader = lang === "es" ? "Columna" : "Column";
  const headers = draft.headers.map((header, index) => tableCellToMarkdown(header) || `${defaultHeader} ${index + 1}`);
  const rows = draft.rows
    .map((row) => headers.map((_, cellIndex) => tableCellToMarkdown(row[cellIndex] ?? "")))
    .filter((row) => row.some(Boolean));

  if (!headers.length || !rows.length) {
    return "";
  }

  return [`| ${headers.join(" | ")} |`, `| ${headers.map(() => "---").join(" | ")} |`, ...rows.map((row) => `| ${row.join(" | ")} |`)].join("\n");
};

const appendBlockSnippet = (value: string, snippet: string) => (value.trim() ? `${value.trimEnd()}\n\n${snippet}` : snippet);

const normalizeCertificateToForm = (certificate: Record<string, any>): CertificateFormState => {
  const form = defaultCertificateForm();
  const copyEs = certificate.copy?.es ?? {};
  const copyEn = certificate.copy?.en ?? {};

  return {
    ...form,
    id: certificate.id ?? "",
    fileName: certificate.fileName ?? "",
    certificateType: certificate.type ?? form.certificateType,
    mime: certificate.mime ?? form.mime,
    issued: certificate.issued ?? form.issued,
    status: certificate.status ?? form.status,
    hidden: certificate.hidden === true,
    title: copyEs.title ?? "",
    issuer: copyEs.issuer ?? form.issuer,
    tags: joinCommaList(copyEs.tags),
    titleEn: copyEn.title ?? "",
    issuerEn: copyEn.issuer ?? "",
    tagsEn: joinCommaList(copyEn.tags),
  };
};

const normalizeDevelopmentToForm = (item: Record<string, any>): DevelopmentFormState => {
  const form = defaultDevelopmentForm();
  const copyEs = item.copy?.es ?? {};
  const copyEn = item.copy?.en ?? {};

  return {
    ...form,
    id: item.id ?? "",
    kind: item.kind === "certificate" ? "certificate" : "project",
    cover: item.cover ?? "",
    progress: String(item.progress ?? form.progress),
    certificateUrl: item.certificateUrl ?? item.url ?? "",
    hidden: item.hidden === true,
    title: copyEs.title ?? "",
    description: copyEs.description ?? "",
    titleEn: copyEn.title ?? "",
    descriptionEn: copyEn.description ?? "",
  };
};

const normalizeBlogToForm = (post: Record<string, any>): BlogFormState => {
  const form = defaultBlogForm();
  const copyEs = post.copy?.es ?? {};
  const copyEn = post.copy?.en ?? {};
  const categoryEs = copyEs.category ?? form.category;

  return {
    ...form,
    slug: post.slug ?? "",
    filter: categoryEs || post.filter || form.filter,
    visualClass: post.visualClass ?? form.visualClass,
    cover: post.cover ?? "",
    articleImage: post.articleImage ?? "",
    category: categoryEs,
    date: copyEs.date ?? form.date,
    readTime: copyEs.readTime ?? form.readTime,
    title: copyEs.title ?? "",
    phrase: copyEs.phrase ?? "",
    excerpt: copyEs.excerpt ?? "",
    body: copyEs.body ?? "",
    introduction: copyEs.introduction ?? "",
    paragraphs: joinTextBlocks(copyEs.paragraphs),
    highlights: joinTextLines(copyEs.highlights),
    categoryEn: copyEn.category ?? "",
    dateEn: copyEn.date ?? "",
    readTimeEn: copyEn.readTime ?? "",
    titleEn: copyEn.title ?? "",
    phraseEn: copyEn.phrase ?? "",
    excerptEn: copyEn.excerpt ?? "",
    bodyEn: copyEn.body ?? "",
    introductionEn: copyEn.introduction ?? "",
    paragraphsEn: joinTextBlocks(copyEn.paragraphs),
    highlightsEn: joinTextLines(copyEn.highlights),
    imageCredit: copyEs.imageCredit ?? "",
    imageCreditEn: copyEn.imageCredit ?? "",
  };
};

const normalizeInterestToForm = (interest: Record<string, any>): InterestFormState => {
  const form = defaultInterestForm();
  const copyEs = interest.copy?.es ?? {};
  const copyEn = interest.copy?.en ?? {};

  return {
    ...form,
    filter: interest.filter ?? form.filter,
    visualClass: interest.visualClass ?? form.visualClass,
    image: interest.image ?? "",
    category: copyEs.category ?? form.category,
    title: copyEs.title ?? "",
    meta: copyEs.meta ?? "",
    description: copyEs.description ?? "",
    body: copyEs.body ?? "",
    tags: joinCommaList(copyEs.tags),
    categoryEn: copyEn.category ?? "",
    titleEn: copyEn.title ?? "",
    metaEn: copyEn.meta ?? "",
    descriptionEn: copyEn.description ?? "",
    bodyEn: copyEn.body ?? "",
    tagsEn: joinCommaList(copyEn.tags),
  };
};

const normalizeProfileToForm = (profile: Record<string, any>): ProfileFormState => {
  const form = defaultProfileForm();
  const copyEs = profile.copy?.es ?? {};
  const copyEn = profile.copy?.en ?? {};

  return {
    ...form,
    name: profile.name ?? form.name,
    fullName: profile.fullName ?? form.fullName,
    initials: profile.initials ?? form.initials,
    email: profile.email ?? form.email,
    linkedin: profile.linkedin ?? form.linkedin,
    github: profile.github ?? form.github,
    gitlab: profile.gitlab ?? form.gitlab,
    cvPath: profile.cvPath ?? form.cvPath,
    description: copyEs.description ?? form.description,
    focus: copyEs.focus ?? form.focus,
    descriptionEn: copyEn.description ?? "",
    focusEn: copyEn.focus ?? "",
  };
};

const normalizeAboutToForm = (entry: Record<string, any>): AboutFormState => {
  const group: AboutGroupKind = entry.group === "work" ? "work" : "education";
  const form = defaultAboutForm(group);
  const es = entry.es ?? {};
  const en = entry.en ?? {};

  return {
    ...form,
    group,
    period: es.period ?? form.period,
    title: es.title ?? "",
    category: es.category ?? "",
    institution: es.institution ?? "",
    detail: group === "work" ? es.description ?? es.detail ?? "" : es.detail ?? "",
    skills: joinCommaList(es.skills),
    stack: joinCommaList(es.stack),
    focus: joinCommaList(es.focus),
    detailPlacement: es.detailPlacement ?? "",
    titleEn: en.title ?? "",
    categoryEn: en.category ?? "",
    institutionEn: en.institution ?? "",
    detailEn: group === "work" ? en.description ?? en.detail ?? "" : en.detail ?? "",
    skillsEn: joinCommaList(en.skills),
    focusEn: joinCommaList(en.focus),
  };
};

function FieldHint({ text }: { text: string }) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{
    arrowLeft: number;
    left: number;
    placement: "bottom" | "top";
    top: number;
    width: number;
  } | null>(null);

  const openTooltip = () => {
    const button = buttonRef.current;
    if (!button) {
      setIsOpen(true);
      return;
    }

    const viewportPadding = 16;
    const tooltipGap = 10;
    const tooltipWidth = Math.min(320, window.innerWidth - viewportPadding * 2);
    const rect = button.getBoundingClientRect();
    const idealLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
    const left = Math.min(
      Math.max(idealLeft, viewportPadding),
      window.innerWidth - tooltipWidth - viewportPadding,
    );
    const estimatedHeight = 128;
    const placement = rect.top - tooltipGap - estimatedHeight > viewportPadding ? "top" : "bottom";
    const top = placement === "bottom" ? rect.bottom + tooltipGap : rect.top - tooltipGap;
    const arrowLeft = Math.min(
      Math.max(rect.left + rect.width / 2 - left, 14),
      tooltipWidth - 14,
    );

    setTooltipPosition({ arrowLeft, left, placement, top, width: tooltipWidth });
    setIsOpen(true);
  };

  const tooltipStyle = tooltipPosition
    ? ({
        "--tooltip-arrow-left": `${tooltipPosition.arrowLeft}px`,
        "--tooltip-left": `${tooltipPosition.left}px`,
        "--tooltip-top": `${tooltipPosition.top}px`,
        "--tooltip-width": `${tooltipPosition.width}px`,
      } as CSSProperties)
    : undefined;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={`field-hint${isOpen ? " is-open" : ""}`}
        aria-label={text}
        onBlur={() => setIsOpen(false)}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (isOpen) {
            setIsOpen(false);
          } else {
            openTooltip();
          }
        }}
      >
        <HelpCircle size={14} strokeWidth={2.2} aria-hidden="true" />
      </button>

      {isOpen &&
        tooltipPosition &&
        createPortal(
          <span
            className="field-tooltip is-open"
            data-placement={tooltipPosition.placement}
            role="tooltip"
            style={tooltipStyle}
          >
            {text}
          </span>,
          document.body,
        )}
    </>
  );
}

function FieldLabel({ children, hint }: { children: string; hint: string }) {
  return (
    <span className="field-label">
      {children}
      <FieldHint text={hint} />
    </span>
  );
}

function StackSelector({
  hint,
  onChange,
  value,
}: {
  hint: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const [customStack, setCustomStack] = useState("");
  const selectedItems = uniqueStackItems(splitStackItems(value));
  const selectedKeys = new Set(selectedItems.map(normalizeStackKey));
  const options = uniqueStackItems([
    ...stackCatalog,
    ...selectedItems.filter((item) => !stackCatalog.some((option) => normalizeStackKey(option) === normalizeStackKey(item))),
  ]);

  const updateItems = (items: string[]) => {
    onChange(formatStackItems(items));
  };

  const toggleStack = (item: string) => {
    const key = normalizeStackKey(item);

    if (selectedKeys.has(key)) {
      updateItems(selectedItems.filter((selected) => normalizeStackKey(selected) !== key));
      return;
    }

    updateItems([...selectedItems, item]);
  };

  const addCustomStack = () => {
    const nextStack = customStack.trim();
    if (!nextStack) {
      return;
    }

    updateItems([...selectedItems, nextStack]);
    setCustomStack("");
  };

  return (
    <div className="stack-selector">
      <FieldLabel hint={hint}>Stack</FieldLabel>

      <div className="stack-option-list" aria-label="Seleccionar tecnologias">
        {options.map((option) => {
          const isSelected = selectedKeys.has(normalizeStackKey(option));

          return (
            <button
              type="button"
              key={option}
              className={`stack-option${isSelected ? " is-selected" : ""}`}
              onClick={() => toggleStack(option)}
              aria-pressed={isSelected}
            >
              <span>{option}</span>
              {isSelected && <CheckCircle2 size={14} strokeWidth={2.4} aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      {selectedItems.length > 0 ? (
        <div className="stack-selected-list" aria-label="Stack seleccionado">
          {selectedItems.map((item) => (
            <span className="stack-chip" key={item}>
              <span>{item}</span>
              <button type="button" onClick={() => toggleStack(item)} aria-label={`Quitar ${item}`}>
                <X size={13} strokeWidth={2.4} aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="stack-empty">Selecciona tecnologias o agrega una nueva.</p>
      )}

      <div className="stack-custom-row">
        <input
          value={customStack}
          onChange={(event) => setCustomStack(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addCustomStack();
            }
          }}
          placeholder="Agregar stack nuevo"
          aria-label="Agregar stack nuevo"
        />
        <button type="button" className="stack-add-button" onClick={addCustomStack} disabled={!customStack.trim()}>
          <Plus size={15} strokeWidth={2.3} />
          Agregar
        </button>
      </div>
    </div>
  );
}

function ProcessStepsEditor({
  addLabel = "Agregar paso",
  emptyText = "Agrega pasos para construir la linea de tiempo del proceso.",
  hint,
  label = "Proceso",
  onChange,
  placeholder = "Investigacion, prototipo, desarrollo...",
  value,
}: {
  addLabel?: string;
  emptyText?: string;
  hint: string;
  label?: string;
  onChange: (value: string[]) => void;
  placeholder?: string;
  value: string[];
}) {
  const addStep = () => {
    onChange([...value, ""]);
  };

  const updateStep = (index: number, nextValue: string) => {
    onChange(value.map((step, stepIndex) => (stepIndex === index ? nextValue : step)));
  };

  const removeStep = (index: number) => {
    onChange(value.filter((_, stepIndex) => stepIndex !== index));
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= value.length) {
      return;
    }

    const nextValue = [...value];
    [nextValue[index], nextValue[targetIndex]] = [nextValue[targetIndex], nextValue[index]];
    onChange(nextValue);
  };

  return (
    <div className="process-step-editor">
      <FieldLabel hint={hint}>{label}</FieldLabel>

      {value.length === 0 ? (
        <p className="process-step-empty">{emptyText}</p>
      ) : (
        <div className="process-step-list">
          {value.map((step, index) => (
            <div className="process-step-row" key={`process-step-${index}`}>
              <span className="process-step-number">{String(index + 1).padStart(2, "0")}</span>
              <input
                value={step}
                onChange={(event) => updateStep(index, event.target.value)}
                placeholder={placeholder}
                aria-label={`Paso ${index + 1}`}
              />
              <div className="process-step-actions">
                <button
                  type="button"
                  className="move-row-button"
                  onClick={() => moveStep(index, -1)}
                  disabled={index === 0}
                  aria-label={`Subir paso ${index + 1}`}
                  title="Subir"
                >
                  <ChevronUp size={15} strokeWidth={2.3} />
                </button>
                <button
                  type="button"
                  className="move-row-button"
                  onClick={() => moveStep(index, 1)}
                  disabled={index === value.length - 1}
                  aria-label={`Bajar paso ${index + 1}`}
                  title="Bajar"
                >
                  <ChevronDown size={15} strokeWidth={2.3} />
                </button>
                <button
                  type="button"
                  className="remove-row-button"
                  onClick={() => removeStep(index)}
                  aria-label={`Quitar paso ${index + 1}`}
                  title="Quitar"
                >
                  <Trash2 size={15} strokeWidth={2.2} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button type="button" className="add-row-button process-step-add" onClick={addStep}>
        <Plus size={16} strokeWidth={2.2} />
        {addLabel}
      </button>
    </div>
  );
}

function OptionalItemActions({
  canMoveDown,
  canMoveUp,
  onMoveDown,
  onMoveUp,
  onRemove,
  removeLabel,
}: {
  canMoveDown: boolean;
  canMoveUp: boolean;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onRemove: () => void;
  removeLabel: string;
}) {
  return (
    <div className="optional-item-actions">
      <button
        type="button"
        className="move-row-button"
        onClick={onMoveUp}
        disabled={!canMoveUp}
        aria-label="Subir"
        title="Subir"
      >
        <ChevronUp size={15} strokeWidth={2.3} />
      </button>
      <button
        type="button"
        className="move-row-button"
        onClick={onMoveDown}
        disabled={!canMoveDown}
        aria-label="Bajar"
        title="Bajar"
      >
        <ChevronDown size={15} strokeWidth={2.3} />
      </button>
      <button type="button" className="remove-row-button" onClick={onRemove} aria-label={removeLabel} title="Quitar">
        <Trash2 size={15} strokeWidth={2.2} />
      </button>
    </div>
  );
}

function BlogParagraphEditor({
  hint,
  onChange,
  valueEn,
  valueEs,
}: {
  hint: string;
  onChange: (valueEs: string, valueEn: string) => void;
  valueEn: string;
  valueEs: string;
}) {
  const rawEs = splitTextBlocks(valueEs);
  const rawEn = splitTextBlocks(valueEn);
  const rowCount = Math.max(rawEs.length, rawEn.length, 1);
  const linesEs = Array.from({ length: rowCount }, (_, index) => rawEs[index] ?? "");
  const linesEn = Array.from({ length: rowCount }, (_, index) => rawEn[index] ?? "");
  const [tableTarget, setTableTarget] = useState<{ index: number; lang: "es" | "en" } | null>(null);
  const [tableDraft, setTableDraft] = useState<BlogTableDraft>(() => createBlogTableDraft("es"));

  const commit = (nextEs: string[], nextEn: string[]) => {
    onChange(serializeTextBlocks(nextEs), serializeTextBlocks(nextEn));
  };

  const updateLine = (index: number, lang: "es" | "en", nextValue: string) => {
    const nextEs = [...linesEs];
    const nextEn = [...linesEn];

    if (lang === "es") {
      nextEs[index] = nextValue;
    } else {
      nextEn[index] = nextValue;
    }

    commit(nextEs, nextEn);
  };

  const openTableBuilder = (index: number, lang: "es" | "en") => {
    setTableTarget({ index, lang });
    setTableDraft(createBlogTableDraft(lang));
  };

  const updateTableHeader = (columnIndex: number, value: string) => {
    setTableDraft((current) => ({
      ...current,
      headers: current.headers.map((header, index) => (index === columnIndex ? value : header)),
    }));
  };

  const updateTableCell = (rowIndex: number, columnIndex: number, value: string) => {
    setTableDraft((current) => ({
      ...current,
      rows: current.rows.map((row, currentRowIndex) =>
        currentRowIndex === rowIndex ? current.headers.map((_, currentColumnIndex) => (currentColumnIndex === columnIndex ? value : row[currentColumnIndex] ?? "")) : row,
      ),
    }));
  };

  const addTableColumn = () => {
    setTableDraft((current) => ({
      headers: [...current.headers, ""],
      rows: current.rows.map((row) => [...row, ""]),
    }));
  };

  const removeTableColumn = (columnIndex: number) => {
    setTableDraft((current) => {
      if (current.headers.length <= 2) {
        return current;
      }

      return {
        headers: current.headers.filter((_, index) => index !== columnIndex),
        rows: current.rows.map((row) => row.filter((_, index) => index !== columnIndex)),
      };
    });
  };

  const addTableRow = () => {
    setTableDraft((current) => ({
      ...current,
      rows: [...current.rows, current.headers.map(() => "")],
    }));
  };

  const removeTableRow = (rowIndex: number) => {
    setTableDraft((current) => ({
      ...current,
      rows: current.rows.length <= 1 ? current.rows : current.rows.filter((_, index) => index !== rowIndex),
    }));
  };

  const insertTable = () => {
    if (!tableTarget) {
      return;
    }

    const markdown = buildBlogTableMarkdown(tableDraft, tableTarget.lang);
    if (!markdown) {
      return;
    }

    const nextEs = [...linesEs];
    const nextEn = [...linesEn];

    if (tableTarget.lang === "es") {
      nextEs[tableTarget.index] = appendBlockSnippet(nextEs[tableTarget.index] ?? "", markdown);
    } else {
      nextEn[tableTarget.index] = appendBlockSnippet(nextEn[tableTarget.index] ?? "", markdown);
    }

    commit(nextEs, nextEn);
    setTableTarget(null);
  };

  const addParagraph = () => {
    commit([...linesEs, ""], [...linesEn, ""]);
  };

  const removeParagraph = (index: number) => {
    if (rowCount <= 1) {
      commit([""], [""]);
      return;
    }

    commit(
      linesEs.filter((_, lineIndex) => lineIndex !== index),
      linesEn.filter((_, lineIndex) => lineIndex !== index),
    );
  };

  const moveParagraph = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= rowCount) {
      return;
    }

    const nextEs = [...linesEs];
    const nextEn = [...linesEn];
    [nextEs[index], nextEs[targetIndex]] = [nextEs[targetIndex], nextEs[index]];
    [nextEn[index], nextEn[targetIndex]] = [nextEn[targetIndex], nextEn[index]];
    commit(nextEs, nextEn);
  };

  return (
    <div className="optional-group field-wide blog-paragraph-editor">
      <div className="optional-group-head">
        <div>
          <FieldLabel hint={hint}>Bloques del articulo</FieldLabel>
          <p>Usa # para titulo, ## para subtitulo, - para lista, 1. para lista numerada y | para tablas.</p>
        </div>
        <button type="button" className="add-row-button" onClick={addParagraph}>
          <Plus size={16} strokeWidth={2.2} />
          Agregar
        </button>
      </div>

      <div className="optional-list">
        {linesEs.map((lineEs, index) => (
          <div className="optional-item" key={`blog-paragraph-${index}`}>
            <div className="optional-item-head">
              <strong>Bloque {index + 1}</strong>
              <OptionalItemActions
                canMoveUp={index > 0}
                canMoveDown={index < rowCount - 1}
                onMoveUp={() => moveParagraph(index, -1)}
                onMoveDown={() => moveParagraph(index, 1)}
                onRemove={() => removeParagraph(index)}
                removeLabel={`Quitar bloque ${index + 1}`}
              />
            </div>
            <div className="optional-item-grid">
              <label className="field">
                <span className="blog-block-field-head">
                  <span className="compact-label">Bloque ES</span>
                  <button
                    type="button"
                    className="table-builder-toggle"
                    onClick={(event) => {
                      event.preventDefault();
                      openTableBuilder(index, "es");
                    }}
                  >
                    <Table2 size={14} strokeWidth={2.2} />
                    Tabla ES
                  </button>
                </span>
                <textarea
                  value={lineEs}
                  onChange={(event) => updateLine(index, "es", event.target.value)}
                  rows={8}
                  placeholder={"Texto del parrafo\n\n# Titulo centrado\n\n## Subtitulo a la izquierda\n\n- Elemento de lista\n- Otro elemento\n\n1. Primer paso\n2. Segundo paso\n\n| Campo | Descripcion |\n| --- | --- |\n| QA Manual | Pruebas exploratorias |\n| QA Automation | Pruebas automatizadas |"}
                />
              </label>
              <label className="field">
                <span className="blog-block-field-head">
                  <span className="compact-label">Block EN</span>
                  <button
                    type="button"
                    className="table-builder-toggle"
                    onClick={(event) => {
                      event.preventDefault();
                      openTableBuilder(index, "en");
                    }}
                  >
                    <Table2 size={14} strokeWidth={2.2} />
                    Table EN
                  </button>
                </span>
                <textarea
                  value={linesEn[index]}
                  onChange={(event) => updateLine(index, "en", event.target.value)}
                  rows={8}
                  placeholder={"Paragraph text\n\n# Centered title\n\n## Left subtitle\n\n- List item\n- Another item\n\n1. First step\n2. Second step\n\n| Field | Description |\n| --- | --- |\n| Manual QA | Exploratory testing |\n| QA Automation | Automated tests |"}
                />
              </label>
            </div>
            {tableTarget?.index === index ? (
              <div className="blog-table-builder">
                <div className="blog-table-builder-head">
                  <div>
                    <strong>{tableTarget.lang === "es" ? "Constructor de tabla ES" : "Table builder EN"}</strong>
                    <p>{tableTarget.lang === "es" ? "Llena la tabla con campos normales. Al insertar, se agregara al bloque." : "Fill the table with normal fields. Insert will add it to the block."}</p>
                  </div>
                  <button type="button" className="move-row-button" onClick={() => setTableTarget(null)} aria-label="Cerrar constructor de tabla" title="Cerrar">
                    <X size={15} strokeWidth={2.3} />
                  </button>
                </div>

                <div className="blog-table-builder-scroll">
                  <table className="blog-table-builder-grid">
                    <thead>
                      <tr>
                        {tableDraft.headers.map((header, columnIndex) => (
                          <th key={`table-header-${columnIndex}`}>
                            <div className="blog-table-builder-cell-head">
                              <input
                                value={header}
                                onChange={(event) => updateTableHeader(columnIndex, event.target.value)}
                                placeholder={tableTarget.lang === "es" ? `Columna ${columnIndex + 1}` : `Column ${columnIndex + 1}`}
                              />
                              <button
                                type="button"
                                className="remove-row-button"
                                onClick={() => removeTableColumn(columnIndex)}
                                disabled={tableDraft.headers.length <= 2}
                                aria-label="Quitar columna"
                                title="Quitar columna"
                              >
                                <Trash2 size={13} strokeWidth={2.2} />
                              </button>
                            </div>
                          </th>
                        ))}
                        <th className="blog-table-builder-row-actions"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableDraft.rows.map((row, rowIndex) => (
                        <tr key={`table-row-${rowIndex}`}>
                          {tableDraft.headers.map((_, columnIndex) => (
                            <td key={`table-cell-${rowIndex}-${columnIndex}`}>
                              <input
                                value={row[columnIndex] ?? ""}
                                onChange={(event) => updateTableCell(rowIndex, columnIndex, event.target.value)}
                                placeholder={tableTarget.lang === "es" ? `Fila ${rowIndex + 1}` : `Row ${rowIndex + 1}`}
                              />
                            </td>
                          ))}
                          <td className="blog-table-builder-row-actions">
                            <button
                              type="button"
                              className="remove-row-button"
                              onClick={() => removeTableRow(rowIndex)}
                              disabled={tableDraft.rows.length <= 1}
                              aria-label="Quitar fila"
                              title="Quitar fila"
                            >
                              <Trash2 size={13} strokeWidth={2.2} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="blog-table-builder-actions">
                  <button type="button" className="add-row-button" onClick={addTableColumn}>
                    <Plus size={15} strokeWidth={2.2} />
                    Columna
                  </button>
                  <button type="button" className="add-row-button" onClick={addTableRow}>
                    <Plus size={15} strokeWidth={2.2} />
                    Fila
                  </button>
                  <button type="button" className="add-row-button table-builder-insert" onClick={insertTable} disabled={!buildBlogTableMarkdown(tableDraft, tableTarget.lang)}>
                    <Table2 size={15} strokeWidth={2.2} />
                    Insertar tabla
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionOrderControl({
  hint,
  onMove,
  value,
}: {
  hint: string;
  onMove: (index: number, direction: -1 | 1) => void;
  value: ProjectPreviewSection[];
}) {
  const orderedSections = value
    .map((sectionId) => previewSectionOptions.find((section) => section.id === sectionId))
    .filter((section): section is (typeof previewSectionOptions)[number] => Boolean(section));

  return (
    <div className="section-order-panel">
      <div>
        <FieldLabel hint={hint}>Orden en preview</FieldLabel>
        <p>Organiza como quieres que aparezcan estas secciones en la pagina del proyecto.</p>
      </div>

      <div className="section-order-list">
        {orderedSections.map((section, index) => (
          <div className="section-order-item" key={section.id}>
            <span className="section-order-number">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <strong>{section.label}</strong>
              <span>{section.detail}</span>
            </div>
            <div className="optional-item-actions">
              <button
                type="button"
                className="move-row-button"
                onClick={() => onMove(index, -1)}
                disabled={index === 0}
                aria-label={`Subir ${section.label}`}
                title="Subir"
              >
                <ChevronUp size={15} strokeWidth={2.3} />
              </button>
              <button
                type="button"
                className="move-row-button"
                onClick={() => onMove(index, 1)}
                disabled={index === orderedSections.length - 1}
                aria-label={`Bajar ${section.label}`}
                title="Bajar"
              >
                <ChevronDown size={15} strokeWidth={2.3} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [activeSection, setActiveSection] = useState<StudioSectionId>("about");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [workspaceView, setWorkspaceView] = useState<
    | "home"
    | "section-detail"
    | "profile-edit"
    | "project-create"
    | "about-edit"
    | "development-edit"
    | "certificate-edit"
    | "blog-edit"
    | "interest-edit"
  >("home");
  const [profileForm, setProfileForm] = useState<ProfileFormState>(() => defaultProfileForm());
  const [projectForm, setProjectForm] = useState<ProjectFormState>(() => defaultProjectForm());
  const [aboutForm, setAboutForm] = useState<AboutFormState>(() => defaultAboutForm());
  const [developmentForm, setDevelopmentForm] = useState<DevelopmentFormState>(() => defaultDevelopmentForm());
  const [certificateForm, setCertificateForm] = useState<CertificateFormState>(() => defaultCertificateForm());
  const [blogForm, setBlogForm] = useState<BlogFormState>(() => defaultBlogForm());
  const [interestForm, setInterestForm] = useState<InterestFormState>(() => defaultInterestForm());
  const [slugTouched, setSlugTouched] = useState(false);
  const [blogSlugTouched, setBlogSlugTouched] = useState(false);
  const [certificateIdTouched, setCertificateIdTouched] = useState(false);
  const [developmentIdTouched, setDevelopmentIdTouched] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editingAboutKey, setEditingAboutKey] = useState<string | null>(null);
  const [editingDevelopmentId, setEditingDevelopmentId] = useState<string | null>(null);
  const [editingCertificateId, setEditingCertificateId] = useState<string | null>(null);
  const [editingBlogSlug, setEditingBlogSlug] = useState<string | null>(null);
  const [editingInterestIndex, setEditingInterestIndex] = useState<number | null>(null);
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [contentItems, setContentItems] = useState<Record<ContentKind, StudioContentItem[]>>({
    about: [],
    development: [],
    certificates: [],
    blog: [],
    interests: [],
  });
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [loadingContentKind, setLoadingContentKind] = useState<ContentKind | null>(null);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [projectResult, setProjectResult] = useState<CreatedProject | null>(null);
  const [projectError, setProjectError] = useState("");
  const [contentResult, setContentResult] = useState<SavedContent | null>(null);
  const [contentError, setContentError] = useState("");
  const [imagePickMessage, setImagePickMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isOpeningLivePreview, setIsOpeningLivePreview] = useState(false);
  const [livePreviewUrl, setLivePreviewUrl] = useState("");
  const [livePreviewMessage, setLivePreviewMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const selected = useMemo(() => getSectionById(activeSection), [activeSection]);
  const SelectedIcon = selected.icon;
  const activeProjectCount = projects.filter((project) => project.showInHome).length;
  const developmentItemCount = contentItems.development.length;
  const visibleDevelopmentItemCount = contentItems.development.filter((item) => !item.hidden).length;
  const developmentMetric = visibleDevelopmentItemCount === developmentItemCount
    ? `${developmentItemCount} en progreso`
    : `${visibleDevelopmentItemCount} visibles / ${developmentItemCount} total`;
  const developmentOrderSummary = visibleDevelopmentItemCount === developmentItemCount
    ? `${developmentItemCount} entrada${developmentItemCount === 1 ? "" : "s"} disponible${developmentItemCount === 1 ? "" : "s"}`
    : `${visibleDevelopmentItemCount} visible${visibleDevelopmentItemCount === 1 ? "" : "s"} de ${developmentItemCount} entrada${developmentItemCount === 1 ? "" : "s"}`;
  const activeContentKind = contentSectionKinds[selected.id];
  const selectedContentItems = activeContentKind ? contentItems[activeContentKind] : [];
  const blogCategoryOptions = useMemo(
    () => uniqueTextOptions([...contentItems.blog.map((item) => item.metadata?.category ?? item.detail), blogForm.category]),
    [blogForm.category, contentItems.blog],
  );
  const blogCategoryEnOptions = useMemo(
    () => uniqueTextOptions([...contentItems.blog.map((item) => item.metadata?.categoryEn), blogForm.categoryEn]),
    [blogForm.categoryEn, contentItems.blog],
  );
  const aboutEducationItems = contentItems.about.filter((item) => item.key.startsWith("education:"));
  const aboutWorkItems = contentItems.about.filter((item) => item.key.startsWith("work:"));
  const sectionMetric = selected.id === "projects"
    ? `${activeProjectCount} activos`
    : selected.id === "development"
      ? developmentMetric
    : activeContentKind
      ? `${selectedContentItems.length} items`
      : selected.metric;
  const getSectionMetric = (sectionId: StudioSectionId, fallback: string) => {
    if (sectionId === "projects") {
      return `${activeProjectCount} activos`;
    }

    if (sectionId === "development") {
      return developmentMetric;
    }

    const kind = contentSectionKinds[sectionId];
    return kind ? `${contentItems[kind].length} items` : fallback;
  };

  const loadProjects = async () => {
    setIsLoadingProjects(true);

    try {
      const items = await invoke<ProjectListItem[]>("list_projects");
      setProjects(items);
    } catch {
      setProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const loadProfile = async () => {
    try {
      const profile = await invoke<Record<string, any>>("get_profile");
      setProfileForm(normalizeProfileToForm(profile));
    } catch {
      setProfileForm(defaultProfileForm());
    }
  };

  useEffect(() => {
    loadProfile();
    loadProjects();
  }, []);

  const loadContent = async (kind: ContentKind) => {
    setLoadingContentKind(kind);

    try {
      const items = await invoke<StudioContentItem[]>("list_studio_content", { kind });
      setContentItems((current) => ({ ...current, [kind]: items }));
    } catch {
      setContentItems((current) => ({ ...current, [kind]: [] }));
    } finally {
      setLoadingContentKind(null);
    }
  };

  useEffect(() => {
    loadContent("about");
    loadContent("development");
    loadContent("certificates");
    loadContent("blog");
    loadContent("interests");
  }, []);

  useEffect(() => {
    if (!livePreviewUrl || workspaceView !== "project-create") {
      return;
    }

    const syncPreview = window.setTimeout(async () => {
      try {
        await invoke<ProjectPreviewResult>("write_project_preview", { input: projectForm });
        setLivePreviewMessage({
          tone: "success",
          text: "Preview real sincronizado en el portafolio local.",
        });
      } catch (error) {
        setLivePreviewMessage({
          tone: "error",
          text: error instanceof Error ? error.message : String(error),
        });
      }
    }, 550);

    return () => window.clearTimeout(syncPreview);
  }, [livePreviewUrl, projectForm, workspaceView]);

  const updateProjectField = <Key extends keyof ProjectFormState>(
    field: Key,
    value: ProjectFormState[Key],
  ) => {
    setProjectForm((current) => {
      const next = { ...current, [field]: value };

      if (field === "title" && !slugTouched && typeof value === "string") {
        next.slug = slugify(value);
      }

      if (field === "slug" && typeof value === "string") {
        next.slug = slugify(value);
      }

      return next;
    });

    if (field === "slug") {
      setSlugTouched(true);
    }
  };

  const updateAboutField = <Key extends keyof AboutFormState>(
    field: Key,
    value: AboutFormState[Key],
  ) => {
    setAboutForm((current) => {
      if (field !== "group") {
        return { ...current, [field]: value };
      }

      const group = value as AboutGroupKind;
      return {
        ...current,
        group,
      };
    });
  };

  const updateCertificateField = <Key extends keyof CertificateFormState>(
    field: Key,
    value: CertificateFormState[Key],
  ) => {
    setCertificateForm((current) => {
      const next = { ...current, [field]: value };

      if (field === "title" && !certificateIdTouched && typeof value === "string") {
        next.id = slugify(value);
      }

      if (field === "id" && typeof value === "string") {
        next.id = slugify(value);
      }

      return next;
    });

    if (field === "id") {
      setCertificateIdTouched(true);
    }
  };

  const updateDevelopmentField = <Key extends keyof DevelopmentFormState>(
    field: Key,
    value: DevelopmentFormState[Key],
  ) => {
    setDevelopmentForm((current) => {
      const next = { ...current, [field]: value };

      if (field === "title" && !developmentIdTouched && typeof value === "string") {
        next.id = slugify(value);
      }

      if (field === "id" && typeof value === "string") {
        next.id = slugify(value);
      }

      if (field === "progress" && typeof value === "string") {
        next.progress = value.replace(/[^\d]/g, "").slice(0, 3);
      }

      return next;
    });

    if (field === "id") {
      setDevelopmentIdTouched(true);
    }
  };

  const updateBlogField = <Key extends keyof BlogFormState>(
    field: Key,
    value: BlogFormState[Key],
  ) => {
    setBlogForm((current) => {
      const next = { ...current, [field]: value };

      if (field === "title" && !blogSlugTouched && typeof value === "string") {
        next.slug = slugify(value);
      }

      if (field === "slug" && typeof value === "string") {
        next.slug = slugify(value);
      }

      if (field === "category" && typeof value === "string") {
        next.filter = value;
      }

      return next;
    });

    if (field === "slug") {
      setBlogSlugTouched(true);
    }
  };

  const updateInterestField = <Key extends keyof InterestFormState>(
    field: Key,
    value: InterestFormState[Key],
  ) => {
    setInterestForm((current) => ({ ...current, [field]: value }));
  };

  const updateProfileField = <Key extends keyof ProfileFormState>(
    field: Key,
    value: ProfileFormState[Key],
  ) => {
    setProfileForm((current) => ({ ...current, [field]: value }));
  };

  const addOptionalItem = (listKey: OptionalListKey) => {
    setProjectForm((current) => ({
      ...current,
      [listKey]: [...current[listKey], optionalListItems[listKey]()],
    }) as ProjectFormState);
  };

  const updateOptionalItem = (
    listKey: OptionalListKey,
    index: number,
    field: string,
    value: string,
  ) => {
    setProjectForm((current) => ({
      ...current,
      [listKey]: current[listKey].map((item, itemIndex) =>
        itemIndex === index ? ({ ...item, [field]: value } as OptionalListItem) : item,
      ),
    }) as ProjectFormState);
  };

  const removeOptionalItem = (listKey: OptionalListKey, index: number) => {
    setProjectForm((current) => ({
      ...current,
      [listKey]: current[listKey].filter((_, itemIndex) => itemIndex !== index),
    }) as ProjectFormState);
  };

  const moveOptionalItem = (listKey: OptionalListKey, index: number, direction: -1 | 1) => {
    setProjectForm((current) => {
      const nextList = [...current[listKey]] as OptionalListItem[];
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= nextList.length) {
        return current;
      }

      [nextList[index], nextList[targetIndex]] = [nextList[targetIndex], nextList[index]];

      return {
        ...current,
        [listKey]: nextList,
      } as ProjectFormState;
    });
  };

  const movePreviewSection = (index: number, direction: -1 | 1) => {
    setProjectForm((current) => {
      const nextOrder = [...current.sectionOrder];
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= nextOrder.length) {
        return current;
      }

      [nextOrder[index], nextOrder[targetIndex]] = [nextOrder[targetIndex], nextOrder[index]];

      return {
        ...current,
        sectionOrder: nextOrder,
      };
    });
  };

  const pickImageForField = async (target: ImagePickTarget, source: ImagePickSource) => {
    setProjectError("");
    setImagePickMessage(null);

    try {
      const imageSlug = target.kind === "developmentCover"
        ? developmentForm.id || slugify(developmentForm.title) || "en-desarrollo"
        : target.kind === "blogCover" || target.kind === "blogArticleImage"
          ? blogForm.slug || slugify(blogForm.title) || "blog"
        : target.kind === "interestImage"
          ? slugify(interestForm.title) || "interes"
        : projectForm.slug || slugify(projectForm.title) || "nuevo-proyecto";
      const pickedImage = await invoke<string | null>("pick_project_image", {
        source,
        slug: imageSlug,
      });

      if (!pickedImage) {
        return;
      }

      if (target.kind === "preview") {
        updateProjectField("previewImage", pickedImage);
      } else if (target.kind === "developmentCover") {
        updateDevelopmentField("cover", pickedImage);
      } else if (target.kind === "blogCover") {
        updateBlogField("cover", pickedImage);
      } else if (target.kind === "blogArticleImage") {
        updateBlogField("articleImage", pickedImage);
      } else if (target.kind === "interestImage") {
        updateInterestField("image", pickedImage);
      } else if (target.kind === "gallery") {
        updateOptionalItem("images", target.index, "src", pickedImage);
      } else if (target.kind === "videoPoster") {
        updateOptionalItem("videos", target.index, "poster", pickedImage);
      } else {
        updateOptionalItem("collaborators", target.index, "photo", pickedImage);
      }

      setImagePickMessage({
        tone: "success",
        text:
          source === "import"
            ? `Imagen importada: ${pickedImage}`
            : `Imagen seleccionada: ${pickedImage}`,
      });
    } catch (error) {
      setImagePickMessage({
        tone: "error",
        text: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const renderImagePickerActions = (target: ImagePickTarget) => (
    <div className="media-picker-actions">
      <button
        type="button"
        className="media-picker-button"
        onClick={() => pickImageForField(target, "import")}
      >
        <ImagePlus size={15} strokeWidth={2.2} />
        Importar archivo
      </button>
      <button
        type="button"
        className="media-picker-button"
        onClick={() => pickImageForField(target, "existing")}
      >
        <FolderOpen size={15} strokeWidth={2.2} />
        Elegir del portafolio
      </button>
    </div>
  );

  const pickProfileCv = async (source: ImagePickSource) => {
    setContentError("");
    setContentResult(null);
    setImagePickMessage(null);

    try {
      const pickedCv = await invoke<string | null>("pick_profile_cv", { source });

      if (!pickedCv) {
        return;
      }

      updateProfileField("cvPath", pickedCv);
      setImagePickMessage({
        tone: "success",
        text:
          source === "import"
            ? `PDF importado: ${pickedCv}`
            : `PDF seleccionado: ${pickedCv}`,
      });
    } catch (error) {
      setImagePickMessage({
        tone: "error",
        text: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const handleOpenLivePreview = async () => {
    setProjectError("");
    setLivePreviewMessage(null);
    setIsOpeningLivePreview(true);

    try {
      const result = await invoke<ProjectPreviewResult>("open_project_preview", { input: projectForm });
      setLivePreviewUrl(result.url);
      setLivePreviewMessage({
        tone: "success",
        text: `Preview real abierto en ${result.url}`,
      });
    } catch (error) {
      setLivePreviewMessage({
        tone: "error",
        text: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsOpeningLivePreview(false);
    }
  };

  const openProjectCreator = () => {
    setActiveSection("projects");
    setWorkspaceView("project-create");
    setEditingSlug(null);
    setProjectError("");
    setImagePickMessage(null);
    setProjectResult(null);
  };

  const resetProjectForm = () => {
    setProjectForm(defaultProjectForm());
    setEditingSlug(null);
    setSlugTouched(false);
    setProjectError("");
    setImagePickMessage(null);
    setProjectResult(null);
  };

  const handleEditProject = async (slug: string) => {
    setProjectError("");
    setImagePickMessage(null);
    setProjectResult(null);

    try {
      const project = await invoke<Record<string, any>>("get_project", { slug });
      setProjectForm(normalizeProjectToForm(project));
      setEditingSlug(slug);
      setSlugTouched(true);
      setActiveSection("projects");
      setWorkspaceView("project-create");
    } catch (error) {
      setProjectError(error instanceof Error ? error.message : String(error));
    }
  };

  const handleDeleteProject = async (slug: string) => {
    const confirmed = window.confirm(
      "Esto borrara el proyecto, su ficha y sus assets locales del portafolio.",
    );
    if (!confirmed) {
      return;
    }

    setProjectError("");
    setImagePickMessage(null);
    setProjectResult(null);
    setIsSavingProject(true);

    try {
      await invoke<SavedContent>("delete_project", { slug });
      await loadProjects();

      if (editingSlug === slug) {
        resetProjectForm();
      }
    } catch (error) {
      setProjectError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleMoveProject = async (slug: string, direction: "up" | "down") => {
    setProjectError("");
    setImagePickMessage(null);
    setProjectResult(null);
    setIsSavingProject(true);

    try {
      await invoke<SavedContent>("move_project", { slug, direction });
      await loadProjects();
    } catch (error) {
      setProjectError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSavingProject(false);
    }
  };

  const openAboutEditor = (mode: "new" | "edit" = "new", group: AboutGroupKind = "education") => {
    setActiveSection("about");
    setWorkspaceView("about-edit");
    setContentError("");
    setContentResult(null);

    if (mode === "new") {
      setAboutForm(defaultAboutForm(group));
      setEditingAboutKey(null);
    }
  };

  const openProfileEditor = async () => {
    setActiveSection("profile");
    setWorkspaceView("profile-edit");
    setContentError("");
    setContentResult(null);
    setImagePickMessage(null);
    await loadProfile();
  };

  const openDevelopmentEditor = (mode: "new" | "edit" = "new") => {
    setActiveSection("development");
    setWorkspaceView("development-edit");
    setContentError("");
    setContentResult(null);
    setImagePickMessage(null);

    if (mode === "new") {
      setDevelopmentForm(defaultDevelopmentForm());
      setEditingDevelopmentId(null);
      setDevelopmentIdTouched(false);
    }
  };

  const openCertificateEditor = (mode: "new" | "edit" = "new") => {
    setActiveSection("certificates");
    setWorkspaceView("certificate-edit");
    setContentError("");
    setContentResult(null);

    if (mode === "new") {
      setCertificateForm(defaultCertificateForm());
      setEditingCertificateId(null);
      setCertificateIdTouched(false);
    }
  };

  const openBlogEditor = (mode: "new" | "edit" = "new") => {
    setActiveSection("blog");
    setWorkspaceView("blog-edit");
    setContentError("");
    setContentResult(null);
    setImagePickMessage(null);

    if (mode === "new") {
      setBlogForm(defaultBlogForm());
      setEditingBlogSlug(null);
      setBlogSlugTouched(false);
    }
  };

  const openInterestEditor = (mode: "new" | "edit" = "new") => {
    setActiveSection("interests");
    setWorkspaceView("interest-edit");
    setContentError("");
    setContentResult(null);
    setImagePickMessage(null);

    if (mode === "new") {
      setInterestForm(defaultInterestForm());
      setEditingInterestIndex(null);
    }
  };

  const handleEditContent = async (kind: ContentKind, key: string) => {
    setContentError("");
    setContentResult(null);

    try {
      const item = await invoke<Record<string, any>>("get_studio_content", { kind, key });

      if (kind === "about") {
        setAboutForm(normalizeAboutToForm(item));
        setEditingAboutKey(key);
        openAboutEditor("edit");
      } else if (kind === "development") {
        setDevelopmentForm(normalizeDevelopmentToForm(item));
        setEditingDevelopmentId(key);
        setDevelopmentIdTouched(true);
        openDevelopmentEditor("edit");
      } else if (kind === "certificates") {
        setCertificateForm(normalizeCertificateToForm(item));
        setEditingCertificateId(key);
        setCertificateIdTouched(true);
        openCertificateEditor("edit");
      } else if (kind === "blog") {
        setBlogForm(normalizeBlogToForm(item));
        setEditingBlogSlug(key);
        setBlogSlugTouched(true);
        openBlogEditor("edit");
      } else {
        setInterestForm(normalizeInterestToForm(item));
        setEditingInterestIndex(Number(key));
        openInterestEditor("edit");
      }
    } catch (error) {
      setContentError(error instanceof Error ? error.message : String(error));
    }
  };

  const handleSectionClick = (sectionId: StudioSectionId) => {
    setContentError("");
    setContentResult(null);
    setProjectError("");
    setActiveSection(sectionId);
    setWorkspaceView("section-detail");
  };

  const handleSectionAction = (action: string) => {
    if (selected.id === "profile" && action === "Editar perfil") {
      openProfileEditor();
      return;
    }

    if (selected.id === "development") {
      if (action === "Agregar elemento") {
        openDevelopmentEditor("new");
        return;
      }
    }

    if (selected.id === "projects" && action === "Nuevo proyecto") {
      openProjectCreator();
      return;
    }

    if (selected.id === "about") {
      if (action === "Agregar formacion") {
        openAboutEditor("new", "education");
        return;
      }

      if (action === "Agregar experiencia") {
        openAboutEditor("new", "work");
        return;
      }

      if (action === "Editar entradas") {
        loadContent("about");
        return;
      }
    }

    if (selected.id === "certificates") {
      if (action === "Subir certificado") {
        openCertificateEditor("new");
        return;
      }

      if (action === "Editar metadatos") {
        loadContent("certificates");
        return;
      }
    }

    if (selected.id === "blog") {
      if (action === "Nueva nota") {
        openBlogEditor("new");
        return;
      }

      if (action === "Editar borrador") {
        loadContent("blog");
        return;
      }
    }

    if (selected.id === "interests") {
      if (action === "Agregar item") {
        openInterestEditor("new");
        return;
      }

      if (action === "Ajustar etiquetas") {
        loadContent("interests");
      }
    }
  };

  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setContentError("");
    setContentResult(null);
    setIsSavingContent(true);

    try {
      const result = await invoke<SavedContent>("save_profile", { input: profileForm });
      setContentResult(result);
      await loadProfile();
    } catch (error) {
      setContentError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleSaveAbout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setContentError("");
    setContentResult(null);
    setIsSavingContent(true);

    try {
      const result = await invoke<SavedContent>("save_about_item", {
        existingKey: editingAboutKey,
        input: aboutForm,
      });
      setContentResult(result);
      await loadContent("about");
      setEditingAboutKey(result.key);
    } catch (error) {
      setContentError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleDeleteAbout = async (key: string) => {
    const confirmed = window.confirm("Esto quitara la entrada de Sobre mi del portafolio.");
    if (!confirmed) {
      return;
    }

    setContentError("");
    setContentResult(null);
    setIsSavingContent(true);

    try {
      const result = await invoke<SavedContent>("delete_about_item", { key });
      setContentResult(result);
      await loadContent("about");

      if (editingAboutKey === key) {
        setAboutForm(defaultAboutForm());
        setEditingAboutKey(null);
      }
    } catch (error) {
      setContentError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleSaveDevelopment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setContentError("");
    setContentResult(null);
    setImagePickMessage(null);
    setIsSavingContent(true);

    try {
      const result = await invoke<SavedContent>("save_development_item", {
        existingId: editingDevelopmentId,
        input: developmentForm,
      });
      setContentResult(result);
      await loadContent("development");
      setEditingDevelopmentId(result.key);
      setDevelopmentIdTouched(true);
    } catch (error) {
      setContentError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleDeleteDevelopment = async (id: string) => {
    const confirmed = window.confirm("Esto quitara la entrada de En desarrollo del portafolio.");
    if (!confirmed) {
      return;
    }

    setContentError("");
    setContentResult(null);
    setIsSavingContent(true);

    try {
      const result = await invoke<SavedContent>("delete_development_item", { id });
      setContentResult(result);
      await loadContent("development");

      if (editingDevelopmentId === id) {
        setDevelopmentForm(defaultDevelopmentForm());
        setEditingDevelopmentId(null);
        setDevelopmentIdTouched(false);
      }
    } catch (error) {
      setContentError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleMoveDevelopment = async (id: string, direction: "up" | "down") => {
    setContentError("");
    setContentResult(null);
    setIsSavingContent(true);

    try {
      const result = await invoke<SavedContent>("move_development_item", { id, direction });
      setContentResult(result);
      await loadContent("development");
    } catch (error) {
      setContentError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleToggleContentHidden = async (kind: "development" | "certificates", item: StudioContentItem) => {
    const hidden = !item.hidden;

    setContentError("");
    setContentResult(null);
    setIsSavingContent(true);

    try {
      const result = await invoke<SavedContent>("set_studio_content_hidden", {
        kind,
        key: item.key,
        hidden,
      });
      setContentResult(result);
      await loadContent(kind);

      if (kind === "development" && editingDevelopmentId === item.key) {
        setDevelopmentForm((current) => ({ ...current, hidden }));
      }

      if (kind === "certificates" && editingCertificateId === item.key) {
        setCertificateForm((current) => ({ ...current, hidden }));
      }
    } catch (error) {
      setContentError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSavingContent(false);
    }
  };

  const pickCertificateFile = async (source: ImagePickSource) => {
    setContentError("");

    try {
      const picked = await invoke<PickedCertificateFile | null>("pick_certificate_file", { source });
      if (!picked) {
        return;
      }

      setCertificateForm((current) => ({
        ...current,
        fileName: picked.fileName,
        certificateType: picked.fileType,
        mime: picked.mime,
      }));
    } catch (error) {
      setContentError(error instanceof Error ? error.message : String(error));
    }
  };

  const handleSaveCertificate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setContentError("");
    setContentResult(null);
    setIsSavingContent(true);

    try {
      const result = await invoke<SavedContent>("save_certificate", {
        existingId: editingCertificateId,
        input: certificateForm,
      });
      setContentResult(result);
      await loadContent("certificates");
      setEditingCertificateId(result.key);
      setCertificateIdTouched(true);
    } catch (error) {
      setContentError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleDeleteCertificate = async (id: string) => {
    const confirmed = window.confirm(
      "Esto quitara el certificado del portafolio y eliminara su archivo local asociado.",
    );
    if (!confirmed) {
      return;
    }

    setContentError("");
    setContentResult(null);
    setIsSavingContent(true);

    try {
      const result = await invoke<SavedContent>("delete_certificate", { id });
      setContentResult(result);
      await loadContent("certificates");

      if (editingCertificateId === id) {
        setCertificateForm(defaultCertificateForm());
        setEditingCertificateId(null);
        setCertificateIdTouched(false);
      }
    } catch (error) {
      setContentError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleMoveCertificate = async (id: string, direction: "up" | "down") => {
    setContentError("");
    setContentResult(null);
    setIsSavingContent(true);

    try {
      const result = await invoke<SavedContent>("move_certificate", { id, direction });
      setContentResult(result);
      await loadContent("certificates");
    } catch (error) {
      setContentError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleSaveBlog = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setContentError("");
    setContentResult(null);
    setIsSavingContent(true);

    try {
      const blogInput = {
        ...blogForm,
        filter: blogForm.category || blogForm.filter,
      };
      const result = await invoke<SavedContent>("save_blog_post", {
        existingSlug: editingBlogSlug,
        input: blogInput,
      });
      setContentResult(result);
      await loadContent("blog");
      setEditingBlogSlug(result.key);
      setBlogSlugTouched(true);
    } catch (error) {
      setContentError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleDeleteBlog = async (slug: string) => {
    const confirmed = window.confirm("Esto borrara la nota publicada del portafolio.");
    if (!confirmed) {
      return;
    }

    setContentError("");
    setContentResult(null);
    setIsSavingContent(true);

    try {
      const result = await invoke<SavedContent>("delete_blog_post", { slug });
      setContentResult(result);
      await loadContent("blog");

      if (editingBlogSlug === slug) {
        setBlogForm(defaultBlogForm());
        setEditingBlogSlug(null);
        setBlogSlugTouched(false);
      }
    } catch (error) {
      setContentError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleSaveInterest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setContentError("");
    setContentResult(null);
    setIsSavingContent(true);

    try {
      const result = await invoke<SavedContent>("save_interest", {
        existingIndex: editingInterestIndex,
        input: interestForm,
      });
      setContentResult(result);
      await loadContent("interests");
      setEditingInterestIndex(Number(result.key));
    } catch (error) {
      setContentError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleDeleteInterest = async (index: number) => {
    const confirmed = window.confirm("Esto borrara el interes del portafolio y sus assets locales asociados.");
    if (!confirmed) {
      return;
    }

    setContentError("");
    setContentResult(null);
    setIsSavingContent(true);

    try {
      const result = await invoke<SavedContent>("delete_interest", { index });
      setContentResult(result);
      await loadContent("interests");

      if (editingInterestIndex === index) {
        setInterestForm(defaultInterestForm());
        setEditingInterestIndex(null);
      }
    } catch (error) {
      setContentError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleCreateProject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProjectError("");
    setImagePickMessage(null);
    setProjectResult(null);
    setIsSavingProject(true);

    try {
      const result = editingSlug
        ? await invoke<CreatedProject>("update_project", { existingSlug: editingSlug, input: projectForm })
        : await invoke<CreatedProject>("create_project", { input: projectForm });
      setProjectResult(result);
      await loadProjects();
      setSlugTouched(false);
      setEditingSlug(null);
      setProjectForm((current) => ({
        ...defaultProjectForm(),
        category: current.category,
        year: current.year,
        tag: current.tag,
        accent: current.accent,
        detailCategory: current.detailCategory,
        detailCategoryEn: current.detailCategoryEn,
        visualClass: current.visualClass,
      }));
    } catch (error) {
      setProjectError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSavingProject(false);
    }
  };

  const editorTitle =
    workspaceView === "section-detail"
      ? selected.title
      : workspaceView === "profile-edit"
      ? "Editar perfil"
      : workspaceView === "project-create"
      ? editingSlug
        ? "Editar proyecto"
        : "Nuevo proyecto"
      : workspaceView === "about-edit"
        ? editingAboutKey
          ? "Editar Sobre mi"
          : aboutForm.group === "work"
            ? "Nueva experiencia"
            : "Nueva formacion"
      : workspaceView === "development-edit"
        ? editingDevelopmentId
          ? "Editar en desarrollo"
          : "Nuevo en desarrollo"
      : workspaceView === "certificate-edit"
        ? editingCertificateId
          ? "Editar certificado"
          : "Nuevo certificado"
        : workspaceView === "blog-edit"
          ? editingBlogSlug
            ? "Editar nota"
            : "Nueva nota"
          : workspaceView === "interest-edit"
            ? editingInterestIndex !== null
              ? "Editar interes"
              : "Nuevo interes"
            : "";
  const editorEyebrow =
    workspaceView === "section-detail"
      ? selected.eyebrow
      : workspaceView === "profile-edit"
      ? "Perfil"
      : workspaceView === "project-create"
      ? "Proyectos"
      : workspaceView === "about-edit"
        ? "Sobre mi"
      : workspaceView === "development-edit"
        ? "En desarrollo"
      : workspaceView === "certificate-edit"
        ? "Certificados"
        : workspaceView === "blog-edit"
          ? "Blog"
          : workspaceView === "interest-edit"
            ? "Intereses"
            : "";
  const resetCurrentEditor = () => {
    if (workspaceView === "profile-edit") {
      loadProfile();
    } else if (workspaceView === "project-create") {
      resetProjectForm();
    } else if (workspaceView === "about-edit") {
      openAboutEditor("new", aboutForm.group);
    } else if (workspaceView === "development-edit") {
      openDevelopmentEditor("new");
    } else if (workspaceView === "certificate-edit") {
      openCertificateEditor("new");
    } else if (workspaceView === "blog-edit") {
      openBlogEditor("new");
    } else if (workspaceView === "interest-edit") {
      openInterestEditor("new");
    }
  };

  const selectedModuleDetail = (
    <div className={`module-card-detail module-card-detail--${selected.id}`} aria-live="polite">
      <div className="selection-status">
        <span>
          <CircleDot size={16} strokeWidth={2.4} />
          {sectionMetric}
        </span>
        <span>
          <CheckCircle2 size={16} strokeWidth={2.4} />
          {selected.detail}
        </span>
      </div>

      {selected.id === "development" ? (
        <div className="active-projects-panel" id="development-work-list">
          <div className="active-projects-head">
            <div>
              <strong>Orden de En desarrollo</strong>
              <span>{developmentOrderSummary}</span>
            </div>
            <button type="button" onClick={() => openDevelopmentEditor("new")}>
              Agregar
            </button>
          </div>

          {loadingContentKind === "development" ? (
            <p className="active-projects-empty">Cargando contenido...</p>
          ) : contentItems.development.length === 0 ? (
            <p className="active-projects-empty">
              Todavia no hay elementos en desarrollo. Agrega un proyecto o certificado con titulo, descripcion, portada y progreso.
            </p>
          ) : (
            <>
              <div className="active-projects-list development-order-list">
                {contentItems.development.map((item, index) => (
                  <div className={`active-project-row${item.hidden ? " is-hidden-content" : ""}`} key={item.key}>
                    <span className="development-order-index" aria-label={`Posicion ${index + 1}`}>
                      {index + 1}
                    </span>
                    <div className="active-project-row-copy">
                      <strong>{item.title}</strong>
                      <span>{item.subtitle} - {item.detail}</span>
                      <span className={`content-visibility-badge${item.hidden ? " is-hidden" : ""}`}>
                        {item.hidden ? "Oculto en web" : "Visible en web"}
                      </span>
                    </div>
                    <div className="active-project-row-actions">
                      <span className="development-order-actions" aria-label="Cambiar posicion">
                        <button
                          type="button"
                          className="development-order-button"
                          onClick={() => handleMoveDevelopment(item.key, "up")}
                          disabled={index === 0 || isSavingContent}
                          aria-label={`Subir ${item.title}`}
                          title="Subir una posicion"
                        >
                          <ChevronUp size={16} strokeWidth={2.5} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="development-order-button"
                          onClick={() => handleMoveDevelopment(item.key, "down")}
                          disabled={index === contentItems.development.length - 1 || isSavingContent}
                          aria-label={`Bajar ${item.title}`}
                          title="Bajar una posicion"
                        >
                          <ChevronDown size={16} strokeWidth={2.5} aria-hidden="true" />
                        </button>
                      </span>
                      <button
                        type="button"
                        className="visibility-action"
                        onClick={() => handleToggleContentHidden("development", item)}
                        disabled={isSavingContent}
                      >
                        {item.hidden ? <Eye size={15} strokeWidth={2.3} /> : <EyeOff size={15} strokeWidth={2.3} />}
                        {item.hidden ? "Mostrar" : "Ocultar"}
                      </button>
                      <button type="button" onClick={() => handleEditContent("development", item.key)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className="danger-action"
                        onClick={() => handleDeleteDevelopment(item.key)}
                        disabled={isSavingContent}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {contentError ? <p className="form-message is-error">{contentError}</p> : null}
          {contentResult ? (
            <p className="form-message is-success">Contenido actualizado. Total: {contentResult.totalItems}</p>
          ) : null}
        </div>
      ) : null}

      {selected.id === "about" ? (
        <div className="about-content-blocks">
          {[
            { title: "Formacion academica", items: aboutEducationItems, group: "education" as AboutGroupKind },
            { title: "Experiencia laboral", items: aboutWorkItems, group: "work" as AboutGroupKind },
          ].map((block) => (
            <div className="active-projects-panel about-content-block" key={block.group}>
              <div className="active-projects-head">
                <div>
                  <strong>{block.title}</strong>
                  <span>{block.items.length} entrada{block.items.length === 1 ? "" : "s"}</span>
                </div>
                <button type="button" onClick={() => openAboutEditor("new", block.group)}>
                  Agregar
                </button>
              </div>
              {loadingContentKind === "about" ? (
                <p className="active-projects-empty">Cargando contenido...</p>
              ) : block.items.length === 0 ? (
                <p className="active-projects-empty">Todavia no hay entradas en este bloque.</p>
              ) : (
                <div className="active-projects-list">
                  {block.items.map((item) => (
                    <div className="active-project-row" key={item.key}>
                      <div>
                        <strong>{item.title}</strong>
                        <span>{item.subtitle} - {item.detail}</span>
                      </div>
                      <div className="active-project-row-actions">
                        <button type="button" onClick={() => handleEditContent("about", item.key)}>
                          Editar
                        </button>
                        <button
                          type="button"
                          className="danger-action"
                          onClick={() => handleDeleteAbout(item.key)}
                          disabled={isSavingContent}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {contentError ? <p className="form-message is-error about-content-message">{contentError}</p> : null}
        </div>
      ) : null}

      {selected.id === "projects" ? (
        <div className="active-projects-panel" id="project-edit-list">
          <div className="active-projects-head">
            <div>
              <strong>Orden de proyectos</strong>
              <span>{projects.length} proyecto{projects.length === 1 ? "" : "s"} disponible{projects.length === 1 ? "" : "s"}</span>
            </div>
            <button type="button" onClick={loadProjects}>
              Actualizar
            </button>
          </div>
          {isLoadingProjects ? (
            <p className="active-projects-empty">Cargando proyectos...</p>
          ) : projects.length === 0 ? (
            <p className="active-projects-empty">No hay proyectos en src/content/projects todavia.</p>
          ) : (
            <div className="active-projects-list">
              {projects.map((project, index) => (
                <div className="active-project-row" key={project.slug}>
                  <span className="project-order-index" aria-label={`Posicion ${index + 1}`}>
                    {index + 1}
                  </span>
                  <div className="active-project-row-copy">
                    <strong>{project.title}</strong>
                    <span>
                      {project.year || "Sin ano"} - {project.status || "sin estado"}
                      {project.showInHome ? " - visible en home" : " - oculto en home"}
                    </span>
                  </div>
                  <div className="active-project-row-actions">
                    <span className="project-order-actions" aria-label="Cambiar posicion">
                      <button
                        type="button"
                        className="project-order-button"
                        onClick={() => handleMoveProject(project.slug, "up")}
                        disabled={index === 0 || isSavingProject}
                        aria-label={`Subir ${project.title}`}
                        title="Subir una posicion"
                      >
                        <ChevronUp size={16} strokeWidth={2.5} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="project-order-button"
                        onClick={() => handleMoveProject(project.slug, "down")}
                        disabled={index === projects.length - 1 || isSavingProject}
                        aria-label={`Bajar ${project.title}`}
                        title="Bajar una posicion"
                      >
                        <ChevronDown size={16} strokeWidth={2.5} aria-hidden="true" />
                      </button>
                    </span>
                    <button type="button" onClick={() => handleEditProject(project.slug)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className="danger-action"
                      onClick={() => handleDeleteProject(project.slug)}
                      disabled={isSavingProject}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {projectError ? <p className="form-message is-error">{projectError}</p> : null}
        </div>
      ) : null}

      {activeContentKind && selected.id !== "about" && selected.id !== "development" ? (
        <div className="active-projects-panel">
          <div className="active-projects-head">
            <div>
              <strong>
                {activeContentKind === "about"
                  ? "Entradas de Sobre mi"
                  : activeContentKind === "certificates"
                    ? "Certificados disponibles"
                    : activeContentKind === "blog"
                      ? "Notas disponibles"
                      : "Intereses disponibles"}
              </strong>
              <span>{selectedContentItems.length} item{selectedContentItems.length === 1 ? "" : "s"} para editar</span>
            </div>
            <button type="button" onClick={() => loadContent(activeContentKind)}>
              Actualizar
            </button>
          </div>
          {loadingContentKind === activeContentKind ? (
            <p className="active-projects-empty">Cargando contenido...</p>
          ) : selectedContentItems.length === 0 ? (
            <p className="active-projects-empty">Todavia no hay contenido en este modulo.</p>
          ) : (
            <div className="active-projects-list">
              {selectedContentItems.map((item, index) => (
                <div className={`active-project-row${item.hidden ? " is-hidden-content" : ""}`} key={item.key}>
                  {activeContentKind === "certificates" ? (
                    <span className="project-order-index" aria-label={`Posicion ${index + 1}`}>
                      {index + 1}
                    </span>
                  ) : null}
                  <div className="active-project-row-copy">
                    <strong>{item.title}</strong>
                    <span>{item.subtitle} - {item.detail}</span>
                    {activeContentKind === "certificates" ? (
                      <span className={`content-visibility-badge${item.hidden ? " is-hidden" : ""}`}>
                        {item.hidden ? "Oculto en web" : "Visible en web"}
                      </span>
                    ) : null}
                  </div>
                  <div className="active-project-row-actions">
                    <button type="button" onClick={() => handleEditContent(activeContentKind, item.key)}>
                      Editar
                    </button>
                    {activeContentKind === "about" ? (
                      <button
                        type="button"
                        className="danger-action"
                        onClick={() => handleDeleteAbout(item.key)}
                        disabled={isSavingContent}
                      >
                        Eliminar
                      </button>
                    ) : activeContentKind === "certificates" ? (
                      <>
                        <span className="project-order-actions" aria-label="Cambiar posicion">
                          <button
                            type="button"
                            className="project-order-button"
                            onClick={() => handleMoveCertificate(item.key, "up")}
                            disabled={index === 0 || isSavingContent}
                            aria-label={`Subir ${item.title}`}
                            title="Subir una posicion"
                          >
                            <ChevronUp size={16} strokeWidth={2.5} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="project-order-button"
                            onClick={() => handleMoveCertificate(item.key, "down")}
                            disabled={index === selectedContentItems.length - 1 || isSavingContent}
                            aria-label={`Bajar ${item.title}`}
                            title="Bajar una posicion"
                          >
                            <ChevronDown size={16} strokeWidth={2.5} aria-hidden="true" />
                          </button>
                        </span>
                        <button
                          type="button"
                          className="visibility-action"
                          onClick={() => handleToggleContentHidden("certificates", item)}
                          disabled={isSavingContent}
                        >
                          {item.hidden ? <Eye size={15} strokeWidth={2.3} /> : <EyeOff size={15} strokeWidth={2.3} />}
                          {item.hidden ? "Mostrar" : "Ocultar"}
                        </button>
                        <button
                          type="button"
                          className="danger-action"
                          onClick={() => handleDeleteCertificate(item.key)}
                          disabled={isSavingContent}
                        >
                          Eliminar
                        </button>
                      </>
                    ) : activeContentKind === "blog" ? (
                      <button
                        type="button"
                        className="danger-action"
                        onClick={() => handleDeleteBlog(item.key)}
                        disabled={isSavingContent}
                      >
                        Eliminar
                      </button>
                    ) : activeContentKind === "interests" ? (
                      <button
                        type="button"
                        className="danger-action"
                        onClick={() => handleDeleteInterest(Number(item.key))}
                        disabled={isSavingContent}
                      >
                        Eliminar
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
          {contentError ? <p className="form-message is-error">{contentError}</p> : null}
          {(activeContentKind === "about" || activeContentKind === "certificates" || activeContentKind === "blog" || activeContentKind === "interests") && contentResult ? (
            <p className="form-message is-success">Contenido actualizado. Total: {contentResult.totalItems}</p>
          ) : null}
        </div>
      ) : null}

      {selected.id !== "about" && selected.id !== "development" ? (
        <div className="action-stack" aria-label={`Acciones de ${selected.title}`}>
          {selected.actions.map((action) => (
            <button
              type="button"
              key={action}
              className="action-row"
              onClick={() => handleSectionAction(action)}
            >
              <span>{action}</span>
              <ArrowRight size={17} strokeWidth={2.2} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );

  return (
    <main className={`studio-app ${theme}`} data-theme={theme}>
      <div className="studio-grid" aria-hidden="true" />
      <div className="studio-shell">
        <header className="topbar">
          <div className="brand-lockup">
            <span className="brand-mark" aria-hidden="true">
              <FolderCog size={21} strokeWidth={2.1} />
            </span>
            <div>
              <p className="app-kicker">Portfolio Studio</p>
              <h1>Gestor local</h1>
            </div>
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className="icon-button"
              aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {workspaceView !== "home" ? (
          <section className="creator-strip" aria-label="Editor de contenido">
            <button type="button" className="back-button" onClick={() => setWorkspaceView("home")}>
              <ArrowLeft size={17} strokeWidth={2.2} />
              Inicio
            </button>
            <div>
              <p className="section-label">{editorEyebrow}</p>
              <h2>{editorTitle}</h2>
            </div>
            <div className="creator-actions">
              {workspaceView === "project-create" ? (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleOpenLivePreview}
                  disabled={isOpeningLivePreview}
                  title="Abre la ficha real en el portafolio local y la mantiene sincronizada mientras escribes."
                >
                  <ExternalLink size={16} strokeWidth={2.2} />
                  {isOpeningLivePreview ? "Abriendo..." : "Preview real"}
                </button>
              ) : null}
              {workspaceView !== "section-detail" ? (
                <button type="button" className="secondary-button" onClick={resetCurrentEditor}>
                  Limpiar
                </button>
              ) : null}
            </div>
          </section>
        ) : null}

        {workspaceView === "home" ? (
          <section className="workspace" aria-label="Modulos de gestion">
            <div className="module-grid">
              {studioSections.map((section) => {
                const Icon = section.icon;
                const isActive = false;

                return (
                  <article
                    key={section.id}
                    className={`module-card accent-${section.accent}${isActive ? " is-active" : ""}`}
                  >
                    <button
                      type="button"
                      className="module-card-select"
                      onClick={() => handleSectionClick(section.id)}
                      aria-pressed={isActive}
                    >
                      <span className="module-card-top">
                        <span className="module-icon" aria-hidden="true">
                          <Icon size={22} strokeWidth={2.1} />
                        </span>
                        <span className="module-metric">{getSectionMetric(section.id, section.metric)}</span>
                      </span>
                      <span className="module-eyebrow">{section.eyebrow}</span>
                      <span className="module-title">
                        {section.title}
                        <ChevronRight size={18} strokeWidth={2.3} />
                      </span>
                      {section.description ? <span className="module-description">{section.description}</span> : null}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        ) : workspaceView === "section-detail" ? (
          <section className="module-detail-layout" aria-label={`Gestion de ${selected.title}`}>
            <section className={`module-detail-panel module-detail-panel--${selected.id} accent-${selected.accent}`} aria-live="polite">
              {selected.id !== "about" && selected.id !== "development" ? (
                <div className="module-detail-panel-head">
                  <span className="selection-icon" aria-hidden="true">
                    <SelectedIcon size={28} strokeWidth={2.1} />
                  </span>
                  <div>
                    <p>{selected.eyebrow}</p>
                    <h3>{selected.title}</h3>
                  </div>
                </div>
              ) : null}
              {selected.id !== "about" && selected.id !== "development" && selected.description ? (
                <p className="selection-copy">{selected.description}</p>
              ) : null}
              {selectedModuleDetail}
            </section>
          </section>
        ) : (
          <section
            className="project-creator-layout"
            aria-label="Formulario de contenido"
          >
            {workspaceView === "profile-edit" ? (
              <form className="project-form-panel" onSubmit={handleSaveProfile}>
                <div className="form-scroll">
                  <div className="form-section-heading">
                    <span className="section-label">Perfil</span>
                    <h3>Identidad y hero del portafolio</h3>
                  </div>

                  <div className="form-grid">
                    <label className="field">
                      <span className="compact-label">Nombre visible</span>
                      <input
                        value={profileForm.name}
                        onChange={(event) => updateProfileField("name", event.target.value)}
                        required
                      />
                    </label>
                    <label className="field">
                      <span className="compact-label">Nombre completo</span>
                      <input
                        value={profileForm.fullName}
                        onChange={(event) => updateProfileField("fullName", event.target.value)}
                        required
                      />
                    </label>
                    <label className="field">
                      <span className="compact-label">Iniciales</span>
                      <input
                        value={profileForm.initials}
                        onChange={(event) => updateProfileField("initials", event.target.value)}
                      />
                    </label>
                    <label className="field">
                      <span className="compact-label">Correo electronico</span>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(event) => updateProfileField("email", event.target.value)}
                        required
                      />
                    </label>
                    <label className="field field-wide">
                      <FieldLabel hint={fieldHints.profileDescription}>Texto principal ES</FieldLabel>
                      <textarea
                        value={profileForm.description}
                        onChange={(event) => updateProfileField("description", event.target.value)}
                        rows={4}
                        required
                      />
                    </label>
                    <label className="field field-wide">
                      <FieldLabel hint={fieldHints.profileFocus}>Frase ES</FieldLabel>
                      <input
                        value={profileForm.focus}
                        onChange={(event) => updateProfileField("focus", event.target.value)}
                        required
                      />
                    </label>
                    <div className="field field-wide">
                      <FieldLabel hint={fieldHints.profileCvPath}>CV para descargar / visualizar</FieldLabel>
                      <div className="media-picker-row">
                        <input
                          value={profileForm.cvPath}
                          onChange={(event) => updateProfileField("cvPath", event.target.value)}
                          placeholder="/CV_Jonathan_Acevedo.pdf o https://..."
                        />
                        <div className="media-picker-actions">
                          <button
                            type="button"
                            className="media-picker-button"
                            onClick={() => {
                              updateProfileField("cvPath", "");
                              setContentResult(null);
                              setImagePickMessage(null);
                            }}
                            disabled={!profileForm.cvPath.trim()}
                          >
                            <Trash2 size={15} strokeWidth={2.2} />
                            Quitar
                          </button>
                          <button
                            type="button"
                            className="media-picker-button"
                            onClick={() => pickProfileCv("import")}
                          >
                            <FolderOpen size={15} strokeWidth={2.2} />
                            Importar PDF
                          </button>
                          <button
                            type="button"
                            className="media-picker-button"
                            onClick={() => pickProfileCv("existing")}
                          >
                            <FolderOpen size={15} strokeWidth={2.2} />
                            Elegir del portafolio
                          </button>
                        </div>
                      </div>
                    </div>
                    <label className="field field-wide">
                      <FieldLabel hint={fieldHints.profileLink}>LinkedIn</FieldLabel>
                      <input
                        value={profileForm.linkedin}
                        onChange={(event) => updateProfileField("linkedin", event.target.value)}
                        placeholder="https://www.linkedin.com/in/..."
                      />
                    </label>
                    <label className="field field-wide">
                      <FieldLabel hint={fieldHints.profileLink}>GitHub</FieldLabel>
                      <input
                        value={profileForm.github}
                        onChange={(event) => updateProfileField("github", event.target.value)}
                        placeholder="https://github.com/..."
                      />
                    </label>
                    <label className="field field-wide">
                      <FieldLabel hint={fieldHints.profileLink}>GitLab</FieldLabel>
                      <input
                        value={profileForm.gitlab}
                        onChange={(event) => updateProfileField("gitlab", event.target.value)}
                        placeholder="https://gitlab.com/..."
                      />
                    </label>
                  </div>

                  <div className="form-section-heading">
                    <span className="section-label">English</span>
                    <h3>Textos del hero en ingles</h3>
                  </div>
                  <div className="form-grid">
                    <label className="field field-wide">
                      <FieldLabel hint={fieldHints.englishFallback}>Main text EN</FieldLabel>
                      <textarea
                        value={profileForm.descriptionEn}
                        onChange={(event) => updateProfileField("descriptionEn", event.target.value)}
                        rows={4}
                      />
                    </label>
                    <label className="field field-wide">
                      <FieldLabel hint={fieldHints.englishFallback}>Focus phrase EN</FieldLabel>
                      <input
                        value={profileForm.focusEn}
                        onChange={(event) => updateProfileField("focusEn", event.target.value)}
                      />
                    </label>
                  </div>

                  {imagePickMessage && (
                    <p className={`form-message is-${imagePickMessage.tone}`}>{imagePickMessage.text}</p>
                  )}
                  {contentError && <p className="form-message is-error">{contentError}</p>}
                  {contentResult && (
                    <div className="form-message is-success">
                      <strong>Perfil guardado</strong>
                      <span>{contentResult.filePath}</span>
                    </div>
                  )}
                </div>
                <div className="form-footer">
                  <button type="button" className="secondary-button" onClick={loadProfile}>Restaurar archivo</button>
                  <button type="submit" className="primary-button" disabled={isSavingContent}>
                    <Save size={17} strokeWidth={2.2} />
                    {isSavingContent ? "Guardando..." : "Guardar perfil"}
                  </button>
                </div>
              </form>
            ) : workspaceView === "project-create" ? (
            <form className="project-form-panel" onSubmit={handleCreateProject}>
              <div className="form-scroll">
                <div className="form-section-heading">
                  <span className="section-label">Base</span>
                  <h3>Datos para la tarjeta</h3>
                </div>

                <div className="form-grid">
                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.title}>Nombre del proyecto</FieldLabel>
                    <input
                      value={projectForm.title}
                      onChange={(event) => updateProjectField("title", event.target.value)}
                      placeholder="Docqee"
                      required
                    />
                  </label>

                  <label className="field">
                    <FieldLabel hint={fieldHints.slug}>Slug</FieldLabel>
                    <input
                      value={projectForm.slug}
                      onChange={(event) => updateProjectField("slug", event.target.value)}
                      placeholder="docqee"
                      required
                    />
                  </label>

                  <label className="field">
                    <FieldLabel hint={fieldHints.year}>Año</FieldLabel>
                    <input
                      value={projectForm.year}
                      onChange={(event) => updateProjectField("year", event.target.value)}
                      placeholder={currentYear}
                      required
                    />
                  </label>

                  <label className="field">
                    <FieldLabel hint={fieldHints.category}>Categoria</FieldLabel>
                    <select
                      value={projectForm.category}
                      onChange={(event) => updateProjectField("category", event.target.value)}
                    >
                      <option value="web">Web</option>
                      <option value="design">Diseno</option>
                      <option value="automation">Automatizacion</option>
                      <option value="content">Contenido</option>
                      <option value="ai">IA</option>
                    </select>
                  </label>

                  <label className="field">
                    <FieldLabel hint={fieldHints.tag}>Etiqueta</FieldLabel>
                    <input
                      value={projectForm.tag}
                      onChange={(event) => updateProjectField("tag", event.target.value)}
                      placeholder="Web"
                      required
                    />
                  </label>

                  <label className="field">
                    <FieldLabel hint={fieldHints.accent}>Acento</FieldLabel>
                    <input
                      value={projectForm.accent}
                      onChange={(event) => updateProjectField("accent", event.target.value)}
                      placeholder="Producto digital"
                      required
                    />
                  </label>

                  <label className="field">
                    <FieldLabel hint={fieldHints.visualClass}>Visual</FieldLabel>
                    <select
                      value={projectForm.visualClass}
                      onChange={(event) => updateProjectField("visualClass", event.target.value)}
                    >
                      <option value="visual-brand">Marca</option>
                      <option value="visual-control">Control</option>
                      <option value="visual-launch">Lanzamiento</option>
                      <option value="visual-notes">Notas</option>
                      <option value="visual-system">Sistema</option>
                      <option value="visual-ai">IA</option>
                    </select>
                  </label>

                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.description}>Descripcion corta</FieldLabel>
                    <textarea
                      value={projectForm.description}
                      onChange={(event) => updateProjectField("description", event.target.value)}
                      placeholder="Una frase clara para la tarjeta del portafolio."
                      rows={3}
                      required
                    />
                  </label>
                </div>

                <div className="form-section-heading">
                  <span className="section-label">English</span>
                  <h3>Textos base en ingles</h3>
                </div>

                <div className="form-grid">
                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.englishFallback}>Project name</FieldLabel>
                    <input
                      value={projectForm.titleEn}
                      onChange={(event) => updateProjectField("titleEn", event.target.value)}
                      placeholder="Docqee"
                    />
                  </label>

                  <label className="field">
                    <FieldLabel hint={fieldHints.englishFallback}>Tag</FieldLabel>
                    <input
                      value={projectForm.tagEn}
                      onChange={(event) => updateProjectField("tagEn", event.target.value)}
                      placeholder="Web"
                    />
                  </label>

                  <label className="field">
                    <FieldLabel hint={fieldHints.englishFallback}>Focus</FieldLabel>
                    <input
                      value={projectForm.accentEn}
                      onChange={(event) => updateProjectField("accentEn", event.target.value)}
                      placeholder="Digital product"
                    />
                  </label>

                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.englishFallback}>Short description</FieldLabel>
                    <textarea
                      value={projectForm.descriptionEn}
                      onChange={(event) => updateProjectField("descriptionEn", event.target.value)}
                      placeholder="A clear sentence for the portfolio card."
                      rows={3}
                    />
                  </label>
                </div>

                <div className="form-section-heading">
                  <span className="section-label">Ficha</span>
                  <h3>Contenido del caso</h3>
                </div>

                <div className="form-grid">
                  <label className="field">
                    <FieldLabel hint={fieldHints.detailCategory}>Categoria visible</FieldLabel>
                    <input
                      value={projectForm.detailCategory}
                      onChange={(event) => updateProjectField("detailCategory", event.target.value)}
                      placeholder="Producto digital"
                    />
                  </label>

                  <div className="field field-wide">
                    <StackSelector
                      hint={fieldHints.stack}
                      value={projectForm.stack}
                      onChange={(value) => updateProjectField("stack", value)}
                    />
                  </div>

                  <div className="field field-wide">
                    <ProcessStepsEditor
                      hint={fieldHints.process}
                      value={projectForm.process}
                      onChange={(value) => updateProjectField("process", value)}
                    />
                  </div>

                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.results}>Resultados</FieldLabel>
                    <textarea
                      value={projectForm.results}
                      onChange={(event) => updateProjectField("results", event.target.value)}
                      placeholder="Describe el impacto, aprendizaje o resultado principal en formato de parrafo."
                      rows={3}
                    />
                  </label>

                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.summary}>Resumen</FieldLabel>
                    <textarea
                      value={projectForm.summary}
                      onChange={(event) => updateProjectField("summary", event.target.value)}
                      rows={2}
                      required
                    />
                  </label>

                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.overview}>Descripcion larga</FieldLabel>
                    <textarea
                      value={projectForm.overview}
                      onChange={(event) => updateProjectField("overview", event.target.value)}
                      rows={4}
                      required
                    />
                  </label>

                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.challenge}>Reto</FieldLabel>
                    <textarea
                      value={projectForm.challenge}
                      onChange={(event) => updateProjectField("challenge", event.target.value)}
                      rows={3}
                      required
                    />
                  </label>

                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.solution}>Solucion</FieldLabel>
                    <textarea
                      value={projectForm.solution}
                      onChange={(event) => updateProjectField("solution", event.target.value)}
                      rows={3}
                      required
                    />
                  </label>

                </div>

                <div className="form-section-heading">
                  <span className="section-label">English</span>
                  <h3>Contenido de la ficha en ingles</h3>
                </div>

                <div className="form-grid">
                  <label className="field">
                    <FieldLabel hint={fieldHints.englishFallback}>Visible category</FieldLabel>
                    <input
                      value={projectForm.detailCategoryEn}
                      onChange={(event) => updateProjectField("detailCategoryEn", event.target.value)}
                      placeholder="Digital product"
                    />
                  </label>

                  <div className="field field-wide">
                    <ProcessStepsEditor
                      addLabel="Add step"
                      emptyText="Add English steps for the process timeline."
                      hint={fieldHints.englishFallback}
                      label="Process"
                      placeholder="Research, prototype, development..."
                      value={projectForm.processEn}
                      onChange={(value) => updateProjectField("processEn", value)}
                    />
                  </div>

                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.englishFallback}>Results</FieldLabel>
                    <textarea
                      value={projectForm.resultsEn}
                      onChange={(event) => updateProjectField("resultsEn", event.target.value)}
                      placeholder="Describe the main impact, learning, or result as a paragraph."
                      rows={3}
                    />
                  </label>

                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.englishFallback}>Overview block</FieldLabel>
                    <textarea
                      value={projectForm.summaryEn}
                      onChange={(event) => updateProjectField("summaryEn", event.target.value)}
                      rows={2}
                    />
                  </label>

                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.englishFallback}>Long description</FieldLabel>
                    <textarea
                      value={projectForm.overviewEn}
                      onChange={(event) => updateProjectField("overviewEn", event.target.value)}
                      rows={4}
                    />
                  </label>

                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.englishFallback}>Challenge</FieldLabel>
                    <textarea
                      value={projectForm.challengeEn}
                      onChange={(event) => updateProjectField("challengeEn", event.target.value)}
                      rows={3}
                    />
                  </label>

                  <label className="field field-wide">
                    <FieldLabel hint={fieldHints.englishFallback}>Solution</FieldLabel>
                    <textarea
                      value={projectForm.solutionEn}
                      onChange={(event) => updateProjectField("solutionEn", event.target.value)}
                      rows={3}
                    />
                  </label>

                </div>

                <div className="form-section-heading">
                  <span className="section-label">Enlaces</span>
                  <h3>Demo y archivos</h3>
                </div>

                <div className="form-grid">
                  <label className="field">
                    <FieldLabel hint={fieldHints.repoUrl}>Repositorio</FieldLabel>
                    <input
                      value={projectForm.repoUrl}
                      onChange={(event) => updateProjectField("repoUrl", event.target.value)}
                      placeholder="https://github.com/..."
                    />
                  </label>

                  <div className="field">
                    <FieldLabel hint={fieldHints.previewImage}>Imagen preview</FieldLabel>
                    <div className="media-picker-row">
                      <input
                        value={projectForm.previewImage}
                        onChange={(event) => updateProjectField("previewImage", event.target.value)}
                        placeholder="/docqee.png o https://..."
                      />
                      {renderImagePickerActions({ kind: "preview" })}
                    </div>
                  </div>

                  <label className="field">
                    <FieldLabel hint={fieldHints.status}>Estado</FieldLabel>
                    <select
                      value={projectForm.status}
                      onChange={(event) => updateProjectField("status", event.target.value)}
                    >
                      <option value="">Sin estado</option>
                      <option value="completed">Completado</option>
                      <option value="in-progress">En progreso</option>
                      <option value="concept">Concepto</option>
                      <option value="experimental">Experimental</option>
                      <option value="paused">Pausado</option>
                      <option value="archived">Archivado</option>
                    </select>
                  </label>

                  <label className="field">
                    <FieldLabel hint={fieldHints.featuredLevel}>Destacado</FieldLabel>
                    <select
                      value={projectForm.featuredLevel}
                      onChange={(event) => updateProjectField("featuredLevel", event.target.value)}
                    >
                      <option value="">Normal</option>
                      <option value="featured">Destacado</option>
                      <option value="main">Principal</option>
                    </select>
                  </label>

                  <label className="check-field">
                    <input
                      type="checkbox"
                      checked={projectForm.showInHome}
                      onChange={(event) => updateProjectField("showInHome", event.target.checked)}
                    />
                    <FieldLabel hint={fieldHints.showInHome}>Mostrar en inicio</FieldLabel>
                  </label>
                </div>

                <div className="form-section-heading">
                  <span className="section-label">Opcional</span>
                  <h3>Mas campos del proyecto</h3>
                </div>

                <div className="optional-content-panel">
                  <SectionOrderControl
                    hint={fieldHints.sectionOrder}
                    value={projectForm.sectionOrder}
                    onMove={movePreviewSection}
                  />

                  <div className="optional-group">
                    <div className="optional-group-head">
                      <div>
                        <FieldLabel hint={fieldHints.metrics}>Metricas</FieldLabel>
                        <p>Indicadores visibles en la ficha: pueden ser numeros, frases cortas o valores mixtos.</p>
                      </div>
                      <button type="button" className="add-row-button" onClick={() => addOptionalItem("metrics")}>
                        <Plus size={16} strokeWidth={2.2} />
                        Agregar
                      </button>
                    </div>
                    {projectForm.metrics.length === 0 ? (
                      <p className="optional-empty">Sin metricas adicionales.</p>
                    ) : (
                      <div className="optional-list">
                        {projectForm.metrics.map((metric, index) => (
                          <div className="optional-item" key={`metric-${index}`}>
                            <div className="optional-item-head">
                              <strong>Metrica {index + 1}</strong>
                              <OptionalItemActions
                                canMoveUp={index > 0}
                                canMoveDown={index < projectForm.metrics.length - 1}
                                onMoveUp={() => moveOptionalItem("metrics", index, -1)}
                                onMoveDown={() => moveOptionalItem("metrics", index, 1)}
                                onRemove={() => removeOptionalItem("metrics", index)}
                                removeLabel={`Quitar metrica ${index + 1}`}
                              />
                            </div>
                            <div className="optional-item-grid">
                              <label className="field">
                                <span className="compact-label">Valor o texto</span>
                                <input
                                  value={metric.value}
                                  onChange={(event) => updateOptionalItem("metrics", index, "value", event.target.value)}
                                  placeholder="+35%, MVP listo, 4 modulos"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Etiqueta</span>
                                <input
                                  value={metric.label}
                                  onChange={(event) => updateOptionalItem("metrics", index, "label", event.target.value)}
                                  placeholder="menos tiempo de carga"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Label EN</span>
                                <input
                                  value={metric.labelEn}
                                  onChange={(event) => updateOptionalItem("metrics", index, "labelEn", event.target.value)}
                                  placeholder="less load time"
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="optional-group">
                    <div className="optional-group-head">
                      <div>
                        <FieldLabel hint={fieldHints.extraLinks}>Enlaces extra</FieldLabel>
                        <p>Documentacion, articulo, prototipo, video externo o cualquier recurso relacionado.</p>
                      </div>
                      <button type="button" className="add-row-button" onClick={() => addOptionalItem("extraLinks")}>
                        <Plus size={16} strokeWidth={2.2} />
                        Agregar
                      </button>
                    </div>
                    {projectForm.extraLinks.length === 0 ? (
                      <p className="optional-empty">Sin enlaces adicionales.</p>
                    ) : (
                      <div className="optional-list">
                        {projectForm.extraLinks.map((link, index) => (
                          <div className="optional-item" key={`extra-link-${index}`}>
                            <div className="optional-item-head">
                              <strong>Enlace {index + 1}</strong>
                              <OptionalItemActions
                                canMoveUp={index > 0}
                                canMoveDown={index < projectForm.extraLinks.length - 1}
                                onMoveUp={() => moveOptionalItem("extraLinks", index, -1)}
                                onMoveDown={() => moveOptionalItem("extraLinks", index, 1)}
                                onRemove={() => removeOptionalItem("extraLinks", index)}
                                removeLabel={`Quitar enlace ${index + 1}`}
                              />
                            </div>
                            <div className="optional-item-grid">
                              <label className="field">
                                <span className="compact-label">Tipo</span>
                                <input
                                  value={link.type}
                                  onChange={(event) => updateOptionalItem("extraLinks", index, "type", event.target.value)}
                                  placeholder="docs"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Texto ES</span>
                                <input
                                  value={link.labelEs}
                                  onChange={(event) => updateOptionalItem("extraLinks", index, "labelEs", event.target.value)}
                                  placeholder="Ver documentacion"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Texto EN</span>
                                <input
                                  value={link.labelEn}
                                  onChange={(event) => updateOptionalItem("extraLinks", index, "labelEn", event.target.value)}
                                  placeholder="View documentation"
                                />
                              </label>
                              <label className="field field-wide">
                                <span className="compact-label">URL</span>
                                <input
                                  value={link.href}
                                  onChange={(event) => updateOptionalItem("extraLinks", index, "href", event.target.value)}
                                  placeholder="https://..."
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="optional-group">
                    <div className="optional-group-head">
                      <div>
                        <FieldLabel hint={fieldHints.images}>Imagenes</FieldLabel>
                        <p>Alt ES describe la imagen para accesibilidad. Caption ES es el texto visible debajo de la imagen.</p>
                      </div>
                      <button type="button" className="add-row-button" onClick={() => addOptionalItem("images")}>
                        <Plus size={16} strokeWidth={2.2} />
                        Agregar
                      </button>
                    </div>
                    {projectForm.images.length === 0 ? (
                      <p className="optional-empty">Sin imagenes adicionales.</p>
                    ) : (
                      <div className="optional-list">
                        {projectForm.images.map((image, index) => (
                          <div className="optional-item" key={`image-${index}`}>
                            <div className="optional-item-head">
                              <strong>Imagen {index + 1}</strong>
                              <OptionalItemActions
                                canMoveUp={index > 0}
                                canMoveDown={index < projectForm.images.length - 1}
                                onMoveUp={() => moveOptionalItem("images", index, -1)}
                                onMoveDown={() => moveOptionalItem("images", index, 1)}
                                onRemove={() => removeOptionalItem("images", index)}
                                removeLabel={`Quitar imagen ${index + 1}`}
                              />
                            </div>
                            <div className="optional-item-grid">
                              <div className="field field-wide">
                                <span className="compact-label">Ruta o URL</span>
                                <div className="media-picker-row">
                                  <input
                                    value={image.src}
                                    onChange={(event) => updateOptionalItem("images", index, "src", event.target.value)}
                                    placeholder="/captura-proyecto.png o https://..."
                                  />
                                  {renderImagePickerActions({ kind: "gallery", index })}
                                </div>
                              </div>
                              <label className="field">
                                <span className="compact-label">Alt ES</span>
                                <input
                                  value={image.altEs}
                                  onChange={(event) => updateOptionalItem("images", index, "altEs", event.target.value)}
                                  placeholder="Pantalla principal"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Alt EN</span>
                                <input
                                  value={image.altEn}
                                  onChange={(event) => updateOptionalItem("images", index, "altEn", event.target.value)}
                                  placeholder="Main screen"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Caption ES</span>
                                <input
                                  value={image.captionEs}
                                  onChange={(event) => updateOptionalItem("images", index, "captionEs", event.target.value)}
                                  placeholder="Opcional"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Caption EN</span>
                                <input
                                  value={image.captionEn}
                                  onChange={(event) => updateOptionalItem("images", index, "captionEn", event.target.value)}
                                  placeholder="Optional"
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="optional-group">
                    <div className="optional-group-head">
                      <div>
                        <FieldLabel hint={fieldHints.videos}>Videos</FieldLabel>
                        <p>Videos locales, demos grabadas o recursos audiovisuales.</p>
                      </div>
                      <button type="button" className="add-row-button" onClick={() => addOptionalItem("videos")}>
                        <Plus size={16} strokeWidth={2.2} />
                        Agregar
                      </button>
                    </div>
                    {projectForm.videos.length === 0 ? (
                      <p className="optional-empty">Sin videos adicionales.</p>
                    ) : (
                      <div className="optional-list">
                        {projectForm.videos.map((video, index) => (
                          <div className="optional-item" key={`video-${index}`}>
                            <div className="optional-item-head">
                              <strong>Video {index + 1}</strong>
                              <OptionalItemActions
                                canMoveUp={index > 0}
                                canMoveDown={index < projectForm.videos.length - 1}
                                onMoveUp={() => moveOptionalItem("videos", index, -1)}
                                onMoveDown={() => moveOptionalItem("videos", index, 1)}
                                onRemove={() => removeOptionalItem("videos", index)}
                                removeLabel={`Quitar video ${index + 1}`}
                              />
                            </div>
                            <div className="optional-item-grid">
                              <label className="field field-wide">
                                <span className="compact-label">Ruta o URL</span>
                                <input
                                  value={video.src}
                                  onChange={(event) => updateOptionalItem("videos", index, "src", event.target.value)}
                                  placeholder="/demo-proyecto.mp4"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Titulo ES</span>
                                <input
                                  value={video.titleEs}
                                  onChange={(event) => updateOptionalItem("videos", index, "titleEs", event.target.value)}
                                  placeholder="Demo del flujo"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Titulo EN</span>
                                <input
                                  value={video.titleEn}
                                  onChange={(event) => updateOptionalItem("videos", index, "titleEn", event.target.value)}
                                  placeholder="Flow demo"
                                />
                              </label>
                              <div className="field">
                                <span className="compact-label">Poster</span>
                                <div className="media-picker-row">
                                  <input
                                    value={video.poster}
                                    onChange={(event) => updateOptionalItem("videos", index, "poster", event.target.value)}
                                    placeholder="/poster.png o https://..."
                                  />
                                  {renderImagePickerActions({ kind: "videoPoster", index })}
                                </div>
                              </div>
                              <label className="field">
                                <span className="compact-label">Caption ES</span>
                                <input
                                  value={video.captionEs}
                                  onChange={(event) => updateOptionalItem("videos", index, "captionEs", event.target.value)}
                                  placeholder="Opcional"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Caption EN</span>
                                <input
                                  value={video.captionEn}
                                  onChange={(event) => updateOptionalItem("videos", index, "captionEn", event.target.value)}
                                  placeholder="Optional"
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="optional-group">
                    <div className="optional-group-head">
                      <div>
                        <FieldLabel hint={fieldHints.modules}>Modulos</FieldLabel>
                        <p>Partes funcionales o bloques importantes del proyecto.</p>
                      </div>
                      <button type="button" className="add-row-button" onClick={() => addOptionalItem("modules")}>
                        <Plus size={16} strokeWidth={2.2} />
                        Agregar
                      </button>
                    </div>
                    {projectForm.modules.length === 0 ? (
                      <p className="optional-empty">Sin modulos adicionales.</p>
                    ) : (
                      <div className="optional-list">
                        {projectForm.modules.map((module, index) => (
                          <div className="optional-item" key={`module-${index}`}>
                            <div className="optional-item-head">
                              <strong>Modulo {index + 1}</strong>
                              <OptionalItemActions
                                canMoveUp={index > 0}
                                canMoveDown={index < projectForm.modules.length - 1}
                                onMoveUp={() => moveOptionalItem("modules", index, -1)}
                                onMoveDown={() => moveOptionalItem("modules", index, 1)}
                                onRemove={() => removeOptionalItem("modules", index)}
                                removeLabel={`Quitar modulo ${index + 1}`}
                              />
                            </div>
                            <div className="optional-item-grid">
                              <label className="field">
                                <span className="compact-label">Titulo ES</span>
                                <input
                                  value={module.title}
                                  onChange={(event) => updateOptionalItem("modules", index, "title", event.target.value)}
                                  placeholder="Panel administrativo"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Titulo EN</span>
                                <input
                                  value={module.titleEn}
                                  onChange={(event) => updateOptionalItem("modules", index, "titleEn", event.target.value)}
                                  placeholder="Admin panel"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Descripcion ES</span>
                                <input
                                  value={module.description}
                                  onChange={(event) => updateOptionalItem("modules", index, "description", event.target.value)}
                                  placeholder="Gestiona usuarios y estados"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Descripcion EN</span>
                                <input
                                  value={module.descriptionEn}
                                  onChange={(event) => updateOptionalItem("modules", index, "descriptionEn", event.target.value)}
                                  placeholder="Manages users and statuses"
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="optional-group">
                    <div className="optional-group-head">
                      <div>
                        <FieldLabel hint={fieldHints.flow}>Flujo</FieldLabel>
                        <p>Pasos para explicar como avanza el usuario o el proceso.</p>
                      </div>
                      <button type="button" className="add-row-button" onClick={() => addOptionalItem("flow")}>
                        <Plus size={16} strokeWidth={2.2} />
                        Agregar
                      </button>
                    </div>
                    {projectForm.flow.length === 0 ? (
                      <p className="optional-empty">Sin pasos de flujo adicionales.</p>
                    ) : (
                      <div className="optional-list">
                        {projectForm.flow.map((step, index) => (
                          <div className="optional-item" key={`flow-${index}`}>
                            <div className="optional-item-head">
                              <strong>Paso {index + 1}</strong>
                              <OptionalItemActions
                                canMoveUp={index > 0}
                                canMoveDown={index < projectForm.flow.length - 1}
                                onMoveUp={() => moveOptionalItem("flow", index, -1)}
                                onMoveDown={() => moveOptionalItem("flow", index, 1)}
                                onRemove={() => removeOptionalItem("flow", index)}
                                removeLabel={`Quitar paso ${index + 1}`}
                              />
                            </div>
                            <div className="optional-item-grid">
                              <label className="field">
                                <span className="compact-label">Numero</span>
                                <input
                                  value={step.step}
                                  onChange={(event) => updateOptionalItem("flow", index, "step", event.target.value)}
                                  placeholder="01"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Titulo ES</span>
                                <input
                                  value={step.title}
                                  onChange={(event) => updateOptionalItem("flow", index, "title", event.target.value)}
                                  placeholder="Ingreso"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Titulo EN</span>
                                <input
                                  value={step.titleEn}
                                  onChange={(event) => updateOptionalItem("flow", index, "titleEn", event.target.value)}
                                  placeholder="Entry"
                                />
                              </label>
                              <label className="field field-wide">
                                <span className="compact-label">Descripcion ES</span>
                                <input
                                  value={step.description}
                                  onChange={(event) => updateOptionalItem("flow", index, "description", event.target.value)}
                                  placeholder="El usuario inicia el recorrido desde..."
                                />
                              </label>
                              <label className="field field-wide">
                                <span className="compact-label">Descripcion EN</span>
                                <input
                                  value={step.descriptionEn}
                                  onChange={(event) => updateOptionalItem("flow", index, "descriptionEn", event.target.value)}
                                  placeholder="The user starts the journey from..."
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="optional-group">
                    <div className="optional-group-head">
                      <div>
                        <FieldLabel hint={fieldHints.collaborators}>Colaboradores</FieldLabel>
                        <p>Agrega personas del equipo con foto y enlaces opcionales.</p>
                      </div>
                      <button type="button" className="add-row-button" onClick={() => addOptionalItem("collaborators")}>
                        <Plus size={16} strokeWidth={2.2} />
                        Agregar
                      </button>
                    </div>
                    {projectForm.collaborators.length === 0 ? (
                      <p className="optional-empty">Sin colaboradores adicionales.</p>
                    ) : (
                      <div className="optional-list">
                        {projectForm.collaborators.map((collaborator, index) => (
                          <div className="optional-item" key={`collaborator-${index}`}>
                            <div className="optional-item-head">
                              <strong>Colaborador {index + 1}</strong>
                              <OptionalItemActions
                                canMoveUp={index > 0}
                                canMoveDown={index < projectForm.collaborators.length - 1}
                                onMoveUp={() => moveOptionalItem("collaborators", index, -1)}
                                onMoveDown={() => moveOptionalItem("collaborators", index, 1)}
                                onRemove={() => removeOptionalItem("collaborators", index)}
                                removeLabel={`Quitar colaborador ${index + 1}`}
                              />
                            </div>
                            <div className="optional-item-grid">
                              <label className="field">
                                <span className="compact-label">Nombre</span>
                                <input
                                  value={collaborator.name}
                                  onChange={(event) => updateOptionalItem("collaborators", index, "name", event.target.value)}
                                  placeholder="Nombre del colaborador"
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Rol ES</span>
                                <input
                                  value={collaborator.role}
                                  onChange={(event) => updateOptionalItem("collaborators", index, "role", event.target.value)}
                                  placeholder="Frontend, diseno, backend..."
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">Rol EN</span>
                                <input
                                  value={collaborator.roleEn}
                                  onChange={(event) => updateOptionalItem("collaborators", index, "roleEn", event.target.value)}
                                  placeholder="Frontend, design, backend..."
                                />
                              </label>
                              <div className="field">
                                <span className="compact-label">Foto</span>
                                <div className="media-picker-row">
                                  <input
                                    value={collaborator.photo}
                                    onChange={(event) => updateOptionalItem("collaborators", index, "photo", event.target.value)}
                                    placeholder="/colaborador.png o https://..."
                                  />
                                  {renderImagePickerActions({ kind: "collaboratorPhoto", index })}
                                </div>
                              </div>
                              <label className="field">
                                <span className="compact-label">Portfolio</span>
                                <input
                                  value={collaborator.portfolioUrl}
                                  onChange={(event) => updateOptionalItem("collaborators", index, "portfolioUrl", event.target.value)}
                                  placeholder="https://..."
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">GitHub</span>
                                <input
                                  value={collaborator.githubUrl}
                                  onChange={(event) => updateOptionalItem("collaborators", index, "githubUrl", event.target.value)}
                                  placeholder="https://github.com/..."
                                />
                              </label>
                              <label className="field">
                                <span className="compact-label">LinkedIn</span>
                                <input
                                  value={collaborator.linkedinUrl}
                                  onChange={(event) => updateOptionalItem("collaborators", index, "linkedinUrl", event.target.value)}
                                  placeholder="https://linkedin.com/in/..."
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="optional-group">
                    <div className="optional-group-head">
                      <div>
                        <FieldLabel hint={fieldHints.liveUrl}>Demo en vivo</FieldLabel>
                        <p>Enlace opcional para mostrar la demo interactiva al final de la ficha.</p>
                      </div>
                    </div>
                    <label className="field field-wide">
                      <span className="compact-label">URL demo</span>
                      <input
                        value={projectForm.liveUrl}
                        onChange={(event) => updateProjectField("liveUrl", event.target.value)}
                        placeholder="https://..."
                      />
                    </label>
                  </div>
                </div>

                {imagePickMessage && (
                  <p className={`form-message is-${imagePickMessage.tone}`}>{imagePickMessage.text}</p>
                )}
                {livePreviewMessage && (
                  <p className={`form-message is-${livePreviewMessage.tone}`}>{livePreviewMessage.text}</p>
                )}
                {projectError && <p className="form-message is-error">{projectError}</p>}
                {projectResult && (
                  <div className="form-message is-success">
                    <strong>Proyecto guardado: {projectResult.slug}</strong>
                    <span>Total: {projectResult.totalProjects}</span>
                  </div>
                )}
              </div>

              <div className="form-footer">
                {editingSlug ? (
                  <button
                    type="button"
                    className="danger-action"
                    onClick={() => handleDeleteProject(editingSlug)}
                    disabled={isSavingProject}
                  >
                    Eliminar
                  </button>
                ) : null}
                <button type="button" className="secondary-button" onClick={resetProjectForm}>
                  Limpiar
                </button>
                <button type="submit" className="primary-button" disabled={isSavingProject}>
                  <Save size={17} strokeWidth={2.2} />
                  {isSavingProject ? (editingSlug ? "Guardando..." : "Creando...") : editingSlug ? "Guardar cambios" : "Crear proyecto"}
                </button>
              </div>
            </form>
            ) : workspaceView === "about-edit" ? (
              <form className="project-form-panel" onSubmit={handleSaveAbout}>
                <div className="form-scroll">
                  <div className="form-section-heading">
                    <span className="section-label">Sobre mi</span>
                    <h3>{aboutForm.group === "work" ? "Experiencia laboral" : "Formacion academica"}</h3>
                  </div>

                  <div className="form-grid">
                    <label className="field">
                      <span className="compact-label">Apartado</span>
                      <select
                        value={aboutForm.group}
                        onChange={(event) => updateAboutField("group", event.target.value as AboutGroupKind)}
                      >
                        <option value="education">Formacion academica</option>
                        <option value="work">Experiencia laboral</option>
                      </select>
                    </label>
                    <label className="field">
                      <span className="compact-label">Periodo</span>
                      <input
                        value={aboutForm.period}
                        onChange={(event) => updateAboutField("period", event.target.value)}
                        placeholder={currentYear}
                        required
                      />
                    </label>

                    {aboutForm.group === "education" ? (
                      <>
                        <label className="field">
                          <span className="compact-label">Institucion ES</span>
                          <input
                            value={aboutForm.institution}
                            onChange={(event) => updateAboutField("institution", event.target.value)}
                            placeholder="Universidad Catolica de Colombia"
                          />
                        </label>
                        <label className="field">
                          <span className="compact-label">Titulo ES</span>
                          <input
                            value={aboutForm.title}
                            onChange={(event) => updateAboutField("title", event.target.value)}
                            placeholder="Voluntariado medico"
                          />
                        </label>
                        <label className="field field-wide">
                          <span className="compact-label">Detalle ES</span>
                          <input
                            value={aboutForm.detail}
                            onChange={(event) => updateAboutField("detail", event.target.value)}
                            placeholder="Pregrado - Ingenieria de Sistemas y Computacion"
                          />
                        </label>
                        <label className="field field-wide">
                          <span className="compact-label">Habilidades ES</span>
                          <input
                            value={aboutForm.skills}
                            onChange={(event) => updateAboutField("skills", event.target.value)}
                            placeholder="Trabajo en equipo, Comunicacion, Adaptabilidad"
                          />
                        </label>
                      </>
                    ) : (
                      <>
                        <label className="field field-wide">
                          <span className="compact-label">Titulo ES</span>
                          <input
                            value={aboutForm.title}
                            onChange={(event) => updateAboutField("title", event.target.value)}
                            placeholder="Desarrollador Full Stack - Docqee"
                            required
                          />
                        </label>
                        <label className="field field-wide">
                          <span className="compact-label">Texto bajo el titulo ES</span>
                          <input
                            value={aboutForm.category}
                            onChange={(event) => updateAboutField("category", event.target.value)}
                            placeholder="Software - Proyecto de grado"
                          />
                        </label>
                        <label className="field field-wide">
                          <span className="compact-label">Detalle ES</span>
                          <textarea
                            value={aboutForm.detail}
                            onChange={(event) => updateAboutField("detail", event.target.value)}
                            rows={3}
                            placeholder="Describe responsabilidades, contexto o aporte principal."
                          />
                        </label>
                        <label className="field">
                          <span className="compact-label">Posicion visual</span>
                          <select
                            value={aboutForm.detailPlacement}
                            onChange={(event) => updateAboutField("detailPlacement", event.target.value)}
                          >
                            <option value="">Automatico</option>
                            <option value="right">A la derecha</option>
                          </select>
                        </label>
                        <label className="field field-wide">
                          <span className="compact-label">Stack</span>
                          <input
                            value={aboutForm.stack}
                            onChange={(event) => updateAboutField("stack", event.target.value)}
                            placeholder="React, NestJS, PostgreSQL"
                          />
                        </label>
                        <label className="field field-wide">
                          <span className="compact-label">Enfoque ES</span>
                          <input
                            value={aboutForm.focus}
                            onChange={(event) => updateAboutField("focus", event.target.value)}
                            placeholder="Arquitectura modular, APIs REST, Full Stack"
                          />
                        </label>
                        <label className="field field-wide">
                          <span className="compact-label">Habilidades ES</span>
                          <input
                            value={aboutForm.skills}
                            onChange={(event) => updateAboutField("skills", event.target.value)}
                            placeholder="Responsabilidad, Gestion del tiempo"
                          />
                        </label>
                      </>
                    )}
                  </div>

                  <div className="form-section-heading">
                    <span className="section-label">English</span>
                    <h3>Version en ingles</h3>
                  </div>

                  <div className="form-grid">
                    {aboutForm.group === "education" ? (
                      <>
                        <label className="field">
                          <span className="compact-label">Institution EN</span>
                          <input
                            value={aboutForm.institutionEn}
                            onChange={(event) => updateAboutField("institutionEn", event.target.value)}
                            placeholder="Catholic University of Colombia"
                          />
                        </label>
                        <label className="field">
                          <span className="compact-label">Title EN</span>
                          <input
                            value={aboutForm.titleEn}
                            onChange={(event) => updateAboutField("titleEn", event.target.value)}
                            placeholder="Medical volunteering"
                          />
                        </label>
                        <label className="field field-wide">
                          <span className="compact-label">Detail EN</span>
                          <input
                            value={aboutForm.detailEn}
                            onChange={(event) => updateAboutField("detailEn", event.target.value)}
                          />
                        </label>
                      </>
                    ) : (
                      <>
                        <label className="field field-wide">
                          <span className="compact-label">Title EN</span>
                          <input
                            value={aboutForm.titleEn}
                            onChange={(event) => updateAboutField("titleEn", event.target.value)}
                            placeholder="Full Stack Developer - Docqee"
                          />
                        </label>
                        <label className="field field-wide">
                          <span className="compact-label">Text under title EN</span>
                          <input
                            value={aboutForm.categoryEn}
                            onChange={(event) => updateAboutField("categoryEn", event.target.value)}
                            placeholder="Software - Degree project"
                          />
                        </label>
                      </>
                    )}
                    {aboutForm.group === "work" ? (
                      <label className="field field-wide">
                        <span className="compact-label">Detail EN</span>
                        <textarea
                          value={aboutForm.detailEn}
                          onChange={(event) => updateAboutField("detailEn", event.target.value)}
                          rows={3}
                        />
                      </label>
                    ) : null}
                    {aboutForm.group === "work" ? (
                      <label className="field field-wide">
                        <span className="compact-label">Focus EN</span>
                        <input
                          value={aboutForm.focusEn}
                          onChange={(event) => updateAboutField("focusEn", event.target.value)}
                        />
                      </label>
                    ) : null}
                    <label className="field field-wide">
                      <span className="compact-label">Skills EN</span>
                      <input
                        value={aboutForm.skillsEn}
                        onChange={(event) => updateAboutField("skillsEn", event.target.value)}
                      />
                    </label>
                  </div>

                  {contentError && <p className="form-message is-error">{contentError}</p>}
                  {contentResult && (
                    <div className="form-message is-success">
                      <strong>Sobre mi actualizado: {contentResult.key}</strong>
                      <span>Total: {contentResult.totalItems}</span>
                    </div>
                  )}
                </div>

                <div className="form-footer">
                  <button type="button" className="secondary-button" onClick={() => openAboutEditor("new", aboutForm.group)}>Limpiar</button>
                  {editingAboutKey ? (
                    <button
                      type="button"
                      className="secondary-button danger-action"
                      onClick={() => handleDeleteAbout(editingAboutKey)}
                      disabled={isSavingContent}
                    >
                      Eliminar
                    </button>
                  ) : null}
                  <button type="submit" className="primary-button" disabled={isSavingContent}>
                    <Save size={17} strokeWidth={2.2} />
                    {isSavingContent ? "Guardando..." : "Guardar entrada"}
                  </button>
                </div>
              </form>
            ) : workspaceView === "development-edit" ? (
              <form className="project-form-panel" onSubmit={handleSaveDevelopment}>
                <div className="form-scroll">
                  <div className="form-section-heading">
                    <span className="section-label">En desarrollo</span>
                    <h3>Portada de avance</h3>
                  </div>

                  <div className="form-grid">
                    <label className="field field-wide">
                      <FieldLabel hint="Nombre que vera la persona en la tarjeta de En desarrollo.">Titulo ES</FieldLabel>
                      <input
                        value={developmentForm.title}
                        onChange={(event) => updateDevelopmentField("title", event.target.value)}
                        placeholder="Nombre del proyecto o certificado"
                        required
                      />
                    </label>
                    <label className="field">
                      <FieldLabel hint="Identificador interno. Usa minusculas, numeros y guiones.">ID / slug</FieldLabel>
                      <input
                        value={developmentForm.id}
                        onChange={(event) => updateDevelopmentField("id", event.target.value)}
                        placeholder="mi-progreso"
                        required
                      />
                    </label>
                    <label className="field">
                      <FieldLabel hint="Define si esta portada representa un proyecto o un certificado.">Tipo</FieldLabel>
                      <select
                        value={developmentForm.kind}
                        onChange={(event) => updateDevelopmentField("kind", event.target.value as DevelopmentFormState["kind"])}
                      >
                        <option value="project">Proyecto</option>
                        <option value="certificate">Certificado</option>
                      </select>
                    </label>
                    <label className="field">
                      <FieldLabel hint={fieldHints.developmentProgress}>Progreso</FieldLabel>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={developmentForm.progress}
                        onChange={(event) => updateDevelopmentField("progress", event.target.value)}
                        placeholder="35"
                        required
                      />
                    </label>
                    {developmentForm.kind === "certificate" ? (
                      <label className="field field-wide">
                        <FieldLabel hint={fieldHints.developmentCertificateUrl}>Enlace del certificado online</FieldLabel>
                        <input
                          type="url"
                          value={developmentForm.certificateUrl}
                          onChange={(event) => updateDevelopmentField("certificateUrl", event.target.value)}
                          placeholder="https://..."
                        />
                      </label>
                    ) : null}
                    <label className="check-field">
                      <input
                        type="checkbox"
                        checked={developmentForm.hidden}
                        onChange={(event) => updateDevelopmentField("hidden", event.target.checked)}
                      />
                      <FieldLabel hint={fieldHints.contentHidden}>Ocultar en portafolio</FieldLabel>
                    </label>
                    <label className="field field-wide">
                      <FieldLabel hint={fieldHints.developmentCover}>Portada</FieldLabel>
                      <div className="media-picker-row">
                        <input
                          value={developmentForm.cover}
                          onChange={(event) => updateDevelopmentField("cover", event.target.value)}
                          placeholder="/en-desarrollo.png o https://..."
                        />
                        {renderImagePickerActions({ kind: "developmentCover" })}
                      </div>
                    </label>
                    <label className="field field-wide">
                      <FieldLabel hint="Descripcion corta que aparece debajo del titulo.">Descripcion ES</FieldLabel>
                      <textarea
                        value={developmentForm.description}
                        onChange={(event) => updateDevelopmentField("description", event.target.value)}
                        rows={4}
                        placeholder="Describe que estas construyendo y que falta para terminarlo."
                        required
                      />
                    </label>
                  </div>

                  <div className="form-section-heading">
                    <span className="section-label">English</span>
                    <h3>Version en ingles</h3>
                  </div>
                  <div className="form-grid">
                    <label className="field field-wide">
                      <FieldLabel hint={fieldHints.englishFallback}>Title EN</FieldLabel>
                      <input
                        value={developmentForm.titleEn}
                        onChange={(event) => updateDevelopmentField("titleEn", event.target.value)}
                      />
                    </label>
                    <label className="field field-wide">
                      <FieldLabel hint={fieldHints.englishFallback}>Description EN</FieldLabel>
                      <textarea
                        value={developmentForm.descriptionEn}
                        onChange={(event) => updateDevelopmentField("descriptionEn", event.target.value)}
                        rows={4}
                      />
                    </label>
                  </div>

                  {imagePickMessage && (
                    <p className={`form-message is-${imagePickMessage.tone}`}>{imagePickMessage.text}</p>
                  )}
                  {contentError && <p className="form-message is-error">{contentError}</p>}
                  {contentResult && (
                    <div className="form-message is-success">
                      <strong>En desarrollo guardado: {contentResult.key}</strong>
                      <span>Total: {contentResult.totalItems}</span>
                    </div>
                  )}
                </div>
                <div className="form-footer">
                  <button type="button" className="secondary-button" onClick={() => openDevelopmentEditor("new")}>Limpiar</button>
                  {editingDevelopmentId ? (
                    <button
                      type="button"
                      className="secondary-button danger-action"
                      onClick={() => handleDeleteDevelopment(editingDevelopmentId)}
                      disabled={isSavingContent}
                    >
                      Eliminar
                    </button>
                  ) : null}
                  <button type="submit" className="primary-button" disabled={isSavingContent}>
                    <Save size={17} strokeWidth={2.2} />
                    {isSavingContent ? "Guardando..." : "Guardar portada"}
                  </button>
                </div>
              </form>
            ) : workspaceView === "certificate-edit" ? (
              <form className="project-form-panel" onSubmit={handleSaveCertificate}>
                <div className="form-scroll">
                  <div className="form-section-heading">
                    <span className="section-label">Certificado</span>
                    <h3>Archivo y metadatos</h3>
                  </div>
                  <div className="form-grid">
                    <label className="field">
                      <span className="compact-label">Titulo ES</span>
                      <input
                        value={certificateForm.title}
                        onChange={(event) => updateCertificateField("title", event.target.value)}
                        placeholder="Certificado profesional"
                        required
                      />
                    </label>
                    <label className="field">
                      <span className="compact-label">ID / slug</span>
                      <input
                        value={certificateForm.id}
                        onChange={(event) => updateCertificateField("id", event.target.value)}
                        placeholder="certificado-profesional"
                        required
                      />
                    </label>
                    <label className="field field-wide">
                      <span className="compact-label">Archivo</span>
                      <div className="media-picker-row">
                        <input
                          value={certificateForm.fileName}
                          onChange={(event) => updateCertificateField("fileName", event.target.value)}
                          placeholder="certificado.pdf"
                          required
                        />
                        <div className="media-picker-actions">
                          <button type="button" className="media-picker-button" onClick={() => pickCertificateFile("import")}>
                            <ImagePlus size={15} strokeWidth={2.2} />
                            Importar
                          </button>
                          <button type="button" className="media-picker-button" onClick={() => pickCertificateFile("existing")}>
                            <FolderOpen size={15} strokeWidth={2.2} />
                            Existente
                          </button>
                        </div>
                      </div>
                    </label>
                    <label className="field">
                      <span className="compact-label">Tipo</span>
                      <input
                        value={certificateForm.certificateType}
                        onChange={(event) => updateCertificateField("certificateType", event.target.value)}
                        placeholder="pdf o image"
                      />
                    </label>
                    <label className="field">
                      <span className="compact-label">MIME</span>
                      <input
                        value={certificateForm.mime}
                        onChange={(event) => updateCertificateField("mime", event.target.value)}
                        placeholder="application/pdf"
                      />
                    </label>
                    <label className="field">
                      <span className="compact-label">Emisor ES</span>
                      <input
                        value={certificateForm.issuer}
                        onChange={(event) => updateCertificateField("issuer", event.target.value)}
                        placeholder="Formacion"
                      />
                    </label>
                    <label className="field">
                      <span className="compact-label">Fecha</span>
                      <input
                        value={certificateForm.issued}
                        onChange={(event) => updateCertificateField("issued", event.target.value)}
                        placeholder="2026"
                      />
                    </label>
                    <label className="field">
                      <span className="compact-label">Estado</span>
                      <input
                        value={certificateForm.status}
                        onChange={(event) => updateCertificateField("status", event.target.value)}
                        placeholder="completed o in-progress"
                      />
                    </label>
                    <label className="check-field">
                      <input
                        type="checkbox"
                        checked={certificateForm.hidden}
                        onChange={(event) => updateCertificateField("hidden", event.target.checked)}
                      />
                      <FieldLabel hint={fieldHints.contentHidden}>Ocultar en portafolio</FieldLabel>
                    </label>
                    <label className="field field-wide">
                      <span className="compact-label">Tags ES</span>
                      <input
                        value={certificateForm.tags}
                        onChange={(event) => updateCertificateField("tags", event.target.value)}
                        placeholder="PDF, Profesional"
                      />
                    </label>
                  </div>

                  <div className="form-section-heading">
                    <span className="section-label">English</span>
                    <h3>Version en ingles</h3>
                  </div>
                  <div className="form-grid">
                    <label className="field">
                      <span className="compact-label">Title EN</span>
                      <input value={certificateForm.titleEn} onChange={(event) => updateCertificateField("titleEn", event.target.value)} />
                    </label>
                    <label className="field">
                      <span className="compact-label">Issuer EN</span>
                      <input value={certificateForm.issuerEn} onChange={(event) => updateCertificateField("issuerEn", event.target.value)} />
                    </label>
                    <label className="field field-wide">
                      <span className="compact-label">Tags EN</span>
                      <input value={certificateForm.tagsEn} onChange={(event) => updateCertificateField("tagsEn", event.target.value)} />
                    </label>
                  </div>

                  {contentError && <p className="form-message is-error">{contentError}</p>}
                  {contentResult && (
                    <div className="form-message is-success">
                      <strong>Certificado guardado: {contentResult.key}</strong>
                      <span>Total: {contentResult.totalItems}</span>
                    </div>
                  )}
                </div>
                <div className="form-footer">
                  <button type="button" className="secondary-button" onClick={() => openCertificateEditor("new")}>Limpiar</button>
                  {editingCertificateId ? (
                    <button
                      type="button"
                      className="secondary-button danger-action"
                      onClick={() => handleDeleteCertificate(editingCertificateId)}
                      disabled={isSavingContent}
                    >
                      Eliminar
                    </button>
                  ) : null}
                  <button type="submit" className="primary-button" disabled={isSavingContent}>
                    <Save size={17} strokeWidth={2.2} />
                    {isSavingContent ? "Guardando..." : "Guardar certificado"}
                  </button>
                </div>
              </form>
            ) : workspaceView === "blog-edit" ? (
              <form className="project-form-panel" onSubmit={handleSaveBlog}>
                <div className="form-scroll">
                  <div className="form-section-heading">
                    <span className="section-label">Blog</span>
                    <h3>Nota y detalle</h3>
                  </div>
                  <datalist id="blog-category-options">
                    {blogCategoryOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                  <datalist id="blog-category-en-options">
                    {blogCategoryEnOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                  <div className="form-grid">
                    <label className="field">
                      <FieldLabel hint={fieldHints.blogTitle}>Titulo ES</FieldLabel>
                      <input value={blogForm.title} onChange={(event) => updateBlogField("title", event.target.value)} required />
                    </label>
                    <label className="field">
                      <FieldLabel hint={fieldHints.blogPhrase}>Frase ES</FieldLabel>
                      <input
                        value={blogForm.phrase}
                        onChange={(event) => updateBlogField("phrase", event.target.value)}
                        required
                        placeholder="Una frase breve para abrir el articulo"
                      />
                    </label>
                    <label className="field">
                      <FieldLabel hint={fieldHints.blogSlug}>Slug</FieldLabel>
                      <input value={blogForm.slug} onChange={(event) => updateBlogField("slug", event.target.value)} required />
                    </label>
                    <label className="field">
                      <FieldLabel hint={fieldHints.blogCategory}>Categoria ES</FieldLabel>
                      <input
                        list="blog-category-options"
                        value={blogForm.category}
                        onChange={(event) => updateBlogField("category", event.target.value)}
                        placeholder="Elige una existente o escribe una nueva"
                      />
                    </label>
                    <label className="field">
                      <FieldLabel hint={fieldHints.blogDate}>Fecha ES</FieldLabel>
                      <input value={blogForm.date} onChange={(event) => updateBlogField("date", event.target.value)} />
                    </label>
                    <label className="field">
                      <FieldLabel hint={fieldHints.blogReadTime}>Lectura ES</FieldLabel>
                      <input value={blogForm.readTime} onChange={(event) => updateBlogField("readTime", event.target.value)} />
                    </label>
                    <label className="field field-wide">
                      <FieldLabel hint={fieldHints.blogVisualClass}>Visual class</FieldLabel>
                      <input value={blogForm.visualClass} onChange={(event) => updateBlogField("visualClass", event.target.value)} />
                    </label>
                    <div className="field field-wide">
                      <FieldLabel hint={fieldHints.blogCover}>Portada</FieldLabel>
                      <div className="media-picker-row">
                        <input
                          value={blogForm.cover}
                          onChange={(event) => updateBlogField("cover", event.target.value)}
                          placeholder="/project-assets/mi-blog/portada.webp o https://..."
                        />
                        {renderImagePickerActions({ kind: "blogCover" })}
                      </div>
                    </div>
                    <div className="field field-wide">
                      <FieldLabel hint={fieldHints.blogArticleImage}>Imagen horizontal del articulo</FieldLabel>
                      <div className="media-picker-row">
                        <input
                          value={blogForm.articleImage}
                          onChange={(event) => updateBlogField("articleImage", event.target.value)}
                          placeholder="/project-assets/mi-blog/articulo-horizontal.webp o https://..."
                        />
                        {renderImagePickerActions({ kind: "blogArticleImage" })}
                      </div>
                    </div>
                    <label className="field field-wide">
                      <FieldLabel hint={fieldHints.blogImageCredit}>Credito de imagen ES</FieldLabel>
                      <input
                        value={blogForm.imageCredit}
                        onChange={(event) => updateBlogField("imageCredit", event.target.value)}
                        placeholder="Ej. Imagen generada por ChatGPT, diseno propio, Unsplash..."
                      />
                    </label>
                    <label className="field field-wide">
                      <FieldLabel hint={fieldHints.blogExcerpt}>Extracto ES (cards iniciales)</FieldLabel>
                      <textarea value={blogForm.excerpt} onChange={(event) => updateBlogField("excerpt", event.target.value)} rows={3} required />
                    </label>
                    <label className="field field-wide">
                      <FieldLabel hint={fieldHints.blogBody}>Cuerpo corto ES (blog completo)</FieldLabel>
                      <textarea value={blogForm.body} onChange={(event) => updateBlogField("body", event.target.value)} rows={4} />
                    </label>
                    <label className="field field-wide">
                      <FieldLabel hint={fieldHints.blogIntroduction}>Introduccion ES (blog completo)</FieldLabel>
                      <textarea value={blogForm.introduction} onChange={(event) => updateBlogField("introduction", event.target.value)} rows={4} />
                    </label>
                    <BlogParagraphEditor
                      hint={fieldHints.blogParagraphs}
                      valueEs={blogForm.paragraphs}
                      valueEn={blogForm.paragraphsEn}
                      onChange={(nextParagraphs, nextParagraphsEn) => {
                        updateBlogField("paragraphs", nextParagraphs);
                        updateBlogField("paragraphsEn", nextParagraphsEn);
                      }}
                    />
                    <label className="field field-wide">
                      <FieldLabel hint={fieldHints.blogHighlights}>Highlights ES</FieldLabel>
                      <textarea value={blogForm.highlights} onChange={(event) => updateBlogField("highlights", event.target.value)} rows={4} placeholder="Un punto por linea" />
                    </label>
                  </div>

                  <div className="form-section-heading">
                    <span className="section-label">English</span>
                    <h3>Version en ingles</h3>
                  </div>
                  <div className="form-grid">
                    <label className="field">
                      <FieldLabel hint={fieldHints.englishFallback}>Title EN</FieldLabel>
                      <input value={blogForm.titleEn} onChange={(event) => updateBlogField("titleEn", event.target.value)} />
                    </label>
                    <label className="field">
                      <FieldLabel hint={fieldHints.blogPhrase}>Phrase EN</FieldLabel>
                      <input
                        value={blogForm.phraseEn}
                        onChange={(event) => updateBlogField("phraseEn", event.target.value)}
                        placeholder="English version of the opening phrase"
                      />
                    </label>
                    <label className="field">
                      <FieldLabel hint={fieldHints.englishFallback}>Category EN</FieldLabel>
                      <input
                        list="blog-category-en-options"
                        value={blogForm.categoryEn}
                        onChange={(event) => updateBlogField("categoryEn", event.target.value)}
                      />
                    </label>
                    <label className="field">
                      <FieldLabel hint={fieldHints.englishFallback}>Date EN</FieldLabel>
                      <input value={blogForm.dateEn} onChange={(event) => updateBlogField("dateEn", event.target.value)} />
                    </label>
                    <label className="field">
                      <FieldLabel hint={fieldHints.englishFallback}>Read time EN</FieldLabel>
                      <input value={blogForm.readTimeEn} onChange={(event) => updateBlogField("readTimeEn", event.target.value)} />
                    </label>
                    <label className="field field-wide">
                      <FieldLabel hint={fieldHints.englishFallback}>Excerpt EN</FieldLabel>
                      <textarea value={blogForm.excerptEn} onChange={(event) => updateBlogField("excerptEn", event.target.value)} rows={3} />
                    </label>
                    <label className="field field-wide">
                      <FieldLabel hint={fieldHints.englishFallback}>Body EN</FieldLabel>
                      <textarea value={blogForm.bodyEn} onChange={(event) => updateBlogField("bodyEn", event.target.value)} rows={4} />
                    </label>
                    <label className="field field-wide">
                      <FieldLabel hint={fieldHints.englishFallback}>Introduction EN</FieldLabel>
                      <textarea value={blogForm.introductionEn} onChange={(event) => updateBlogField("introductionEn", event.target.value)} rows={4} />
                    </label>
                    <label className="field field-wide">
                      <FieldLabel hint={fieldHints.blogImageCredit}>Image credit EN</FieldLabel>
                      <input
                        value={blogForm.imageCreditEn}
                        onChange={(event) => updateBlogField("imageCreditEn", event.target.value)}
                        placeholder="Image by ChatGPT, own design, Unsplash..."
                      />
                    </label>
                    <label className="field field-wide">
                      <FieldLabel hint={fieldHints.englishFallback}>Highlights EN</FieldLabel>
                      <textarea value={blogForm.highlightsEn} onChange={(event) => updateBlogField("highlightsEn", event.target.value)} rows={4} />
                    </label>
                  </div>

                  {imagePickMessage && (
                    <p className={`form-message is-${imagePickMessage.tone}`}>{imagePickMessage.text}</p>
                  )}
                  {contentError && <p className="form-message is-error">{contentError}</p>}
                  {contentResult && (
                    <div className="form-message is-success">
                      <strong>Nota guardada: {contentResult.key}</strong>
                      <span>Total: {contentResult.totalItems}</span>
                    </div>
                  )}
                </div>
                <div className="form-footer">
                  {editingBlogSlug ? (
                    <button
                      type="button"
                      className="danger-action"
                      onClick={() => handleDeleteBlog(editingBlogSlug)}
                      disabled={isSavingContent}
                    >
                      Eliminar
                    </button>
                  ) : null}
                  <button type="button" className="secondary-button" onClick={() => openBlogEditor("new")}>Limpiar</button>
                  <button type="submit" className="primary-button" disabled={isSavingContent}>
                    <Save size={17} strokeWidth={2.2} />
                    {isSavingContent ? "Guardando..." : "Guardar nota"}
                  </button>
                </div>
              </form>
            ) : (
              <form className="project-form-panel" onSubmit={handleSaveInterest}>
                <div className="form-scroll">
                  <div className="form-section-heading">
                    <span className="section-label">Intereses</span>
                    <h3>Referencia personal</h3>
                  </div>
                  <div className="form-grid">
                    <label className="field">
                      <span className="compact-label">Titulo ES</span>
                      <input value={interestForm.title} onChange={(event) => updateInterestField("title", event.target.value)} required />
                    </label>
                    <label className="field">
                      <span className="compact-label">Filtro</span>
                      <input value={interestForm.filter} onChange={(event) => updateInterestField("filter", event.target.value)} placeholder="movies, series, anime, books, games" />
                    </label>
                    <label className="field">
                      <span className="compact-label">Categoria ES</span>
                      <input value={interestForm.category} onChange={(event) => updateInterestField("category", event.target.value)} />
                    </label>
                    <label className="field">
                      <span className="compact-label">Visual class</span>
                      <input value={interestForm.visualClass} onChange={(event) => updateInterestField("visualClass", event.target.value)} />
                    </label>
                    <div className="field field-wide">
                      <FieldLabel hint={fieldHints.interestImage}>Imagen de portada</FieldLabel>
                      <div className="media-picker-row">
                        <input
                          value={interestForm.image}
                          onChange={(event) => updateInterestField("image", event.target.value)}
                          placeholder="/interest-assets/mi-interes.webp o https://..."
                        />
                        {renderImagePickerActions({ kind: "interestImage" })}
                      </div>
                    </div>
                    <label className="field field-wide">
                      <span className="compact-label">Meta ES</span>
                      <input value={interestForm.meta} onChange={(event) => updateInterestField("meta", event.target.value)} placeholder="Serie / estructura narrativa" />
                    </label>
                    <label className="field field-wide">
                      <span className="compact-label">Descripcion ES</span>
                      <textarea value={interestForm.description} onChange={(event) => updateInterestField("description", event.target.value)} rows={3} required />
                    </label>
                    <label className="field field-wide">
                      <span className="compact-label">Cuerpo ES</span>
                      <textarea value={interestForm.body} onChange={(event) => updateInterestField("body", event.target.value)} rows={5} required />
                    </label>
                    <label className="field field-wide">
                      <span className="compact-label">Tags ES</span>
                      <input value={interestForm.tags} onChange={(event) => updateInterestField("tags", event.target.value)} placeholder="Color, Ritmo, Sistema" />
                    </label>
                  </div>

                  <div className="form-section-heading">
                    <span className="section-label">English</span>
                    <h3>Version en ingles</h3>
                  </div>
                  <div className="form-grid">
                    <label className="field">
                      <span className="compact-label">Title EN</span>
                      <input value={interestForm.titleEn} onChange={(event) => updateInterestField("titleEn", event.target.value)} />
                    </label>
                    <label className="field">
                      <span className="compact-label">Category EN</span>
                      <input value={interestForm.categoryEn} onChange={(event) => updateInterestField("categoryEn", event.target.value)} />
                    </label>
                    <label className="field field-wide">
                      <span className="compact-label">Meta EN</span>
                      <input value={interestForm.metaEn} onChange={(event) => updateInterestField("metaEn", event.target.value)} />
                    </label>
                    <label className="field field-wide">
                      <span className="compact-label">Description EN</span>
                      <textarea value={interestForm.descriptionEn} onChange={(event) => updateInterestField("descriptionEn", event.target.value)} rows={3} />
                    </label>
                    <label className="field field-wide">
                      <span className="compact-label">Body EN</span>
                      <textarea value={interestForm.bodyEn} onChange={(event) => updateInterestField("bodyEn", event.target.value)} rows={5} />
                    </label>
                    <label className="field field-wide">
                      <span className="compact-label">Tags EN</span>
                      <input value={interestForm.tagsEn} onChange={(event) => updateInterestField("tagsEn", event.target.value)} />
                    </label>
                  </div>

                  {imagePickMessage && (
                    <p className={`form-message is-${imagePickMessage.tone}`}>{imagePickMessage.text}</p>
                  )}
                  {contentError && <p className="form-message is-error">{contentError}</p>}
                  {contentResult && (
                    <div className="form-message is-success">
                      <strong>Interes guardado: {contentResult.key}</strong>
                      <span>Total: {contentResult.totalItems}</span>
                    </div>
                  )}
                </div>
                <div className="form-footer">
                  {editingInterestIndex !== null ? (
                    <button
                      type="button"
                      className="danger-action"
                      onClick={() => handleDeleteInterest(editingInterestIndex)}
                      disabled={isSavingContent}
                    >
                      Eliminar
                    </button>
                  ) : null}
                  <button type="button" className="secondary-button" onClick={() => openInterestEditor("new")}>Limpiar</button>
                  <button type="submit" className="primary-button" disabled={isSavingContent}>
                    <Save size={17} strokeWidth={2.2} />
                    {isSavingContent ? "Guardando..." : "Guardar interes"}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

export default App;
