import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchCustomerDetail } from '@/services/customersService';
import { formatMoney } from '@/utils/format';

export function CustomerDetailPage() {
  const { id = '' } = useParams();
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchCustomerDetail>> | null>(null);

  useEffect(() => {
    void fetchCustomerDetail(id).then(setData);
  }, [id]);

  if (!data?.customer) return <div className="empty-state">Cliente non trovato</div>;

  return (
    <>
      <div className="page-header">
        <Link to="/customers" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          ← Clienti
        </Link>
        <h2>{data.customer.name}</h2>
      </div>
      <div className="two-col">
        <div className="card review-panel">
          <h3>Profilo</h3>
          <div className="meta-list">
            <div className="meta-row"><span>Email</span><span>{data.customer.email ?? '—'}</span></div>
            <div className="meta-row"><span>Telefono</span><span>{data.customer.phone ?? '—'}</span></div>
            <div className="meta-row"><span>Prenotazioni</span><span>{data.customer.bookings_count}</span></div>
          </div>
        </div>
        <div className="card review-panel">
          <h3>Segnalazioni</h3>
          {data.reports.length === 0 ? (
            <div className="empty-state">Nessuna segnalazione</div>
          ) : (
            data.reports.map((r) => (
              <div key={r.id} className="meta-row">
                <span>{r.reason}</span>
                <span>{r.status}</span>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="card review-panel" style={{ marginTop: 16 }}>
        <h3>Richieste effettuate</h3>
        {data.requests.length === 0 ? (
          <div className="empty-state">Nessuna richiesta</div>
        ) : (
          data.requests.map((req) => (
            <div key={req.id} className="meta-row">
              <span>{req.service_title}</span>
              <span>
                {req.status} · {formatMoney(Number(req.price))}
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
}
