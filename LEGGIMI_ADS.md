# ADS — dati scientifici su Directus

Questo aggiornamento sostituisce la configurazione dati della precedente migrazione Astro.

## Installazione dei file

Copiare il contenuto di `ADS_aggiornamento_Directus/` nella cartella del progetto,
conservando i percorsi e confermando le sostituzioni. Non serve reinstallare dipendenze.
Il file `.env` è nascosto su alcuni sistemi: assicurarsi di copiare anche questo.

Nel `.env`, sostituire `qui-il-tuo-token` con il proprio token:

```dotenv
PUBLIC_DIRECTUS_URL=https://db.lad-sapienza.it/sabant/
PUBLIC_DIRECTUS_TOKEN=qui-il-tuo-token
```

Arrestare il server eventualmente attivo e riavviarlo:

```bash
npm run dev
```

Aprire l’URL locale indicato nel terminale. Dopo un cambio di token, riavviare il
server. La configurazione usa variabili `PUBLIC_*`, disponibili al frontend.

## Base dati

Tutti i dati scientifici vengono richiesti esclusivamente a Directus. I CSV
esportati sono stati usati per riconoscere lo schema, non sono incorporati nel
sito né importati nel database. I vecchi file in `public/data` non vengono più
letti: possono rimanere sul disco senza incidere sul funzionamento.

Le raccolte interrogate sono:

- `fonte`;
- `bibliografia`;
- `luogo`;
- `fonte_luogo`;
- `fonte_bibliografia`.

Il token deve consentire la lettura delle cinque raccolte e dei campi elencati
in `src/ads/services/database.js`. Non servono permessi di scrittura.

Il sito ricostruisce le relazioni M:N tramite gli ID delle tabelle ponte.
Fonti e luoghi vengono collegati da `fonte_luogo`; fonti e opere bibliografiche
vengono collegati da `fonte_bibliografia`. I collegamenti tra bibliografia e
luoghi sono ricavati attraverso le fonti comuni. Relazioni prive di uno degli
estremi vengono ignorate, senza bloccare il sito.

La homepage mostra conteggi ricavati dalle raccolte, non numeri fissi.
Fonti e bibliografia mantengono filtri e paginazione. Il filtro Luogo della
bibliografia usa i luoghi effettivamente collegati tramite le fonti.
Le schede fonte espongono luoghi, tipo di associazione e riferimenti bibliografici;
le schede luogo espongono fonti e bibliografia delle fonti associate.
Le vecchie URL con `tb=luogo_di_interesse` sono compatibili e indirizzano a `luogo`.
Non viene più interrogata una raccolta `persona`, assente dallo schema.

I testi editoriali delle pagine, le immagini e i documenti grafici rimangono
nel progetto: le cinque tabelle fornite non includono una raccolta CMS per
questi contenuti. Tutti i record e le associazioni della ricerca usano Directus.

## Atlante e coordinate

L’atlante costruisce in memoria un GeoJSON dalle relazioni `fonte_luogo` e dal
campo `luogo.coordinates`, richiesti a Directus. Non usa coordinate locali,
fallback CSV, dati inventati o geocodifica automatica.

Il CSV fornito e il controllo dell’istanza live mostrano che tutte le 365 righe
di `luogo` hanno `coordinates` vuoto. Di conseguenza il fondo cartografico viene
caricato, ma non vengono creati marker. Tutti i luoghi rimangono consultabili
nell’elenco sotto la mappa e nelle loro schede.

Quando `coordinates` verrà popolato su Directus, i marker saranno disponibili
al caricamento successivo della pagina. Sono gestiti GeoJSON Point, Feature
contenente Point, array `[longitudine, latitudine]` e stringhe WKT `POINT(lon lat)`.
Le coordinate mancanti, fuori intervallo o non puntuali non sono disegnate.
Il filtro cronologico si applica alle fonti associate ai luoghi.

## Campi di fonte esclusi

Non sono richiesti né visualizzati i campi sempre vuoti nell’esportazione:
`Identificativo`, `ordinamento`, `data_cronica_da`, `data_cronica_a`, `data_traditio`,
`traditio`, `tipo_di_supporto`, `dimensioni`, `sigillo_attuale`, `sigillo_originale`.
Non vengono aggiunti controlli o filtri per questi campi. Anche `nome_riportato`,
sempre vuoto nella tabella ponte fornita, non viene usato.
Il campo relazionale `luoghi_fonte` di fonte non viene espanso: i collegamenti
sono letti direttamente dalla tabella ponte ufficiale `fonte_luogo`.

## Protezione del framework

Nessun componente, layout o CSS originale sCMS viene modificato da questo
aggiornamento. Tutto il codice dati e le schede sono in `src/ads/`; sono aggiornati
anche `.env` e `.env.example`. Le dipendenze e i parametri di GitHub Pages non
vengono modificati. Il lavoro riguarda l’avvio locale con npm.

```bash
npm run verify:upstream
```

Per produrre una compilazione statica dopo aver inserito il token:

```bash
npm run build
```

Il vecchio `dist/` non cambia copiando i sorgenti: ricompilarlo prima di usarlo.
Le vecchie verifiche di migrazione sono storiche; vedere
`migration/VERIFICHE_DIRECTUS.md` per l’aggiornamento corrente.
