import { normalize, plainText, dateRange, relationType } from "./atlas-model.js";

export const catalogTypes = ["Carta", "Filza", "Manoscritto", "Pergamena", "Registro", "Altro"];
export const missingValue = "__missing__";
export function catalogType(source) {
  const type = normalize(source.tipologia);
  if (type.startsWith("perg")) return "Pergamena";
  if (type.startsWith("manoscri")) return "Manoscritto";
  return catalogTypes.find((t) => normalize(t) === type) || "Altro";
}
export function valueKey(value) { return normalize(plainText(value)) || missingValue; }
export function facetOptions(sources, field) {
  const options = new Map();
  for (const source of sources) {
    const key = valueKey(source[field]);
    if (!options.has(key)) options.set(key, { id: key, label: key === missingValue ? "Non indicato" : plainText(source[field]), count: 0 });
    options.get(key).count++;
  }
  return [...options.values()].sort((a, b) => a.id === missingValue ? 1 : b.id === missingValue ? -1 : a.label.localeCompare(b.label, "it"));
}
export const initialFilters = () => ({ types: [], extRoles: [], clientRoles: [], extName: "", clientName: "", places: [], relations: [], conservation: "", undated: true, savedOnly: false });
export function matchesCatalog(source, { query, scopes, range, filters, saved = [] }) {
  const dates = dateRange(source);
  if (!dates && !filters.undated) return false;
  if (dates && (dates[1] < range[0] || dates[0] > range[1])) return false;
  if (filters.types.length && !filters.types.includes(catalogType(source))) return false;
  if (filters.extRoles.length && !filters.extRoles.includes(valueKey(source.estensore_tipologia))) return false;
  if (filters.clientRoles.length && !filters.clientRoles.includes(valueKey(source.committente_tipologia))) return false;
  if (filters.extName && !normalize(plainText(source.estensore_nome)).includes(normalize(filters.extName))) return false;
  if (filters.clientName && !normalize(plainText(source.committente_nome)).includes(normalize(filters.clientName))) return false;
  if (filters.savedOnly && !saved.includes(String(source.id))) return false;
  const associations = source.luoghi_fonte || [];
  if ((filters.places.length || filters.relations.length) && !associations.some((a) =>
    (!filters.places.length || filters.places.includes(String(a.luogo_id.id))) &&
    (!filters.relations.length || filters.relations.includes(relationType(a))))) return false;
  const conservation = [source.luogo_conservazione, ...associations.filter((a) => relationType(a) === "conservazione").map((a) => a.luogo_id.nome_luogo)].map(plainText).join(" ");
  if (filters.conservation && !normalize(conservation).includes(normalize(filters.conservation))) return false;
  const fields = {
    title: [source.nome], regesto: [source.regesto], people: [source.estensore_nome, source.committente_nome, source.autore],
    places: associations.map((a) => a.luogo_id.nome_luogo), segnatura: [source.segnatura_archivistica],
  };
  const text = normalize(scopes.flatMap((scope) => fields[scope] || []).map(plainText).join(" "));
  return normalize(query).split(/\s+/).filter(Boolean).every((word) => text.includes(word));
}
export function pageNumbers(current, total) {
  const pages = [...new Set([1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total))].sort((a, b) => a - b);
  return pages.flatMap((p, i) => i && p - pages[i - 1] > 1 ? ["gap-" + p, p] : [p]);
}
