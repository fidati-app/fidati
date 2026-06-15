import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

type KpiCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  to?: string;
  icon?: LucideIcon;
  accent?: 'brand' | 'success' | 'warning' | 'danger' | 'purple' | 'neutral';
};

const ACCENTS: Record<NonNullable<KpiCardProps['accent']>, string> = {
  brand: 'kpi-accent-brand',
  success: 'kpi-accent-success',
  warning: 'kpi-accent-warning',
  danger: 'kpi-accent-danger',
  purple: 'kpi-accent-purple',
  neutral: 'kpi-accent-neutral',
};

export function KpiCard({ label, value, hint, to, icon: Icon, accent = 'brand' }: KpiCardProps) {
  const inner = (
    <>
      <div className="kpi-card-top">
        <span className="kpi-card-label">{label}</span>
        {Icon ? <Icon size={18} className="kpi-card-icon" /> : null}
      </div>
      <div className="kpi-card-value">{value}</div>
      {hint ? <div className="kpi-card-hint">{hint}</div> : null}
      {to ? <span className="kpi-card-link">Apri sezione →</span> : null}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`card kpi-card-lg kpi-clickable ${ACCENTS[accent]}`}>
        {inner}
      </Link>
    );
  }

  return <div className={`card kpi-card-lg ${ACCENTS[accent]}`}>{inner}</div>;
}
