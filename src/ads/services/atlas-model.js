export const documentTypes = [
  { id: "pergamena", label: "Pergamene" },
  { id: "manoscritto", label: "Manoscritti" },
  { id: "registro", label: "Registri" },
  { id: "altro", label: "Altro" },
];
export const relationTypes = [
  { id: "menzione", label: "Menzione", detail: "Menzionato nella fonte" },
  { id: "produzione", label: "Produzione", detail: "Luogo di produzione" },
  { id: "conservazione", label: "Conservazione", detail: "Luogo di conservazione" },
  { id: "committenza", label: "Committenza", detail: "Luogo di committenza" },
  { id: "altro", label: "Non specificata / altra", detail: "Relazione non specificata" },
];
export const periods = [
  { label: "Alto Medioevo", centuries: "VI–X secolo", start: 500, end: 999, color: "#566773" },
  { label: "Basso Medioevo", centuries: "XI–XV secolo", start: 1000, end: 1499, color: "#8c1927" },
  { label: "Età moderna", centuries: "XVI–XIX secolo", start: 1500, end: 1899, color: "#9b7945" },
];
export const normalize = (value) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
export function documentType(source) {
  const type = normalize(source.tipologia);
  if (type.startsWith("perg")) return "pergamena";
  if (type.startsWith("manoscri")) return "manoscritto";
  if (type.startsWith("registr")) return "registro";
  return "altro";
}
export function relationType(association) {
  const role = normalize(association.tipo_di_associazione);
  if (role.includes("menzion")) return "menzione";
  if (role.includes("prodott") || role.includes("produzion")) return "produzione";
  if (role.includes("conserv")) return "conservazione";
  if (role.includes("commission") || role.includes("committen")) return "committenza";
  return "altro";
}
export function year(value) {
  if (value == null || String(value).trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? Math.trunc(number) : null;
}
export function dateRange(source) {
  const a = year(source.anno_produzione), b = year(source.anno_produzione_fine);
  if (a === null && b === null) return null;
  return [Math.min(a ?? b, b ?? a), Math.max(a ?? b, b ?? a)];
}
export function dateLabel(source) {
  const range = dateRange(source);
  return range ? (range[0] === range[1] ? String(range[0]) : `${range[0]}–${range[1]}`) : (source.datazione || "Data non disponibile");
}
const entityCache = new Map(Object.entries({ amp: "&", nbsp: " ", apos: "'", quot: '"', lt: "<", gt: ">", agrave: "à", egrave: "è", eacute: "é", igrave: "ì", ograve: "ò", ugrave: "ù", ndash: "–", mdash: "—", hellip: "…" }));
export function plainText(value) {
  const text = String(value ?? "").replace(/<[^>]*>/g, " ");
  return text.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z][a-z\d]+);/gi, (match, name) => {
    if (name.startsWith("#")) {
      const n = name[1].toLowerCase() === "x" ? parseInt(name.slice(2), 16) : Number(name.slice(1));
      return n > 0 && n <= 0x10ffff && !(n >= 0xd800 && n <= 0xdfff) ? String.fromCodePoint(n) : match;
    }
    if (entityCache.has(name)) return entityCache.get(name);
    if (typeof document !== "undefined") {
      const element = document.createElement("textarea");
      element.innerHTML = match;
      entityCache.set(name, element.value);
      return element.value;
    }
    return match;
  }).replace(/\s+/g, " ").trim();
}
export function matchesSource(source, query, range, includeUndated) {
  const dates = dateRange(source);
  if (!dates && !includeUndated) return false;
  if (dates && (dates[1] < range[0] || dates[0] > range[1])) return false;
  const text = normalize([source.nome, source.tipologia, source.regesto, source.segnatura_archivistica,
    source.estensore_nome, source.committente_nome, source.autore,
    ...(source.luoghi_fonte || []).map((a) => a.luogo_id.nome_luogo)].map(plainText).join(" "));
  return normalize(query).split(/\s+/).filter(Boolean).every((word) => text.includes(word));
}
export function recordsFor(sources, types, relations) {
  return sources.filter((source) => types.includes(documentType(source))).map((source) => ({
    source,
    associations: source.luoghi_fonte.filter((a) => relations.includes(relationType(a))),
  })).filter((record) => record.associations.length ||
    (record.source.luoghi_fonte.length === 0 && relations.length === relationTypes.length));
}
export function groupPlaces(records) {
  const result = new Map();
  for (const record of records) for (const association of record.associations) {
    const place = association.luogo_id, key = String(place.id);
    if (!result.has(key)) result.set(key, { place, records: new Map() });
    const group = result.get(key);
    if (!group.records.has(String(record.source.id))) group.records.set(String(record.source.id), { source: record.source, associations: [] });
    group.records.get(String(record.source.id)).associations.push(association);
  }
  return [...result.values()].map((group) => ({ ...group, records: [...group.records.values()] }));
}
