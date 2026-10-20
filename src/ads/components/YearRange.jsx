import React, { useId } from "react";
import "../styles/year-range.css";

export default function YearRange({ min, max, value, onChange }) {
  const id = useId();
  const start = Math.max(min, Math.min(max, value[0]));
  const end = Math.max(start, Math.min(max, value[1]));
  return (
    <div className="ads-year-range">
      <div>
        <label htmlFor={`${id}-start`}>Da <output>{start}</output></label>
        <input id={`${id}-start`} type="range" min={min} max={max} step={1}
          value={start} disabled={min === max}
          onChange={(event) => onChange([Math.min(Number(event.target.value), end), end])} />
      </div>
      <div>
        <label htmlFor={`${id}-end`}>A <output>{end}</output></label>
        <input id={`${id}-end`} type="range" min={min} max={max} step={1}
          value={end} disabled={min === max}
          onChange={(event) => onChange([start, Math.max(Number(event.target.value), start)])} />
      </div>
    </div>
  );
}
