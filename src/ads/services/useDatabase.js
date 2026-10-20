import { useEffect, useState } from "react";
import { loadDatabase } from "./database.js";
export default function useDatabase() {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  useEffect(() => {
    let active = true;
    loadDatabase()
      .then((data) => active && setState({ data, loading: false, error: "" }))
      .catch(
        (error) =>
          active &&
          setState({ data: null, loading: false, error: error.message }),
      );
    return () => {
      active = false;
    };
  }, []);
  return state;
}
