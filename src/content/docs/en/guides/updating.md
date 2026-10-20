---
title: Updating
description: How to update the s:CMS framework
order: 6
---

This guide explains how to update the s:CMS framework in your site.

## TL;DR

```bash
npm update @lad-sapienza/scms-core
```

That's it. The framework layer (`DataTb`, `Map`, `Gallery`, `ZoteroGeoViewer`, `Record`, the Astro integrations, and the `scms-add-collection`/`scms-add-content` scaffolding commands) is an ordinary npm package, `@lad-sapienza/scms-core`. Updating it is exactly like updating any other dependency — there's no custom script, no protected folder to worry about, and nothing in `src/` is ever touched, because the framework was never part of this repository in the first place.

## Checking What's New

Before updating, see what version you're on and what's available:

```bash
npm outdated @lad-sapienza/scms-core
```

To see the package's changelog/commit history, check [lad-sapienza/scms-core](https://github.com/lad-sapienza/scms-core) on GitHub.

## Picking a Version

By default, `npm update` respects the version range already in your `package.json` (e.g. `^0.1.0-alpha.0` allows any compatible `0.1.x` release). To move to a specific version or a new range on purpose:

```bash
npm install @lad-sapienza/scms-core@<version>
# or, to track the latest alpha:
npm install @lad-sapienza/scms-core@alpha
```

## Peer dependencies

`@lad-sapienza/scms-core` declares `astro`, `react`, `react-dom` and `maplibre-gl` as **peer dependencies**: they're not bundled inside the package, they're listed directly in your own `package.json` (the scaffold puts them there, and there's exactly one copy of each in your tree). `npm update @lad-sapienza/scms-core` bumps the framework *within the range those peers already allow*. When a framework release requires a **new major** of one of them, npm can't satisfy it against your old range and `npm install` stops with an `ERESOLVE` peer-conflict error until you bump that peer in your own `package.json` too.

### MapLibre GL JS 5 → 6 (`@lad-sapienza/scms-core@0.1.0-alpha.11`)

This release moves the `Map` component to MapLibre GL JS v6. If your site is still on `maplibre-gl` v5, update both lines together:

```jsonc
// package.json
"dependencies": {
  "@lad-sapienza/scms-core": "^0.1.0-alpha.11",
  "maplibre-gl": "^6.7.0"
}
```

```bash
npm install
npm run build
```

What changes for your site: MapLibre v6 renders through **WebGL2** (supported by every current browser; the map won't render where WebGL2 is unavailable or disabled), and it no longer auto-loads its Web Worker — but `scms-core` wires the worker up for you, so there's nothing to configure. No `Map` prop or API changes.

## After Updating

```bash
# Check the production build still succeeds
npm run build

# Test locally
npm run dev
```

Since `@lad-sapienza/scms-core` exposes its options (`contentDir`, `pagesDir`, `galleriesDir`, etc.) through the `scms()` integration in `astro.config.mjs`, a genuinely breaking framework release will show up as a build or type error at this point — the same way any other npm dependency's breaking change would.

## If Something Breaks

Roll back to your previous version:

```bash
npm install @lad-sapienza/scms-core@<previous-version>
```

Since the framework lives entirely in `node_modules`, this is a normal `package.json`/lockfile change — commit it or revert it with git like any other dependency bump.
