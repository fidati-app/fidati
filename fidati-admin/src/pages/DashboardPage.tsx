import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ClipboardList,
  Flag,
  ShieldCheck,
  UserCircle,
  Users,
  Wallet,
} from 'lucide-react';

import { KpiCard } from '@/components/ui/KpiCard';
import { AuditPreviewRow, ProPreviewRow } from '@/components/ui/PreviewRow';
import {
  checkSystemHealth,
  fetchDashboardStats,
  fetchPendingVerificationPreview,
  fetchProfessionalsGrowthByDays,
  fetchRecentAuditLogs,
  fetchRecentProfessionals,
  fetchRecentReports,
} from '@/services/dashboardService';
import { formatDate, formatMoney, reportStatusLabel } from '@/utils/format';

type GrowthPeriod = 7 | 30 | 90;

export function DashboardPage() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchDashboardStats>> | null>(null);
  const [growthPeriod, setGrowthPeriod] = useState<GrowthPeriod>(30);
  const [growth, setGrowth] = useState<Awaited<ReturnType<typeof fetchProfessionalsGrowthByDays>>>([]);
  const [audit, setAudit] = useState<Awaited<ReturnType<typeof fetchRecentAuditLogs>>>([]);
  const [recentPros, setRecentPros] = useState<Awaited<ReturnType<typeof fetchRecentProfessionals>>>([]);
  const [pending, setPending] = useState<Awaited<ReturnType<typeof fetchPendingVerificationPreview>>>([]);
  const [reports, setReports] = useState<Awaited<ReturnType<typeof fetchRecentReports>>>([]);
  const [health, setHealth] = useState<Awaited<ReturnType<typeof checkSystemHealth>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const [s, a, rp, pv, rr, h] = await Promise.all([
        fetchDashboardStats(),
        fetchRecentAuditLogs(8),
        fetchRecentProfessionals(6),
        fetchPendingVerificationPreview(6),
        fetchRecentReports(5),
        checkSystemHealth(),
      ]);
      setStats(s);
      setAudit(a);
      setRecentPros(rp);
      setPending(pv);
      setReports(rr);
      setHealth(h);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    void fetchProfessionalsGrowthByDays(growthPeriod).then(setGrowth);
  }, [growthPeriod]);

  if (loading || !stats) {
    return (
      <>
        <div className="page-header"><h2>Dashboard</h2><p>Caricamento centro operativo…</p></div>
        <div className="kpi-grid-primary">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="card kpi-card-lg skeleton" style={{ height: 120 }} />)}</div>
      </>
    );
  }

  return (
    <>
      <div className="page-header page-header-row">
        <div>
          <h2>Dashboard</h2>
          <p>Centro operativo Fidati — verifiche, professionisti, richieste e segnalazioni</p>
        </div>
        {health ? (
          <div className="health-badges">
            <span className={`badge ${health.supabase ? 'badge-success' : 'badge-danger'}`}>Database {health.supabase ? 'OK' : 'Errore'}</span>
            <span className={`badge ${health.storage ? 'badge-success' : 'badge-warning'}`}>Storage {health.storage ? 'OK' : 'N/D'}</span>
          </div>
        ) : null}
      </div>

      <div className="kpi-grid-primary">
        <KpiCard label="Professionisti totali" value={stats.professionalsTotal} to="/professionals" icon={Users} accent="brand" hint={`${stats.professionalsVerified} verificati`} />
        <KpiCard label="Verifiche in attesa" value={stats.pendingVerifications} to="/verifications?status=pending_review" icon={ShieldCheck} accent="warning" />
        <KpiCard label="Richieste aperte" value={stats.openRequests} to="/requests?status=pending" icon={ClipboardList} accent="purple" hint={`${stats.requestsTotal} totali`} />
        <KpiCard label="Segnalazioni aperte" value={stats.openReports} to="/reports?status=open" icon={Flag} accent="danger" />
        <KpiCard label="Clienti totali" value={stats.customersTotal} to="/customers" icon={UserCircle} accent="neutral" />
        <KpiCard label="Volume pagamenti" value={formatMoney(stats.revenueTotal)} to="/accounting" icon={Wallet} accent="success" hint={`${stats.paymentsTotal} transazioni`} />
      </div>

      <div className="dashboard-grid">
        <div className="card chart-card-lg">
          <div className="section-header">
            <div>
              <h3>Nuovi professionisti registrati</h3>
              <p className="section-sub">Registrazioni nel periodo selezionato</p>
            </div>
            <div className="segment-control">
              {([7, 30, 90] as GrowthPeriod[]).map((d) => (
                <button key={d} type="button" className={`segment-btn${growthPeriod === d ? ' active' : ''}`} onClick={() => setGrowthPeriod(d)}>
                  {d} giorni
                </button>
              ))}
            </div>
          </div>
          {growth.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={growth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#141f35', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 10 }} />
                <Legend />
                <Bar dataKey="total" name="Nuovi registrati" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={48} />
                <Bar dataKey="verified" name="Verificati nel periodo" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state empty-state-chart">
              <div className="empty-state-title">Nessun dato nel periodo</div>
              <p>Quando arriveranno nuove registrazioni, il grafico mostrerà l&apos;andamento.</p>
            </div>
          )}
        </div>

        <div className="card section-card">
          <div className="section-header">
            <div>
              <h3>Attività recenti staff</h3>
              <p className="section-sub">Azioni importanti registrate per controllo interno</p>
            </div>
            <Link to="/audit" className="btn btn-ghost btn-sm">Vedi tutto →</Link>
          </div>
          {audit.length === 0 ? (
            <div className="empty-state">Nessuna azione registrata</div>
          ) : (
            <div className="preview-list">
              {audit.map((log) => (
                <AuditPreviewRow
                  key={log.id}
                  row={log}
                  linkTo={`/audit?highlight=${log.id}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card section-card">
          <div className="section-header">
            <h3>Verifiche in attesa</h3>
            <Link to="/verifications?status=pending_review" className="btn btn-warning btn-sm">Vai alle verifiche</Link>
          </div>
          {pending.length === 0 ? (
            <div className="empty-state">Nessuna verifica in coda</div>
          ) : (
            <div className="preview-list">
              {pending.map((p) => (
                <ProPreviewRow
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  category={p.category_label}
                  city={p.base_city ?? undefined}
                  verificationStatus={p.verification_status}
                  date={p.verification_requested_at ?? p.created_at}
                  linkTo={`/verifications/${p.id}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="card section-card">
          <div className="section-header">
            <h3>Ultimi professionisti registrati</h3>
            <Link to="/professionals" className="btn btn-ghost btn-sm">Vedi tutti</Link>
          </div>
          {recentPros.length === 0 ? (
            <div className="empty-state">Nessun professionista</div>
          ) : (
            <div className="preview-list">
              {recentPros.map((p) => (
                <ProPreviewRow
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  category={p.category_label}
                  city={p.base_city ?? undefined}
                  verificationStatus={p.verification_status}
                  accountStatus={p.account_status}
                  date={p.created_at}
                  linkTo={`/professionals/${p.id}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {reports.length > 0 ? (
        <div className="card section-card" style={{ marginTop: 16 }}>
          <div className="section-header">
            <h3>Ultime segnalazioni</h3>
            <Link to="/reports" className="btn btn-ghost btn-sm">Vedi tutte</Link>
          </div>
          <div className="preview-list">
            {reports.map((r) => (
              <Link key={r.id} to={`/reports/${r.id}`} className="preview-row-link">
                <div className="preview-row">
                  <div className="preview-row-main">
                    <div className="preview-row-title">{r.reason.slice(0, 80)}</div>
                    <div className="preview-row-meta"><span>{formatDate(r.created_at)}</span></div>
                  </div>
                  <span className="badge badge-neutral">{reportStatusLabel(r.status)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
