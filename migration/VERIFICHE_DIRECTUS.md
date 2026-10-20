# Aggiornamento Directus — 9 ottobre 2026

## Raccolte e campi

La configurazione segue i nomi ufficiali nelle cinque esportazioni fornite.
Le richieste usano un elenco esplicito di campi, definito in
`src/ads/services/database.js`; i campi fonte sempre vuoti nell’esportazione
sono esclusi. Non viene richiesto `fields=*.*.*` al server.

Le esportazioni non sono importate nel sito e non limitano i risultati: le
richieste leggono i record attuali su Directus, con `limit=-1`.
Per esempio, il CSV fonte contiene 500 righe, mentre l’istanza restituisce
1.424 record. Il CSV è stato usato per riconoscere lo schema.

## Controlli live in sola lettura

Verificati endpoint e campi selezionati usando la configurazione disponibile
nel progetto originario, senza modificare dati o permessi sul server.
Il pacchetto di aggiornamento contiene soltanto il segnaposto per il token.

| Raccolta | Esito | Record |
| --- | --- | ---: |
| fonte | HTTP 200 | 1424 |
| bibliografia | HTTP 200 | 805 |
| luogo | HTTP 200 | 365 |
| fonte_luogo | HTTP 200 | 618 |
| fonte_bibliografia | HTTP 200 | 293 |

Tutti i 365 luoghi hanno `coordinates` vuoto. I dati cartografici precedenti
non vengono usati per integrare o correggere questi record.
Le associazioni incomplete sono ignorate nella ricostruzione dei collegamenti.

## Verifiche funzionali

- Tre test del modello dati superati: collegamenti bidirezionali M:N;
  conservazione di pagine bibliografiche specifiche di ciascuna fonte;
  costruzione dei punti con ID ufficiali e rifiuto di coordinate assenti/errate.
- Build Astro: pagine statiche generate con successo.
- Browser: homepage, cataloghi, schede, atlante e menu mobile verificati
  con le risposte reali dei controlli live, intercettate localmente per
  separare il comportamento del frontend dall’accesso alla rete.
- Caricamento dei cataloghi, filtro autore bibliografia, reset fonti,
  caricamento di una scheda fonte e di una scheda luogo con fonti associate.
- Atlante: nessun marker inventato; messaggio sui 365 luoghi senza coordinate
  e tutti i luoghi consultabili nell’elenco.
- Nessuna eccezione JavaScript nei test browser.
- Senza token: messaggio esplicito in homepage, atlante e fonti; nessuna
  richiesta API inviata con `qui-il-tuo-token`.
- Impronte SHA-256 dei sorgenti sCMS: nessuna ulteriore modifica al framework
  rispetto alla migrazione precedente. Gli aggiornamenti sono nel livello ADS.

Il token che verrà inserito dall’utente deve avere permessi di lettura sulle
cinque raccolte e sui campi richiesti. Non sono stati eseguiti deploy,
importazioni, geocodifiche o modifiche al database.
