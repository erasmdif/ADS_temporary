import { directusShorthandToConfig } from "@lad-sapienza/scms-core/utils/directus-config";
import { fetchData } from "@lad-sapienza/scms-core/utils/data-fetcher";
export const fields = {
  fonte: [
    "id",
    "nome",
    "tipologia",
    "anno_produzione",
    "anno_produzione_fine",
    "data_precisa_se_nota",
    "estensore_nome",
    "estensore_tipologia",
    "autore",
    "edizione",
    "committente_nome",
    "committente_tipologia",
    "regesto",
    "segnatura_archivistica",
    "link_esterni",
    "link_alternativo",
    "luoghi_menzionati_extra_sabina",
    "luogo_conservazione",
    "datazione",
    "note",
  ],
  bibliografia: [
    "id",
    "argomento",
    "autore",
    "editori",
    "titolo",
    "dettagli_edizione",
    "contenuto_in",
    "pagine",
    "link",
  ],
  luogo: [
    "id",
    "nome_luogo",
    "tipologia",
    "tipo_monumento",
    "caratteristica_di_dettaglio",
    "note",
    "coordinates",
  ],
  fonte_luogo: ["id", "fonte_id", "luogo_id", "tipo_di_associazione"],
  fonte_bibliografia: [
    "id",
    "fonte_id",
    "bibliografia_id",
    "tipo_di_legame",
    "pagine",
  ],
};
let databasePromise;
const idOf = (v) => (v && typeof v === "object" ? v.id : v);
const index = (rows) => new Map(rows.map((row) => [String(row.id), row]));
async function readCollection(table) {
  const token = import.meta.env.PUBLIC_DIRECTUS_TOKEN;
  if (!token || token === "qui-il-tuo-token")
    throw new Error(
      "Inserisci il token Directus nel file .env e riavvia npm run dev.",
    );
  const config = directusShorthandToConfig({
    table,
    queryString: `fields=${fields[table].join(",")}&limit=-1`,
  });
  if (!config) throw new Error("Configura PUBLIC_DIRECTUS_URL nel file .env.");
  try {
    return await fetchData(config);
  } catch {
    throw new Error(
      `Impossibile leggere ${table} da Directus. Verifica token, permessi di lettura e connessione.`,
    );
  }
}
export function connectRelations(raw) {
  const fonti = raw.fonte.map((row) => ({
    ...row,
    luoghi_fonte: [],
    bibliografia: [],
  }));
  const luoghi = raw.luogo.map((row) => ({
    ...row,
    fonti: [],
    bibliografia: [],
  }));
  const bibliografia = raw.bibliografia.map((row) => ({
    ...row,
    fonti_menzionate: [],
    luoghi: [],
  }));
  const fi = index(fonti),
    li = index(luoghi),
    bi = index(bibliografia),
    fonte_luogo = [],
    fonte_bibliografia = [];
  for (const row of raw.fonte_luogo) {
    const fonte = fi.get(String(idOf(row.fonte_id))),
      luogo = li.get(String(idOf(row.luogo_id)));
    if (!fonte || !luogo) continue;
    const assoc = { ...row, fonte_id: fonte, luogo_id: luogo };
    fonte.luoghi_fonte.push(assoc);
    luogo.fonti.push(assoc);
    fonte_luogo.push(assoc);
  }
  for (const row of raw.fonte_bibliografia) {
    const fonte = fi.get(String(idOf(row.fonte_id))),
      opera = bi.get(String(idOf(row.bibliografia_id)));
    if (!fonte || !opera) continue;
    const assoc = { ...row, fonte_id: fonte, bibliografia_id: opera };
    fonte.bibliografia.push(assoc);
    opera.fonti_menzionate.push(assoc);
    fonte_bibliografia.push(assoc);
  }
  for (const fonte of fonti)
    for (const fl of fonte.luoghi_fonte)
      for (const fb of fonte.bibliografia) {
        if (!fl.luogo_id.bibliografia.some((row) => row.id === fb.id))
          fl.luogo_id.bibliografia.push(fb);
        if (!fb.bibliografia_id.luoghi.some((row) => row.id === fl.luogo_id.id))
          fb.bibliografia_id.luoghi.push(fl.luogo_id);
      }
  for (const opera of bibliografia)
    opera.luogo = opera.luoghi.map((luogo) => luogo.nome_luogo).join("; ");
  return {
    fonte: fonti,
    luogo: luoghi,
    bibliografia,
    fonte_luogo,
    fonte_bibliografia,
  };
}
export function loadDatabase() {
  if (!databasePromise)
    databasePromise = Promise.all(
      Object.keys(fields).map(async (table) => [
        table,
        await readCollection(table),
      ]),
    )
      .then((entries) => connectRelations(Object.fromEntries(entries)))
      .catch((error) => {
        databasePromise = undefined;
        throw error;
      });
  return databasePromise;
}
export default async function getDataFromSource({ directus }) {
  const table =
    directus.table === "luogo_di_interesse" ? "luogo" : directus.table;
  if (!fields[table]) throw new Error("Scheda non disponibile.");
  const db = await loadDatabase();
  return directus.id != null
    ? db[table].find((row) => String(row.id) === String(directus.id))
    : db[table];
}
export function pointGeometry(value) {
  if (!value) return null;
  let geometry = value;
  if (typeof geometry === "string") {
    try {
      geometry = JSON.parse(geometry);
    } catch {
      const m = geometry.match(
        /^\s*(?:SRID=\d+;)?POINT\s*\(\s*([-\d.e+]+)\s+([-\d.e+]+)\s*\)\s*$/i,
      );
      if (!m) return null;
      geometry = { type: "Point", coordinates: [Number(m[1]), Number(m[2])] };
    }
  }
  if (geometry?.type === "Feature") geometry = geometry.geometry;
  if (Array.isArray(geometry))
    geometry = { type: "Point", coordinates: geometry };
  const c = geometry?.coordinates;
  if (
    geometry?.type !== "Point" ||
    !Array.isArray(c) ||
    c.length < 2 ||
    c[0] == null ||
    c[1] == null ||
    c[0] === "" ||
    c[1] === ""
  )
    return null;
  const [lng, lat] = c.map(Number);
  return Number.isFinite(lng) &&
    Number.isFinite(lat) &&
    Math.abs(lng) <= 180 &&
    Math.abs(lat) <= 90
    ? { type: "Point", coordinates: [lng, lat] }
    : null;
}
export function atlasData(db) {
  return {
    type: "FeatureCollection",
    features: db.fonte_luogo.flatMap((row) => {
      const geometry = pointGeometry(row.luogo_id.coordinates);
      if (!geometry) return [];
      return [
        {
          type: "Feature",
          geometry,
          properties: {
            ...row.fonte_id,
            luoghi_fonte: undefined,
            bibliografia: undefined,
            luogo_id: row.luogo_id.id,
            fonte_antica: row.fonte_id.id,
            nome_luogo: row.luogo_id.nome_luogo,
            tipo_monumento: row.luogo_id.tipo_monumento,
            tipo_di_associazione: row.tipo_di_associazione,
          },
        },
      ];
    }),
  };
}
