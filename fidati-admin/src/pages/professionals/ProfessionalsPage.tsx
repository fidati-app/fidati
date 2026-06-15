import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { fetchServiceCategories } from '@/services/adminService';
import { fetchProfessionals } from '@/services/professionalsService';
import { formatDate, verificationBadge } from '@/utils/format';
import { ACCOUNT_STATUS_OPTIONS } from '@/constants/changeRequestPresets';

type SortKey = 'created_at' | 'verification_status' | 'base_city' | 'rating';

export function ProfessionalsPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') ?? '');
  const [status, setStatus] = useState(params.get('status') ?? 'all');
  const [city, setCity] = useState(params.get('city') ?? '');
  const [categoryId, setCategoryId] = useState(params.get('categoryId') ?? '');
  const [accountStatus, setAccountStatus] = useState(params.get('accountStatus') ?? 'all');
  const [hasProApp, setHasProApp] = useState(params.get('hasProApp') ?? 'all');
  const [dateFrom, setDateFrom] = useState(params.get('dateFrom') ?? '');
  const [dateTo, setDateTo] = useState(params.get('dateTo') ?? '');
  const [minRating, setMinRating] = useState(Number(params.get('minRating') ?? 0));
  const [sort, setSort] = useState<SortKey>((params.get('sort') as SortKey) ?? 'created_at');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [categories, setCategories] = useState<Awaited<ReturnType<typeof fetchServiceCategories>>>([]);
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchProfessionals>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchServiceCategories().then(setCategories);
  }, []);

  useEffect(() => {
    const next = new URLSearchParams();
    if (search) next.set('search', search);
    if (status !== 'all') next.set('status', status);
    if (city) next.set('city', city);
    if (categoryId) next.set('categoryId', categoryId);
    if (accountStatus !== 'all') next.set('accountStatus', accountStatus);
    if (hasProApp !== 'all') next.set('hasProApp', hasProApp);
    if (dateFrom) next.set('dateFrom', dateFrom);
    if (dateTo) next.set('dateTo', dateTo);
    if (minRating > 0) next.set('minRating', String(minRating));
    if (sort !== 'created_at') next.set('sort', sort);
    setParams(next, { replace: true });
  }, [search, status, city, categoryId, accountStatus, hasProApp, dateFrom, dateTo, minRating, sort, setParams]);

  useEffect(() => {
    setLoading(true);
    void fetchProfessionals({ search, status, city, categoryId, accountStatus, hasProApp, sort, dateFrom, dateTo, minRating })
      .then(setRows)
      .finally(() => setLoading(false));
  }, [search, status, city, categoryId, accountStatus, hasProApp, sort, dateFrom, dateTo, minRating]);

  return (
    <>
      <div className="page-header">
        <h2>Professionisti</h2>
        <p>Elenco completo professionisti Fidati Pro e marketplace</p>
      </div>

      <div className="card">
        <div className="filters-panel">
          <input placeholder="Cerca nome, email, telefono…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Stato verifica: tutti</option>
            <option value="unverified">Non verificati</option>
            <option value="pending_review">In verifica</option>
            <option value="verified">Verificati</option>
            <option value="rejected">Rifiutati</option>
            <option value="changes_requested">Modifiche richieste</option>
            <option value="banned">Bannati</option>
          </select>
          <input placeholder="Città operante…" value={city} onChange={(e) => setCity(e.target.value)} />
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Tutte le categorie</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAdvanced((v) => !v)}>
            {showAdvanced ? 'Nascondi filtri' : 'Filtri avanzati'}
          </button>
        </div>

        {showAdvanced ? (
          <div className="filters-panel filters-panel-secondary">
            <select value={accountStatus} onChange={(e) => setAccountStatus(e.target.value)}>
              <option value="all">Stato account: tutti</option>
              {ACCOUNT_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select value={hasProApp} onChange={(e) => setHasProApp(e.target.value)} title="Registrato tramite app Fidati Pro">
              <option value="all">Registrazione: tutti</option>
              <option value="yes">Registrato da app Pro</option>
              <option value="no">Non da app Pro</option>
            </select>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            <input type="number" min={0} max={5} step={0.1} placeholder="Valutazione min." value={minRating || ''} onChange={(e) => setMinRating(Number(e.target.value) || 0)} />
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              <option value="created_at">Ordina: data registrazione</option>
              <option value="verification_status">Ordina: stato verifica</option>
              <option value="base_city">Ordina: città operante</option>
              <option value="rating">Ordina: valutazione</option>
            </select>
          </div>
        ) : null}

        {loading ? (
          <div className="empty-state">Caricamento…</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">Nessun professionista trovato</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table data-table-comfort">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Città operante</th>
                  <th>Stato verifica</th>
                  <th>Valutazione</th>
                  <th>Registrato il</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const badge = verificationBadge(row.verification_status, row.account_status);
                  return (
                    <tr key={row.id}>
                      <td><strong>{row.name}</strong></td>
                      <td>{row.category_label}</td>
                      <td>{row.base_city ?? '—'}</td>
                      <td><span className={`badge ${badge.className}`}>{badge.label}</span></td>
                      <td>{row.rating} <span style={{ color: 'var(--text-muted)' }}>({row.review_count})</span></td>
                      <td>{formatDate(row.created_at)}</td>
                      <td>
                        <Link to={`/professionals/${row.id}`} className="btn btn-ghost btn-sm">Apri scheda</Link>
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
