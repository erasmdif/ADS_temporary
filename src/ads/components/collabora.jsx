import { assetUrl, localUrl } from "../services/paths.jsx";
import React from "react";

export default function InvioMateriale() {
  return (
    <div className="p-4 bg-white rounded shadow-sm border" style={{ borderColor: '#e0e0e0' }}>
      <h2 className="mb-4 text-center" style={{ color: '#990033', fontWeight: '600' }}>
        Contribuisci al progetto
      </h2>
      
      <div className="mb-4 p-3 bg-light rounded">
        <p className="mb-3">
          Chiunque fosse in possesso di materiale fotografico o grafico pertinente e desideri contribuire all'arricchimento del progetto, 
          è invitato a condividerlo con noi.
        </p>
        
        <div className="mb-3 p-3 bg-white rounded border">
          <p className="mb-2">
            <strong>Attenzione:</strong> È necessario allegare una dichiarazione liberatoria che attesti:
          </p>
          <ul className="mb-0">
            <li>La titolarità del materiale fornito</li>
            <li>L'autorizzazione all'utilizzo nel progetto</li>
          </ul>
        </div>
      </div>
      
      <div className="mb-4">
        <h5 className="mb-3" style={{ color: '#555' }}>Licenza d'uso</h5>
        <p>
          Tutto il materiale sarà pubblicato sotto licenza{" "}
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/deed.it"
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none"
            style={{ color: '#990033' }}
          >
            Creative Commons BY-SA 4.0
          </a>{" "}
          e caricato su{" "}
          <a
            href="https://commons.wikimedia.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none"
            style={{ color: '#990033' }}
          >
            Wikimedia Commons
          </a>.
        </p>
      </div>
      
      <div className="text-center mt-4">
        <p className="mb-3">Per inviare contributi o richiedere informazioni:</p>
        <a 
          href="mailto:erasmo.difonso@libero.it" 
          className="btn px-4"
          style={{ 
            backgroundColor: '#990033', 
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 24px'
          }}
        >
          Contattaci
        </a>
      </div>
    </div>
  );
}