---
title: "Getting Started"
description: "From zero to a running site — no coding experience required."
order: 1
---

This guide walks you through everything you need — no coding experience required. By the end you will have a working website with your own content, published for free on GitHub Pages.

---

### What you will need

- A free [GitHub](https://github.com) account
- [Node.js](https://nodejs.org) installed on your computer (choose the "LTS" version)
- A code editor — [Visual Studio Code](https://code.visualstudio.com) is free and easy to use
- About 30 minutes

---

### Step 1 — Create your site

On your computer, open a terminal (on Mac: Terminal app; on Windows: Command Prompt or PowerShell) and run:

```bash
npx --package=@lad-sapienza/scms-core scms-create my-site
```

You'll be asked a few questions (site title, description, author, site URL) — answer them, then it scaffolds a minimal site and installs its dependencies for you.

Once it finishes, start the local preview server:

```bash
cd my-site
npm run dev
```

Open your browser at **http://localhost:4321** — you should see your new site's homepage.

---

### Step 2 — Make the site yours

Open the file `src/user.config.mjs` in your code editor. You will see two sections — `scms-create` already filled these in from your answers, but you can edit them any time:

```js
export const userConfig = {
  site: 'https://YOUR-USERNAME.github.io/my-site', // ← your future website URL
};

export const siteMetadata = {
  title: 'My Research Site',          // ← name shown in the browser tab and header
  description: 'A short description', // ← used by search engines
  author: 'Your Name',
};
```

Save the file. The preview in your browser updates automatically.

---

### Step 3 — Add your first content collection

A freshly created site starts with no content collections at all — `src/content.config.ts` is empty. The fastest way to add one:

```bash
npm run add-collection
```

This asks for a name (e.g. `blog`) and a type (blog / docs / generic), then creates the schema in `src/content.config.ts`, a sample content file, and listing + detail page templates — everything you need to see it working immediately at `npm run dev`.

#### Adding a content file

Once a collection exists, add content to it the same way:

```bash
npm run add-content
```

If the collection is organised into per-language folders, the script also asks which language the file belongs in (a single locale, or `all`). See [Managing Content](managing-content.md#multilingual-collections) for details.

Or create the file by hand, e.g. `src/content/blog/my-first-post.md`:

```markdown
---
title: 'My First Post'
description: 'A short description of this post'
date: 2026-01-01
author: 'Your Name'
tags: ['news']
---

Write your content here in plain text.

## A section heading

More text, **bold**, *italic*, [a link](https://example.com).
```

The block between the `---` lines is called **frontmatter** — it holds the metadata for your post. Everything below it is your article text, written in plain [Markdown](https://www.markdownguide.org/basic-syntax/).

Save the file and check **http://localhost:4321/blog** — your post appears immediately.

#### Adding images

Place image files next to your content file, inside the same folder:

```
src/content/blog/
├── my-first-post.md
└── my-first-post/
    └── photo.jpg
```

Then reference them in your post with a standard Markdown image tag:

```markdown
![Photo caption](./my-first-post/photo.jpg)
```

No extra copy steps needed — s:CMS handles the rest.

---

### Step 4 — Customise the navigation menu

Open `src/layouts/BaseLayout.astro` and find the `<BSNavbar>` tag. A freshly created site starts with an empty menu (`menuItems={[]}`) — replace it with your links:

```js
<BSNavbar
  client:load
  menuItems={[
    { href: '/', label: 'Home' },
    { href: '/blog', label: 'Blog' },
  ]}
  currentPath={currentPath}
  ...
/>
```

Each entry needs a `label` and, usually, an `href`. The active link is worked out automatically from the current page — no `isActive` flag to set. Entries can also nest via `children` (up to 3 levels) for dropdown menus, e.g. `{ label: 'Docs', children: [{ href: '/docs/guides/getting-started', label: 'Getting Started' }] }`.

---

### Step 5 — Publish to GitHub Pages

**5a.** Create a new, empty repository on [GitHub](https://github.com/new), then push your site to it:

```bash
git init
git add .
git commit -m "Initial site setup"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/my-site.git
git push -u origin main
```

**5b.** In your repository on GitHub, go to **Settings → Pages**. Under "Source", select **"GitHub Actions"**.

**5c.** `scms-create` already included a working deploy workflow at `.github/workflows/deploy.yml` — you don't need to create anything. It builds with `npm run build` and publishes `dist/` on every push to `main`. Open it if you want to customize the Node version or add build steps.

**5d.** If your repository is not at the root of a domain (e.g. it will live at `https://username.github.io/my-site` rather than `https://username.github.io`), open `src/user.config.mjs` and also set the `base` path:

```js
export const userConfig = {
  site: 'https://YOUR-USERNAME.github.io/my-site',
  base: '/my-site',  // ← uncomment and fill in your repository name
};
```

Commit and push this change too — GitHub Actions will build and deploy your site automatically. After about a minute, visit `https://YOUR-USERNAME.github.io/my-site` — your site is live.

From now on, every time you push a change to the `main` branch, the site rebuilds and publishes itself.

---

### Quick reference

| Task | What to edit |
|---|---|
| Site title, description, author | `src/user.config.mjs` |
| Navigation links | `src/layouts/BaseLayout.astro` (the `menuItems` prop on `<BSNavbar>`) |
| Add a content collection | `npm run add-collection` |
| Add a content file | `npm run add-content` |
| Register a collection by hand | `src/content.config.ts` |
| Global colours and fonts | `src/styles/global.css` |
| Update the framework | `npm update @lad-sapienza/scms-core` |
