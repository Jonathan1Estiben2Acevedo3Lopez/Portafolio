import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const localizedCopySchema = z.object({
  title: z.string().min(1),
  tag: z.string().min(1),
  description: z.string().min(1),
  accent: z.string().min(1),
});

const detailSchema = z.object({
  title: z.string().optional(),
  accent: z.string().optional(),
  tag: z.string().optional(),
  category: z.string().optional(),
  summary: z.string().min(1),
  overview: z.string().min(1),
  challenge: z.string().min(1),
  solution: z.string().min(1),
  results: z.array(z.string()).default([]),
  stack: z.array(z.string()).default([]),
  deliverables: z.array(z.string()).default([]),
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
  interactiveTitle: z.string().optional(),
  interactiveDescription: z.string().optional(),
  previewImage: z.string().optional(),
  visualClass: z.string().optional(),
  liveUrl: z.string().url().optional(),
});

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/*.json" }),
  schema: z.object({
    slug: z.string().min(1),
    order: z.number().optional(),
    category: z.string().min(1),
    year: z.string().min(4),
    href: z.string().optional(),
    liveUrl: z.string().url().optional(),
    previewImage: z.string().optional(),
    visualClass: z.string().min(1),
    showInHome: z.boolean().optional(),
    copy: z.object({
      es: localizedCopySchema,
      en: localizedCopySchema,
    }),
    detail: detailSchema.optional(),
  }),
});

export const collections = { projects };
