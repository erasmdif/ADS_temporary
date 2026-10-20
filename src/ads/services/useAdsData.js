import { useEffect, useState } from 'react';
import getDataFromSource from './data.js';

export default function useAdsData(table, queryString) {
  const [state, setState] = useState({ data: [], loading: true, error: '' });
  useEffect(() => {
    let active = true;
    getDataFromSource({ directus: { table, queryString } })
      .then(data => active && setState({ data, loading: false, error: '' }))
      .catch(error => active && setState({ data: [], loading: false, error: error.message }));
    return () => { active = false; };
  }, [table, queryString]);
  return state;
}
