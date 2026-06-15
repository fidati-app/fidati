import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { PermissionGate } from '@/components/auth/PermissionGate';
import { AuditTimelineCard } from '@/components/ui/AuditTimelineCard';
import { fetchAdminUsers } from '@/services/adminService';
import { fetchAuditActions, fetchAuditLogsFiltered } from '@/services/auditService';
import { formatAuditNarrative } from '@/utils/auditNarrative';
import { actionLabel, formatDate } from '@/utils/format';

const TARGET_TYPES = [
  { value: 'all', label: 'Tutte le sezioni' },
  { value: 'professional', label: 'Professionisti' },
  { value: 'report', label: 'Segnalazioni' },
  { value: 'booking_request', label: 'Richieste' },
  { value: 'admin_user', label: 'Staff' },
  { value: 'platform_setting', label: 'Impostazioni' },
];

export function AuditPage() {
  const [params] = useSearchParams();
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchAuditLogsFiltered>>>([]);
  const [staff, setStaff] = useState<Awaited<ReturnType<typeof fetchAdminUsers>>>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<(typeof rows)[0] | null>(null);

  const [search, setSearch] = useState('');
  const [adminId, setAdminId] = useState('all');
  const [action, setAction] = useState('all');
  const [targetType, setTargetType] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const highlight = params.get('highlight');

  const load = () => {
    setLoading(true);
    void fetchAuditLogsFiltered({
      search,
      adminId: adminId === 'all' ? undefined : adminId,
      action: action === 'all' ? undefined : action,
      targetType: targetType === 'all' ? undefined : targetType,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      limit: 500,
    })
      .then((data) => {
        setRows(data);
        if (highlight) {
          const found = data.find((r) => r.id === highlight);
          if (found) setSelected(found);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void Promise.all([fetchAdminUsers(), fetchAuditActions()]).then(([s, a]) => {
      setStaff(s);
      setActions(a);
    });
  }, []);

  useEffect(load, [search, adminId, action, targetType, dateFrom, dateTo]);

  const selectedNarrative = useMemo(
    () => (selected ? formatAuditNarrative(selected) : null),
    [selected],
  );

  const metadataPreview = useMemo(() => {
    if (!selected?.metadata) return null;
    const m = selected.metadata as Record<string, unknown>;
    const before = m.before as Record<string, unknown> | undefined;
    const after = m.after as Record<string, unknown> | undefined;
    return { raw: m, before, after };
  }, [selected]);

  return (
    <PermissionGate permission="audit.view">
      <div className="page-header">
        <h2>Log e sicurezza</h2>
        <p>
          Cronologia delle azioni staff con descrizioni in italiano. I log non sono modificabili.
        </p>
      </div>

      <div className="card card-spacious">
        <div className="filters-panel filters-panel-wrap">
          <input placeholder="Cerca azione, staff, professionista…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={adminId} onChange={(e) => setAdminId(e.target.value)}>
            <option value="all">Tutto lo staff</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>{s.full_name}</option>
            ))}
          </select>
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="all">Tutte le azioni</option>
            {actions.map((a) => (
              <option key={a} value={a}>{actionLabel(a)}</option>
            ))}
          </select>
          <select value={targetType} onChange={(e) => setTargetType(e.target.value)}>
            {TARGET_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label="Da data" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label="A data" />
        </div>

        {loading ? (
          <div className="empty-state">Caricamento log…</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">Nessuna azione registrata con questi filtri</div>
        ) : (
          <div className="audit-timeline audit-timeline-page">
            {rows.map((row) => (
              <AuditTimelineCard
                key={row.id}
                row={row}
                highlighted={row.id === highlight}
                onClick={() => setSelected(row)}
              />
            ))}
          </div>
        )}
      </div>

      {selected && selectedNarrative ? (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="audit-detail-header">
              <span className="badge badge-purple">{selectedNarrative.badge}</span>
              <span className="muted">{formatDate(selected.created_at)}</span>
            </div>
            <h3>{selectedNarrative.headline}</h3>
            {selectedNarrative.body.map((line) => (
              <p key={line} className="audit-detail-line">{line}</p>
            ))}
            <div className="meta-list" style={{ marginTop: 16 }}>
              <div className="meta-row">
                <span>Azione tecnica</span>
                <span className="muted">{actionLabel(selected.action)}</span>
              </div>
              <div className="meta-row">
                <span>Target</span>
                <span>{selected.target_type}{selected.target_id ? ` · ${selected.target_id}` : ''}</span>
              </div>
            </div>
            {metadataPreview?.before || metadataPreview?.after ? (
              <details className="audit-technical-details">
                <summary>Dati tecnici (prima / dopo)</summary>
                <div className="two-col" style={{ marginTop: 12 }}>
                  {metadataPreview.before ? (
                    <div>
                      <div className="section-sub" style={{ marginBottom: 8 }}>Prima</div>
                      <pre className="code-block">{JSON.stringify(metadataPreview.before, null, 2)}</pre>
                    </div>
                  ) : null}
                  {metadataPreview.after ? (
                    <div>
                      <div className="section-sub" style={{ marginBottom: 8 }}>Dopo</div>
                      <pre className="code-block">{JSON.stringify(metadataPreview.after, null, 2)}</pre>
                    </div>
                  ) : null}
                </div>
              </details>
            ) : selected.metadata && Object.keys(selected.metadata as object).length > 0 ? (
              <details className="audit-technical-details">
                <summary>Dati tecnici</summary>
                <pre className="code-block">{JSON.stringify(selected.metadata, null, 2)}</pre>
              </details>
            ) : null}
            <div className="modal-actions">
              {selected.target_type === 'professional' && selected.target_id ? (
                <Link to={`/professionals/${selected.target_id}`} className="btn btn-ghost">Apri professionista</Link>
              ) : null}
              <button type="button" className="btn btn-primary" onClick={() => setSelected(null)}>Chiudi</button>
            </div>
          </div>
        </div>
      ) : null}
    </PermissionGate>
  );
}
