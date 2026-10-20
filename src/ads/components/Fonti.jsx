import React, { useEffect, useMemo, useRef, useState } from "react";
import useDatabase from "../services/useDatabase.js";
import { assetUrl, localUrl } from "../services/paths.jsx";
import { normalize, plainText, dateRange, dateLabel, relationTypes, relationType, periods, year } from "../services/atlas-model.js";
import { catalogTypes, catalogType, facetOptions, initialFilters, matchesCatalog, pageNumbers } from "../services/catalog-model.js";
import "../styles/catalog.css";

const allScopes = ["title", "regesto", "people", "places", "segnatura"];
const scopeLabels = { title: "Titolo", regesto: "Regesto", people: "Nomi di persone", places: "Luoghi collegati", segnatura: "Segnatura" };
const asset = (path) => assetUrl(`/ads-catalog/${path}`);
const sourceUrl = (source) => localUrl(`/fonte/?tb=fonte&id=${encodeURIComponent(source.id)}`);
const placeUrl = (place) => localUrl(`/luogo/?tb=luogo&id=${encodeURIComponent(place.id)}`);
function Icon({ name, light = false }) { return <img className="catalog-icon" src={asset(`icons/${name}${light ? "_avorio" : ""}.svg`)} alt="" aria-hidden="true" />; }
function YearField({ label, value, min, max, onCommit }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  function commit() { const parsed = year(draft); if (parsed !== null) onCommit(Math.max(min, Math.min(max, parsed))); setDraft(String(parsed === null ? value : Math.max(min, Math.min(max, parsed)))); }
  return <label>{label}<input type="number" aria-label={label === "Dal" ? "Anno iniziale del catalogo" : "Anno finale del catalogo"} min={min} max={max} value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} /></label>;
}
function Facet({ title, options, selected, onToggle, nameValue, onNameChange, nameLabel, initiallyOpen = true }) {
  const [search, setSearch] = useState("");
  const visible = options.filter((option) => normalize(option.label).includes(normalize(search)));
  return <details className="catalog-filter-group" open={initiallyOpen || undefined}><summary>{title}{selected.length > 0 && <span>{selected.length}</span>}</summary>
    {nameLabel && <label className="catalog-field-label">{nameLabel}<input type="search" placeholder={nameLabel} value={nameValue} onChange={(e) => onNameChange(e.target.value)} /></label>}
    <label className="catalog-small-search"><Icon name="ricerca" light /><input type="search" aria-label={`Cerca tra ${title.toLowerCase()}`} placeholder="Cerca tra i valori…" value={search} onChange={(e) => setSearch(e.target.value)} /></label>
    <div className="catalog-facet-options">{visible.map((option) => <label key={option.id}><input type="checkbox" checked={selected.includes(option.id)} onChange={() => onToggle(option.id)} />{option.icon && <Icon name={option.icon} light />}<span>{option.label}</span><small>{option.count}</small></label>)}{!visible.length && <p>Nessun valore trovato.</p>}</div>
  </details>;
}
function Metadata({ icon, label, name, type }) {
  const text = plainText(name), kind = plainText(type);
  return <div className="catalog-metadata-item"><Icon name={icon} /><div><span>{label}</span><strong>{text || "Non indicato"}</strong>{kind && normalize(kind) !== normalize(text) && <small>{kind}</small>}</div></div>;
}
function CatalogCard({ source, saved, onSave }) {
  const [expanded, setExpanded] = useState(false), [allPlaces, setAllPlaces] = useState(false);
  const type = catalogType(source), associations = source.luoghi_fonte || [], text = plainText(source.regesto);
  return <article className="catalog-card">
    <header><div className="catalog-document-icon"><Icon name={type.toLowerCase()} /></div><div className="catalog-card-title"><span className="catalog-type-badge">{source.tipologia || "Tipologia non indicata"}</span><h2><a href={sourceUrl(source)}>{source.nome || `Fonte ${source.id}`}</a></h2></div><div className="catalog-date" title={plainText(source.data_precisa_se_nota || source.datazione)}>{dateLabel(source)}</div></header>
    <div className="catalog-card-metadata"><Metadata icon="persona" label="Estensore" name={source.estensore_nome} type={source.estensore_tipologia} /><Metadata icon="committenza" label="Committente" name={source.committente_nome} type={source.committente_tipologia} /><Metadata icon="scheda" label="Segnatura archivistica" name={source.segnatura_archivistica} />{source.autore && <Metadata icon="persona" label="Autore" name={source.autore} />}{source.luogo_conservazione && <Metadata icon="conservazione" label="Conservazione" name={source.luogo_conservazione} />}</div>
    <div className="catalog-regesto"><span className="catalog-field-heading">Regesto</span><p className={expanded ? "" : "is-collapsed"}>{text || "Regesto non disponibile."}</p>{text.length > 250 && <button type="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? "Riduci regesto" : "Leggi tutto"}</button>}</div>
    <footer><div className="catalog-card-places"><span><Icon name="luogo" />Luoghi collegati</span><div>{associations.length ? associations.slice(0, allPlaces ? associations.length : 6).map((a) => {
      const role = relationTypes.find((r) => r.id === relationType(a));
      return <a key={a.id} className={`catalog-place-chip role-${role.id}`} href={placeUrl(a.luogo_id)} title={a.tipo_di_associazione || role.label}>{a.luogo_id.nome_luogo} · {a.tipo_di_associazione || "Relazione non specificata"}</a>;
    }) : <small>Nessun luogo associato</small>}{associations.length > 6 && <button type="button" onClick={() => setAllPlaces(!allPlaces)} aria-expanded={allPlaces}>{allPlaces ? "Riduci" : `+${associations.length - 6} associazioni`}</button>}</div></div><div className="catalog-card-actions"><button type="button" className={saved ? "is-saved" : ""} aria-pressed={saved} aria-label={`${saved ? "Rimuovi dai" : "Aggiungi ai"} preferiti: ${source.nome || source.id}`} onClick={() => onSave(String(source.id))}><Icon name="segnalibro" /></button><a className="catalog-primary" href={sourceUrl(source)}>Apri scheda della fonte <Icon name="freccia" light /></a></div></footer>
    {source.bibliografia?.length > 0 && <div className="catalog-bibliography-count">{source.bibliografia.length} riferimenti bibliografici nella scheda della fonte</div>}
  </article>;
}
function Pagination({ page, total, onChange, position }) {
  return <nav className="catalog-pagination" aria-label={`Paginazione ${position}`}><button type="button" aria-label={`Pagina precedente (${position})`} disabled={page <= 1} onClick={() => onChange(page - 1)}><Icon name="chevron_sinistra" light /></button>{pageNumbers(page, total).map((value) => typeof value === "number" ? <button type="button" key={value} aria-current={value === page ? "page" : undefined} aria-label={`Pagina ${value} (${position})`} onClick={() => onChange(value)}>{value}</button> : <span key={value}>…</span>)}<button type="button" aria-label={`Pagina successiva (${position})`} disabled={page >= total} onClick={() => onChange(page + 1)}><Icon name="chevron_destra" light /></button></nav>;
}
function Guide({ onClose }) {
  const ref = useRef(null);
  useEffect(() => { const dialog = ref.current; dialog.showModal(); return () => dialog.close(); }, []);
  return <dialog className="catalog-guide" ref={ref} aria-labelledby="catalog-guide-title" onClose={onClose}><header><h2 id="catalog-guide-title">Cercare e filtrare le fonti</h2><button type="button" aria-label="Chiudi guida" onClick={onClose}><Icon name="chiudi" /></button></header><div><p>Digita parole nella ricerca e premi Cerca o Invio. La ricerca avanzata permette di scegliere i campi: titolo, regesto, nomi, luoghi collegati e segnatura. Tutte le parole devono essere presenti nei campi selezionati.</p><p>I filtri si aggiornano subito. Nello stesso gruppo più caselle indicano alternative; gruppi diversi si combinano tra loro. I conteggi dei valori si riferiscono all’intero archivio, prima dei filtri.</p><p>Il luogo e la relazione devono appartenere alla stessa associazione: una menzione altrove non soddisfa il filtro di produzione per un altro luogo. La conservazione cerca sia il campo della fonte sia i luoghi collegati come «conservata a».</p><p>Le date hanno estremi inclusivi. Le fonti datate su più anni sono selezionate per sovrapposizione; quelle senza data possono essere incluse. «Tutte le date» recupera anche gli anni fuori dai tre periodi del progetto.</p><p>I preferiti sono condivisi con l’Atlante e conservati in questo browser. L’esportazione CSV contiene tutti i risultati filtrati, anche quelli nelle altre pagine. I metadati e le relazioni provengono da Directus.</p></div></dialog>;
}
function exportResults(sources) {
  const fields = ["id", "nome", "tipologia", "anno_produzione", "anno_produzione_fine", "data_precisa_se_nota", "datazione", "estensore_nome", "estensore_tipologia", "committente_nome", "committente_tipologia", "autore", "segnatura_archivistica", "luogo_conservazione", "regesto"];
  const rows = [[...fields, "luoghi_e_relazioni", "scheda_fonte"], ...sources.map((s) => [...fields.map((field) => plainText(s[field])), s.luoghi_fonte.map((a) => `${a.luogo_id.nome_luogo}: ${a.tipo_di_associazione || "Non specificata"}`).join(" | "), new URL(sourceUrl(s), window.location.origin).href])];
  const escape = (value) => { let text = String(value ?? ""); if (/^[=+@-]/.test(text)) text = "'" + text; return '"' + text.replace(/"/g, '""') + '"'; };
  const url = URL.createObjectURL(new Blob(["\ufeff" + rows.map((row) => row.map(escape).join(";")).join("\r\n")], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a"); a.href = url; a.download = "catalogo_fonti_risultati.csv"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function FontiPage() {
  const { data: db, loading, error } = useDatabase();
  const [draftQuery, setDraftQuery] = useState(""), [query, setQuery] = useState(""), [scopes, setScopes] = useState(allScopes), [advanced, setAdvanced] = useState(false);
  const [filters, setFilters] = useState(initialFilters), [selectedRange, setSelectedRange] = useState(null);
  const [saved, setSaved] = useState([]), [notice, setNotice] = useState(""), [guide, setGuide] = useState(false);
  const [view, setView] = useState("list"), [sort, setSort] = useState("title"), [page, setPage] = useState(1), [mobileFilters, setMobileFilters] = useState(false);
  const size = view === "list" ? 4 : 6;
  const resultsRef = useRef(null);
  useEffect(() => { try { const ids = JSON.parse(localStorage.getItem("ads-atlas-saved") || "[]"); if (Array.isArray(ids)) setSaved(ids.map(String)); } catch {} }, []);
  const domain = useMemo(() => { const years = db?.fonte.flatMap((s) => dateRange(s) || []) || []; return [Math.min(500, ...years), Math.max(1899, ...years)]; }, [db]);
  const range = selectedRange || domain;
  const results = useMemo(() => (db?.fonte || []).filter((s) => matchesCatalog(s, { query, scopes, range, filters, saved })).sort((a, b) => {
    if (sort === "title") return String(a.nome || "").localeCompare(String(b.nome || ""), "it");
    const da = dateRange(a), db = dateRange(b); if (!da) return db ? 1 : 0; if (!db) return -1;
    return sort === "date-desc" ? db[0] - da[0] : da[0] - db[0];
  }), [db, query, scopes, range, filters, saved, sort]);
  useEffect(() => setPage(1), [query, scopes, filters, selectedRange, size, sort]);
  const totalPages = Math.max(1, Math.ceil(results.length / size)), currentPage = Math.min(page, totalPages);
  const sources = results.slice((currentPage - 1) * size, currentPage * size);
  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  const toggleFilter = (key, value) => setFilter(key, filters[key].includes(value) ? filters[key].filter((v) => v !== value) : [...filters[key], value]);
  const reset = () => { setFilters(initialFilters()); setSelectedRange(null); setQuery(""); setDraftQuery(""); setScopes(allScopes); setPage(1); setNotice(""); };
  const save = (id) => { const next = saved.includes(id) ? saved.filter((v) => v !== id) : [...saved, id]; setSaved(next); try { localStorage.setItem("ads-atlas-saved", JSON.stringify(next)); } catch { setNotice("Il browser non consente di conservare i preferiti tra gli accessi."); } };
  const submitSearch = (event) => { event.preventDefault(); if (!scopes.length && draftQuery.trim()) { setNotice("Seleziona almeno un campo nella ricerca avanzata."); return; } setQuery(draftQuery.trim()); setPage(1); setNotice(""); };
  const goToPage = (value) => { setPage(value); resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const typeOptions = catalogTypes.map((type) => ({ id: type, label: type, icon: type.toLowerCase(), count: db?.fonte.filter((s) => catalogType(s) === type).length || 0 }));
  const extOptions = useMemo(() => facetOptions(db?.fonte || [], "estensore_tipologia"), [db]);
  const clientOptions = useMemo(() => facetOptions(db?.fonte || [], "committente_tipologia"), [db]);
  const placeOptions = useMemo(() => (db?.luogo || []).map((p) => ({ id: String(p.id), label: p.nome_luogo, count: new Set(p.fonti.map((a) => String(a.fonte_id.id))).size })).sort((a, b) => a.label.localeCompare(b.label, "it")), [db]);
  const roleOptions = relationTypes.map((r) => ({ ...r, count: new Set(db?.fonte_luogo.filter((a) => relationType(a) === r.id).map((a) => String(a.fonte_id.id))).size || 0 }));
  const chips = [
    ...filters.types.map((id) => ({ key: "types", id, label: id })),
    ...filters.extRoles.map((id) => ({ key: "extRoles", id, label: `Estensore: ${extOptions.find((o) => o.id === id)?.label || id}` })),
    ...filters.clientRoles.map((id) => ({ key: "clientRoles", id, label: `Committente: ${clientOptions.find((o) => o.id === id)?.label || id}` })),
    ...filters.places.map((id) => ({ key: "places", id, label: placeOptions.find((o) => o.id === id)?.label || id })),
    ...filters.relations.map((id) => ({ key: "relations", id, label: relationTypes.find((r) => r.id === id)?.label || id })),
  ];
  return <div className="catalog-app">
    <header className="catalog-hero"><div><span className="catalog-kicker">CATALOGO DELLE FONTI</span><h1>Cerca nell’archivio</h1><p>Fonti documentarie, persone e luoghi: esplora la collezione attraverso i suoi dati.</p></div><div className="catalog-hero-right"><div className="catalog-total"><Icon name="scheda" light /><strong>{db?.fonte.length ?? "—"}</strong><span>fonti</span></div><div><button type="button" onClick={() => setGuide(true)}><Icon name="guida" light />Guida</button><button type="button" disabled={!results.length} onClick={() => exportResults(results)}><Icon name="esporta" light />Esporta risultati</button></div></div></header>
    <form className="catalog-search-form" onSubmit={submitSearch}><label><Icon name="ricerca" light /><input type="search" aria-label="Cerca nel catalogo" placeholder="Cerca nel titolo, nel regesto o nei nomi…" value={draftQuery} onChange={(e) => setDraftQuery(e.target.value)} /></label><button type="submit" className="catalog-primary">Cerca</button><button type="button" className="catalog-advanced-toggle" aria-expanded={advanced} aria-controls="catalog-advanced" onClick={() => setAdvanced(!advanced)}>Ricerca avanzata <Icon name="chevron_giu" light /></button></form>
    {advanced && <div id="catalog-advanced" className="catalog-advanced"><strong>Cerca nei campi:</strong>{allScopes.map((scope) => <label key={scope}><input type="checkbox" checked={scopes.includes(scope)} onChange={() => setScopes(scopes.includes(scope) ? scopes.filter((v) => v !== scope) : [...scopes, scope])} />{scopeLabels[scope]}</label>)}<small>Per un testo non vuoto, seleziona almeno un campo. I nomi riguardano estensori, committenti e autori registrati.</small></div>}
    {loading && <p className="catalog-status" role="status">Caricamento del catalogo da Directus…</p>}{error && <p className="catalog-status error" role="alert">{error}</p>}{notice && <p className="catalog-status" role="status">{notice}</p>}
    <div className="catalog-body"><aside className="catalog-filters" data-expanded={mobileFilters} aria-label="Filtri del catalogo"><header><h2>Filtra le fonti</h2><button type="button" onClick={reset}>Azzera filtri</button><button type="button" className="catalog-mobile-toggle" aria-expanded={mobileFilters} aria-controls="catalog-filter-content" onClick={() => setMobileFilters(!mobileFilters)}>{mobileFilters ? "Chiudi filtri" : "Apri filtri"}</button></header><div id="catalog-filter-content">
      <Facet title="Tipologia documentaria" options={typeOptions} selected={filters.types} onToggle={(id) => toggleFilter("types", id)} initiallyOpen />
      <details className="catalog-filter-group" open><summary>Datazione</summary><div className="catalog-year-fields"><YearField label="Dal" value={range[0]} min={domain[0]} max={range[1]} onCommit={(value) => setSelectedRange([value, range[1]])} /><YearField label="Al" value={range[1]} min={range[0]} max={domain[1]} onCommit={(value) => setSelectedRange([range[0], value])} /></div><div className="catalog-period-buttons">{periods.map((p) => <button type="button" key={p.start} aria-label={p.label} aria-pressed={range[0] === p.start && range[1] === p.end} onClick={() => setSelectedRange([p.start, p.end])}>{p.centuries.replace(" secolo", "")}</button>)}</div><button type="button" className="catalog-text-button" onClick={() => setSelectedRange(null)}>Tutte le date ({domain[0]}–{domain[1]})</button><label className="catalog-check"><input type="checkbox" checked={filters.undated} onChange={(e) => setFilter("undated", e.target.checked)} />Includi fonti senza data</label></details>
      <Facet title="Estensore" options={extOptions} selected={filters.extRoles} onToggle={(id) => toggleFilter("extRoles", id)} initiallyOpen nameLabel="Nome dell’estensore" nameValue={filters.extName} onNameChange={(value) => setFilter("extName", value)} />
      <Facet title="Committente" options={clientOptions} selected={filters.clientRoles} onToggle={(id) => toggleFilter("clientRoles", id)} nameLabel="Nome del committente" nameValue={filters.clientName} onNameChange={(value) => setFilter("clientName", value)} />
      <Facet title="Luogo collegato" options={placeOptions} selected={filters.places} onToggle={(id) => toggleFilter("places", id)} />
      <details className="catalog-filter-group" open><summary>Relazione con il luogo{filters.relations.length > 0 && <span>{filters.relations.length}</span>}</summary>{roleOptions.map((r) => <label className="catalog-check" key={r.id}><input type="checkbox" checked={filters.relations.includes(r.id)} onChange={() => toggleFilter("relations", r.id)} /><span>{r.label}</span><small>{r.count}</small></label>)}</details>
      <details className="catalog-filter-group" open><summary>Conservazione</summary><label className="catalog-field-label">Luogo o istituto di conservazione<input type="search" placeholder="Cerca luogo o istituto…" value={filters.conservation} onChange={(e) => setFilter("conservation", e.target.value)} /></label></details>
      <label className="catalog-check catalog-saved-filter"><input type="checkbox" checked={filters.savedOnly} onChange={(e) => setFilter("savedOnly", e.target.checked)} /><Icon name="segnalibro" light />Solo preferiti ({saved.length})</label><p className="catalog-filter-help">I filtri si combinano e aggiornano subito i risultati.</p><button type="button" className="catalog-primary catalog-jump" onClick={() => { setMobileFilters(false); resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}><Icon name="filtri" light />Vai ai risultati</button>
    </div></aside>
    <section className="catalog-results" ref={resultsRef} aria-label="Risultati del catalogo"><header className="catalog-results-toolbar"><div><p role="status"><strong>{results.length} risultati</strong><span>Pagina {currentPage} di {totalPages}</span></p><small>{query ? `Ricerca: «${query}»` : "Tutte le fonti"} · {range[0]}–{range[1]}{filters.undated ? " · incluse le fonti senza data" : ""}</small></div><div className="catalog-result-controls"><label className="catalog-sort">Ordina per<select value={sort} onChange={(e) => setSort(e.target.value)}><option value="title">Titolo</option><option value="date">Data crescente</option><option value="date-desc">Data decrescente</option></select></label><div className="catalog-view"><button type="button" aria-label="Visualizza elenco" aria-pressed={view === "list"} onClick={() => setView("list")}><Icon name="lista" light /></button><button type="button" aria-label="Visualizza griglia" aria-pressed={view === "grid"} onClick={() => setView("grid")}><Icon name="griglia" light /></button></div></div></header>
      <div className="catalog-chips">{query && <button type="button" onClick={() => { setQuery(""); setDraftQuery(""); }}>Ricerca: {query} ×</button>}{chips.map((chip) => <button type="button" key={`${chip.key}-${chip.id}`} onClick={() => toggleFilter(chip.key, chip.id)}>{chip.label} ×</button>)}{["extName", "clientName", "conservation"].filter((key) => filters[key]).map((key) => <button type="button" key={key} onClick={() => setFilter(key, "")}>{key === "extName" ? "Estensore" : key === "clientName" ? "Committente" : "Conservazione"}: {filters[key]} ×</button>)}{filters.savedOnly && <button type="button" onClick={() => setFilter("savedOnly", false)}>Preferiti ×</button>}</div>
      {results.length > 0 && <Pagination page={currentPage} total={totalPages} onChange={goToPage} position="superiore" />}
      <div className={`catalog-card-list ${view}`}>{sources.map((source) => <CatalogCard key={source.id} source={source} saved={saved.includes(String(source.id))} onSave={save} />)}</div>
      {!loading && !error && !results.length && <div className="catalog-empty"><Icon name="ricerca" light /><h2>Nessuna fonte corrisponde alla ricerca.</h2><p>Modifica il testo o rimuovi alcuni filtri.</p><button type="button" className="catalog-primary" onClick={reset}>Azzera filtri</button></div>}
      <footer className="catalog-results-footer"><span>Mostrati {results.length ? (currentPage - 1) * size + 1 : 0}–{Math.min(currentPage * size, results.length)} di {results.length}</span><span className="catalog-fixed-size">{size} fonti per pagina</span>{results.length > 0 && <Pagination page={currentPage} total={totalPages} onChange={goToPage} position="inferiore" />}</footer>
    </section></div>{guide && <Guide onClose={() => setGuide(false)} />}
  </div>;
}
