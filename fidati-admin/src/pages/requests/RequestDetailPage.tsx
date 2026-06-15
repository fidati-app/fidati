import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { PermissionGate } from '@/components/auth/PermissionGate';
import { useToast } from '@/contexts/ToastContext';
import { usePermissions } from '@/hooks/usePermissions';
import { updateBookingRequestStatus } from '@/services/professionalAdminService';
import {
  fetchBookingRequestById,
  fetchRequestAuditLogs,
  fetchRequestConversation,
  fetchRequestNotes,
  fetchRequestPayments,
} from '@/services/requestsService';
import { formatDate, formatMoney, requestStatusLabel } from '@/utils/format';

export function RequestDetailPage() {
  const { id = '' } = useParams();
  const { can } = usePermissions();
  const { showToast } = useToast();
  const [row, setRow] = useState<Awaited<ReturnType<typeof fetchBookingRequestById>>>(null);
  const [payments, setPayments] = useState<Awaited<ReturnType<typeof fetchRequestPayments>>>([]);
  const [chat, setChat] = useState<Awaited<ReturnType<typeof fetchRequestConversation>>>(null);
  const [_notes, setNotes] = useState<Awaited<ReturnType<typeof fetchRequestNotes>>>([]);
  const [audit, setAudit] = useState<Awaited<ReturnType<typeof fetchRequestAuditLogs>>>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetchBookingRequestById(id);
      setRow(r);
      if (r) {
        setStatus(r.status);
        const [p, c, n, a] = await Promise.all([
          fetchRequestPayments(id),
          fetchRequestConversation(id),
          fetchRequestNotes(id),
          fetchRequestAuditLogs(id),
        ]);
        setPayments(p);
        setChat(c);
        setNotes(n);
        setAudit(a);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const saveStatus = async () => {
    if (!row || !can('requests.edit')) return;
    setBusy(true);
    try {
      await updateBookingRequestStatus(row.id, status);
      showToast('Stato richiesta aggiornato');
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Errore', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="empty-state">Caricamento richiesta…</div>;
  if (!row) return <div className="empty-state">Richiesta non trovata</div>;

  return (
    <PermissionGate permission="requests.view">
      <div className="page-header">
        <Link to="/requests" style={{ fontSize: 13, color: 'var(--text-muted)' }}>← Richieste</Link>
        <h2>{row.service_title}</h2>
        <p>{row.category_label} · {row.zone ?? 'Zona N/D'}</p>
      </div>

      <div className="two-col">
        <div className="card section-card">
          <h3>Dettaglio richiesta</h3>
          <div className="meta-list">
            <div className="meta-row"><span>Cliente</span><span>{row.customers?.name ?? '—'}</span></div>
            <div className="meta-row"><span>Professionista</span><span>{row.professionals?.name ?? '—'}</span></div>
            <div className="meta-row"><span>Stato</span><span>{requestStatusLabel(row.status)}</span></div>
            <div className="meta-row"><span>Importo</span><span>{formatMoney(Number(row.price ?? 0))}</span></div>
            <div className="meta-row"><span>Creata il</span><span>{formatDate(row.created_at)}</span></div>
            <div className="meta-row"><span>Appuntamento</span><span>{row.scheduled_date ? `${row.scheduled_date} ${row.scheduled_time ?? ''}` : '—'}</span></div>
          </div>
          {row.note ? <p style={{ marginTop: 12, fontSize: 13 }}>{row.note}</p> : null}
        </div>

        {can('requests.edit') ? (
          <div className="card section-card">
            <h3>Gestione</h3>
            <div className="form-field">
              <label>Modifica stato</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="pending">In attesa</option>
                <option value="accepted">Accettata</option>
                <option value="declined">Rifiutata</option>
                <option value="completed">Completata</option>
                <option value="cancelled">Anullata</option>
              </select>
            </div>
            <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void saveStatus()}>Salva stato</button>
          </div>
        ) : null}
      </div>

      <div className="two-col" style={{ marginTop: 16 }}>
        <div className="card section-card">
          <h3>Chat collegata</h3>
          {chat ? (
            <Link to={`/chats/${chat.id}`} className="btn btn-ghost">Apri conversazione →</Link>
          ) : (
            <div className="empty-state">Nessuna chat collegata</div>
          )}
        </div>
        <div className="card section-card">
          <h3>Pagamenti</h3>
          {payments.length === 0 ? (
            <div className="empty-state">Nessun pagamento collegato</div>
          ) : (
            payments.map((p) => (
              <div key={p.id} className="meta-row">
                <span>{formatMoney(Number(p.amount))}</span>
                <span>{p.status}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card section-card" style={{ marginTop: 16 }}>
        <h3>Audit log</h3>
        {audit.length === 0 ? (
          <div className="empty-state">Nessuna azione registrata</div>
        ) : (
          <div className="timeline">
            {audit.map((log) => (
              <div key={log.id} className="timeline-item">
                <div className="timeline-dot" />
                <div>
                  <div style={{ fontWeight: 700 }}>{log.action}</div>
                  <div className="preview-row-meta">
                    {(log.admin_users as { full_name?: string } | null)?.full_name ?? 'Staff'} · {formatDate(log.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
