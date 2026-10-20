import { normalize, plainText } from "./atlas-model.js";
import { bibliographyAuthorKeys } from "../content/bibliography-author-keys.js";

export const noTopic = "__no_topic__";
export function topicKey(row) { return plainText(row.argomento) || noTopic; }
export function topicLabel(key) { return key === noTopic ? "Argomento non indicato" : key; }
export function externalUrl(value) {
  try { const url = new URL(String(value ?? "").trim()); return ["https:", "http:"].includes(url.protocol) ? url.href : null; } catch { return null; }
}
export function authorKey(row) {
  const name = plainText(row.autore);
  const verified = bibliographyAuthorKeys[name];
  if (verified) return { key: verified, letter: normalize(verified)[0].toUpperCase(), verified: true };
  // Interpreta solo il formato iniziali + cognome. Mantiene particelle e cognomi
  // composti, e per le firme multiple considera il primo autore esplicito.
  const match = name.match(/^(?:[A-ZÀ-ÖØ-Þ]\.\s*)+(.+)$/u);
  if (match) {
    const surname = match[1].split(/\s+[–—-]\s+|;|,/)[0].replace(/\s+et\s+ali(?:i|a)\.?$/i, "").trim();
    if (surname && !/[\d()\[\]]/.test(surname)) return { key: surname, letter: normalize(surname)[0].toUpperCase(), verified: false };
  }
  return { key: name || "Autore non indicato", letter: "#", verified: false };
}
export function citation(row) {
  const author = plainText(row.autore), title = plainText(row.titolo), editors = plainText(row.editori);
  const parts = [author, title, editors ? `Editori: ${editors}` : "", plainText(row.contenuto_in), plainText(row.dettagli_edizione), row.pagine ? `pp. ${plainText(row.pagine).replace(/^pp?\.\s*/i, "")}` : ""].filter(Boolean);
  return parts.join(", ").replace(/[,\s]+$/, "") + ".";
}
export function uniqueSources(row) {
  return [...new Map((row.fonti_menzionate || []).map((a) => [String(a.fonte_id.id), a.fonte_id])).values()];
}
export function matchesBibliography(row, filters, selected) {
  if (filters.topic && topicKey(row) !== filters.topic) return false;
  if (filters.letter && authorKey(row).letter !== filters.letter) return false;
  if (filters.author && !normalize(plainText(row.autore)).includes(normalize(filters.author))) return false;
  if (filters.volume && !normalize(plainText(row.contenuto_in)).includes(normalize(filters.volume))) return false;
  if (filters.editors && !normalize(plainText(row.editori)).includes(normalize(filters.editors))) return false;
  if (filters.link && !externalUrl(row.link)) return false;
  if (filters.linked && !uniqueSources(row).length) return false;
  if (filters.selectedOnly && !selected.includes(String(row.id))) return false;
  if (filters.place && !(row.luoghi || []).some((p) => normalize(p.nome_luogo).includes(normalize(filters.place)))) return false;
  const text = normalize([row.autore, row.titolo, row.editori, row.argomento, row.contenuto_in, row.dettagli_edizione, row.pagine].map(plainText).join(" "));
  return normalize(filters.query).split(/\s+/).filter(Boolean).every((word) => text.includes(word));
}
export function sortBibliography(rows, order) {
  return [...rows].sort((a, b) => {
    if (order === "title") return plainText(a.titolo).localeCompare(plainText(b.titolo), "it") || String(a.id).localeCompare(String(b.id));
    const aa = authorKey(a), bb = authorKey(b);
    return (aa.letter === "#" ? 1 : 0) - (bb.letter === "#" ? 1 : 0) || aa.key.localeCompare(bb.key, "it") || plainText(a.autore).localeCompare(plainText(b.autore), "it") || plainText(a.titolo).localeCompare(plainText(b.titolo), "it");
  });
}
