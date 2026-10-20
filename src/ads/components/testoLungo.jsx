import { assetUrl, localUrl } from "../services/paths.jsx";
import React, { useState } from "react";
import ReactDOMServer from 'react-dom/server';

const TestoLungo = ({ previewLength = 300, jsxContent = null, children }) => {
  const [expanded, setExpanded] = useState(false);

  const childrenString = React.Children.toArray(children).map(child => 
    typeof child === 'string' ? child : ReactDOMServer.renderToStaticMarkup(child)
  ).join('');


  const shouldCollapse = childrenString.length > previewLength; // Verifica se il testo è più lungo del limite

  const getTrimmedText = (text, length) => {
    if (text.length <= length) return text;
    const trimmedText = text.substring(0, length);
    const lastSpaceIndex = trimmedText.lastIndexOf(' ');
    return lastSpaceIndex === -1 ? trimmedText : trimmedText.substring(0, lastSpaceIndex) + "...";
  };

  const displayText = expanded || !shouldCollapse
    ? childrenString
    : getTrimmedText(childrenString, previewLength); // Tronca il testo solo se necessario

  return (
    <div>
      {/* Renderizza il testo come HTML, evitando di spezzare i tag */}
      <div dangerouslySetInnerHTML={{ __html: displayText }} />

      {/* Renderizza eventuali componenti JSX aggiuntivi, come <DownloadPdf> */}
      {jsxContent}

      {/* Mostra il pulsante solo se il testo supera la lunghezza del preview */}
      {shouldCollapse && (
        <button className="btn btn-link mt-2" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Mostra meno" : "Leggi tutto"}
        </button>
      )}
    </div>
  );
};

export default TestoLungo;
