import React from 'react';
export default function DataStatus({ loading, error }) {
  if (loading) return <p role="status" className="alert alert-light">Caricamento dei dati…</p>;
  if (error) return <p role="alert" className="alert alert-warning">{error}</p>;
  return null;
}
