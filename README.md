# s:CMS

A static site Content Management System built on [Astro](https://astro.build/), developed and maintained by [LAD: Laboratorio di Archeologia Digitale alla Sapienza](https://lad.saras.uniroma1.it).

## Features

- **Content Collections** — type-safe content management with Zod schema validation (Markdown and MDX)
- **Interactive Maps** — display geographical data with [MapLibre GL JS](https://maplibre.org/) and multiple data sources
- **Data Tables** — sortable, filterable, paginated tables from CSV, JSON, API, or Directus
- **Image Galleries** — responsive galleries with PhotoSwipe lightbox
- **Table of Contents** — auto-generated from page headings with smooth scrolling
- **Syntax-highlighted code blocks** — via [Expressive Code](https://expressive-code.com/), with line numbers
- **Directus Integration** — connect to a [Directus](https://directus.io/) instance for dynamic content
- **SEO** — meta tags, Open Graph, and JSON-LD structured data
- **Fast by default** — 100% static output via Astro
- **Updateable framework** — the framework layer is a real npm package ([`@lad-sapienza/scms-core`](https://github.com/lad-sapienza/scms-core)), updated with `npm update` like any other dependency

---

## Project Structure

```
my-site/
├── src/                       # Your site
│   ├── content.config.ts      # Collection schemas (Zod)
│   ├── user.config.mjs        # Site configuration (edit this)
│   ├── content/               # Your content files
│   │   ├── blog/              # Blog posts (.md / .mdx)
│   │   ├── docs/              # Documentation pages (.md / .mdx)
│   │   └── data/              # Data files (CSV, JSON, YAML)
│   ├── components/            # Custom components
│   ├── layouts/               # Page layouts
│   ├── pages/                 # Astro routes
│   └── styles/
│       └── global.css         # Global stylesheet
├── public/                    # Static assets, served as-is
├── astro.config.mjs           # Registers the scms() integration
├── tsconfig.json
└── package.json                # @lad-sapienza/scms-core is a normal dependency here
```

This repository itself is s:CMS's demo/documentation site — a working example of every component, not the starting point for a new site (see below).

---

## Getting Started

### Prerequisites

- Node.js 22 or higher
- npm

### Installation

The fastest way to start a new site is the guided generator, shipped inside `@lad-sapienza/scms-core`:

```bash
npx --package=@lad-sapienza/scms-core scms-create my-site
cd my-site
npm run dev
```

It asks a few questions (title, description, author, site URL) and scaffolds a minimal, ready-to-run Astro + s:CMS project — no cloning, no leftover demo content to strip out.

The site is available at **http://localhost:4321**.

<details>
<summary>Alternative: clone this repo</summary>

This repository is itself a working s:CMS site (the demo/docs site you're reading right now), so it can also be used as a starting point if you want a fuller example to trim down rather than an empty one to build up:

```bash
git clone https://github.com/lad-sapienza/sCMS.git my-site
cd my-site
npm install
npm run dev
```

</details>

---

## Minimum Configuration

Open `src/user.config.mjs` and fill in your site details:

```js
export const userConfig = {
  site: 'https://yourdomain.com',   // full URL of your published site
  // base: '/my-repo',              // uncomment if not deployed at root (e.g. GitHub Pages subpath)
};

export const siteMetadata = {
  title: 'My Site',
  description: 'A short description used by search engines.',
  author: 'Your Name',
  siteName: 'My Site',
  defaultImage: '/images/social-preview.png',
};
```

For styling, edit `src/styles/global.css`. For the navigation menu, edit the `menuItems` array in `src/layouts/BaseLayout.astro`.

### Directus (optional)

If you connect to a Directus instance, create a `.env` file in the project root:

```env
PUBLIC_DIRECTUS_URL=https://your-directus-instance.com
PUBLIC_DIRECTUS_TOKEN=your-token
```

---

## Creating Content

Content lives in `src/content/`. Each subfolder is a collection.

| Folder | Purpose |
|---|---|
| `src/content/blog/` | Blog posts and news |
| `src/content/docs/` | Documentation and guides |
| `src/content/data/` | Data files (CSV, JSON, YAML) |

### Blog post

```markdown
---
title: 'My First Post'
description: 'A short description'
date: 2026-01-01
author: 'Your Name'
tags: ['news']
---

Write your content here.
```

### Documentation page

```markdown
---
title: 'My Page'
description: 'A short description'
order: 1
category: 'guides'
---

Write your content here.
```

Place images in a subfolder next to the content file and reference them with a standard Markdown image tag. s:CMS copies them automatically during build.

For full details see [Managing Content](src/content/docs/guides/managing-content.md).

---

## Available Components

Import components from `@lad-sapienza/scms-core` in any `.mdx` file:

```mdx
import { DataTb, Map, Gallery } from '@lad-sapienza/scms-core';
```

| Component | Description | Documentation |
|---|---|---|
| `DataTb` | Sortable, filterable, paginated data table | [datatb.mdx](src/content/docs/components/datatb.mdx) |
| `Map` | Interactive map with MapLibre GL JS | [map.mdx](src/content/docs/components/map.mdx) |
| `Gallery` | Responsive image gallery with lightbox | [gallery/index.mdx](src/content/docs/components/gallery/index.mdx) |
| `SEO` | Meta tags, Open Graph, JSON-LD | [seo.md](src/content/docs/components/seo.md) |
| `TableOfContents` | Auto-generated TOC from headings | [tableofcontents.md](src/content/docs/components/tableofcontents.md) |
| `ZoteroGeoViewer` | Zotero library visualised on a map | [zotero-geoviewer.mdx](src/content/docs/components/zotero-geoviewer.mdx) |
| `RecordProvider`, `Field`, `Image`, `RecordFetcher`, `useRecordFetcher` | Build single-record detail pages against Directus | [record.md](src/content/docs/components/record.md) |

`SearchUI`, `SearchUISimple`, and `SearchUIAdvanced` (the field/operator/value search interface used by `Map`'s `searchInFields`) are also exported from `@lad-sapienza/scms-core` for building custom search UIs — see the [Vector Layer Search section](src/content/docs/components/map.mdx) of the Map docs.

---

## Directus Integration

Use the built-in loader to pull content from Directus into a collection:

```ts
// src/content.config.ts
import { directusLoader } from '@lad-sapienza/scms-core/integrations/directusLoader';

const articles = defineCollection({
  loader: directusLoader({
    table: 'articles',
    fields: ['id', 'title', 'body', 'date_created'],
    sort: ['-date_created'],
  }),
});
```

Use Directus data sources directly in `DataTb` or `Map` components — see their documentation pages linked above.

---

## Scaffolding Scripts

Two CLI scripts help you add content without editing config files by hand.

### `npm run add-collection`

Scaffolds a complete new content collection: updates `src/content.config.ts`, creates a sample content file, and generates listing and detail page templates. For a multilingual site it can also take a list of locale codes (e.g. `en, it`) and scaffold one sample per language folder.

### `npm run add-content`

Adds a single content file to an existing collection, prompting for frontmatter fields based on the Zod schema. When the collection is organised into per-language folders (`src/content/<collection>/en/…`, `.../it/…`), it asks which language the file belongs in — a single locale, or `all`. See [Managing Content](src/content/docs/en/guides/managing-content.md#multilingual-collections).

---

## Build and Deploy

```bash
npm run build     # production build → dist/
npm run preview   # local preview of the production build
```

For deployment to GitHub Pages, Netlify, Vercel, or Cloudflare Pages, see [Deployment](src/content/docs/guides/deployment.md).

---

## Updating the Core

The framework layer is an ordinary npm dependency — update it like any other package:

```bash
npm update @lad-sapienza/scms-core
```

See [Updating](src/content/docs/guides/updating.md) for checking what's new and picking a specific version.

---

## Documentation

| Guide | File |
|---|---|
| Getting Started | [guides/getting-started.md](src/content/docs/guides/getting-started.md) |
| Architecture | [guides/architecture.md](src/content/docs/guides/architecture.md) |
| Managing Content | [guides/managing-content.md](src/content/docs/guides/managing-content.md) |
| Theming | [guides/theming.md](src/content/docs/guides/theming.md) |
| Deployment | [guides/deployment.md](src/content/docs/guides/deployment.md) |
| Updating | [guides/updating.md](src/content/docs/guides/updating.md) |

---

## License

BSD-0-Clause — see [LICENSE](LICENSE).

---

## Built by LAD

<a href="https://lad.saras.uniroma1.it">
  <img src="https://lad-sapienza.it/images/lad-blue.png" alt="LAD: Laboratorio di Archeologia Digitale alla Sapienza" height="60">
</a>

s:CMS is developed and maintained by [LAD: Laboratorio di Archeologia Digitale alla Sapienza](https://lad.saras.uniroma1.it), Università degli Studi di Roma "La Sapienza".

- GitHub Issues: [lad-sapienza/sCMS](https://github.com/lad-sapienza/sCMS/issues)
- Previous Gatsby version: [lad-sapienza/scms](https://github.com/lad-sapienza/scms)

----


## Build with s:CMS
- [LAD](https://lad-sapienza.it) The official website of the Laboratory of Digital Archaeology at Sapienza
- [FortNet](https://fortnet.lad-sapienza.it/) The website, atlas and more of PRIN 2022 Research Project Fortnet: Fortification and population network in coastal Chaonia, Northern Epirus (Albania) between Iron Age and the Medieval period: a longue durée approach to the study of settlements, economic and defensive systems
- [Borderscape](https://lad-sapienza.github.io/borderscape/) Website and WebGIS of Borderscape Project: State Formation and Settlement Patterns in the Ancient Egyptian Southern Border, 4th-3rd millennia BCE
- [ELAMortuary](https://lad-sapienza.github.io/elamortuary/) Website and data portal of the project Villages to Empire: 4,000 Years of Death and Society in Elam (4500-525 BCE) carried out by Yasmina Wicks, in the frame of a Marie Skłodowska-Curie Individual Fellowship hosted by Università di Napoli, “L’Orientale” (2022-2024). The project research and database were funded by the European Union’s Horizon 2020 research and innovation programme under the Marie Skłodowska-Curie grant agreement No. 892581 — ELAMortuary.
- [Borj-e Kabotar](https://borjekabotar.com/) Website and WebGIS of the Borj-e Kabotar project: architecture and anthropology of the pigeon towers in the Isfahan province (Iran), directed by Danilo Rosati and Fariba Saiedi Anaraki with the support of ISMEO and the Italian Ministry of Foreign Affairs and International Cooperation.
- [WinX](https://lad-sapienza.github.io/winx/) Website and data portal of the WInX project (Women in Intellectual conteXts): self-promotion and gender interactions in the eastern Roman Empire — detecting female presence in odeia, gymnasia and theatres of the Hellenophone provinces, from Achaia to Arabia Petraea. PI: Ada Caruso.

