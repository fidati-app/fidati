import { useEffect, useState } from 'react';

import { fetchPayments, fetchRefunds } from '@/services/accountingService';
import { formatDate, formatMoney } from '@/utils/format';

export function AccountingPage() {
  const [payments, setPayments] = useState<Awaited<ReturnType<typeof fetchPayments>>>([]);
  const [refunds, setRefunds] = useState<Awaited<ReturnType<typeof fetchRefunds>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([fetchPayments(), fetchRefunds()]).then(([p, r]) => {
      setPayments(p);
      setRefunds(r);
      setLoading(false);
    });
  }, []);

  const revenue = payments.reduce((sum, p) => sum + Number(p.amount ?? 0), 0);
  const refundsTotal = refunds.reduce((sum, r) => sum + Number(r.amount ?? 0), 0);

  return (
    <>
      <div className="page-header">
        <h2>Contabilità</h2>
        <p>Transazioni, commissioni, rimborsi e report finanziari</p>
      </div>

      <div className="kpi-grid">
        <div className="card kpi-card">
          <div className="kpi-label">Transazioni</div>
          <div className="kpi-value">{payments.length}</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-label">Volume pagamenti</div>
          <div className="kpi-value">{formatMoney(revenue)}</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-label">Rimborsi</div>
          <div className="kpi-value">{refunds.length} · {formatMoney(refundsTotal)}</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-label">Commissioni stimate (12%)</div>
          <div className="kpi-value">{formatMoney(revenue * 0.12)}</div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">Caricamento…</div>
        ) : payments.length === 0 ? (
          <div className="empty-state">
            Nessun dato disponibile — la UI è pronta per transazioni, payout e fatture future.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Servizio</th>
                  <th>Importo</th>
                  <th>Stato</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                    <tr key={p.id}>
                      <td>{p.customers?.name ?? '—'}</td>
                      <td>{p.bookings?.service_title ?? '—'}</td>
                      <td>{formatMoney(Number(p.amount))}</td>
                      <td>{p.status}</td>
                      <td>{formatDate(p.created_at)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
