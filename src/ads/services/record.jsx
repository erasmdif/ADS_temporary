import React, { createContext, useContext, useEffect, useState } from 'react';
import { RecordProvider } from '@lad-sapienza/scms-core/components/Record/context';
import { getValueByDotPath } from '@lad-sapienza/scms-core/components/Record/utils';
import getDataFromSource from './data.js';

const CompatibilityContext = createContext(null);

// Existing ?tb=...&id=... links continue working; modern ?table=... also works.
export function Record({ children, fields = '*.*.*' }) {
  const [state, setState] = useState({ loading: true, record: null, error: '' });
  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const table = params.get('tb') || params.get('table');
    const id = params.get('id');
    if (!table || !id) {
      setState({ loading: false, record: null, error: 'Seleziona un record dalla collezione o dall’atlante.' });
      return;
    }
    getDataFromSource({ directus: { table, id, queryString: `fields=${fields}` } })
      .then(record => active && setState({ loading: false, record, error: record ? '' : 'Record non disponibile.' }))
      .catch(error => active && setState({ loading: false, record: null, error: error.message }));
    return () => { active = false; };
  }, [fields]);
  if (state.loading) return <p role="status">Caricamento della scheda…</p>;
  if (state.error) return <p role="alert" className="alert alert-info">{state.error}</p>;
  return <RecordProvider record={state.record}>
    <CompatibilityContext.Provider value={state.record}>{children}</CompatibilityContext.Provider>
  </RecordProvider>;
}

export function Field({ name, transformer }) {
  const record = useContext(CompatibilityContext);
  const value = getValueByDotPath(record, Array.isArray(name) ? name.join('.') : name);
  if (transformer) return transformer(value, record);
  if (value == null) return null;
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}
