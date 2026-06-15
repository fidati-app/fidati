import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { PermissionGate } from '@/components/auth/PermissionGate';
import { useToast } from '@/contexts/ToastContext';
import { usePermissions } from '@/hooks/usePermissions';
import { fetchAdminUsers } from '@/services/adminService';
import {
  fetchReportAuditLogs,
  fetchReportById,
  fetchReportEvents,
  fetchReportNotes,
  updateReportTicket,
  type ReportPriority,
  type ReportStatus,
} from '@/services/reportsService';
import {
  actionLabel,
  formatDate,
  reportEventLabel,
  reportPriorityLabel,
  reportStatusLabel,
} from '@/utils/format';

export function ReportDetailPage() {
  const { id = '' } = useParams();
  const { can } = usePermissions();
  const { showToast } = useToast();
  const editable = can('reports.edit');

  const [report, setReport] = useState<Awaited<ReturnType<typeof fetchReportById>>>(null);
  const [events, setEvents] = useState<Awaited<ReturnType<typeof fetchReportEvents>>>([]);
  const [notes, setNotes] = useState<Awaited<ReturnType<typeof fetchReportNotes>>>([]);
  const [audit, setAudit] = useState<Awaited<ReturnType<typeof fetchReportAuditLogs>>>([]);
  const [staff, setStaff] = useState<Awaited<ReturnType<typeof fetchAdminUsers>>>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [status, setStatus] = useState<ReportStatus>('open');
  const [priority, setPriority] = useState<ReportPriority>('normal');
  const [assignedId, setAssignedId] = useState('');
  const [note, setNote] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [r, ev, n, a, s] = await Promise.all([
        fetchReportById(id),
        fetchReportEvents(id),
        fetchReportNotes(id),
        fetchReportAuditLogs(id),
        fetchAdminUsers(),
      ]);
      setReport(r);
      setEvents(ev);
      setNotes(n);
      setAudit(a);
      setStaff(s.filter((x) => x.is_active));
      if (r) {
        setStatus(r.status as ReportStatus);
        setPriority(r.priority as ReportPriority);
        setAssignedId(r.assigned_admin_id ?? '');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const save = async (opts?: { noteOnly?: boolean }) => {
    if (!report) return;
    setBusy(true);
    try {
      await updateReportTicket(
        opts?.noteOnly
          ? { reportId: report.id, note: note.trim() }
          : {
              reportId: report.id,
              status,
              priority,
              assignedAdminId: assignedId || null,
              note: note.trim() || undefined,
            },
      );
      showToast(opts?.noteOnly ? 'Nota aggiunta' : 'Ticket aggiornato');
      setNote('');
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Errore aggiornamento', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="empty-state">Caricamento ticket…</div>;
  }

  if (!report) {
    return (
      <div className="card review-panel">
        <div className="empty-state">Segnalazione non trovata</div>
        <Link to="/reports">← Torna alle segnalazioni</Link>
      </div>
    );
  }

  return (
    <PermissionGate permission="reports.view">
      <div className="page-header">
        <Link to="/reports" style={{ fontSize: 13, color: 'var(--text-muted)' }}>← Segnalazioni</Link>
        <h2>Ticket segnalazione</h2>
        <p>{report.reason}</p>
      </div>

      <div className="two-col">
        <div className="card review-panel">
          <h3>Dettaglio</h3>
          <div className="meta-list">
            <div className="meta-row"><span>Stato</span><span>{reportStatusLabel(report.status)}</span></div>
            <div className="meta-row"><span>Priorità</span><span>{reportPriorityLabel(report.priority)}</span></div>
            <div className="meta-row"><span>Target</span><span>{report.target_type} · {report.target_id.slice(0, 8)}…</span></div>
            <div className="meta-row"><span>Segnalante cliente</span><span>{report.customers?.name ?? '—'}</span></div>
            <div className="meta-row"><span>Segnalante professionista</span><span>{report.professionals?.name ?? '—'}</span></div>
            <div className="meta-row"><span>Assegnato a</span><span>{report.assigned_admin?.full_name ?? 'Non assegnato'}</span></div>
            <div className="meta-row"><span>Creata il</span><span>{formatDate(report.created_at)}</span></div>
            <div className="meta-row"><span>Aggiornata il</span><span>{formatDate(report.updated_at)}</span></div>
          </div>
          {report.details ? (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Dettagli</div>
              <p style={{ margin: 0, fontSize: 13 }}>{report.details}</p>
            </div>
          ) : null}
        </div>

        {editable ? (
          <div className="card review-panel">
            <h3>Gestione ticket</h3>
            <div className="form-field">
              <label>Stato</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as ReportStatus)}>
                <option value="open">Aperta</option>
                <option value="reviewing">In lavorazione</option>
                <option value="waiting_user">In attesa utente</option>
                <option value="resolved">Risolta</option>
                <option value="dismissed">Archiviata</option>
              </select>
            </div>
            <div className="form-field">
              <label>Priorità</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as ReportPriority)}>
                <option value="low">Bassa</option>
                <option value="normal">Normale</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <div className="form-field">
              <label>Assegna a staff</label>
              <select value={assignedId} onChange={(e) => setAssignedId(e.target.value)}>
                <option value="">Non assegnato</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>{s.full_name} ({s.role})</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Nota staff</label>
              <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nota interna visibile nello storico…" />
            </div>
            <div className="inline-actions">
              <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void save()}>Salva modifiche</button>
              {note.trim() ? (
                <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => void save({ noteOnly: true })}>Solo nota</button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className="two-col" style={{ marginTop: 16 }}>
        <div className="card review-panel">
          <h3>Storico eventi</h3>
          {events.length === 0 ? (
            <div className="empty-state">Nessun evento registrato</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {events.map((ev) => (
                <div key={ev.id} className="chat-bubble">
                  <div className="chat-meta">
                    <span className="badge badge-neutral">{reportEventLabel(ev.event_type)}</span>
                    <span>{formatDate(ev.created_at)}</span>
                  </div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    {ev.admin_users?.full_name ?? 'Sistema'}
                    {ev.previous_value && ev.new_value ? (
                      <span> · {ev.previous_value} → {ev.new_value}</span>
                    ) : null}
                  </div>
                  {ev.note ? <p style={{ margin: '6px 0 0', fontSize: 13 }}>{ev.note}</p> : null}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card review-panel">
          <h3>Note staff</h3>
          {notes.length === 0 ? (
            <div className="empty-state">Nessuna nota</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {notes.map((n) => (
                <div key={n.id} className="chat-bubble">
                  <div className="chat-meta">
                    <span>{(n.admin_users as { full_name?: string } | null)?.full_name ?? 'Staff'}</span>
                    <span>{formatDate(n.created_at)}</span>
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: 13 }}>{n.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card review-panel" style={{ marginTop: 16 }}>
        <h3>Audit log</h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 0 }}>
          Azioni admin registrate per questo ticket.
        </p>
        {audit.length === 0 ? (
          <div className="empty-state">Nessuna voce audit</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Azione</th>
                  <th>Admin</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((log) => (
                  <tr key={log.id}>
                    <td>{actionLabel(log.action)}</td>
                    <td>{(log.admin_users as { full_name?: string } | null)?.full_name ?? '—'}</td>
                    <td>{formatDate(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
