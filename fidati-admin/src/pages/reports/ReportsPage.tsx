import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { PermissionGate } from '@/components/auth/PermissionGate';
import { fetchReports } from '@/services/reportsService';
import { formatDate, reportPriorityLabel, reportStatusLabel } from '@/utils/format';

export function ReportsPage() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState(params.get('status') ?? 'all');
  const [priority, setPriority] = useState('all');
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchReports>>>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    void fetchReports(status, priority)
      .then(setRows)
      .finally(() => setLoading(false));
  };

  useEffect(load, [status, priority]);

  return (
    <PermissionGate permission="reports.view">
      <div className="page-header">
        <h2>Segnalazioni</h2>
        <p>Sistema ticket con priorità, assegnazione staff, note e storico</p>
      </div>
      <div className="card">
        <div className="table-toolbar">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Tutti gli stati</option>
            <option value="open">Aperta</option>
            <option value="reviewing">In lavorazione</option>
            <option value="waiting_user">In attesa utente</option>
            <option value="resolved">Risolta</option>
            <option value="dismissed">Archiviata</option>
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="all">Tutte le priorità</option>
            <option value="low">Bassa</option>
            <option value="normal">Normale</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
        {loading ? (
          <div className="empty-state">Caricamento…</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">Nessuna segnalazione trovata</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Motivo</th>
                  <th>Segnalante</th>
                  <th>Target</th>
                  <th>Priorità</th>
                  <th>Stato</th>
                  <th>Assegnato a</th>
                  <th>Data</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.reason.slice(0, 60)}</td>
                    <td>{row.customers?.name ?? row.professionals?.name ?? '—'}</td>
                    <td>{row.target_type}</td>
                    <td><span className={`badge ${priorityBadge(row.priority)}`}>{reportPriorityLabel(row.priority)}</span></td>
                    <td>{reportStatusLabel(row.status)}</td>
                    <td>{row.assigned_admin?.full_name ?? '—'}</td>
                    <td>{formatDate(row.created_at)}</td>
                    <td>
                      <Link to={`/reports/${row.id}`} className="btn btn-ghost" style={{ padding: '6px 10px' }}>
                        Apri ticket
                      </Link>
                    </td>
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

function priorityBadge(priority: string) {
  switch (priority) {
    case 'urgent': return 'badge-danger';
    case 'high': return 'badge-warning';
    case 'low': return 'badge-neutral';
    default: return 'badge-purple';
  }
}
