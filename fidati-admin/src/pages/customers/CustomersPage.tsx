import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { fetchCustomers } from '@/services/customersService';
import { formatDate } from '@/utils/format';

export function CustomersPage() {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchCustomers>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchCustomers(search)
      .then(setRows)
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <>
      <div className="page-header">
        <h2>Clienti</h2>
        <p>Utenti app cliente Fidati</p>
      </div>
      <div className="card">
        <div className="table-toolbar">
          <input placeholder="Cerca cliente…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {loading ? (
          <div className="empty-state">Caricamento…</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">Nessun dato disponibile</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Prenotazioni</th>
                  <th>Completate</th>
                  <th>Registrato</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.email ?? '—'}</td>
                    <td>{row.bookings_count}</td>
                    <td>{row.completed_count}</td>
                    <td>{formatDate(row.created_at)}</td>
                    <td>
                      <Link to={`/customers/${row.id}`} className="btn btn-ghost" style={{ padding: '6px 10px' }}>
                        Dettaglio
                      </Link>
                    </td>
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
