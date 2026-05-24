import type { LucideIcon } from "lucide-react";

export type StudioSectionId = "projects" | "certificates" | "blog" | "interests";

export type StudioAccent = "cyan" | "violet" | "rose" | "mint";

export type ProjectPreviewSection = "images" | "videos" | "modules";

export interface StudioSection {
  id: StudioSectionId;
  title: string;
  eyebrow: string;
  description: string;
  metric: string;
  detail: string;
  accent: StudioAccent;
  icon: LucideIcon;
  actions: string[];
}

export interface ProjectExtraLink {
  type: string;
  href: string;
  labelEs: string;
  labelEn: string;
}

export interface ProjectMetric {
  value: string;
  label: string;
  labelEn: string;
}

export interface ProjectModule {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
}

export interface ProjectFlowStep {
  step: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
}

export interface ProjectImage {
  src: string;
  altEs: string;
  altEn: string;
  captionEs: string;
  captionEn: string;
}

export interface ProjectVideo {
  src: string;
  poster: string;
  titleEs: string;
  titleEn: string;
  captionEs: string;
  captionEn: string;
}

export interface ProjectFormState {
  title: string;
  slug: string;
  category: string;
  year: string;
  tag: string;
  accent: string;
  description: string;
  titleEn: string;
  tagEn: string;
  accentEn: string;
  descriptionEn: string;
  detailCategory: string;
  detailCategoryEn: string;
  summary: string;
  summaryEn: string;
  overview: string;
  overviewEn: string;
  challenge: string;
  challengeEn: string;
  solution: string;
  solutionEn: string;
  process: string[];
  processEn: string[];
  results: string;
  resultsEn: string;
  stack: string;
  deliverables: string;
  deliverablesEn: string;
  learnings: string;
  learningsEn: string;
  liveUrl: string;
  repoUrl: string;
  previewImage: string;
  visualClass: string;
  showInHome: boolean;
  status: string;
  featuredLevel: string;
  extraLinks: ProjectExtraLink[];
  metrics: ProjectMetric[];
  modules: ProjectModule[];
  flow: ProjectFlowStep[];
  images: ProjectImage[];
  videos: ProjectVideo[];
  sectionOrder: ProjectPreviewSection[];
}

export interface CreatedProject {
  slug: string;
  filePath: string;
  generatedPath: string;
  totalProjects: number;
}

export interface ProjectPreviewResult {
  url: string;
  filePath: string;
}
