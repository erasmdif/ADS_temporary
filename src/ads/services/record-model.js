import { plainText, normalize, dateRange, relationType, relationTypes, periods } from './atlas-model.js';

// The layout is chosen from the full dossier, before applying any filters.
export const EXTENDED_PLACE_THRESHOLD = 50;
export const recordLabels = {
  fonte: { label: 'Fonte antica', collection: '/fonti/', collectionLabel: 'Fonti', title: 'nome' },
  luogo: { label: 'Scheda di luogo', collection: '/atlante/', collectionLabel: 'Atlante', title: 'nome_luogo' },
  bibliografia: { label: 'Riferimento bibliografico', collection: '/bibliografia/', collectionLabel: 'Bibliografia', title: 'titolo' },
};
export function groupRelations(rows = [], key) {
  const groups = new Map();
  for (const association of rows) {
    const record = association[key];
    if (!record || record.id == null) continue;
    const id = String(record.id);
    if (!groups.has(id)) groups.set(id, { record, associations: [] });
    groups.get(id).associations.push(association);
  }
  return [...groups.values()];
}
export const sourceGroups = (rows) => groupRelations(rows, 'fonte_id');
export const bibliographyGroups = (rows) => groupRelations(rows, 'bibliografia_id').sort((a, b) => plainText(a.record.autore).localeCompare(plainText(b.record.autore), 'it') || plainText(a.record.titolo).localeCompare(plainText(b.record.titolo), 'it') || String(a.record.id).localeCompare(String(b.record.id), 'it', { numeric: true }));
export function rolesFor(associations = []) {
  const roles = new Map();
  for (const a of associations) {
    const key = relationType(a), raw = plainText(a.tipo_di_associazione);
    const label = key === 'altro' && raw ? raw : relationTypes.find(r => r.id === key).label;
    roles.set(key + ':' + label, { key, label });
  }
  return [...roles.values()];
}
export function roleCounts(groups) {
  return relationTypes.map(role => ({ ...role, count: groups.filter(g => g.associations.some(a => relationType(a) === role.id)).length }));
}
export function sourcePlaces(source) { return groupRelations(source.luoghi_fonte, 'luogo_id'); }
export function bibliographyPlaces(reference) {
  const groups = new Map();
  for (const { record: source } of sourceGroups(reference.fonti_menzionate)) {
    for (const { record: place, associations } of sourcePlaces(source)) {
      const id = String(place.id);
      if (!groups.has(id)) groups.set(id, { record: place, via: [] });
      groups.get(id).via.push({ source, associations });
    }
  }
  return [...groups.values()].sort((a,b) => plainText(a.record.nome_luogo).localeCompare(plainText(b.record.nome_luogo), 'it'));
}
export function filterSources(groups, filters) {
  const words = normalize(filters.query).split(/\s+/).filter(Boolean);
  return groups.filter(({ record, associations }) => {
    if (filters.role && !associations.some(a => relationType(a) === filters.role)) return false;
    if (filters.type && plainText(record.tipologia) !== filters.type) return false;
    if (filters.bibliography && !record.bibliografia?.length) return false;
    const range = dateRange(record);
    if (filters.period === 'undated' && range) return false;
    if (filters.period && filters.period !== 'undated') {
      const period = periods[Number(filters.period)];
      if (!period || !range || range[1] < period.start || range[0] > period.end) return false;
    }
    const text = normalize([record.nome, record.regesto, record.segnatura_archivistica, record.estensore_nome, record.committente_nome, record.autore].map(plainText).join(' '));
    return words.every(word => text.includes(word));
  });
}
export function sortSources(groups, order = 'date-asc') {
  return [...groups].sort((a, b) => {
    let result = 0;
    if (order === 'title') result = plainText(a.record.nome).localeCompare(plainText(b.record.nome), 'it');
    else {
      const aa = dateRange(a.record), bb = dateRange(b.record);
      if (!aa && bb) return 1;
      if (aa && !bb) return -1;
      if (aa && bb) result = (order === 'date-desc' ? -1 : 1) * (aa[0] - bb[0] || aa[1] - bb[1]);
    }
    return result || String(a.record.id).localeCompare(String(b.record.id), 'it', { numeric: true });
  });
}
export function centuryDistribution(groups) {
  const buckets = new Map(); let undated = 0;
  for (const { record } of groups) {
    const range = dateRange(record);
    if (!range) { undated++; continue; }
    const start = Math.floor(range[0] / 100) * 100;
    buckets.set(start, (buckets.get(start) || 0) + 1);
  }
  return { undated, buckets: [...buckets].sort(([a],[b]) => a-b).map(([start,count]) => ({ start, end: start + 99, count })) };
}
// Explicit, acyclic export. The complete scientific fields are preserved, and
// relation targets use IDs, avoiding recursion through the connected graph.
export function exportRecord(kind, record, fields) {
  const data = Object.fromEntries(fields[kind].map(key => [key, record[key] ?? null]));
  const placeLink = a => ({ id: a.id, fonte_id: a.fonte_id.id, luogo_id: a.luogo_id.id, tipo_di_associazione: a.tipo_di_associazione ?? null });
  const bibLink = a => ({ id: a.id, fonte_id: a.fonte_id.id, bibliografia_id: a.bibliografia_id.id, tipo_di_legame: a.tipo_di_legame ?? null, pagine: a.pagine ?? null });
  if (kind === 'fonte') { data.luoghi = (record.luoghi_fonte || []).map(placeLink); data.bibliografia = (record.bibliografia || []).map(bibLink); }
  if (kind === 'luogo') { data.fonti = (record.fonti || []).map(placeLink); data.bibliografia_tramite_fonti = (record.bibliografia || []).map(bibLink); }
  if (kind === 'bibliografia') { data.fonti = (record.fonti_menzionate || []).map(bibLink); data.luoghi_tramite_fonti = bibliographyPlaces(record).map(g => ({ luogo_id: g.record.id, tramite_fonti: g.via.map(v => ({ fonte_id: v.source.id, relazioni: v.associations.map(placeLink) })) })); }
  return data;
}
export function csvText(rows) {
  const keys = [...new Set(rows.flatMap(Object.keys))];
  const escape = value => { let text = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? ''); if (/^\s*[=+@-]/.test(text)) text = "'" + text; return '"' + text.replace(/"/g,'""') + '"'; };
  return '\ufeff' + [keys, ...rows.map(row => keys.map(key => row[key]))].map(row => row.map(escape).join(';')).join('\r\n');
}
