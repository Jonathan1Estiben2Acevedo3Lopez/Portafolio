export type Locale = "es" | "en";

export type FeaturedLevel = "normal" | "featured" | "main";

export type ProjectStatus = "completed" | "in-progress" | "paused" | "archived" | "experimental" | "concept";

export interface LocalizedText {
  es: string;
  en?: string;
}

export interface CategoryDefinition {
  id: string;
  legacyFilter: string;
  label: LocalizedText;
  description: string;
  recommendedModules: string[];
  allowedModules: string[];
  recommendedVisualTemplate: string;
  specificFields: string[];
}

export interface VisualTemplateDefinition {
  id: string;
  name: string;
  description: string;
  bestFor: string;
  visualClass: string;
}

export interface ModuleDefinition {
  id: string;
  label: string;
  type: string;
  description: string;
}

export interface Technology {
  name: string;
  slug: string;
  icon?: string;
  color: string;
  category: string;
}

export interface ProjectCopy {
  title: string;
  tag: string;
  description: string;
  longDescription?: string;
  accent?: string;
}

export interface ProjectImage {
  src: string;
  alt?: LocalizedText;
  caption?: LocalizedText;
  sourcePath?: string;
  isExternal?: boolean;
}

export interface ProjectVideo {
  type: "youtube";
  url: string;
  youtubeId: string;
}

export interface ProjectMedia {
  cover: string;
  gallery: ProjectImage[];
  video: ProjectVideo;
}

export interface ProjectModule {
  title?: LocalizedText;
  body?: LocalizedText;
  items?: Array<string | { label?: string; value?: string; title?: string; description?: string }>;
  code?: string;
  language?: string;
  links?: Array<{ label: LocalizedText; href: string; type?: string }>;
}

export interface ProjectDraft {
  slug: string;
  order?: number;
  category: string;
  visualTemplate: string;
  year: string;
  href: string;
  liveUrl?: string;
  githubUrl?: string;
  previewImage?: string;
  visualClass: string;
  featuredLevel: FeaturedLevel;
  status: ProjectStatus;
  stack: string[];
  pinned?: boolean;
  priority?: number;
  copy: {
    es: ProjectCopy;
    en: ProjectCopy;
  };
  media: ProjectMedia;
  visualOptions: {
    heroStyle: string;
    motion: string;
    cardStyle: string;
  };
  modulesOrder: string[];
  modules: Record<string, ProjectModule>;
  detail?: Record<string, unknown>;
  showInHome?: boolean;
}

export interface ProjectSummary {
  slug: string;
  title: string;
  category: string;
  year: string;
  status: ProjectStatus;
  featuredLevel: FeaturedLevel;
  visualTemplate: string;
  href: string;
  previewImage: string;
  path: string;
}

export interface ValidationMessage {
  level: "error" | "warning" | "info";
  message: string;
}

export interface AssetInput {
  sourcePath: string;
  targetName: string;
}
