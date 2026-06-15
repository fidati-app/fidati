import { formatDate } from '@/utils/format';
import { formatAuditNarrative, type AuditRowInput } from '@/utils/auditNarrative';

export type AuditLogRow = AuditRowInput & { id?: string; created_at?: string };

function normalizeAdmin(
  admin: AuditRowInput['admin_users'],
): { full_name?: string; role?: string } | null {
  if (!admin) return null;
  if (Array.isArray(admin)) return admin[0] ?? null;
  return admin;
}

function toAuditRow(row: AuditLogRow): AuditRowInput {
  return {
    action: row.action,
    target_type: row.target_type ?? 'system',
    target_id: row.target_id,
    metadata: row.metadata,
    admin_users: normalizeAdmin(row.admin_users),
  };
}

const BADGE_CLASS: Record<string, string> = {
  Verifica: 'badge-warning',
  Sicurezza: 'badge-danger',
  Impostazioni: 'badge-purple',
  Professionisti: 'badge-info',
  Segnalazioni: 'badge-neutral',
  Staff: 'badge-purple',
  Portfolio: 'badge-info',
  Documenti: 'badge-warning',
  Servizi: 'badge-info',
  Notifiche: 'badge-neutral',
  Sistema: 'badge-neutral',
};

type Props = {
  row: AuditLogRow;
  compact?: boolean;
  onClick?: () => void;
  highlighted?: boolean;
};

export function AuditTimelineCard({ row, compact, onClick, highlighted }: Props) {
  const narrative = formatAuditNarrative(toAuditRow(row));
  const badgeClass = BADGE_CLASS[narrative.badge] ?? 'badge-neutral';

  const inner = (
    <>
      <div className="audit-timeline-icon" aria-hidden>
        <span>{narrative.badge.slice(0, 1)}</span>
      </div>
      <div className="audit-timeline-content">
        <div className="audit-timeline-head">
          <span className={`badge ${badgeClass}`}>{narrative.badge}</span>
          <time className="audit-timeline-time">{formatDate(row.created_at ?? null)}</time>
        </div>
        <div className="audit-timeline-headline">{narrative.headline}</div>
        {narrative.body.map((line) => (
          <div key={line} className="audit-timeline-line">{line}</div>
        ))}
        {!compact && row.target_id ? (
          <div className="audit-timeline-meta muted">
            {row.target_type ?? 'system'}
            {row.target_id ? ` · ${row.target_id.slice(0, 8)}…` : ''}
          </div>
        ) : null}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={`audit-timeline-item audit-timeline-item--clickable${highlighted ? ' audit-timeline-item--highlight' : ''}`}
        onClick={onClick}
      >
        {inner}
      </button>
    );
  }

  return (
    <article className={`audit-timeline-item${highlighted ? ' audit-timeline-item--highlight' : ''}`}>
      {inner}
    </article>
  );
}

export function auditNarrativeSummary(row: AuditLogRow): string {
  const { headline, body } = formatAuditNarrative(toAuditRow(row));
  const first = body[0] ?? '';
  return first ? `${headline} ${first}` : headline;
}
