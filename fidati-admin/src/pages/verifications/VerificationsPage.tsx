import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { fetchVerificationsByStatus } from '@/services/professionalsService';
import { formatDate, verificationBadge } from '@/utils/format';

const TABS = [
  { id: 'pending_review', label: 'In attesa' },
  { id: 'verified', label: 'Approvate' },
  { id: 'rejected', label: 'Rifiutate' },
  { id: 'changes_requested', label: 'Modifiche richieste' },
  { id: 'banned', label: 'Bannati' },
  { id: 'all', label: 'Storico completo' },
] as const;

export function VerificationsPage() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState<string>(params.get('status') ?? 'pending_review');
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchVerificationsByStatus>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void fetchVerificationsByStatus(tab)
      .then(setRows)
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <>
      <div className="page-header">
        <h2>Verifiche professionisti</h2>
        <p>Team revisione — approva, rifiuta o richiedi modifiche con audit log</p>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab-btn${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        {loading ? (
          <div className="empty-state">Caricamento…</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">Nessun dato disponibile per questo filtro</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Professionista</th>
                  <th>Categoria</th>
                  <th>Città</th>
                  <th>Data richiesta</th>
                  <th>Stato verifica</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const badge = verificationBadge(row.verification_status, row.account_status);
                  return (
                    <tr key={row.id}>
                      <td>{row.name}</td>
                      <td>{row.category_label}</td>
                      <td>{row.base_city ?? '—'}</td>
                      <td>{formatDate(row.verification_requested_at)}</td>
                      <td><span className={`badge ${badge.className}`}>{badge.label}</span></td>
                      <td>
                        <Link to={`/verifications/${row.id}`} className="btn btn-ghost btn-sm">
                          {tab === 'pending_review' ? 'Revisiona' : 'Apri scheda'}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
