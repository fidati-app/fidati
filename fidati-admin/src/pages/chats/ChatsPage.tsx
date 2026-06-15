import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { fetchConversations } from '@/services/chatService';
import { formatDate } from '@/utils/format';

export function ChatsPage() {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchConversations>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void fetchConversations(search).then(setRows).finally(() => setLoading(false));
  }, [search]);

  return (
    <>
      <div className="page-header">
        <h2>Chat</h2>
        <p>Conversazioni reali tra clienti e professionisti — nessun messaggio demo</p>
      </div>
      <div className="card">
        <div className="table-toolbar">
          <input placeholder="Cerca cliente, professionista, messaggio…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {loading ? (
          <div className="empty-state">Caricamento…</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">Nessuna conversazione trovata</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Professionista</th>
                  <th>Ultimo messaggio</th>
                  <th>Data</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const c = row.customers;
                  const p = row.professionals;
                  return (
                    <tr key={row.id}>
                      <td>{c?.name ?? '—'}</td>
                      <td>{p?.name ?? '—'}</td>
                      <td>{row.last_message?.slice(0, 60)}</td>
                      <td>{formatDate(row.last_message_at ?? '')}</td>
                      <td>
                        <Link to={`/chats/${row.id}`} className="btn btn-ghost" style={{ padding: '6px 10px' }}>
                          Apri
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
