---
title: Architecture
description: s:CMS system architecture and design patterns
order: 2
---

# Architecture

s:CMS separates **framework code** from **your site**: the framework is a published npm package, and this repository is only your site.

## The package / src split

```
your-site/
├── node_modules/
│   └── @lad-sapienza/scms-core/   # Framework — a real npm dependency
│       ├── components/            # DataTb, Map, Gallery, SEO, TableOfContents, Record, …
│       ├── integrations/          # Astro integrations (content assets, Directus loader)
│       ├── utils/                 # Directus / data-fetching helpers
│       └── bin/                   # scms-add-collection / scms-add-content / scms-create CLI
│
├── src/                       # Your site — the only thing this repo owns
│   ├── content.config.ts      # Collection schemas (Zod)
│   ├── user.config.mjs        # Site configuration
│   ├── content/                # Your content (blog, docs, data, …)
│   ├── components/             # Your custom components
│   ├── layouts/                 # Your layouts
│   ├── pages/                   # Your routes
│   └── styles/global.css        # Your stylesheet
├── public/                    # Static assets, served as-is (sibling of src/, not nested)
│
├── astro.config.mjs             # Astro config — registers the scms() integration + your src settings
├── tsconfig.json
└── package.json                 # @lad-sapienza/scms-core is a normal dependency here
```

- **`@lad-sapienza/scms-core`** contains every reusable component, integration, and utility. It lives in `node_modules`, like any other npm package — there's nothing to "not edit," because it's not part of this repository at all.
- **`src/`** contains everything specific to your site: content, pages, layouts, styling, and configuration. This repo *is* essentially `src/` plus the config files that wire the package in.
- Components are imported from the package by name — `import { DataTb } from '@lad-sapienza/scms-core'` — the same way you'd import any other npm dependency.

Because the framework isn't in this repository, there's no "protected folder" convention to follow and nothing an update script needs to avoid touching — `npm update` only ever touches `node_modules` and your lockfile.

## Configuration

`astro.config.mjs` at the project root registers the framework's `scms()` Astro integration (imported from `@lad-sapienza/scms-core/scms`) alongside your site settings from `src/user.config.mjs`. You generally don't need to edit `astro.config.mjs` directly — site-level settings (URL, base path, metadata) belong in `src/user.config.mjs`.

## Content collections

Collections are declared with Zod schemas in `src/content.config.ts`. Each collection maps to a folder under `src/content/` and gets a listing + detail route under `src/pages/`. See [Managing Content](managing-content.md) for the full workflow, including the `npm run add-collection` / `npm run add-content` scaffolding commands (themselves part of the `@lad-sapienza/scms-core` package, exposed as its `bin` CLI).

## Keeping the framework up to date

Framework updates are pulled with `npm update @lad-sapienza/scms-core`, the same as updating any other dependency — no custom tooling, no risk of overwriting `src/` since the framework was never in this repository to begin with. See [Updating](updating.md) for checking what's new before you update.

## Deployment

s:CMS builds to a static `dist/` folder (`npm run build`) that can be hosted anywhere — GitHub Pages, Netlify, Vercel, Cloudflare Pages, or a plain file server. See [Deployment](deployment.md) for platform-specific instructions.

## Getting help

- [GitHub Discussions](https://github.com/lad-sapienza/sCMS/discussions)
- [Issue Tracker](https://github.com/lad-sapienza/sCMS/issues)
