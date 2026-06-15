import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { PermissionGate } from '@/components/auth/PermissionGate';
import { fetchBookingRequests } from '@/services/requestsService';
import { formatDate, formatMoney, requestStatusLabel } from '@/utils/format';

export function RequestsPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(params.get('status') ?? 'all');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [customer, setCustomer] = useState('');
  const [professional, setProfessional] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchBookingRequests>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.get('status')) setStatus(params.get('status')!);
  }, [params]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (status !== 'all') next.set('status', status);
    setParams(next, { replace: true });
  }, [status, setParams]);

  useEffect(() => {
    setLoading(true);
    void fetchBookingRequests({ search, status, category, city, customer, professional, dateFrom, dateTo })
      .then(setRows)
      .finally(() => setLoading(false));
  }, [search, status, category, city, customer, professional, dateFrom, dateTo]);

  return (
    <PermissionGate permission="requests.view">
      <div className="page-header">
        <h2>Richieste</h2>
        <p>Tutte le richieste clienti — presenti, passate, completate e annullate</p>
      </div>
      <div className="card">
        <div className="filters-panel">
          <input placeholder="Cerca servizio o zona…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Tutti gli stati</option>
            <option value="pending">In attesa</option>
            <option value="accepted">Accettate</option>
            <option value="declined">Rifiutate</option>
            <option value="completed">Completate</option>
            <option value="cancelled">Annullate</option>
          </select>
          <input placeholder="Categoria…" value={category} onChange={(e) => setCategory(e.target.value)} />
          <input placeholder="Città…" value={city} onChange={(e) => setCity(e.target.value)} />
          <input placeholder="Cliente…" value={customer} onChange={(e) => setCustomer(e.target.value)} />
          <input placeholder="Professionista…" value={professional} onChange={(e) => setProfessional(e.target.value)} />
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        {loading ? (
          <div className="empty-state">Caricamento…</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">Nessuna richiesta trovata</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table data-table-comfort">
              <thead>
                <tr>
                  <th>Servizio</th>
                  <th>Cliente</th>
                  <th>Professionista</th>
                  <th>Stato</th>
                  <th>Città</th>
                  <th>Data</th>
                  <th>Importo</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.service_title}</td>
                    <td>{row.customers?.name ?? '—'}</td>
                    <td>{row.professionals?.name ?? '—'}</td>
                    <td><span className="badge badge-neutral">{requestStatusLabel(row.status)}</span></td>
                    <td>{row.zone ?? '—'}</td>
                    <td>{row.scheduled_date ?? formatDate(row.created_at)}</td>
                    <td>{formatMoney(Number(row.price ?? 0))}</td>
                    <td>
                      <Link to={`/requests/${row.id}`} className="btn btn-ghost btn-sm">Dettaglio</Link>
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
