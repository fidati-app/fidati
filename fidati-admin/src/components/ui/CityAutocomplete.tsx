import { useEffect, useRef, useState } from 'react';

import { searchCities } from '@/services/settingsService';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (city: { name: string; province: string | null; label: string }) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function CityAutocomplete({ value, onChange, onSelect, placeholder = 'Cerca città…', disabled }: Props) {
  const [results, setResults] = useState<{ id: string; name: string; province: string | null; label: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (value.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setLoading(true);
      void searchCities(value, 12)
        .then((rows) => {
          setResults(
            rows.map((r) => ({
              id: r.id,
              name: r.name,
              province: r.province,
              label: r.province ? `${r.name} (${r.province})` : r.name,
            })),
          );
          setOpen(true);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 220);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value]);

  return (
    <div className="city-autocomplete" ref={ref}>
      <input
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => value.length >= 2 && setOpen(true)}
      />
      {open && (loading || results.length > 0) ? (
        <div className="city-dropdown card">
          {loading ? (
            <div className="search-item muted">Ricerca comuni…</div>
          ) : (
            results.map((city) => (
              <button
                key={city.id}
                type="button"
                className="search-item"
                onClick={() => {
                  onChange(city.name);
                  onSelect?.(city);
                  setOpen(false);
                }}
              >
                {city.label}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
