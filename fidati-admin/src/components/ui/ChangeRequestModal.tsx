import { useState } from 'react';

type Props = {
  open: boolean;
  title: string;
  description?: string;
  presets?: string[];
  showAreas?: { id: string; label: string }[];
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: (payload: { preset?: string; message: string; areas: string[] }) => void;
  onCancel: () => void;
};

export function ChangeRequestModal({
  open,
  title,
  description,
  presets = [],
  showAreas = [],
  confirmLabel = 'Invia richiesta',
  loading,
  onConfirm,
  onCancel,
}: Props) {
  const [preset, setPreset] = useState('');
  const [message, setMessage] = useState('');
  const [areas, setAreas] = useState<string[]>([]);

  if (!open) return null;

  const toggleArea = (id: string) => {
    setAreas((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  };

  const canSubmit = (preset.trim().length > 0 || message.trim().length > 3) && (showAreas.length === 0 || areas.length > 0);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}

        {showAreas.length > 0 ? (
          <div className="form-field">
            <label>Cosa deve modificare</label>
            <div className="checkbox-grid">
              {showAreas.map((a) => (
                <label key={a.id} className="permission-check">
                  <input type="checkbox" checked={areas.includes(a.id)} onChange={() => toggleArea(a.id)} />
                  {a.label}
                </label>
              ))}
            </div>
          </div>
        ) : null}

        {presets.length > 0 ? (
          <div className="form-field">
            <label>Motivo preimpostato</label>
            <select value={preset} onChange={(e) => setPreset(e.target.value)}>
              <option value="">Seleziona motivo…</option>
              {presets.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="form-field">
          <label>Messaggio per il professionista</label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Spiega cosa correggere…"
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={loading}>Annulla</button>
          <button
            type="button"
            className="btn btn-warning"
            disabled={!canSubmit || loading}
            onClick={() => onConfirm({ preset: preset || undefined, message, areas })}
          >
            {loading ? 'Invio…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
