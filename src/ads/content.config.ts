import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';
const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/ads/content/pages' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string().default(''),
    menu_position: z.number().optional(),
  }),
});
export const collections = { pages: pages };
