import type { LucideIcon } from "lucide-react";

export type StudioSectionId = "about" | "development" | "projects" | "certificates" | "blog" | "interests";

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

export interface ProjectCollaborator {
  name: string;
  role: string;
  roleEn: string;
  photo: string;
  portfolioUrl: string;
  githubUrl: string;
  linkedinUrl: string;
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
  collaborators: ProjectCollaborator[];
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

export interface ProjectListItem {
  slug: string;
  title: string;
  year: string;
  status: string;
  showInHome: boolean;
  filePath: string;
}

export type ContentKind = "about" | "certificates" | "blog" | "interests";

export type AboutGroupKind = "education" | "work";

export interface StudioContentItem {
  key: string;
  title: string;
  subtitle: string;
  detail: string;
  status?: string;
  filePath: string;
}

export interface SavedContent {
  key: string;
  filePath: string;
  totalItems: number;
}

export interface PickedCertificateFile {
  fileName: string;
  fileType: string;
  mime: string;
}

export interface AboutFormState {
  group: AboutGroupKind;
  period: string;
  title: string;
  institution: string;
  detail: string;
  skills: string;
  stack: string;
  focus: string;
  detailPlacement: string;
  titleEn: string;
  institutionEn: string;
  detailEn: string;
  skillsEn: string;
  focusEn: string;
}

export interface CertificateFormState {
  id: string;
  fileName: string;
  certificateType: string;
  mime: string;
  issued: string;
  status: string;
  title: string;
  issuer: string;
  tags: string;
  titleEn: string;
  issuerEn: string;
  tagsEn: string;
}

export interface BlogFormState {
  slug: string;
  filter: string;
  visualClass: string;
  category: string;
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
  body: string;
  introduction: string;
  paragraphs: string;
  highlights: string;
  categoryEn: string;
  dateEn: string;
  readTimeEn: string;
  titleEn: string;
  excerptEn: string;
  bodyEn: string;
  introductionEn: string;
  paragraphsEn: string;
  highlightsEn: string;
}

export interface InterestFormState {
  filter: string;
  visualClass: string;
  category: string;
  title: string;
  meta: string;
  description: string;
  body: string;
  tags: string;
  categoryEn: string;
  titleEn: string;
  metaEn: string;
  descriptionEn: string;
  bodyEn: string;
  tagsEn: string;
}
