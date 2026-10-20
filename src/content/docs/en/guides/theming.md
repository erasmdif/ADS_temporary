---
title: Theming
description: Customization and theming information for s:CMS
order: 4
---

s:CMS ships with [Bootstrap 5](https://getbootstrap.com/) as its base design system. Theming works by overriding Bootstrap's Sass/CSS variables and adding your own rules in a single stylesheet you own: `src/styles/global.css`.

## Where styles live

```
src/styles/global.css                        → your stylesheet — edit this
node_modules/@lad-sapienza/scms-core/         → framework components — no stylesheet of its own
```

`global.css` is imported once by `src/layouts/BaseLayout.astro` and applies to the whole site. There is no separate framework stylesheet to merge with — this file *is* your theme.

## Quick start

`global.css` already does three things out of the box; edit them directly:

1. **Import a font** (optional) — the starter imports a Google Font:

   ```css
   @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
   ```

2. **Import Bootstrap's compiled CSS**:

   ```css
   @import "bootstrap/dist/css/bootstrap.min.css";
   ```

3. **Override Bootstrap's CSS variables** — this is the main lever for brand colors, typography, and body styling:

   ```css
   :root {
     --bs-primary: #6366f1;
     --bs-secondary: #8b5cf6;
     --bs-success: #06b6d4;
     --bs-body-font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
     --bs-body-color: #334155;
     --bs-body-bg: #fafafa;
     --bs-heading-color: #1e1b4b;
     --bs-border-color: #e7e5e4;
   }
   ```

Because these are plain CSS custom properties (not a Sass build step), changes take effect immediately in the dev server — no rebuild of Bootstrap required.

## Using Bootstrap utility classes

With Bootstrap's CSS loaded, its utility classes are available everywhere in your Astro/MDX content:

```html
<button class="btn btn-primary">Primary button</button>
<div class="text-primary border border-primary">Brand-colored content</div>
<h1 class="fw-bold">Bold heading</h1>
<div class="row g-3">
  <div class="col-md-6">Half-width column</div>
</div>
```

See the [Bootstrap documentation](https://getbootstrap.com/docs/5.3/getting-started/introduction/) for the full utility and component reference.

## Custom rules beyond variable overrides

Anything Bootstrap's variables don't cover, write as plain CSS in `global.css`, after the imports. The starter includes examples for headings, buttons, cards, form controls, badges, and a mobile breakpoint — extend these or add your own selectors:

```css
.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  font-weight: 600;
}

.card {
  border: none;
  border-radius: 1.25rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

@media (max-width: 768px) {
  h1 { font-size: 2rem; }
}
```

## Navigation bar

The top navigation (`BSNavbar`, from `@lad-sapienza/scms-core/components/BSNavbar`) is a Bootstrap navbar rendered from the `menuItems` array in `src/layouts/BaseLayout.astro` — see [Getting Started](getting-started.md) for how to edit the menu. It picks up the same `--bs-*` variables as the rest of the site, so no separate theming is needed for it.

## Component-level styling

Core components (`DataTb`, `Map`, `Gallery`, etc.) render mostly plain HTML with Bootstrap classes, so global overrides in `global.css` apply to them too. A few components pull in their own third-party CSS (e.g. MapLibre GL, PhotoSwipe) for functionality that Bootstrap doesn't cover (map controls, the lightbox) — those are scoped to the component and won't conflict with your theme.

`Map` is built on MapLibre GL JS v6, which renders through **WebGL2** — the canvas itself isn't styleable with CSS, and the map won't render on a browser without WebGL2 support.

## Best practices

1. **Override `--bs-*` variables first** — it's the fastest way to get consistent brand colors across every Bootstrap-based component.
2. **Add custom CSS after the imports** in `global.css`, so it can override Bootstrap's defaults.
3. **Don't fork component markup** — it lives in the `@lad-sapienza/scms-core` package (`node_modules`, updated via `npm update`); keep all visual customization in `src/styles/global.css`.
