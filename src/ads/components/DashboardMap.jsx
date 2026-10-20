import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, ScaleControl, useMap, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import useDatabase from "../services/useDatabase.js";
import { pointGeometry } from "../services/database.js";
import { assetUrl, localUrl } from "../services/paths.jsx";
import { documentTypes, relationTypes, periods, documentType, relationType, dateRange, dateLabel, year, normalize, plainText, matchesSource, recordsFor, groupPlaces } from "../services/atlas-model.js";
import "../styles/atlas.css";

const allTypes = documentTypes.map((t) => t.id), allRelations = relationTypes.map((r) => r.id);
const asset = (path) => assetUrl(`/ads-atlas/${path}`);
const sourceUrl = (s) => localUrl(`/fonte/?tb=fonte&id=${encodeURIComponent(s.id)}`);
const placeUrl = (p) => localUrl(`/luogo/?tb=luogo&id=${encodeURIComponent(p.id)}`);
function Icon({ name, light = false }) { return <img className="atlas-icon" src={asset(`icons/${name}${light ? "_avorio" : ""}.svg`)} alt="" aria-hidden="true" />; }
function Action({ icon, children, ...props }) { return <button type="button" {...props}><Icon name={icon} light />{children}</button>; }
function Relation({ association }) {
  const role = relationTypes.find((r) => r.id === relationType(association));
  return <span className={`atlas-relation role-${role.id}`} title={association.tipo_di_associazione || role.detail}><Icon name={role.id === "altro" ? "luogo" : role.id} />{role.id === "altro" && association.tipo_di_associazione ? association.tipo_di_associazione : role.detail}</span>;
}
function Dialog({ title, children, onClose }) {
  const ref = useRef(null);
  useEffect(() => { const dialog = ref.current; dialog.showModal(); return () => dialog.close(); }, []);
  return <dialog ref={ref} className="atlas-dialog" onClose={onClose} aria-labelledby="atlas-dialog-title">
    <header><h2 id="atlas-dialog-title">{title}</h2><button type="button" onClick={onClose} aria-label="Chiudi finestra"><Icon name="chiudi" /></button></header>{children}
  </dialog>;
}
function MapControl({ command, onBounds }) {
  const map = useMap();
  useMapEvents({ moveend: () => onBounds(map.getBounds()) });
  useEffect(() => { onBounds(map.getBounds()); }, [map]);
  useEffect(() => {
    if (!command) return;
    if (command.action === "zoom") map.setZoom(map.getZoom() + command.value);
    if (command.action === "place") map.flyTo(command.position, Math.max(map.getZoom(), 12));
    if (command.action === "fit") command.points.length ? map.fitBounds(command.points, { padding: [45, 45], maxZoom: 13 }) : map.setView([42.27, 12.8], 10);
    if (command.action === "resize") map.invalidateSize();
  }, [command, map]);
  return null;
}
function YearField({ label, value, min, max, onCommit }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => { const parsed = year(draft); if (parsed !== null) onCommit(parsed); setDraft(String(parsed === null ? value : Math.max(min, Math.min(max, parsed)))); };
  return <label>{label}<input type="number" aria-label={label === "Dal" ? "Imposta anno iniziale" : "Imposta anno finale"} min={min} max={max} value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} /></label>;
}
function mapIcon(group, selected) {
  const categories = [...new Set(group.records.map((r) => documentType(r.source)))];
  const type = categories.length === 1 ? categories[0] : "altro";
  return L.divIcon({ className: `atlas-map-marker${selected ? " is-selected" : ""}`, iconSize: [46, 54], iconAnchor: [23, 50], popupAnchor: [0, -42],
    html: `<img alt="" src="${asset(`markers/${type}${selected ? "_selezionato" : ""}.svg`)}" width="46" height="54" />${group.records.length > 1 ? `<span>${group.records.length}</span>` : ""}` });
}
function PlaceMarker({ group, selected, onSelect, onFocus }) {
  const point = pointGeometry(group.place.coordinates).coordinates;
  return <Marker position={[point[1], point[0]]} icon={mapIcon(group, selected)} sourceIds={group.records.map(r => String(r.source.id))} title={`${group.place.nome_luogo}: ${group.records.length} fonti`} eventHandlers={{ click: () => onSelect(String(group.place.id)) }}><Popup><div className="atlas-popup"><span>LUOGO DELL’ARCHIVIO</span><h3>{group.place.nome_luogo}</h3><p>{group.records.length} fonti · {[...new Set(group.records.flatMap(r => r.associations.map(a => relationTypes.find(t => t.id === relationType(a)).label)))].join(", ")}</p><button type="button" onClick={() => onFocus(group.place)}>Apri dossier</button><a href={placeUrl(group.place)}>Scheda del luogo ↗</a></div></Popup></Marker>;
}
function clusterIcon(cluster) {
  const sources = new Set();
  cluster.getAllChildMarkers().forEach((marker) => marker.options.sourceIds?.forEach((id) => sources.add(id)));
  return L.divIcon({ className: "atlas-cluster", html: `<span>${sources.size}</span>`, iconSize: [46, 46], iconAnchor: [23, 23] });
}
function downloadCSV(records) {
  const rows = [["fonte_id", "nome", "tipologia", "anno_da", "anno_a", "regesto", "luogo_id", "luogo", "relazione", "scheda_fonte"]];
  records.forEach(({ source, associations }) => (associations.length ? associations : [null]).forEach((a) => rows.push([
    source.id, source.nome, source.tipologia, dateRange(source)?.[0], dateRange(source)?.[1], plainText(source.regesto), a?.luogo_id.id, a?.luogo_id.nome_luogo, a?.tipo_di_associazione,
    new URL(sourceUrl(source), window.location.origin).href,
  ])));
  const escape = (value) => { let text = String(value ?? ""); if (/^[=+@-]/.test(text)) text = "'" + text; return '"' + text.replace(/"/g, '""') + '"'; };
  const url = URL.createObjectURL(new Blob(["\ufeff" + rows.map((row) => row.map(escape).join(";")).join("\r\n")], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = "atlante_fonti_selezione.csv"; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function SourceCard({ record, saved, compared, onSave, onCompare, onPlace }) {
  const { source, associations } = record;
  const type = documentType(source), text = plainText(source.regesto);
  return <article className="atlas-source-card">
    <div className="atlas-card-heading"><img src={asset(`icons/${type}.svg`)} alt="" /><div><span className="atlas-eyebrow">{source.tipologia || "Tipologia non specificata"}</span><h3>{source.nome || `Fonte ${source.id}`}</h3><strong>{dateLabel(source)}</strong></div></div>
    <p className="atlas-regesto">{text || "Regesto non disponibile."}</p>
    <div className="atlas-card-relations">{associations.length ? associations.map((a) => <div key={a.id}><Relation association={a} /><button type="button" onClick={() => onPlace(a.luogo_id)}><Icon name="luogo" />{a.luogo_id.nome_luogo}</button></div>) : <p>Nessun luogo associato.</p>}</div>
    <footer><a className="atlas-primary" href={sourceUrl(source)}>Apri scheda <Icon name="freccia" light /></a><button type="button" className={saved ? "is-saved" : ""} aria-label={`${saved ? "Rimuovi dai" : "Aggiungi ai"} preferiti: ${source.nome || source.id}`} aria-pressed={saved} onClick={() => onSave(String(source.id))}><Icon name="segnalibro" /></button><label><input type="checkbox" checked={compared} onChange={() => onCompare(String(source.id))} /> Confronta</label></footer>
  </article>;
}

export default function DashboardMap() {
  const { data: db, loading, error } = useDatabase();
  const [query, setQuery] = useState(""), [types, setTypes] = useState(allTypes), [relations, setRelations] = useState(allRelations);
  const [range, setRange] = useState([500, 1899]), [undated, setUndated] = useState(true);
  const [placeId, setPlaceId] = useState(null), [placeSearch, setPlaceSearch] = useState("");
  const [bounds, setBounds] = useState(null), [onlyVisible, setOnlyVisible] = useState(false), [onlyUnlocated, setOnlyUnlocated] = useState(false);
  const [sort, setSort] = useState("date"), [view, setView] = useState("grid"), [page, setPage] = useState(1);
  const [saved, setSaved] = useState([]), [onlySaved, setOnlySaved] = useState(false), [comparison, setComparison] = useState([]);
  const [dialog, setDialog] = useState(null), [notice, setNotice] = useState(""), [command, setCommand] = useState(null);
  const [basemap, setBasemap] = useState("osm"), [layers, setLayers] = useState(false), [fullscreen, setFullscreen] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);
  const mapArea = useRef(null), resultsArea = useRef(null);
  useEffect(() => { try { setSaved(JSON.parse(localStorage.getItem("ads-atlas-saved") || "[]").map(String)); } catch {} }, []);
  useEffect(() => {
    const update = () => { setFullscreen(document.fullscreenElement === mapArea.current); setCommand({ action: "resize", time: Date.now() }); };
    document.addEventListener("fullscreenchange", update); return () => document.removeEventListener("fullscreenchange", update);
  }, []);
  useEffect(() => { setPage(1); }, [query, types, relations, range, undated, placeId, onlyVisible, onlyUnlocated, onlySaved, sort]);
  const domain = useMemo(() => {
    const years = db?.fonte.flatMap((source) => dateRange(source) || []) || [];
    return [Math.min(500, ...years), Math.max(1899, ...years)];
  }, [db]);
  const candidates = useMemo(() => db?.fonte.filter((s) => matchesSource(s, query, range, undated)) || [], [db, query, range, undated]);
  const records = useMemo(() => recordsFor(candidates, types, relations), [candidates, types, relations]);
  const groups = useMemo(() => groupPlaces(records), [records]);
  const selectedPlace = db?.luogo.find((p) => String(p.id) === placeId);
  const dossier = groups.find((g) => String(g.place.id) === placeId);
  const filtered = useMemo(() => records.map((record) => ({ ...record, associations: record.associations.filter((a) => {
    if (placeId && String(a.luogo_id.id) !== placeId) return false;
    const point = pointGeometry(a.luogo_id.coordinates);
    if (onlyUnlocated && point) return false;
    if (onlyVisible && (!point || !bounds?.contains([point.coordinates[1], point.coordinates[0]]))) return false;
    return true;
  }) })).filter((record) => ((!placeId && !onlyUnlocated && !onlyVisible) || record.associations.length) && (!onlySaved || saved.includes(String(record.source.id)))).sort((a, b) => {
    if (sort === "title") return String(a.source.nome || "").localeCompare(String(b.source.nome || ""), "it");
    const da = dateRange(a.source), db = dateRange(b.source);
    if (!da) return db ? 1 : 0; if (!db) return -1;
    return sort === "date-desc" ? db[0] - da[0] : da[0] - db[0];
  }), [records, placeId, onlyUnlocated, onlyVisible, bounds, onlySaved, saved, sort]);
  const locatedGroups = useMemo(() => groupPlaces(filtered).filter(g => pointGeometry(g.place.coordinates)), [filtered]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / 8)), currentPage = Math.min(page, totalPages);
  const unlocatedPlaces = db?.luogo.filter((p) => !pointGeometry(p.coordinates)) || [];
  const typeCounts = Object.fromEntries(documentTypes.map((t) => [t.id, recordsFor(candidates, [t.id], relations).length]));
  const relationCounts = Object.fromEntries(relationTypes.map((r) => [r.id, new Set(candidates.filter((s) => types.includes(documentType(s))).flatMap((s) => s.luoghi_fonte.filter((a) => relationType(a) === r.id).map((a) => String(a.fonte_id.id)))).size]));
  const histSources = db?.fonte.filter((s) => matchesSource(s, query, domain, false) && types.includes(documentType(s)) && (s.luoghi_fonte.some((a) => relations.includes(relationType(a))) || (s.luoghi_fonte.length === 0 && relations.length === allRelations.length))) || [];
  const histogram = Array.from({ length: 70 }, (_, i) => { const begin = 500 + i * 20, end = 500 + (i + 1) * 20; return { begin, end, count: histSources.filter((s) => { const y = dateRange(s)?.[0]; return y >= begin && y < end; }).length }; });
  const histogramMax = Math.max(1, ...histogram.map((b) => b.count));
  const toggle = (id, values, setValues) => setValues(values.includes(id) ? values.filter((v) => v !== id) : [...values, id]);
  const focusPlace = (place) => { setPlaceId(String(place.id)); setPlaceSearch(""); const geometry = pointGeometry(place.coordinates); if (geometry) setCommand({ action: "place", position: [geometry.coordinates[1], geometry.coordinates[0]], time: Date.now() }); };
  useEffect(() => {
    if (!db) return;
    const id = new URLSearchParams(window.location.search).get("luogo");
    const place = db.luogo.find(p => String(p.id) === id);
    if (place) focusPlace(place);
  }, [db]);

  const save = (id) => { const next = saved.includes(id) ? saved.filter((v) => v !== id) : [...saved, id]; setSaved(next); try { localStorage.setItem("ads-atlas-saved", JSON.stringify(next)); } catch { setNotice("Il browser non consente di conservare i preferiti tra gli accessi."); } };
  const compare = (id) => { if (comparison.includes(id)) setComparison(comparison.filter((v) => v !== id)); else if (comparison.length < 4) { setComparison([...comparison, id]); setNotice(""); } else setNotice("Puoi confrontare fino a quattro fonti. Rimuovine una per aggiungerne un’altra."); };
  const reset = () => { setQuery(""); setTypes(allTypes); setRelations(allRelations); setRange(domain); setUndated(true); setPlaceId(null); setOnlyUnlocated(false); setOnlyVisible(false); setOnlySaved(false); setNotice(""); };
  const fit = () => setCommand({ action: "fit", points: locatedGroups.map((g) => { const p = pointGeometry(g.place.coordinates).coordinates; return [p[1], p[0]]; }), time: Date.now() });
  const searchPlaces = (db?.luogo || []).filter((p) => normalize(p.nome_luogo).includes(normalize(placeSearch))).sort((a, b) => a.nome_luogo.localeCompare(b.nome_luogo, "it"));
  const setYear = (position, value) => { const parsed = year(value); if (parsed === null) return; const clamped = Math.max(domain[0], Math.min(domain[1], parsed)); setRange(position === 0 ? [Math.min(clamped, range[1]), range[1]] : [range[0], Math.max(clamped, range[0])]); };
  async function toggleFullscreen() { try { if (document.fullscreenElement) await document.exitFullscreen(); else await mapArea.current.requestFullscreen(); } catch { setNotice("Il browser non consente la modalità a schermo intero."); } }
  return <div className="atlas-app" style={{ "--atlas-engraving": `url("${asset("backgrounds/cartografia_incisa.png")}")` }}>
    <header className="atlas-topbar"><div><span className="atlas-brand">ATLANTE DELLE FONTI</span><h1>Luoghi, documenti, relazioni</h1></div><div className="atlas-top-actions"><span>{db?.fonte.length ?? "—"} fonti · {db?.luogo.length ?? "—"} luoghi</span><Action icon="guida" onClick={() => setDialog("guide")}>Guida</Action><Action icon="esporta" onClick={() => downloadCSV(filtered)} disabled={!filtered.length}>Esporta</Action></div></header>
    {loading && <p className="atlas-status" role="status">Caricamento dell’archivio da Directus…</p>}
    {error && <p className="atlas-status atlas-error" role="alert">{error}</p>}
    <div className="atlas-workspace">
      <aside className="atlas-sidebar" data-expanded={mobileFilters} aria-label="Filtri dell’archivio"><div className="atlas-sidebar-heading"><h2>Esplora l’archivio</h2><button type="button" className="atlas-mobile-filter-toggle" aria-expanded={mobileFilters} aria-controls="atlas-filter-options" onClick={() => setMobileFilters(!mobileFilters)}>{mobileFilters ? "Chiudi filtri" : "Apri filtri"}</button></div><label className="atlas-search"><Icon name="ricerca" light /><input type="search" placeholder="Documenti, luoghi, persone…" aria-label="Cerca nell’archivio" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
        <div id="atlas-filter-options" className="atlas-filter-heading"><h3>Tipologie documentarie</h3><button type="button" onClick={() => setTypes(allTypes)}>Tutte</button></div>
        <div className="atlas-types">{documentTypes.map((t) => <button type="button" key={t.id} aria-pressed={types.includes(t.id)} onClick={() => setTypes(types.length === 1 && types[0] === t.id ? allTypes : [t.id])}><Icon name={t.id} light /><span>{t.label}</span><strong>{typeCounts[t.id]}</strong><span aria-hidden="true">{types.length === 1 && types[0] === t.id ? "✓" : "›"}</span></button>)}</div>
        <h3>Relazione con il luogo</h3><div className="atlas-role-filters">{relationTypes.map((r) => <label key={r.id}><input type="checkbox" checked={relations.includes(r.id)} onChange={() => toggle(r.id, relations, setRelations)} /><Icon name={r.id === "altro" ? "luogo" : r.id} light /><span>{r.label}</span><strong>{relationCounts[r.id]}</strong></label>)}</div>
        <div className="atlas-sidebar-extra"><button type="button" onClick={() => setDialog("places")}><Icon name="luogo" light /><span>{unlocatedPlaces.length} luoghi senza coordinate<small>Consulta l’elenco →</small></span></button><label><input type="checkbox" checked={onlyUnlocated} onChange={(e) => { setOnlyUnlocated(e.target.checked); if (e.target.checked) setOnlyVisible(false); }} /> Solo fonti con luoghi senza coordinate</label><label><input type="checkbox" checked={onlySaved} onChange={(e) => setOnlySaved(e.target.checked)} /> Preferiti ({saved.length})</label><Action icon="reset" onClick={reset}>Azzera filtri</Action></div>
      </aside>
      <section className="atlas-map-area" ref={mapArea} aria-label="Mappa dei luoghi delle fonti">
        <MapContainer className="atlas-map" center={[42.27, 12.8]} zoom={10} zoomControl={false} scrollWheelZoom>
          <TileLayer key={basemap} maxZoom={19} url={basemap === "osm" ? "https://tile.openstreetmap.org/{z}/{x}/{y}.png" : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"} attribution={basemap === "osm" ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'} />
          <ScaleControl position="bottomleft" imperial={false} /><MapControl command={command} onBounds={setBounds} />
          <MarkerClusterGroup key={`${types.join()}-${relations.join()}-${range.join()}-${query}-${undated}-${onlySaved}-${onlySaved ? saved.join() : ""}-${onlyUnlocated}-${onlyVisible}`} chunkedLoading={false} animate={false} animateAddingMarkers={false} showCoverageOnHover={false} iconCreateFunction={clusterIcon}>
            {locatedGroups.filter(group => String(group.place.id) !== placeId).map(group => <PlaceMarker key={group.place.id} group={group} selected={false} onSelect={setPlaceId} onFocus={focusPlace} />)}
          </MarkerClusterGroup>
          {locatedGroups.filter(group => String(group.place.id) === placeId).map(group => <PlaceMarker key={`selected-${group.place.id}`} group={group} selected onSelect={setPlaceId} onFocus={focusPlace} />)}
        </MapContainer>
        <div className="atlas-map-search"><label className="atlas-search"><Icon name="ricerca" light /><input type="search" aria-label="Cerca un luogo sulla mappa" placeholder="Cerca un luogo…" value={placeSearch} onChange={(e) => setPlaceSearch(e.target.value)} /></label>{placeSearch && <ul>{searchPlaces.slice(0, 12).map((p) => <li key={p.id}><button type="button" onClick={() => focusPlace(p)}>{p.nome_luogo}<small>{pointGeometry(p.coordinates) ? "Apri sulla mappa" : "Senza coordinate"}</small></button></li>)}{!searchPlaces.length && <li>Nessun luogo trovato.</li>}</ul>}</div>
        <div className="atlas-map-tools"><Action icon="livelli" aria-label="Scegli la mappa di base" aria-expanded={layers} onClick={() => setLayers(!layers)} /><Action icon="reset" aria-label="Inquadra tutti i risultati" onClick={fit} /><Action icon="fullscreen" aria-label={fullscreen ? "Esci dallo schermo intero" : "Mappa a schermo intero"} onClick={toggleFullscreen} /></div>
        {layers && <div className="atlas-layer-panel"><strong>Mappa di base</strong><label><input type="radio" name="atlas-basemap" value="osm" checked={basemap === "osm"} onChange={() => setBasemap("osm")} /> OpenStreetMap</label><label><input type="radio" name="atlas-basemap" value="light" checked={basemap === "light"} onChange={() => setBasemap("light")} /> CARTO chiara</label></div>}
        <div className="atlas-zoom"><Action icon="piu" aria-label="Aumenta lo zoom" onClick={() => setCommand({ action: "zoom", value: 1, time: Date.now() })} /><Action icon="meno" aria-label="Riduci lo zoom" onClick={() => setCommand({ action: "zoom", value: -1, time: Date.now() })} /></div>
        {selectedPlace && <aside className="atlas-dossier"><header><span>LUOGO SELEZIONATO</span><button type="button" aria-label="Chiudi dossier del luogo" onClick={() => setPlaceId(null)}><Icon name="chiudi" light /></button></header><div className="atlas-dossier-body"><div className="atlas-dossier-heading"><div><h2>{selectedPlace.nome_luogo}</h2><p>{selectedPlace.tipologia || "Luogo dell’archivio"}</p></div><img src={asset("infographics/fonte_relazioni.svg")} alt="La fonte e le relazioni con il luogo" /></div><p className="atlas-dossier-summary"><Icon name="scheda" />{dossier?.records.length || 0} fonti nei filtri attuali{!pointGeometry(selectedPlace.coordinates) && <span> · Senza coordinate</span>}</p><div className="atlas-dossier-records">{dossier?.records.length ? dossier.records.map((r) => <div key={r.source.id}><Icon name={documentType(r.source)} /><a href={sourceUrl(r.source)}><strong>{r.source.nome || `Fonte ${r.source.id}`}</strong><small>{dateLabel(r.source)}</small></a><div>{r.associations.map((a) => <Relation key={a.id} association={a} />)}</div></div>) : <p>Nessuna fonte corrisponde ai filtri selezionati.</p>}</div><footer><button type="button" className="atlas-primary" onClick={() => resultsArea.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>Esplora le fonti ↓</button><a href={placeUrl(selectedPlace)}>Scheda del luogo ↗</a></footer></div></aside>}
        <div className="atlas-map-legend"><span><Icon name="pergamena" /> Simbolo = tipologia · numero = fonti distinte</span><span>{locatedGroups.length} luoghi mappati</span></div>
      </section>
    </div>
    <section className="atlas-timeline" aria-labelledby="atlas-time-title"><div className="atlas-section-heading"><span>01 /</span><h2 id="atlas-time-title">Intervallo cronologico</h2><p>Seleziona un periodo per esplorare le fonti nel territorio.</p><button type="button" onClick={() => setRange(domain)}>Tutte le date ({domain[0]}–{domain[1]})</button><label><input type="checkbox" checked={undated} onChange={(e) => setUndated(e.target.checked)} /> Includi fonti senza data</label></div><div className="atlas-time-controls"><div className="atlas-periods">{periods.map((p) => <button type="button" key={p.start} style={{ "--period-color": p.color }} aria-pressed={range[0] === p.start && range[1] === p.end} onClick={() => setRange([p.start, p.end])}><strong>{p.label}</strong><small>{p.centuries}</small></button>)}</div><div className="atlas-histogram" role="img" aria-label="Distribuzione delle fonti dal 500 al 1899 per anno iniziale, prima del filtro cronologico. Ogni barra rappresenta un intervallo di anni.">{histogram.map((b, i) => <div key={i} className={b.end >= range[0] && b.begin <= range[1] ? "selected" : ""} style={{ height: `${Math.max(2, b.count / histogramMax * 100)}%`, background: periods.find((p) => b.begin >= p.start && b.begin <= p.end)?.color || "#7c746c" }} title={`${Math.floor(b.begin)}–${Math.ceil(b.end) - 1}: ${b.count} fonti`} />)}</div><div className="atlas-range-inputs"><label>Dal <output>{range[0]}</output><input type="range" aria-label="Anno iniziale" min={domain[0]} max={domain[1]} value={range[0]} onChange={(e) => setYear(0, e.target.value)} /></label><label>Al <output>{range[1]}</output><input type="range" aria-label="Anno finale" min={domain[0]} max={domain[1]} value={range[1]} onChange={(e) => setYear(1, e.target.value)} /></label></div><div className="atlas-time-ticks"><span>500</span><span>1000</span><span>1500</span><span>1899</span></div></div><div className="atlas-year-fields"><YearField label="Dal" value={range[0]} min={domain[0]} max={range[1]} onCommit={(value) => setYear(0, value)} /><YearField label="Al" value={range[1]} min={range[0]} max={domain[1]} onCommit={(value) => setYear(1, value)} /><small>Intervalli inclusivi. Le fonti datate su più anni sono selezionate per sovrapposizione.</small></div></section>
    <section className="atlas-results" ref={resultsArea} aria-labelledby="atlas-results-title"><div className="atlas-results-heading"><div><span className="atlas-eyebrow">02 / Fonti nel territorio</span><h2 id="atlas-results-title">{selectedPlace ? `Fonti a ${selectedPlace.nome_luogo}` : "Documenti dell’archivio"}</h2></div><div className="atlas-result-tools"><span role="status">{filtered.length} risultati</span><div className="atlas-view-switch"><Action icon="griglia" aria-label="Visualizza griglia" aria-pressed={view === "grid"} onClick={() => setView("grid")} /><Action icon="lista" aria-label="Visualizza elenco" aria-pressed={view === "list"} onClick={() => setView("list")} /></div><label>Ordina per<select value={sort} onChange={(e) => setSort(e.target.value)}><option value="date">Data crescente</option><option value="date-desc">Data decrescente</option><option value="title">Titolo</option></select></label></div></div>
      <div className="atlas-active-filters">{types.length < allTypes.length && <button type="button" onClick={() => setTypes(allTypes)}>{types.length ? types.map((t) => documentTypes.find((v) => v.id === t).label).join(", ") : "Nessuna tipologia"} ×</button>}{selectedPlace && <button type="button" onClick={() => setPlaceId(null)}>{selectedPlace.nome_luogo} ×</button>}{relations.length < allRelations.length && <button type="button" onClick={() => setRelations(allRelations)}>Relazioni selezionate ({relations.length}) ×</button>}{onlyUnlocated && <button type="button" onClick={() => setOnlyUnlocated(false)}>Senza coordinate ×</button>}{onlySaved && <button type="button" onClick={() => setOnlySaved(false)}>Preferiti ×</button>}<label><input type="checkbox" checked={onlyVisible} onChange={(e) => { setOnlyVisible(e.target.checked); if (e.target.checked) setOnlyUnlocated(false); }} /> Solo nell’area della mappa</label><span>{range[0]}–{range[1]}{undated ? " · incluse le fonti senza data" : ""}</span></div>
      {notice && <p className="atlas-notice" role="status">{notice}</p>}{comparison.length > 0 && <div className="atlas-compare-bar"><span>{comparison.length} fonti selezionate per il confronto</span><Action icon="confronta" disabled={comparison.length < 2} onClick={() => setDialog("compare")}>Confronta</Action><button type="button" onClick={() => setComparison([])}>Svuota selezione</button></div>}
      <div className={`atlas-source-list ${view}`}>{filtered.slice((currentPage - 1) * 8, currentPage * 8).map((record) => <SourceCard key={record.source.id} record={record} saved={saved.includes(String(record.source.id))} compared={comparison.includes(String(record.source.id))} onSave={save} onCompare={compare} onPlace={focusPlace} />)}</div>
      {!loading && !error && !filtered.length && <div className="atlas-empty"><Icon name="ricerca" light /><h3>Nessuna fonte corrisponde ai filtri.</h3><p>Prova a cambiare periodo, luogo o relazione.</p><button type="button" className="atlas-primary" onClick={reset}>Azzera filtri</button></div>}
      {filtered.length > 0 && <nav className="atlas-results-pagination" aria-label="Paginazione risultati dell’Atlante"><button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>← Precedenti</button><span role="status">{(currentPage - 1) * 8 + 1}–{Math.min(currentPage * 8, filtered.length)} di {filtered.length} · Pagina {currentPage} di {totalPages}</span><button type="button" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Successivi →</button></nav>}
    </section>
    {dialog === "guide" && <Dialog title="Come esplorare l’Atlante" onClose={() => setDialog(null)}><div className="atlas-guide"><p>La ricerca combina parole nei titoli, regesti, segnature, nomi di estensori e committenti e luoghi collegati. I filtri cronologici includono gli estremi e le fonti il cui intervallo si sovrappone alla selezione.</p><p>Seleziona una tipologia nella colonna sinistra. Le caselle delle relazioni permettono di combinare menzione, produzione, conservazione e committenza; sono consultabili anche le associazioni non specificate.</p><p>Ogni simbolo rappresenta un luogo: la tipologia indica le fonti collegate, oppure «Altro» quando sono di più tipi. I numeri mostrano fonti distinte, anche nei cluster. Clicca un luogo per aprirne il dossier e filtrare l’elenco sottostante.</p><p>Le fonti senza coordinate o senza luoghi associati restano nell’elenco. «Solo nell’area della mappa» considera invece esclusivamente luoghi georeferenziati nell’inquadratura attuale.</p><p>I conteggi nei filtri indicano fonti distinte e possono sovrapporsi: una fonte può avere più relazioni. L’istogramma conta le fonti dal 500 al 1899 per anno iniziale, prima del filtro cronologico. Le fonti fuori da questi periodi rimangono consultabili scegliendo «Tutte le date».</p><p>Puoi salvare preferiti nel browser, confrontare da due a quattro fonti ed esportare tutti i risultati filtrati in CSV. L’esportazione conserva una riga per ciascuna associazione luogo–fonte.</p></div></Dialog>}
    {dialog === "places" && <Dialog title="Luoghi senza coordinate" onClose={() => setDialog(null)}><div className="atlas-place-list"><p>{unlocatedPlaces.length} luoghi dell’archivio non hanno una posizione utilizzabile sulla mappa.</p>{unlocatedPlaces.sort((a, b) => a.nome_luogo.localeCompare(b.nome_luogo, "it")).map((p) => <div key={p.id}><button type="button" onClick={() => { focusPlace(p); setDialog(null); }}>{p.nome_luogo}</button><span>{p.fonti.length} associazioni</span><a href={placeUrl(p)}>Scheda ↗</a></div>)}</div></Dialog>}
    {dialog === "compare" && <Dialog title="Confronto delle fonti" onClose={() => setDialog(null)}><div className="atlas-comparison">{comparison.map((id) => db?.fonte.find((s) => String(s.id) === id)).filter(Boolean).map((source) => <article key={source.id}><h3>{source.nome || `Fonte ${source.id}`}</h3><dl><dt>Tipologia</dt><dd>{source.tipologia || "—"}</dd><dt>Data</dt><dd>{dateLabel(source)}</dd><dt>Estensore</dt><dd>{source.estensore_nome || source.estensore_tipologia || "—"}</dd><dt>Committente</dt><dd>{source.committente_nome || "—"}</dd><dt>Segnatura</dt><dd>{source.segnatura_archivistica || "—"}</dd><dt>Luoghi e relazioni</dt><dd>{source.luoghi_fonte.map((a) => <div key={a.id}>{a.luogo_id.nome_luogo}<Relation association={a} /></div>)}</dd><dt>Regesto</dt><dd>{plainText(source.regesto) || "—"}</dd></dl><a className="atlas-primary" href={sourceUrl(source)}>Apri scheda ↗</a></article>)}</div></Dialog>}
  </div>;
}
