import { useEffect, useState } from 'react';

import {
  fetchProfessionalChangeResponses,
  responseStatusLabel,
  responseTypeLabel,
  reviewChangeResponse,
  type ChangeRequestResponseRow,
} from '@/services/changeRequestResponsesService';
import { formatDate } from '@/utils/format';

type Props = {
  professionalId: string;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  onReviewComplete?: () => void;
};

export function ProfessionalResponsesPanel({ professionalId, showToast, onReviewComplete }: Props) {
  const [rows, setRows] = useState<ChangeRequestResponseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    void fetchProfessionalChangeResponses(professionalId)
      .then(setRows)
      .catch((e) => showToast(e instanceof Error ? e.message : 'Errore caricamento risposte', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [professionalId]);

  const handleReview = async (id: string, status: 'accepted' | 'rejected') => {
    setBusyId(id);
    try {
      await reviewChangeResponse(id, status, true);
      showToast(status === 'accepted' ? 'Correzione approvata' : 'Correzione rifiutata');
      load();
      onReviewComplete?.();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Operazione fallita', 'error');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <div className="empty-state">Caricamento risposte professionista…</div>;
  }

  if (rows.length === 0) {
    return <div className="empty-state">Nessuna risposta dal professionista</div>;
  }

  return (
    <div className="review-panel review-panel-spacious">
      <h3 className="section-title">Risposte del professionista</h3>
      <p className="muted" style={{ marginTop: 0, marginBottom: 16 }}>
        Correzioni e spiegazioni inviate in risposta alle richieste di modifica.
      </p>
      <div className="audit-timeline">
        {rows.map((row) => {
          const notif = row.professional_internal_notifications;
          return (
            <article key={row.id} className="audit-timeline-item">
              <div className="audit-timeline-content" style={{ gridColumn: '1 / -1' }}>
                <div className="audit-timeline-head">
                  <span className={`badge ${row.status === 'submitted' ? 'badge-warning' : row.status === 'accepted' ? 'badge-success' : row.status === 'rejected' ? 'badge-danger' : 'badge-info'}`}>
                    {responseStatusLabel(row.status)}
                  </span>
                  <time className="audit-timeline-time">{formatDate(row.created_at)}</time>
                </div>
                <div className="audit-timeline-headline">
                  {responseTypeLabel(row.response_type)} · {row.area}
                </div>
                {notif ? (
                  <div className="audit-timeline-line">
                    Richiesta collegata: {notif.title || notif.type}
                  </div>
                ) : null}
                {row.message ? (
                  <div className="audit-timeline-line">Messaggio: {row.message}</div>
                ) : null}
                {row.new_value ? (
                  <pre className="code-block" style={{ maxHeight: 120, marginTop: 8 }}>
                    {JSON.stringify(row.new_value, null, 2)}
                  </pre>
                ) : null}
                {row.attachment_url ? (
                  <div style={{ marginTop: 8 }}>
                    <a href={row.attachment_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                      Apri allegato
                    </a>
                  </div>
                ) : null}
                {row.status === 'submitted' || row.status === 'reviewed' ? (
                  <div className="inline-actions" style={{ marginTop: 12 }}>
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      disabled={busyId === row.id}
                      onClick={() => void handleReview(row.id, 'accepted')}
                    >
                      Approva
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      disabled={busyId === row.id}
                      onClick={() => void handleReview(row.id, 'rejected')}
                    >
                      Rifiuta
                    </button>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
