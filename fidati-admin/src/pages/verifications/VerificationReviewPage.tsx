import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { AuditTimelineCard } from '@/components/ui/AuditTimelineCard';
import { ChangeRequestModal } from '@/components/ui/ChangeRequestModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { MediaPhotoCard } from '@/components/ui/MediaPhotoCard';
import { DOCUMENT_CHANGE_PRESETS, PORTFOLIO_CHANGE_PRESETS, SERVICE_CHANGE_PRESETS, VERIFICATION_CHANGE_AREAS, VERIFICATION_CHANGE_PRESETS } from '@/constants/changeRequestPresets';
import { useToast } from '@/contexts/ToastContext';
import { requestPortfolioChange, requestProfessionalChanges, requestServiceChange } from '@/services/notificationService';
import {
  approveVerification,
  banProfessional,
  fetchProfessionalById,
  fetchProfessionalDetailBundle,
  getSignedDocumentUrl,
  rejectVerification,
  requestVerificationChanges,
} from '@/services/professionalsService';
import { documentTypeLabel, formatDate, formatMoney, verificationBadge } from '@/utils/format';

type ModalKind = 'approve' | 'reject' | 'changes' | 'ban' | null;

export function VerificationReviewPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [professional, setProfessional] = useState<Awaited<ReturnType<typeof fetchProfessionalById>>>(null);
  const [bundle, setBundle] = useState<Awaited<ReturnType<typeof fetchProfessionalDetailBundle>> | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalKind>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; title: string } | null>(null);
  const [photoChangeTarget, setPhotoChangeTarget] = useState<{ photoId: string } | null>(null);
  const [docChangeArea, setDocChangeArea] = useState<string | null>(null);
  const [serviceChangeTarget, setServiceChangeTarget] = useState<{ serviceId: string; title: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const pro = await fetchProfessionalById(id);
      setProfessional(pro);
      if (!pro) return;
      const detail = await fetchProfessionalDetailBundle(id);
      setBundle(detail);

      const doc = detail.document;
      const [front, back, selfie] = await Promise.all([
        getSignedDocumentUrl(doc?.front_image_url),
        getSignedDocumentUrl(doc?.back_image_url),
        getSignedDocumentUrl(doc?.selfie_image_url),
      ]);
      setSignedUrls({ front, back, selfie });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const badge = useMemo(
    () => verificationBadge(professional?.verification_status ?? 'unverified', professional?.account_status),
    [professional],
  );

  const [changeAreas, setChangeAreas] = useState<string[]>([]);

  const runAction = async (action: ModalKind, changePayload?: { message: string; preset?: string; areas: string[] }) => {
    if (!id || !action) return;
    setBusy(true);
    try {
      if (action === 'approve') await approveVerification(id);
      if (action === 'reject') await rejectVerification(id, reason);
      if (action === 'changes') {
        await requestVerificationChanges(
          id,
          changePayload?.message ?? reason,
          changePayload?.areas ?? changeAreas,
          changePayload?.preset,
        );
      }
      if (action === 'ban') await banProfessional(id, reason || 'Violazione policy Fidati');

      showToast(
        action === 'approve'
          ? 'Verifica approvata — il professionista sarà visibile su Fidati'
          : action === 'ban'
            ? 'Professionista bannato'
            : 'Operazione completata',
        action === 'ban' ? 'error' : 'success',
      );
      setModal(null);
      setReason('');
      setChangeAreas([]);
      if (action === 'approve') navigate('/verifications');
      else void load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Operazione fallita', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handlePhotoChangeRequest = async (payload: { preset?: string; message: string; areas: string[] }) => {
    if (!id || !photoChangeTarget) return;
    setBusy(true);
    try {
      await requestPortfolioChange(id, photoChangeTarget.photoId, payload.message, payload.preset);
      showToast('Richiesta modifica foto inviata');
      setPhotoChangeTarget(null);
      void load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Invio richiesta fallito', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleDocPartChange = async (payload: { preset?: string; message: string; areas: string[] }) => {
    if (!id || !docChangeArea) return;
    setBusy(true);
    try {
      await requestProfessionalChanges({
        professionalId: id,
        areas: [docChangeArea],
        message: payload.message,
        preset: payload.preset,
      });
      showToast('Richiesta modifica documento inviata');
      setDocChangeArea(null);
      void load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Invio richiesta fallito', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleServiceChangeRequest = async (payload: { preset?: string; message: string; areas: string[] }) => {
    if (!id || !serviceChangeTarget) return;
    setBusy(true);
    try {
      await requestServiceChange(id, serviceChangeTarget.serviceId, payload.message, payload.preset);
      showToast(`Richiesta modifica inviata per «${serviceChangeTarget.title}»`);
      setServiceChangeTarget(null);
      void load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Invio richiesta fallito', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="empty-state">Caricamento revisione professionista…</div>;
  }

  if (!professional) {
    return (
      <div className="empty-state">
        Professionista non trovato. <Link to="/verifications">Torna alle verifiche</Link>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <Link to="/verifications" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          ← Verifiche in attesa
        </Link>
        <h2>{professional.name}</h2>
        <p>
          {professional.category_label} · {professional.base_city ?? 'Città N/D'} ·{' '}
          <span className={`badge ${badge.className}`}>{badge.label}</span>
        </p>
      </div>

      <div className="review-grid">
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="card review-panel review-panel-spacious">
            <h3>Documento identità</h3>
            <div className="meta-list meta-list-spaced">
              <div className="meta-row">
                <span>Tipo documento</span>
                <span>{documentTypeLabel(bundle?.document?.document_type)}</span>
              </div>
              <div className="meta-row">
                <span>Richiesta inviata</span>
                <span>{formatDate(professional.verification_requested_at as string | null)}</span>
              </div>
            </div>
            {!signedUrls.front && !signedUrls.back && !signedUrls.selfie ? (
              <div className="empty-state">Nessun documento caricato</div>
            ) : (
              <div className="document-gallery">
                {signedUrls.front ? (
                  <MediaPhotoCard
                    layout="document"
                    src={signedUrls.front}
                    title="Fronte"
                    subtitle={documentTypeLabel(bundle?.document?.document_type)}
                    onOpen={() => setLightbox({ src: signedUrls.front!, title: 'Fronte documento' })}
                    onRequestChange={() => setDocChangeArea('document_front')}
                  />
                ) : (
                  <div className="empty-state">Fronte non caricato</div>
                )}
                {signedUrls.back ? (
                  <MediaPhotoCard
                    layout="document"
                    src={signedUrls.back}
                    title="Retro"
                    subtitle={documentTypeLabel(bundle?.document?.document_type)}
                    onOpen={() => setLightbox({ src: signedUrls.back!, title: 'Retro documento' })}
                    onRequestChange={() => setDocChangeArea('document_back')}
                  />
                ) : null}
                {signedUrls.selfie ? (
                  <MediaPhotoCard
                    layout="document"
                    src={signedUrls.selfie}
                    title="Selfie"
                    subtitle="Verifica identità"
                    onOpen={() => setLightbox({ src: signedUrls.selfie!, title: 'Selfie verifica' })}
                    onRequestChange={() => setDocChangeArea('selfie')}
                  />
                ) : (
                  !signedUrls.front && !signedUrls.back ? null : (
                    <div className="empty-state">Selfie non caricato</div>
                  )
                )}
              </div>
            )}
          </div>

          <div className="card review-panel review-panel-spacious">
            <h3>Foto lavori ({Math.min(bundle?.workPhotos.length ?? 0, 6)}{bundle && bundle.workPhotos.length > 6 ? ` di ${bundle.workPhotos.length}` : ''})</h3>
            {bundle?.workPhotos.length ? (
              <div className="work-photos-grid">
                {bundle.workPhotos.slice(0, 6).map((photo) => (
                  <MediaPhotoCard
                    key={photo.id}
                    layout="work"
                    src={photo.image_url}
                    title={photo.title?.trim() || 'Senza titolo'}
                    onOpen={() => setLightbox({ src: photo.image_url, title: photo.title ?? 'Foto lavoro' })}
                    onRequestChange={() => setPhotoChangeTarget({ photoId: photo.id })}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">Nessuna foto lavori</div>
            )}
          </div>

          <div className="card review-panel">
            <h3>Servizi e prezzi</h3>
            {bundle?.services.length ? (
              <div className="meta-list">
                {bundle.services.map((service) => (
                  <div key={service.id} className="meta-row" style={{ alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div>{service.title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                        {formatMoney(Number(service.price_from))}
                        {service.price_max ? ` – ${formatMoney(Number(service.price_max))}` : ''}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={() => setServiceChangeTarget({ serviceId: service.id, title: service.title })}
                    >
                      Richiedi modifica
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">Nessun servizio configurato</div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <div className="card review-panel">
            <h3>Profilo</h3>
            {professional.image_url ? (
              <img
                src={professional.image_url}
                alt={professional.name}
                style={{ width: 88, height: 88, borderRadius: 12, objectFit: 'cover', marginBottom: 12 }}
              />
            ) : null}
            <div className="meta-list">
              <div className="meta-row">
                <span>Email</span>
                <span>{professional.email ?? '—'}</span>
              </div>
              <div className="meta-row">
                <span>Telefono</span>
                <span>{professional.phone ?? '—'}</span>
              </div>
              <div className="meta-row">
                <span>Zone servite</span>
                <span>{bundle?.zones.map((z) => z.zone_name).join(', ') || '—'}</span>
              </div>
              <div className="meta-row">
                <span>Lavori urgenti</span>
                <span>{bundle?.acceptsUrgentJobs ? 'Sì' : 'No'}</span>
              </div>
            </div>
          </div>

          <div className="card review-panel">
            <h3>Disponibilità</h3>
            {bundle?.availability.length ? (
              <div className="meta-list">
                {bundle.availability.map((day) => (
                  <div key={day.day_label} className="meta-row">
                    <span>{day.day_label}</span>
                    <span>
                      {day.is_available === false || day.status === 'off'
                        ? 'Non disponibile'
                        : day.start_time && day.end_time
                          ? `${String(day.start_time).slice(0, 5)} – ${String(day.end_time).slice(0, 5)}`
                          : day.time_ranges?.join(', ') || day.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">Disponibilità non configurata</div>
            )}
          </div>

          <div className="card review-panel">
            <h3>Azioni revisione</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 0 }}>
              Ogni azione viene registrata nell&apos;audit log staff.
            </p>
            <div className="action-bar" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
              <button type="button" className="btn btn-success" onClick={() => setModal('approve')}>
                Approva verifica
              </button>
              <button type="button" className="btn btn-warning" onClick={() => setModal('changes')}>
                Richiedi modifiche
              </button>
              <button type="button" className="btn btn-danger" onClick={() => setModal('reject')}>
                Rifiuta verifica
              </button>
              <button type="button" className="btn btn-purple" onClick={() => setModal('ban')}>
                Banna professionista
              </button>
            </div>
          </div>

          <div className="card review-panel review-panel-spacious">
            <h3>Storico azioni admin</h3>
            {bundle?.auditLogs.length ? (
              <div className="audit-timeline">
                {bundle.auditLogs.map((log) => (
                  <AuditTimelineCard key={log.id} row={log} compact />
                ))}
              </div>
            ) : (
              <div className="empty-state">Nessuna azione precedente</div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={modal === 'approve'}
        title="Approva verifica Fidati?"
        message="Il professionista risulterà verificato e visibile nell'app clienti."
        confirmLabel="Approva"
        confirmClassName="btn-success"
        loading={busy}
        onConfirm={() => void runAction('approve')}
        onCancel={() => setModal(null)}
      />

      <ConfirmModal
        open={modal === 'reject'}
        title="Rifiuta verifica"
        message="Indica il motivo del rifiuto. Il professionista potrà correggere e reinviare."
        confirmLabel="Rifiuta"
        confirmClassName="btn-danger"
        requireText="motivo"
        textValue={reason}
        onTextChange={setReason}
        textPlaceholder="Motivo del rifiuto…"
        loading={busy}
        onConfirm={() => void runAction('reject')}
        onCancel={() => {
          setModal(null);
          setReason('');
        }}
      />

      <ChangeRequestModal
        open={modal === 'changes'}
        title="Richiedi modifiche al professionista"
        description="Seleziona le sezioni da correggere. Il professionista riceverà una notifica interna in Fidati Pro."
        presets={VERIFICATION_CHANGE_PRESETS}
        showAreas={VERIFICATION_CHANGE_AREAS}
        confirmLabel="Invia richiesta modifiche"
        loading={busy}
        onConfirm={(payload) => {
          setChangeAreas(payload.areas);
          void runAction('changes', payload);
        }}
        onCancel={() => {
          setModal(null);
          setReason('');
          setChangeAreas([]);
        }}
      />

      <ConfirmModal
        open={modal === 'ban'}
        title="Bannare questo professionista?"
        message="Azione irreversibile lato listing: il profilo non sarà più visibile ai clienti."
        confirmLabel="Banna"
        confirmClassName="btn-purple"
        requireText="conferma"
        textValue={reason}
        onTextChange={setReason}
        textPlaceholder="Motivo del ban (obbligatorio)…"
        loading={busy}
        onConfirm={() => void runAction('ban')}
        onCancel={() => {
          setModal(null);
          setReason('');
        }}
      />

      <ChangeRequestModal
        open={Boolean(photoChangeTarget)}
        title="Richiedi modifica foto lavoro"
        presets={PORTFOLIO_CHANGE_PRESETS}
        loading={busy}
        onConfirm={(payload) => void handlePhotoChangeRequest(payload)}
        onCancel={() => setPhotoChangeTarget(null)}
      />

      <ChangeRequestModal
        open={Boolean(docChangeArea)}
        title="Richiedi modifica documento"
        presets={DOCUMENT_CHANGE_PRESETS}
        loading={busy}
        onConfirm={(payload) => void handleDocPartChange(payload)}
        onCancel={() => setDocChangeArea(null)}
      />

      <ChangeRequestModal
        open={Boolean(serviceChangeTarget)}
        title="Richiedi modifica servizio"
        description={
          serviceChangeTarget
            ? `Servizio: ${serviceChangeTarget.title}. Il professionista potrà aggiornare prezzo o dettagli.`
            : undefined
        }
        presets={SERVICE_CHANGE_PRESETS}
        loading={busy}
        onConfirm={(payload) => void handleServiceChangeRequest(payload)}
        onCancel={() => setServiceChangeTarget(null)}
      />

      <ImageLightbox
        open={Boolean(lightbox)}
        src={lightbox?.src ?? null}
        title={lightbox?.title}
        onClose={() => setLightbox(null)}
      />
    </>
  );
}
