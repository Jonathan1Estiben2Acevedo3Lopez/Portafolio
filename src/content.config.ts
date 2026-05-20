import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const localizedCopySchema = z.object({
  title: z.string().min(1),
  tag: z.string().min(1),
  description: z.string().min(1),
  accent: z.string().min(1),
  longDescription: z.string().optional(),
});

const optionalLocalizedStringSchema = z.object({
  es: z.string().min(1),
  en: z.string().optional(),
});

const detailLanguageSchema = z.object({
  title: z.string().optional(),
  accent: z.string().optional(),
  tag: z.string().optional(),
  summary: z.string().min(1),
  overview: z.string().min(1),
  challenge: z.string().min(1),
  solution: z.string().min(1),
  process: z.array(z.string()).default([]),
  results: z.array(z.string()).default([]),
  deliverables: z.array(z.string()).default([]),
  learnings: z.array(z.string()).default([]),
  interactiveTitle: z.string().optional(),
  interactiveDescription: z.string().optional(),
});

const optionalDetailLanguageSchema = z.object({
  title: z.string().optional(),
  accent: z.string().optional(),
  tag: z.string().optional(),
  summary: z.string().optional(),
  overview: z.string().optional(),
  challenge: z.string().optional(),
  solution: z.string().optional(),
  process: z.array(z.string()).optional(),
  results: z.array(z.string()).optional(),
  deliverables: z.array(z.string()).optional(),
  learnings: z.array(z.string()).optional(),
  interactiveTitle: z.string().optional(),
  interactiveDescription: z.string().optional(),
});

const detailSchema = z.object({
  category: z.string().optional(),
  stack: z.array(z.string()).default([]),
  metrics: z
    .array(
      z.object({
        value: z.string().min(1),
        label: z.string().min(1),
      }),
    )
    .default([]),
  modules: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
      }),
    )
    .default([]),
  flow: z
    .array(
      z.object({
        step: z.string().min(1),
        title: z.string().min(1),
        description: z.string().min(1),
      }),
    )
    .default([]),
  links: z
    .array(
      z.object({
        type: z.string().default("custom"),
        href: z.string().min(1),
        label: optionalLocalizedStringSchema.optional(),
      }),
    )
    .default([]),
  media: z
    .object({
      images: z
        .array(
          z.object({
            src: z.string().min(1),
            alt: optionalLocalizedStringSchema.optional(),
            caption: optionalLocalizedStringSchema.optional(),
          }),
        )
        .default([]),
      videos: z
        .array(
          z.object({
            src: z.string().min(1),
            poster: z.string().optional(),
            title: optionalLocalizedStringSchema.optional(),
            caption: optionalLocalizedStringSchema.optional(),
            type: z.string().optional(),
            youtubeId: z.string().optional(),
            url: z.string().optional(),
          }),
        )
        .default([]),
      video: z
        .object({
          type: z.string().optional(),
          url: z.string().optional(),
          youtubeId: z.string().optional(),
        })
        .optional(),
    })
    .default({ images: [], videos: [] }),
  previewImage: z.string().optional(),
  visualClass: z.string().optional(),
  liveUrl: z.string().url().optional(),
  es: detailLanguageSchema,
  en: optionalDetailLanguageSchema.optional(),
});

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/*.json" }),
  schema: z.object({
    slug: z.string().min(1),
    order: z.number().optional(),
    category: z.string().min(1),
    visualTemplate: z.string().optional(),
    year: z.string().min(4),
    href: z.string().optional(),
    liveUrl: z.string().url().optional(),
    githubUrl: z.string().optional(),
    previewImage: z.string().optional(),
    visualClass: z.string().min(1),
    featuredLevel: z.enum(["normal", "featured", "main"]).optional(),
    status: z.enum(["completed", "in-progress", "paused", "archived", "experimental", "concept"]).optional(),
    stack: z.array(z.string()).optional(),
    pinned: z.boolean().optional(),
    priority: z.number().optional(),
    media: z
      .object({
        cover: z.string().optional(),
        gallery: z.array(z.any()).optional(),
        video: z
          .object({
            type: z.string().optional(),
            url: z.string().optional(),
            youtubeId: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
    visualOptions: z.record(z.string(), z.any()).optional(),
    modulesOrder: z.array(z.string()).optional(),
    modules: z.record(z.string(), z.any()).optional(),
    showInHome: z.boolean().optional(),
    copy: z.object({
      es: localizedCopySchema,
      en: localizedCopySchema,
    }),
    detail: detailSchema.optional(),
  }),
});

export const collections = { projects };
