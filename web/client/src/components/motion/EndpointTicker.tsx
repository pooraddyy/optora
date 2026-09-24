/* EndpointTicker — a slim infinite ticker of the real API surface.
   Method pills + paths slide continuously, pause on hover, and each item
   scrolls to the endpoints section. Pure CSS loop, no fake data. */
import { useMemo } from "react";

export type TickerItem = { method: "POST" | "GET"; path: string };

type Props = {
  items: TickerItem[];
  onSelect: () => void;
};

export default function EndpointTicker({ items, onSelect }: Props) {
  const doubled = useMemo(() => [...items, ...items], [items]);
  return (
    <div className="ticker" aria-label="API endpoints ticker">
      <div className="ticker-track">
        {doubled.map((t, i) => (
          <button
            key={`${t.path}-${i}`}
            className="ticker-item"
            onClick={onSelect}
            tabIndex={i < items.length ? 0 : -1}
            aria-hidden={i >= items.length}
          >
            <span className={`method-pill ${t.method.toLowerCase()}`}>{t.method}</span>
            <span className="ticker-path">{t.path}</span>
            <span className="ticker-sep" aria-hidden="true">·</span>
          </button>
        ))}
      </div>
    </div>
  );
}
