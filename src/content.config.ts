/**
 * Content Collections Configuration
 * 
 * This file defines the structure and schema for your content collections.
 * Collections provide type-safe content management with automatic validation.
 */

import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

// Schema for blog posts
const blogCollection = defineCollection({
  loader: glob({ 
    pattern: '**/*.{md,mdx}', 
    base: './src/content/blog' 
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    draft: z.boolean().optional(),
    menu_position: z.number().optional(),
  }),
});

// Schema for documentation
const docsCollection = defineCollection({
  loader: glob({ 
    pattern: '**/*.{md,mdx}', 
    base: './src/content/docs' 
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().optional(),
    category: z.string().optional(),
    draft: z.boolean().optional(),
    menu_position: z.number().optional(),
  }),
});

// Recursive schema for a single menu item (supports up to any nesting depth)
type MenuItem = {
  href?: string;
  label: string;
  match?: string;
  children?: MenuItem[];
};
const menuItemSchema: z.ZodType<MenuItem> = z.lazy(() =>
  z.object({
    href:     z.string().optional(),
    label:    z.string(),
    match:    z.string().optional(),
    children: z.array(menuItemSchema).optional(),
  })
);

// Schema for src/content/data/{locale}/menu.yaml — one menu per language,
// top-level array of menu items. hrefs stay locale-agnostic (prefixed with
// the current locale at render time — see src/utils/i18n.ts); only `label`
// needs translating per locale.
const menuCollection = defineCollection({
  loader: glob({
    pattern: '*/menu.yaml',
    base: './src/content/data',
  }),
  schema: z.array(menuItemSchema),
});

// Recursive schema for a dictionary value: a string leaf, or a nested
// object of further dictionary values (e.g. `dataTb.pagination.next`).
type DictionaryValue = string | { [key: string]: DictionaryValue };
const dictionaryValueSchema: z.ZodType<DictionaryValue> = z.lazy(() =>
  z.union([z.string(), z.record(z.string(), dictionaryValueSchema)])
);

// Schema for src/content/data/i18n/{locale}.yaml — this site's own
// translation dictionary. Only needs keys the site wants to add (nav,
// footer, page copy) or override (a component's own key, e.g.
// `dataTb.searchPlaceholder`) — anything omitted falls back through the
// default locale to @lad-sapienza/scms-core's built-in English strings.
// See @lad-sapienza/scms-core/components/i18n for the resolution mechanism.
const i18nCollection = defineCollection({
  loader: glob({
    pattern: '*.yaml',
    base: './src/content/data/i18n',
  }),
  schema: z.record(z.string(), dictionaryValueSchema),
});

// Export all collections
export const collections = {
  blog: blogCollection,
  docs: docsCollection,
  menu: menuCollection,
  i18n: i18nCollection,
};
