# Verifiche della migrazione ADS

Eseguite il 9 ottobre 2026. Revisione sCMS:
`2d4f6652b76719eeb34306f7febfd280dbe20879`.

## Riproducibilità e protezione dei sorgenti

- Installazione risolta senza `--force` o `--legacy-peer-deps`.
- Lockfile incluso; `npm ci` riproduce le dipendenze.
- `astro check`: nessun errore e nessun warning diagnostico; restano suggerimenti
  per import inutilizzati di componenti trasferiti dal progetto originale.
- `astro build`: 11 pagine statiche generate, oltre ad asset e sitemap.
- `npm run verify:upstream`: 70 file originali identici e 6 modifiche consentite
  alla configurazione o alle dipendenze. Nessun componente, CSS o layout
  originale del repository modificato. Il framework npm non è stato modificato.
- La build segnala deprecazioni Sass interne a Bootstrap e opzioni Vite usate
  dalle integrazioni originali; non impediscono la compilazione.
- L’adattatore dei comandi editoriali riconosce la raccolta ADS `pages`, senza
  modificare le raccolte dimostrative originali. Verificata la creazione di una
  pagina MDX temporanea con frontmatter completo, poi rimossa. Provato anche
  `images --help`.

## Test Directus live

| Richiesta | Risultato |
| --- | --- |
| `fonte`, campi usati dal catalogo e `limit=-1` | HTTP 200; 1.424 record |
| `bibliografia`, inclusi `fonti_menzionate.fonte_id.*` | HTTP 200; 805 record |
| Una scheda `fonte` con `fields=*.*.*` | HTTP 200 |
| `luogo_di_interesse` con `fields=*.*.*` | HTTP 403 |
| `persona` con `fields=*.*.*` | HTTP 403 |

Questi conteggi sono quelli restituiti dal server durante il controllo, e non
sostituiscono le cifre editoriali conservate nella homepage. HTTP 403 richiede
la verifica dei permessi o dell’istanza; non è un errore di compilazione Astro.

## Browser

Test sulla build statica, servita via HTTP, con Chromium headless. Per isolare
il comportamento del frontend dalla rete, le richieste API durante questi test
sono state servite con le risposte reali appena ottenute dai test live. Le
basemap esterne Carto/OSM non sono state incluse nel test automatico.

- Homepage, crediti, produzione, fonti, bibliografia, atlante, fonte, luogo,
  monumento e personaggio rispondono con HTTP 200 e titoli ADS.
- Verificata l’idratazione dei componenti React, senza eccezioni JavaScript.
- Catalogo fonti: caricamento, filtro cronologico originale, pulsante reset.
- Bibliografia: 805 risultati; filtro autore e stato con zero risultati.
- Scheda fonte: un collegamento `?tb=fonte&id=...` carica il record atteso.
- Atlante: Leaflet, marker aggregati, categorie delle fonti visibili, apertura
  delle schede; caricamento del GeoJSON locale incluso nel progetto.
  Con intervallo iniziale 1000–1500, i cluster rappresentano 340 associazioni,
  corrispondenti al filtro del dataset.
- Menu mobile: apertura verificata dopo la transizione di Bootstrap.
- Verificata anche una build con `ADS_BASE_PATH=/ads-test`, incluse navigazione,
  asset, atlante e richieste alle schede tramite la stessa suite browser.
- Controllo visuale delle pagine principali; nessun overflow orizzontale
  nelle pagine desktop e nella homepage a 390 px.
- Le schede luogo/monumento/personaggio senza parametri mostrano un messaggio
  di selezione del record. I dati completi delle due raccolte con HTTP 403
  non sono verificabili con i permessi forniti.

## Correzioni nel livello ADS

- Sostituito Gatsby Link con link standard che rispettano il base path Astro.
- Accesso Directus tramite le utility del nuovo pacchetto sCMS, con adattatori
  separati per le vecchie firme e i parametri `tb`/`id`.
- Leaflet caricato esclusivamente nel browser; CSS della mappa e dei cluster
  importati nel componente ADS.
- Adattamento dello slider CommonJS al rendering Astro/React 19.
- Relazioni bibliografiche nulle ignorate nella lista dei link: la pagina non
  si interrompe su due record restituiti dall’istanza.
- Hook di espansione delle note spostato in un componente React dedicato,
  senza troncare a metà i tag HTML.
- Aggiornamento del layer GeoJSON dopo il filtro cronologico, anche al primo
  caricamento, evitando che Leaflet conservi il dataset iniziale non filtrato.
- Menu mobile e accordion delle schede tramite Bootstrap JavaScript.
- Messaggi per caricamento e indisponibilità dei dati; gestione separata dei
  materiali mancanti già nel progetto Gatsby.

Non è stato eseguito alcun deploy e non sono stati modificati record Directus.
