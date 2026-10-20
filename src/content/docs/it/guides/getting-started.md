---
title: "Per iniziare"
description: "Da zero a un sito funzionante — nessuna esperienza di programmazione richiesta."
order: 1
---

Questa guida ti accompagna in tutto ciò che serve — nessuna esperienza di programmazione richiesta. Alla fine avrai un sito funzionante con i tuoi contenuti, pubblicato gratuitamente su GitHub Pages.

---

### Cosa ti serve

- Un account [GitHub](https://github.com) gratuito
- [Node.js](https://nodejs.org) installato sul tuo computer (scegli la versione "LTS")
- Un editor di codice — [Visual Studio Code](https://code.visualstudio.com) è gratuito e facile da usare
- Circa 30 minuti

---

### Passo 1 — Crea il tuo sito

Sul tuo computer, apri un terminale (su Mac: app Terminale; su Windows: Prompt dei comandi o PowerShell) ed esegui:

```bash
npx --package=@lad-sapienza/scms-core scms-create my-site
```

Ti verranno poste alcune domande (titolo del sito, descrizione, autore, URL del sito) — rispondi, e verrà creato un sito minimale con tutte le dipendenze già installate.

Al termine, avvia il server di anteprima locale:

```bash
cd my-site
npm run dev
```

Apri il browser su **http://localhost:4321** — dovresti vedere la homepage del tuo nuovo sito.

---

### Passo 2 — Personalizza il sito

Apri il file `src/user.config.mjs` nel tuo editor. Troverai due sezioni — `scms-create` le ha già compilate con le tue risposte, ma puoi modificarle in qualsiasi momento:

```js
export const userConfig = {
  site: 'https://TUO-USERNAME.github.io/my-site', // ← l'URL futuro del tuo sito
};

export const siteMetadata = {
  title: 'Il mio sito di ricerca',      // ← nome mostrato nella scheda del browser e nell'header
  description: 'Una breve descrizione', // ← usata dai motori di ricerca
  author: 'Il tuo nome',
};
```

Salva il file. L'anteprima nel browser si aggiorna automaticamente.

---

### Passo 3 — Aggiungi la tua prima collection di contenuti

Un sito appena creato parte senza alcuna collection di contenuti — `src/content.config.ts` è vuoto. Il modo più veloce per aggiungerne una:

```bash
npm run add-collection
```

Ti verrà chiesto un nome (es. `blog`) e un tipo (blog / docs / generica), dopodiché verranno creati lo schema in `src/content.config.ts`, un file di contenuto di esempio, e i template delle pagine di elenco + dettaglio — tutto ciò che serve per vederla funzionare subito con `npm run dev`.

#### Aggiungere un file di contenuto

Una volta che una collection esiste, aggiungere contenuto funziona allo stesso modo:

```bash
npm run add-content
```

Se la collection è organizzata in cartelle per lingua, lo script chiede anche in quale lingua va inserito il file (una singola lingua, oppure `all`). Vedi [Gestione dei contenuti](managing-content.md#multilingual-collections) per i dettagli.

Oppure crea il file a mano, es. `src/content/blog/il-mio-primo-post.md`:

```markdown
---
title: 'Il mio primo post'
description: 'Una breve descrizione di questo post'
date: 2026-01-01
author: 'Il tuo nome'
tags: ['novità']
---

Scrivi qui il tuo contenuto in testo semplice.

## Un titolo di sezione

Altro testo, **grassetto**, *corsivo*, [un link](https://example.com).
```

Il blocco tra le righe `---` si chiama **frontmatter** — contiene i metadati del post. Tutto ciò che sta sotto è il testo dell'articolo, scritto in semplice [Markdown](https://www.markdownguide.org/basic-syntax/).

Salva il file e controlla **http://localhost:4321/blog** — il tuo post appare immediatamente.

#### Aggiungere immagini

Metti i file immagine accanto al file di contenuto, nella stessa cartella:

```
src/content/blog/
├── il-mio-primo-post.md
└── il-mio-primo-post/
    └── foto.jpg
```

Poi richiamale nel post con un normale tag immagine Markdown:

```markdown
![Didascalia della foto](./il-mio-primo-post/foto.jpg)
```

Nessun passaggio di copia extra necessario — s:CMS si occupa del resto.

---

### Passo 4 — Personalizza il menu di navigazione

Apri `src/layouts/BaseLayout.astro` e trova il tag `<BSNavbar>`. Un sito appena creato parte con un menu vuoto (`menuItems={[]}`) — sostituiscilo con i tuoi link:

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

Ogni voce richiede un `label` e, di solito, un `href`. Il link attivo viene calcolato automaticamente dalla pagina corrente — nessun flag `isActive` da impostare. Le voci possono anche annidarsi tramite `children` (fino a 3 livelli) per menu a tendina, es. `{ label: 'Docs', children: [{ href: '/docs/guides/getting-started', label: 'Getting Started' }] }`.

---

### Passo 5 — Pubblica su GitHub Pages

**5a.** Crea un nuovo repository vuoto su [GitHub](https://github.com/new), poi carica il tuo sito:

```bash
git init
git add .
git commit -m "Initial site setup"
git branch -M main
git remote add origin https://github.com/TUO-USERNAME/my-site.git
git push -u origin main
```

**5b.** Nel tuo repository su GitHub, vai su **Settings → Pages**. Sotto "Source", seleziona **"GitHub Actions"**.

**5c.** `scms-create` ha già incluso un workflow di deploy funzionante in `.github/workflows/deploy.yml` — non devi creare nulla. Esegue la build con `npm run build` e pubblica `dist/` a ogni push su `main`. Aprilo se vuoi personalizzare la versione di Node o aggiungere passaggi di build.

**5d.** Se il tuo repository non è alla radice di un dominio (es. il sito vivrà su `https://username.github.io/my-site` anziché `https://username.github.io`), apri `src/user.config.mjs` e imposta anche il path `base`:

```js
export const userConfig = {
  site: 'https://TUO-USERNAME.github.io/my-site',
  base: '/my-site',  // ← decommenta e inserisci il nome del tuo repository
};
```

Fai commit e push anche di questa modifica — GitHub Actions costruirà e pubblicherà il sito automaticamente. Dopo circa un minuto, visita `https://TUO-USERNAME.github.io/my-site` — il tuo sito è online.

Da questo momento, ogni volta che fai push di una modifica sul branch `main`, il sito si ricostruisce e si ripubblica da solo.

---

### Riferimento rapido

| Cosa | Cosa modificare |
|---|---|
| Titolo, descrizione, autore del sito | `src/user.config.mjs` |
| Link di navigazione | `src/layouts/BaseLayout.astro` (la prop `menuItems` su `<BSNavbar>`) |
| Aggiungere una collection di contenuti | `npm run add-collection` |
| Aggiungere un file di contenuto | `npm run add-content` |
| Registrare una collection a mano | `src/content.config.ts` |
| Colori e font globali | `src/styles/global.css` |
| Aggiornare il framework | `npm update @lad-sapienza/scms-core` |
