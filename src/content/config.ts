import { defineCollection, z } from 'astro:content';

const chapters = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    chapter: z.number(),
    summary: z.string().optional(),
    coverIllustration: z.string().optional(),
    published: z.boolean().default(true),
  }),
});

export const collections = { chapters };
