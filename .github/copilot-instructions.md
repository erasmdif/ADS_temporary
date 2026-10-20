# s:CMS Astro Development Guide

## Architecture Overview

s:CMS is a static CMS built on Astro with a **strict separation between framework and user code** — enforced by the framework not being part of this repository at all:

- **`@lad-sapienza/scms-core`** (npm package, in `node_modules`, source at [lad-sapienza/scms-core](https://github.com/lad-sapienza/scms-core)): Framework components, layouts, and utilities. Update it like any dependency: `npm update @lad-sapienza/scms-core`.
- **`src/`**: User content, custom components, and configurations (edit freely) — this repo *is*, essentially, `src/` plus the config files that wire the package in.

### Path Aliases

`src/`-relative aliases, configured in `astro.config.mjs` / `tsconfig.json`:
- `@user/*` → `src/*` (user code)
- `@components/*` → `src/components/*`
- `@layouts/*` → `src/layouts/*`
- `@content/*` → `src/content/*`

Framework components are a normal package import, not an alias: `import { DataTb } from '@lad-sapienza/scms-core/components/DataTb'`. The bare `@lad-sapienza/scms-core` specifier resolves to the package's barrel (component exports); its `scms()` Astro integration specifically lives at the `@lad-sapienza/scms-core/scms` subpath (importing it from the bare specifier breaks — the barrel re-exports `.astro` components, which can't be parsed yet at Astro's config-load time).

## Configuration System

### Merged Config Pattern
[astro.config.mjs](astro.config.mjs) merges core settings with [src/user.config.mjs](src/user.config.mjs). When modifying:
- Core settings go in `astro.config.mjs` (integrations, srcDir, aliases)
- User overrides go in `src/user.config.mjs` (site URL, custom integrations)
- Arrays like `integrations` and `vite.resolve.dedupe` are spread-merged, not replaced

`src/user.config.mjs` exports two objects:
- `userConfig` — Astro config overrides (`site`, `integrations`, `vite`, `markdown`)
- `siteMetadata` — SEO/social metadata (`title`, `description`, `author`, `defaultImage`, `twitter`, etc.)

### Core Integrations (always active)
- `contentAssetsIntegration` — serves co-located content assets (images, PDFs) from `src/content/` without a manual copy step
- `astro-expressive-code` with `pluginLineNumbers` — syntax-highlighted code blocks
- `@astrojs/mdx`, `@astrojs/react`, `@astrojs/sitemap`

### Content Collections
[src/content.config.ts](src/content.config.ts) defines schemas with Zod validation. Use `glob` loader for local files, `directusLoader` from `@lad-sapienza/scms-core/integrations/directusLoader` for CMS data.

## Core Components

### Available Components

| Component | Export(s) | Requires Astro wrapper? |
|---|---|---|
| `BSNavbar` | `default BSNavbar` | No — pure React, use `client:load` |
| `DataTb` | `DataTb`, `CsvSource`, `JsonSource`, `DirectusSource`, `ApiSource` | Yes — `.astro` wrapper available |
| `Gallery` | `Gallery` | Astro component, usable from `.astro` files and MDX bodies alike |
| `Map` | `MapComponent` | No — pure React, use `client:idle` |
| `Map/Search` | `SearchUI`, `SearchUISimple`, `SearchUIAdvanced` | No — pure React |
| `Record` | `RecordProvider`, `Field`, `Image`, `RecordFetcher`, `useRecordFetcher`, `getValueByDotPath` | No — pure React |
| `SEO` | `default SEO` | Astro component |
| `TableOfContents` | `default TableOfContents` | Astro component |
| `ZoteroGeoViewer` | `ZoteroGeoViewer` | Yes — `.astro` wrapper available |

Most exports are available via the `@lad-sapienza/scms-core` barrel; a few (`SEO`, `BSNavbar`, `directusLoader`) are subpath-only — see the package's own README for the full list of subpath-only exports.

### Hybrid Rendering Architecture
Interactive components use a **React client** pattern. Some also have an **Astro wrapper** for SSR data fetching:

1. **Astro wrapper** (e.g., `DataTb.astro` in the package) handles SSR data fetching
2. **React component** (e.g., `DataTb.tsx`) provides interactivity
3. **MDX wrapper** (e.g., `DataTbMdx.tsx`) wraps React for MDX use

Components without an Astro wrapper (BSNavbar, Map, Record, SearchUI*) are used directly as React components with a `client:` directive.

### Component Directory Structure
```
components/DataTb/
├── DataTb.astro       # SSR wrapper (not all components have this)
├── DataTb.tsx         # React client component
├── DataTbMdx.tsx      # MDX-compatible wrapper (not all components have this)
├── types.ts           # TypeScript interfaces
├── utils.ts           # Helper functions
├── index.ts           # Public exports
└── README.md          # Component docs
```

### Data Source Abstraction
`@lad-sapienza/scms-core`'s `utils/data-fetcher.ts` re-exports `SourceConfig` from `components/DataTb/types.ts`. Used by DataTb and Map vector layers:

```typescript
type SourceConfig =
  | { type: 'csv';     url: string; delimiter?: string; skipRows?: number; lng?: string; lat?: string }
  | { type: 'json';    url?: string; data?: DataRow[] }
  | { type: 'directus'; collection: string; config: { url: string; token: string }; filter?: ...; fields?: ...; limit?: number; ... }
  | { type: 'api';     url: string; method?: 'GET'|'POST'; headers?: ...; transformer?: (data) => DataRow[] }
  | { type: 'geojson'; url?: string; data?: any }
  | { type: 'vector';  url?: string }
```

**Shorthand for DataTb and Map**: components accept a `directus` prop of type `DirectusShorthand` for convenience:
```typescript
interface DirectusShorthand {
  table: string;
  queryString?: string; // e.g. "filter[status][_eq]=published&limit=10"
  url?: string;         // defaults to PUBLIC_DIRECTUS_URL env var
  token?: string;       // defaults to PUBLIC_DIRECTUS_TOKEN env var
}
```

## Key Development Workflows

### Running the Dev Server
```bash
npm run dev                          # Start dev server at localhost:4321
npm run build                        # Type-check + production build
npm run preview                      # Preview production build
npm run add-collection                # Scaffold a new content collection (scms-add-collection CLI)
npm run add-content                   # Add a content file to an existing collection (scms-add-content CLI)
npm update @lad-sapienza/scms-core   # Update the framework layer
```

### Working with Directus
1. Set environment variables in `.env` (never committed):
   ```
   PUBLIC_DIRECTUS_URL=https://your-instance.com
   PUBLIC_DIRECTUS_TOKEN=your-token
   ```
   Note: variables must be prefixed `PUBLIC_` to be accessible client-side.
2. Use `directusLoader` in content collections for build-time data
3. Use the `directus` shorthand prop on `DataTb` or `Map` for runtime data
4. Directus SDK (`@directus/sdk`) is used internally in `@lad-sapienza/scms-core`'s `utils/data-fetcher.ts`

### Adding New Framework Components
Framework components live in a separate repository, [lad-sapienza/scms-core](https://github.com/lad-sapienza/scms-core) — not here. To add one there:
1. Create component directory in `components/NewComponent/`
2. Export from `index.ts` for user access (or leave subpath-only, like `SEO`/`BSNavbar`)
3. If interactive: create a `.tsx` React component with a `client:` directive
4. If it needs SSR data: add an `.astro` wrapper and optionally a `Mdx.tsx` variant
5. Add TypeScript types to `types.ts`, document in `README.md`
6. Bump the version and publish (`npm publish --tag alpha --access public` for pre-1.0 releases)

### Customizing for Users
Users extend core by:
- Importing core components: `import { DataTb } from '@lad-sapienza/scms-core'`
- Creating custom components in `src/components/`
- Modifying `src/layouts/` to wrap or replace core layouts
- Adding styles in `src/styles/global.css`

## TypeScript Conventions

- Strict mode enabled (`strictNullChecks: true`)
- Use Zod for runtime validation in content schemas
- Export types from component `types.ts` files
- React components use `type` imports: `import type { DataTbProps } from './types'`

## Styling Approach

- **Bootstrap 5** is the CSS framework (`bootstrap` package)
- Global styles in `src/styles/global.css` — imports Bootstrap and defines CSS custom properties overriding Bootstrap defaults (`--bs-primary`, `--bs-body-font-family`, etc.)
- All styles live under `src/`; the framework package ships no stylesheet of its own
- Components use Bootstrap utility classes and component classes (e.g. `navbar`, `card`, `btn-primary`)
- `sass` is available as a dev dependency for custom SCSS
- `lucide-react` is available for icons

## Critical Files

- [astro.config.mjs](astro.config.mjs): Registers `scms()` and the `src/`-relative path aliases
- [src/user.config.mjs](src/user.config.mjs): User overrides (`userConfig`) and site metadata (`siteMetadata`)
- [src/content.config.ts](src/content.config.ts): Content collection schemas
- `node_modules/@lad-sapienza/scms-core/index.ts`: Framework package exports (source: [lad-sapienza/scms-core](https://github.com/lad-sapienza/scms-core))
- `node_modules/@lad-sapienza/scms-core/utils/data-fetcher.ts`: Unified data loading
- `node_modules/@lad-sapienza/scms-core/utils/directus-config.ts`: `DirectusShorthand` and `DirectusSourceConfig` types
- `node_modules/@lad-sapienza/scms-core/integrations/{contentAssetsIntegration,directusLoader}.ts`: Co-located asset serving; Astro content loader for Directus

## Common Pitfalls

- **Framework changes don't belong in this repo** — they go in [lad-sapienza/scms-core](https://github.com/lad-sapienza/scms-core); this repo only ever consumes the published package
- **`scms()` must be imported from the `/scms` subpath**, not the bare `@lad-sapienza/scms-core` specifier (see Path Aliases above)
- **Always use path aliases** (`@user`, `@components`, `@layouts`, `@content`) for `src/`-relative imports instead of relative paths
- **BSNavbar needs `client:load`** (not `client:idle`) because it controls toggle state immediately on render
- **Map and Search components** have no Astro wrapper — use them directly with `client:idle`
- **Directus env vars must be `PUBLIC_`-prefixed** (`PUBLIC_DIRECTUS_URL`, `PUBLIC_DIRECTUS_TOKEN`) for client-side access
- **Stringify source objects** in `useEffect` deps to prevent infinite re-renders (see `DataTb.tsx` in the package)
- **`contentAssetsIntegration`** handles images co-located in `src/content/` — no need to copy them to `public/`
