import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { globalSearch } from '@/services/searchService';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Awaited<ReturnType<typeof globalSearch>>>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setLoading(true);
      void globalSearch(query.trim())
        .then((r) => {
          setResults(r);
          setOpen(true);
        })
        .finally(() => setLoading(false));
    }, 280);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query]);

  const go = (path: string) => {
    setOpen(false);
    setQuery('');
    navigate(path);
  };

  return (
    <div className="topbar-search" style={{ position: 'relative' }}>
      <input
        placeholder="Ricerca globale: professionisti, clienti, richieste, chat…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 2 && setOpen(true)}
      />
      {open && (
        <div className="search-dropdown card">
          {loading ? (
            <div className="search-item muted">Ricerca in corso…</div>
          ) : results.length === 0 ? (
            <div className="search-item muted">Nessun risultato</div>
          ) : (
            results.map((item) => (
              <button key={`${item.group}-${item.id}`} type="button" className="search-item" onClick={() => go(item.path)}>
                <span className="badge badge-neutral">{item.group}</span>
                <span>{item.label}</span>
                {item.sub ? <span className="search-sub">{item.sub}</span> : null}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
