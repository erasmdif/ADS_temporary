import React, { useState } from "react";
import DOMPurify from "dompurify";

export default function NotePreview({ note }) {
  const [expanded, setExpanded] = useState(false);
  if (!note)
    return <p className="text-muted small">Nessun testo disponibile.</p>;
  const html = DOMPurify.sanitize(String(note));
  return (
    <div>
      <div
        className={`ads-note ${expanded ? "" : "ads-note-collapsed"}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {String(note).length > 300 && (
        <button
          className="btn btn-link p-0 small mt-2"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          {expanded ? "Mostra meno" : "Scopri di più"}
        </button>
      )}
    </div>
  );
}
