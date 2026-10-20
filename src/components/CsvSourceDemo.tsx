import { useState } from 'react';
import { CsvSource } from '@lad-sapienza/scms-core/components/DataTb';
import type { DataRow } from '@lad-sapienza/scms-core/components/DataTb/types';

export default function CsvSourceDemo() {
  const [rows, setRows] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <CsvSource
        url="/data/ksa.csv"
        onDataLoad={(data) => setRows(data.slice(0, 5))}
        onLoadingChange={setLoading}
        onError={(err) => setError(err.message)}
      />

      {loading && <p className="text-secondary">Loading…</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && !error && (
        <ul className="list-group">
          {rows.map((row, i) => (
            <li key={i} className="list-group-item">
              {row.Site_Name ?? JSON.stringify(row)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
