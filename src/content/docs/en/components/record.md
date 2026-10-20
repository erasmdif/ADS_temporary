---
title: Record Components
description: Build single-record detail pages against Directus — RecordProvider, Field, Image, RecordFetcher, and useRecordFetcher.
order: 34
category: components
---

# Record Components

A small family of components for rendering a **single Directus record** as a detail page — the kind of page a `Map` popup, a `DataTb` row, or a search result would link to. They handle fetching, loading/error states, and reading fields (including nested ones) without you having to write that boilerplate for every layout.

All are exported from `@lad-sapienza/scms-core`:

```ts
import { RecordProvider, Field, Image, RecordFetcher, useRecordFetcher } from '@lad-sapienza/scms-core';
```

## The two ways to build a record page

### 1. `RecordFetcher` — Astro page, client-side fetch

`RecordFetcher` is a React component that reads `table` / `id` (and optionally `fields`) from the page's URL query string, fetches the record from Directus client-side, and passes it to a `Layout` component you supply.

```astro
---
// src/pages/record.astro
import { RecordFetcher } from '@lad-sapienza/scms-core';
import MyRecordLayout from '../layouts/record/default.astro';
---

<RecordFetcher Layout={MyRecordLayout} client:load />
```

Visiting `/record?table=sites&id=42` fetches `sites/42` from Directus and renders `MyRecordLayout` with `record`, `table`, and `id` props. This is the pattern used by the built-in demo at `src/pages/record.astro` (paired with `src/layouts/record/default.astro`).

`RecordFetcherProps`:

| Prop | Type | Description |
|---|---|---|
| `Layout` | `ComponentType<{ record, table, id }>` | Required. Renders once the record has loaded. |
| `directusUrl` | `string` | Defaults to `PUBLIC_DIRECTUS_URL`. |
| `directusToken` | `string` | Defaults to `PUBLIC_DIRECTUS_TOKEN`. |
| `fields` | `string` | Directus fields query, e.g. `"*.*.*"` (default). Overridable per-request via a `?fields=` URL param. |
| `LoadingComponent` | `ComponentType` | Optional custom loading state. |
| `ErrorComponent` | `ComponentType<{ table, id }>` | Optional custom "not found" state. |

### 2. `useRecordFetcher` — same fetch, as a hook

If you're building your own React component instead of an Astro layout, `useRecordFetcher()` gives you the same URL-driven fetch as a hook:

```tsx
// src/components/RecordView.tsx
import { useRecordFetcher } from '@lad-sapienza/scms-core';
import { RecordProvider, Field, Image } from '@lad-sapienza/scms-core';

export default function RecordView() {
  const { record, loading, error, table, id } = useRecordFetcher();

  if (loading) return <p>Loading…</p>;
  if (error || !record) return <p>Not found: {table}/{id}</p>;

  return (
    <RecordProvider record={record}>
      <h1>{record.Site_Name}</h1>
      <Field name="Description" fallback="No description" />
      <Image fieldName="Thumbnail" />
    </RecordProvider>
  );
}
```

```astro
---
// src/pages/record.astro
import RecordView from '../components/RecordView.tsx';
---
<RecordView client:load />
```

## `RecordProvider` + `Field` + `Image`

Once you have a record (from either approach above), `RecordProvider` puts it in React context so `Field` and `Image` don't need `record={record}` repeated on every usage — though both also accept an explicit `record` prop if you'd rather not use the provider.

### `Field`

Reads one value out of the record by name — including dot-path access into nested objects/arrays — with an optional transformer and fallback.

```tsx
<Field name="Site_Name" fallback="Untitled" />

<Field
  name="Latitude"
  transformer={(lat) => `${lat}, ${record.Longitude ?? '?'}`}
/>

{/* dot-path into a relation */}
<Field name="category.name" fallback="Uncategorized" />
```

`FieldProps`: `name` (string, required, dot-path supported), `transformer?: (value) => ReactNode`, `fallback?: ReactNode` (default `null`), `record?: any` (overrides context).

### `Image`

Resolves a field to one or more `<img>` tags. Handles three shapes automatically: a plain URL string, a Directus file object, and a Directus many-files relation (`directus_files_id`).

```tsx
{/* first image in the field */}
<Image fieldName="Thumbnail" className="img-fluid rounded" alt="Site photo" />

{/* a specific index */}
<Image fieldName="Gallery" index={2} />

{/* render every image in the field */}
<Image fieldName="Gallery" index="all" />

{/* Directus transform preset or custom query string */}
<Image fieldName="Thumbnail" preset="thumbnail" />
<Image fieldName="Thumbnail" custom="width=400&quality=80" />
```

`ImageProps`: `fieldName` (required), `index?: number | 'all'` (default `0`), `dEndPoint?: string` (defaults to `PUBLIC_DIRECTUS_URL`, only needed for Directus file objects — plain URL strings ignore it), `preset?: string`, `custom?: string`, `className?: string`, `alt?: string`, `record?: any`.

## Fetching a record server-side instead

If you'd rather fetch the record at build/request time in an Astro frontmatter block (no client-side fetch, no loading state to handle) rather than using `RecordFetcher`/`useRecordFetcher`, use the plain async helpers from `@lad-sapienza/scms-core`:

```astro
---
import { getRecordFromParams } from '@lad-sapienza/scms-core';

const record = await getRecordFromParams(Astro); // reads table/id from Astro.params
---
{record && <h1>{record.title}</h1>}
```

`getRecord({ table, id, fields?, url?, token? })` and `getRecordById(table, id)` are also available for cases where `table`/`id` don't come from `Astro.params`.

## `getValueByDotPath`

The dot-path resolver used internally by `Field` and `Image` is also exported directly, for when you need the raw value without rendering it:

```ts
import { getValueByDotPath } from '@lad-sapienza/scms-core';

const lat = getValueByDotPath(record, 'geometry.coordinates.1');
```
