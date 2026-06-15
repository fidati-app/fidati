import { Link } from 'react-router-dom';

import { formatDate, verificationBadge } from '@/utils/format';
import { auditNarrativeSummary, type AuditLogRow } from '@/components/ui/AuditTimelineCard';

type Props = {
  id: string;
  name: string;
  category?: string;
  city?: string;
  verificationStatus?: string;
  accountStatus?: string;
  date?: string;
  linkTo: string;
  linkLabel?: string;
};

export function ProPreviewRow({
  name,
  category,
  city,
  verificationStatus,
  accountStatus,
  date,
  linkTo,
  linkLabel = 'Apri scheda',
}: Props) {
  const badge = verificationBadge(verificationStatus ?? 'unverified', accountStatus);

  return (
    <div className="preview-row">
      <div className="preview-row-main">
        <div className="preview-row-title">{name}</div>
        <div className="preview-row-meta">
          {category ? <span>{category}</span> : null}
          {city ? <span>· {city}</span> : null}
          {date ? <span>· {formatDate(date)}</span> : null}
        </div>
      </div>
      <div className="preview-row-actions">
        <span className={`badge ${badge.className}`}>{badge.label}</span>
        <Link to={linkTo} className="btn btn-ghost btn-sm">{linkLabel}</Link>
      </div>
    </div>
  );
}

export function AuditPreviewRow({
  row,
  linkTo,
}: {
  row: AuditLogRow;
  linkTo?: string;
}) {
  const summary = auditNarrativeSummary(row);
  const adminRaw = row.admin_users;
  const adminName = Array.isArray(adminRaw) ? adminRaw[0]?.full_name : adminRaw?.full_name;

  const content = (
    <div className="preview-row">
      <div className="preview-row-main">
        <div className="preview-row-title">{summary}</div>
        <div className="preview-row-meta">
          {adminName ? <span>{adminName}</span> : null}
          <span>· {formatDate(row.created_at)}</span>
        </div>
      </div>
      {linkTo ? <span className="kpi-card-link">Dettaglio →</span> : null}
    </div>
  );

  if (linkTo) return <Link to={linkTo} className="preview-row-link">{content}</Link>;
  return content;
}
