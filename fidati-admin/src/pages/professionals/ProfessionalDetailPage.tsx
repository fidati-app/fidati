import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { AuditTimelineCard } from '@/components/ui/AuditTimelineCard';
import { ProfessionalResponsesPanel } from '@/components/professionals/ProfessionalResponsesPanel';
import { ChangeRequestModal } from '@/components/ui/ChangeRequestModal';
import { CityAutocomplete } from '@/components/ui/CityAutocomplete';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { MediaPhotoCard } from '@/components/ui/MediaPhotoCard';
import {
  ACCOUNT_STATUS_OPTIONS,
  DOCUMENT_CHANGE_PRESETS,
  PORTFOLIO_CHANGE_PRESETS,
  SERVICE_CHANGE_PRESETS,
} from '@/constants/changeRequestPresets';
import { useToast } from '@/contexts/ToastContext';
import { usePermissions } from '@/hooks/usePermissions';
import { safeSelect } from '@/lib/safeSupabase';
import { fetchProfessionalConversations } from '@/services/chatService';
import {
  addProfessionalZone,
  deleteProfessionalService,
  deleteWorkPhoto,
  removeProfessionalZone,
  setAcceptsUrgentJobs,
  updateAvailabilityDay,
  updateProfessionalProfile,
  updateWorkPhotoTitle,
  upsertProfessionalService,
} from '@/services/professionalAdminService';
import {
  fetchProfessionalById,
  fetchProfessionalDetailBundle,
  getSignedDocumentUrl,
} from '@/services/professionalsService';
import {
  requestDocumentChange,
  requestPortfolioChange,
  requestProfessionalChanges,
  requestServiceChange,
} from '@/services/notificationService';
import {
  accountStatusLabel,
  clientVisibilityBadge,
  documentTypeLabel,
  formatDate,
  formatMoney,
  verificationBadge,
} from '@/utils/format';

type TabId =
  | 'profilo'
  | 'zone'
  | 'servizi'
  | 'disponibilita'
  | 'portfolio'
  | 'documenti'
  | 'richieste'
  | 'chat'
  | 'audit'
  | 'risposte';

type Bundle = NonNullable<Awaited<ReturnType<typeof fetchProfessionalDetailBundle>>>;
type Professional = NonNullable<Awaited<ReturnType<typeof fetchProfessionalById>>>;

type BookingRequestRow = {
  id: string;
  service_title: string;
  status: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  price: number | null;
  zone: string | null;
  created_at: string;
  customers?: { name?: string } | null;
};

type ConversationRow = {
  id: string;
  last_message: string | null;
  last_message_at: string | null;
  customers?: { name?: string } | null;
};

type ConfirmTarget =
  | { kind: 'zone'; id: string; name: string }
  | { kind: 'service'; id: string; title: string }
  | { kind: 'photo'; id: string; title: string | null };

const TABS: { id: TabId; label: string }[] = [
  { id: 'profilo', label: 'Profilo' },
  { id: 'zone', label: 'Città servite' },
  { id: 'servizi', label: 'Servizi' },
  { id: 'disponibilita', label: 'Disponibilità' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'documenti', label: 'Documenti' },
  { id: 'richieste', label: 'Richieste' },
  { id: 'chat', label: 'Chat' },
  { id: 'audit', label: 'Audit' },
  { id: 'risposte', label: 'Risposte' },
];

const REQUEST_STATUS_LABELS: Record<string, string> = {
  pending: 'In attesa',
  accepted: 'Accettata',
  declined: 'Rifiutata',
  completed: 'Completata',
};

function LoadingSkeleton() {
  return (
    <div className="detail-skeleton">
      <div className="skeleton detail-skeleton-header" />
      <div className="card">
        <div className="skeleton detail-skeleton-tabs" />
        <div className="skeleton detail-skeleton-body" style={{ margin: 16 }} />
      </div>
    </div>
  );
}

export function ProfessionalDetailPage() {
  const { id = '' } = useParams();
  const { showToast } = useToast();
  const { can } = usePermissions();
  const canEdit = can('professionals.edit');

  const [tab, setTab] = useState<TabId>('profilo');
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    category_label: '',
    base_city: '',
    account_status: 'unverified',
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [, setProfileDraft] = useState(profileForm);

  const [newZone, setNewZone] = useState('');
  const [newService, setNewService] = useState({
    title: '',
    price_from: '',
    price_max: '',
    duration_label: '',
  });
  const [serviceEdits, setServiceEdits] = useState<
    Record<string, { title: string; price_from: string; price_max: string; duration_label: string; is_active: boolean }>
  >({});
  const [photoTitles, setPhotoTitles] = useState<Record<string, string>>({});
  const [signedUrls, setSignedUrls] = useState<Record<'front' | 'back' | 'selfie', string | null>>({
    front: null,
    back: null,
    selfie: null,
  });

  const [requests, setRequests] = useState<BookingRequestRow[]>([]);
  const [requestsLoaded, setRequestsLoaded] = useState(false);
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [chatLoaded, setChatLoaded] = useState(false);

  const [lightbox, setLightbox] = useState<{ src: string; title?: string } | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null);
  const [changeRequestModal, setChangeRequestModal] = useState<
    null | { kind: 'service' | 'photo' | 'document'; entityId?: string; documentArea?: string }
  >(null);

  const badge = useMemo(
    () => verificationBadge(professional?.verification_status ?? 'unverified', professional?.account_status),
    [professional],
  );

  const visibilityBadge = useMemo(
    () => clientVisibilityBadge(professional?.client_visibility_status),
    [professional],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const pro = await fetchProfessionalById(id);
      setProfessional(pro);
      if (!pro) {
        setBundle(null);
        return;
      }

      setProfileForm({
        name: pro.name,
        phone: pro.phone ?? '',
        category_label: pro.category_label,
        base_city: pro.base_city ?? '',
        account_status: pro.account_status,
      });

      const detail = await fetchProfessionalDetailBundle(id);
      setBundle(detail);

      const edits: typeof serviceEdits = {};
      const titles: Record<string, string> = {};
      for (const service of detail.services) {
        edits[service.id] = {
          title: service.title,
          price_from: String(service.price_from ?? ''),
          price_max: service.price_max != null ? String(service.price_max) : '',
          duration_label: service.duration_label ?? '',
          is_active: service.is_active !== false,
        };
      }
      for (const photo of detail.workPhotos) {
        titles[photo.id] = photo.title ?? '';
      }
      setServiceEdits(edits);
      setPhotoTitles(titles);

      const doc = detail.document;
      const [front, back, selfie] = await Promise.all([
        getSignedDocumentUrl(doc?.front_image_url),
        getSignedDocumentUrl(doc?.back_image_url),
        getSignedDocumentUrl(doc?.selfie_image_url),
      ]);
      setSignedUrls({ front, back, selfie });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Errore caricamento professionista', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    void load();
    setRequestsLoaded(false);
    setChatLoaded(false);
  }, [load]);

  useEffect(() => {
    if (tab !== 'richieste' || requestsLoaded || !id) return;
    void safeSelect<BookingRequestRow>(
      'booking_requests',
      'id, service_title, status, scheduled_date, scheduled_time, price, zone, created_at, customers(name)',
      {
        filters: [{ column: 'professional_id', value: id }],
        order: { column: 'created_at', ascending: false },
        limit: 100,
      },
    ).then((rows) => {
      setRequests(rows);
      setRequestsLoaded(true);
    });
  }, [tab, id, requestsLoaded]);

  useEffect(() => {
    if (tab !== 'chat' || chatLoaded || !id) return;
    void fetchProfessionalConversations(id).then((rows) => {
      setConversations(rows as ConversationRow[]);
      setChatLoaded(true);
    });
  }, [tab, id, chatLoaded]);

  const handleSaveProfile = async () => {
    if (!id || !professional || !canEdit) return;
    setBusy(true);
    try {
      const before = {
        name: professional.name,
        phone: professional.phone,
        category_label: professional.category_label,
        base_city: professional.base_city,
        account_status: professional.account_status,
      };
      const patch = {
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim() || null,
        category_label: profileForm.category_label.trim(),
        base_city: profileForm.base_city.trim() || null,
        account_status: profileForm.account_status,
      };
      await updateProfessionalProfile(id, patch, before);
      showToast('Profilo aggiornato');
      setProfileDraft({ ...profileForm });
      setEditingProfile(false);
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Salvataggio fallito', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleAddZone = async () => {
    if (!id || !bundle || !canEdit || !newZone.trim()) return;
    setBusy(true);
    try {
      await addProfessionalZone(id, newZone, bundle.zones.length);
      setNewZone('');
      showToast('Zona aggiunta');
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Impossibile aggiungere zona', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!id || !confirmTarget) return;
    setBusy(true);
    try {
      if (confirmTarget.kind === 'zone') {
        await removeProfessionalZone(confirmTarget.id, id, confirmTarget.name);
        showToast('Zona rimossa');
      }
      if (confirmTarget.kind === 'service') {
        await deleteProfessionalService(confirmTarget.id, id, confirmTarget.title);
        showToast('Servizio eliminato');
      }
      if (confirmTarget.kind === 'photo') {
        await deleteWorkPhoto(confirmTarget.id, id);
        showToast('Foto eliminata');
      }
      setConfirmTarget(null);
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Operazione fallita', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveService = async (serviceId: string) => {
    if (!id || !canEdit) return;
    const edit = serviceEdits[serviceId];
    if (!edit?.title.trim()) {
      showToast('Il titolo del servizio è obbligatorio', 'error');
      return;
    }
    setBusy(true);
    try {
      await upsertProfessionalService(id, {
        id: serviceId,
        title: edit.title.trim(),
        price_from: Number(edit.price_from) || 0,
        price_max: edit.price_max ? Number(edit.price_max) : null,
        duration_label: edit.duration_label.trim() || undefined,
        is_active: edit.is_active,
      });
      showToast('Servizio aggiornato');
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Salvataggio servizio fallito', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleAddService = async () => {
    if (!id || !canEdit || !newService.title.trim()) return;
    setBusy(true);
    try {
      await upsertProfessionalService(id, {
        title: newService.title.trim(),
        price_from: Number(newService.price_from) || 0,
        price_max: newService.price_max ? Number(newService.price_max) : null,
        duration_label: newService.duration_label.trim() || undefined,
        is_active: true,
        sort_order: bundle?.services.length ?? 0,
      });
      setNewService({ title: '', price_from: '', price_max: '', duration_label: '' });
      showToast('Servizio aggiunto');
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Impossibile aggiungere servizio', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleAvailabilityChange = async (
    dayOfWeek: number,
    patch: { is_available?: boolean; start_time?: string | null; end_time?: string | null; status?: string },
  ) => {
    if (!id || !canEdit) return;
    setBusy(true);
    try {
      await updateAvailabilityDay(id, dayOfWeek, patch);
      showToast('Disponibilità aggiornata');
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Aggiornamento disponibilità fallito', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleUrgentToggle = async (value: boolean) => {
    if (!id || !canEdit) return;
    setBusy(true);
    try {
      await setAcceptsUrgentJobs(id, value);
      showToast(value ? 'Lavori urgenti attivati' : 'Lavori urgenti disattivati');
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Aggiornamento fallito', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleCancelProfileEdit = () => {
    if (!professional) return;
    setProfileForm({
      name: professional.name,
      phone: professional.phone ?? '',
      category_label: professional.category_label,
      base_city: professional.base_city ?? '',
      account_status: professional.account_status,
    });
    setEditingProfile(false);
  };

  const handleChangeRequestConfirm = async (payload: { preset?: string; message: string; areas: string[] }) => {
    if (!id || !changeRequestModal) return;
    setBusy(true);
    try {
      const { preset, message } = payload;
      if (changeRequestModal.kind === 'service' && changeRequestModal.entityId) {
        await requestServiceChange(id, changeRequestModal.entityId, message, preset);
        showToast('Richiesta modifica servizio inviata');
      } else if (changeRequestModal.kind === 'photo' && changeRequestModal.entityId) {
        await requestPortfolioChange(id, changeRequestModal.entityId, message, preset);
        showToast('Richiesta modifica foto inviata');
      } else if (changeRequestModal.kind === 'document') {
        if (changeRequestModal.documentArea) {
          await requestProfessionalChanges({
            professionalId: id,
            areas: [changeRequestModal.documentArea],
            message,
            preset,
          });
          showToast('Richiesta modifica documento inviata');
        } else {
          await requestDocumentChange(id, 'document_front', message, preset);
          showToast('Richiesta modifica documento inviata');
        }
      }
      setChangeRequestModal(null);
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Invio richiesta fallito', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleSavePhotoTitle = async (photoId: string) => {
    if (!id || !canEdit) return;
    setBusy(true);
    try {
      await updateWorkPhotoTitle(photoId, id, photoTitles[photoId]?.trim() || null);
      showToast('Titolo foto aggiornato');
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Salvataggio titolo fallito', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  if (!professional) {
    return (
      <div className="empty-state">
        Professionista non trovato.{' '}
        <Link to="/professionals" style={{ color: '#93c5fd' }}>
          Torna all&apos;elenco
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <Link to="/professionals" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          ← Professionisti
        </Link>
        <h2>{professional.name}</h2>
        <p>
          {professional.category_label} · {professional.base_city ?? 'Città N/D'} ·{' '}
          <span className={`badge ${badge.className}`}>{badge.label}</span>
          {professional.verification_status === 'pending_review' ? (
            <>
              {' '}
              ·{' '}
              <Link to={`/verifications/${professional.id}`} style={{ color: '#93c5fd', fontSize: 13 }}>
                Apri revisione verifica
              </Link>
            </>
          ) : null}
          {' '}
          ·{' '}
          <span className={`badge ${visibilityBadge.className}`}>{visibilityBadge.label}</span>
        </p>
      </div>

      <div className="card">
        <div className="tabs">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`tab-btn${tab === item.id ? ' active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="tab-panel">
          {tab === 'profilo' ? (
            <div className="review-panel" style={{ padding: 0 }}>
              <div
                className="card"
                style={{
                  marginBottom: 20,
                  padding: 16,
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  background: 'var(--surface-elevated, rgba(255,255,255,0.02))',
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: 12 }}>Visibilità su Fidati (clienti)</h3>
                <div className="readonly-grid">
                  <div className="readonly-field">
                    <span className="readonly-label">Stato visibilità</span>
                    <span className="readonly-value">
                      <span className={`badge ${visibilityBadge.className}`}>{visibilityBadge.label}</span>
                    </span>
                  </div>
                  <div className="readonly-field">
                    <span className="readonly-label">Motivo</span>
                    <span className="readonly-value">
                      {professional.client_visibility_reason ?? '—'}
                    </span>
                  </div>
                  <div className="readonly-field">
                    <span className="readonly-label">Ultimo cambio stato</span>
                    <span className="readonly-value">
                      {professional.client_visibility_changed_at
                        ? formatDate(professional.client_visibility_changed_at)
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="two-col">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <h3 style={{ marginTop: 0 }}>Dati modificabili</h3>
                    {!editingProfile && canEdit ? (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => {
                          setProfileDraft({ ...profileForm });
                          setEditingProfile(true);
                        }}
                      >
                        Modifica
                      </button>
                    ) : null}
                  </div>

                  {!editingProfile ? (
                    <div className="readonly-grid">
                      <div className="readonly-field">
                        <span className="readonly-label">Nome</span>
                        <span className="readonly-value">{professional.name}</span>
                      </div>
                      <div className="readonly-field">
                        <span className="readonly-label">Telefono</span>
                        <span className="readonly-value">{professional.phone ?? '—'}</span>
                      </div>
                      <div className="readonly-field">
                        <span className="readonly-label">Categoria</span>
                        <span className="readonly-value">{professional.category_label}</span>
                      </div>
                      <div className="readonly-field">
                        <span className="readonly-label">Città operante</span>
                        <span className="readonly-value">{professional.base_city ?? '—'}</span>
                      </div>
                      <div className="readonly-field">
                        <span className="readonly-label">Stato account</span>
                        <span className="readonly-value">{accountStatusLabel(professional.account_status)}</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="form-field">
                        <label htmlFor="pro-name">Nome</label>
                        <input
                          id="pro-name"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor="pro-phone">Telefono</label>
                        <input
                          id="pro-phone"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor="pro-category">Categoria</label>
                        <input
                          id="pro-category"
                          value={profileForm.category_label}
                          onChange={(e) => setProfileForm((f) => ({ ...f, category_label: e.target.value }))}
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor="pro-city">Città operante</label>
                        <CityAutocomplete
                          value={profileForm.base_city}
                          onChange={(value) => setProfileForm((f) => ({ ...f, base_city: value }))}
                          placeholder="Cerca città operante…"
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor="pro-account">Stato account</label>
                        <select
                          id="pro-account"
                          value={profileForm.account_status}
                          onChange={(e) => setProfileForm((f) => ({ ...f, account_status: e.target.value }))}
                        >
                          {ACCOUNT_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="inline-actions" style={{ marginTop: 8 }}>
                        <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void handleSaveProfile()}>
                          {busy ? 'Salvataggio…' : 'Salva modifiche'}
                        </button>
                        <button type="button" className="btn btn-ghost" disabled={busy} onClick={handleCancelProfileEdit}>
                          Annulla
                        </button>
                      </div>
                    </>
                  )}

                  {!canEdit && !editingProfile ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 12 }}>Non hai permessi di modifica.</p>
                  ) : null}
                </div>

                <div>
                  <h3 style={{ marginTop: 0 }}>Informazioni account</h3>
                  {professional.image_url ? (
                    <img
                      src={professional.image_url}
                      alt={professional.name}
                      style={{ width: 88, height: 88, borderRadius: 12, objectFit: 'cover', marginBottom: 12, cursor: 'pointer' }}
                      onClick={() => setLightbox({ src: professional.image_url!, title: 'Foto profilo' })}
                    />
                  ) : null}
                  <div className="meta-list">
                    <div className="meta-row">
                      <span>Email</span>
                      <span>{professional.email ?? '—'}</span>
                    </div>
                    <div className="meta-row">
                      <span>Valutazione</span>
                      <span>
                        {professional.rating} ({professional.review_count} recensioni)
                      </span>
                    </div>
                    <div className="meta-row">
                      <span>Lavori completati</span>
                      <span>{professional.jobs_completed}</span>
                    </div>
                    <div className="meta-row">
                      <span>Tariffa oraria</span>
                      <span>{formatMoney(Number(professional.price_per_hour))}</span>
                    </div>
                    <div className="meta-row">
                      <span>App Pro</span>
                      <span>{professional.has_pro_app ? 'Sì' : 'No'}</span>
                    </div>
                    <div className="meta-row">
                      <span>Registrato il</span>
                      <span>{formatDate(professional.created_at)}</span>
                    </div>
                    <div className="meta-row">
                      <span>Stato verifica</span>
                      <span>{badge.label}</span>
                    </div>
                    {professional.verification_rejected_reason ? (
                      <div className="meta-row">
                        <span>Motivo rifiuto</span>
                        <span>{professional.verification_rejected_reason}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {tab === 'zone' ? (
            <div className="review-panel" style={{ padding: 0 }}>
              <h3 style={{ marginTop: 0 }}>Città servite</h3>
              {bundle?.zones.length ? (
                <div className="zone-list">
                  {bundle.zones.map((zone) => (
                    <div key={zone.id} className="zone-row">
                      <span>{zone.zone_name}</span>
                      {canEdit ? (
                        <button
                          type="button"
                          className="btn btn-danger"
                          style={{ padding: '6px 10px' }}
                          disabled={busy}
                          onClick={() => setConfirmTarget({ kind: 'zone', id: zone.id, name: zone.zone_name })}
                        >
                          Elimina
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  Nessuna città configurata
                </div>
              )}
              {canEdit ? (
                <div className="inline-actions">
                  <CityAutocomplete
                    value={newZone}
                    onChange={setNewZone}
                    placeholder="Cerca città da aggiungere…"
                  />
                  <button type="button" className="btn btn-primary" disabled={busy || !newZone.trim()} onClick={() => void handleAddZone()}>
                    Aggiungi città
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {tab === 'servizi' ? (
            <div className="review-panel" style={{ padding: 0 }}>
              <h3 style={{ marginTop: 0 }}>Servizi e prezzi</h3>
              {bundle?.services.length ? (
                bundle.services.map((service) => {
                  const edit = serviceEdits[service.id];
                  if (!edit) return null;
                  return (
                    <div key={service.id} className="service-row">
                      <input
                        value={edit.title}
                        disabled={!canEdit}
                        onChange={(e) =>
                          setServiceEdits((prev) => ({
                            ...prev,
                            [service.id]: { ...edit, title: e.target.value },
                          }))
                        }
                      />
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="Da €"
                        value={edit.price_from}
                        disabled={!canEdit}
                        onChange={(e) =>
                          setServiceEdits((prev) => ({
                            ...prev,
                            [service.id]: { ...edit, price_from: e.target.value },
                          }))
                        }
                      />
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="Max €"
                        value={edit.price_max}
                        disabled={!canEdit}
                        onChange={(e) =>
                          setServiceEdits((prev) => ({
                            ...prev,
                            [service.id]: { ...edit, price_max: e.target.value },
                          }))
                        }
                      />
                      <input
                        placeholder="Durata"
                        value={edit.duration_label}
                        disabled={!canEdit}
                        onChange={(e) =>
                          setServiceEdits((prev) => ({
                            ...prev,
                            [service.id]: { ...edit, duration_label: e.target.value },
                          }))
                        }
                      />
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                        <input
                          type="checkbox"
                          checked={edit.is_active}
                          disabled={!canEdit}
                          onChange={(e) =>
                            setServiceEdits((prev) => ({
                              ...prev,
                              [service.id]: { ...edit, is_active: e.target.checked },
                            }))
                          }
                        />
                        Attivo
                      </label>
                      {canEdit ? (
                        <div className="inline-actions">
                          <button type="button" className="btn btn-ghost" style={{ padding: '6px 10px' }} disabled={busy} onClick={() => void handleSaveService(service.id)}>
                            Salva
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger"
                            style={{ padding: '6px 10px' }}
                            disabled={busy}
                            onClick={() => setConfirmTarget({ kind: 'service', id: service.id, title: edit.title })}
                          >
                            Elimina
                          </button>
                        </div>
                      ) : null}
                      <button
                        type="button"
                        className="btn btn-warning"
                        style={{ padding: '6px 10px' }}
                        disabled={busy}
                        onClick={() => setChangeRequestModal({ kind: 'service', entityId: service.id })}
                      >
                        Richiedi modifica
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  Nessun servizio configurato
                </div>
              )}

              {canEdit ? (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <h4>Nuovo servizio</h4>
                  <div className="service-row">
                    <input
                      placeholder="Titolo servizio"
                      value={newService.title}
                      onChange={(e) => setNewService((s) => ({ ...s, title: e.target.value }))}
                    />
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="Da €"
                      value={newService.price_from}
                      onChange={(e) => setNewService((s) => ({ ...s, price_from: e.target.value }))}
                    />
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="Max €"
                      value={newService.price_max}
                      onChange={(e) => setNewService((s) => ({ ...s, price_max: e.target.value }))}
                    />
                    <input
                      placeholder="Durata"
                      value={newService.duration_label}
                      onChange={(e) => setNewService((s) => ({ ...s, duration_label: e.target.value }))}
                    />
                    <button type="button" className="btn btn-primary" disabled={busy || !newService.title.trim()} onClick={() => void handleAddService()}>
                      Aggiungi
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {tab === 'disponibilita' ? (
            <div className="review-panel" style={{ padding: 0 }}>
              <h3 style={{ marginTop: 0 }}>Orario settimanale</h3>
              {bundle?.availability.length ? (
                bundle.availability.map((day) => {
                  const available = day.is_available !== false && day.status !== 'off';
                  return (
                    <div key={day.day_of_week} className="availability-row">
                      <strong>{day.day_label ?? day.short_label ?? `Giorno ${day.day_of_week}`}</strong>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                        <input
                          type="checkbox"
                          checked={available}
                          disabled={!canEdit || busy}
                          onChange={(e) =>
                            void handleAvailabilityChange(day.day_of_week, {
                              is_available: e.target.checked,
                              status: e.target.checked ? 'free' : 'off',
                            })
                          }
                        />
                        Disponibile
                      </label>
                      <div className="inline-actions">
                        <input
                          type="time"
                          defaultValue={day.start_time ? String(day.start_time).slice(0, 5) : ''}
                          disabled={!canEdit || !available}
                          onBlur={(e) => {
                            if (!canEdit) return;
                            void handleAvailabilityChange(day.day_of_week, {
                              start_time: e.target.value ? `${e.target.value}:00` : null,
                            });
                          }}
                        />
                        <span style={{ color: 'var(--text-muted)' }}>–</span>
                        <input
                          type="time"
                          defaultValue={day.end_time ? String(day.end_time).slice(0, 5) : ''}
                          disabled={!canEdit || !available}
                          onBlur={(e) => {
                            if (!canEdit) return;
                            void handleAvailabilityChange(day.day_of_week, {
                              end_time: e.target.value ? `${e.target.value}:00` : null,
                            });
                          }}
                        />
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                        {day.time_ranges?.length ? day.time_ranges.join(', ') : null}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  Disponibilità non configurata
                </div>
              )}

              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={bundle?.acceptsUrgentJobs ?? false}
                    disabled={!canEdit || busy}
                    onChange={(e) => void handleUrgentToggle(e.target.checked)}
                  />
                  Accetta lavori urgenti
                </label>
              </div>
            </div>
          ) : null}

          {tab === 'portfolio' ? (
            <div className="review-panel review-panel-spacious">
              <h3 className="section-title">Foto lavori ({bundle?.workPhotos.length ?? 0})</h3>
              {bundle?.workPhotos.length ? (
                <div className="portfolio-gallery">
                  {bundle.workPhotos.map((photo) => (
                    <div key={photo.id} className="portfolio-gallery-item">
                      <MediaPhotoCard
                        layout="portfolio"
                        src={photo.image_url}
                        title={photoTitles[photo.id]?.trim() || photo.title?.trim() || 'Senza titolo'}
                        onOpen={() => setLightbox({ src: photo.image_url, title: photo.title ?? 'Foto lavoro' })}
                        onRequestChange={() => setChangeRequestModal({ kind: 'photo', entityId: photo.id })}
                        showDelete={canEdit}
                        onDelete={
                          canEdit
                            ? () => setConfirmTarget({ kind: 'photo', id: photo.id, title: photo.title })
                            : undefined
                        }
                      />
                      {canEdit ? (
                        <div className="portfolio-title-edit">
                          <input
                            value={photoTitles[photo.id] ?? ''}
                            disabled={busy}
                            placeholder="Titolo foto"
                            onChange={(e) => setPhotoTitles((prev) => ({ ...prev, [photo.id]: e.target.value }))}
                          />
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            disabled={busy}
                            onClick={() => void handleSavePhotoTitle(photo.id)}
                          >
                            Salva titolo
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">Nessuna foto nel portfolio</div>
              )}
            </div>
          ) : null}

          {tab === 'documenti' ? (
            <div className="review-panel review-panel-spacious">
              <div className="section-header-inline">
                <h3 className="section-title">Documenti verifica</h3>
                <button
                  type="button"
                  className="btn btn-warning btn-sm"
                  disabled={busy}
                  onClick={() => setChangeRequestModal({ kind: 'document' })}
                >
                  Richiedi modifica documenti
                </button>
              </div>
              <div className="meta-list meta-list-spaced">
                <div className="meta-row">
                  <span>Tipo documento</span>
                  <span>{documentTypeLabel(bundle?.document?.document_type)}</span>
                </div>
                <div className="meta-row">
                  <span>Richiesta inviata</span>
                  <span>{formatDate(professional.verification_requested_at)}</span>
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
                      onRequestChange={() => setChangeRequestModal({ kind: 'document', documentArea: 'document_front' })}
                    />
                  ) : null}
                  {signedUrls.back ? (
                    <MediaPhotoCard
                      layout="document"
                      src={signedUrls.back}
                      title="Retro"
                      subtitle={documentTypeLabel(bundle?.document?.document_type)}
                      onOpen={() => setLightbox({ src: signedUrls.back!, title: 'Retro documento' })}
                      onRequestChange={() => setChangeRequestModal({ kind: 'document', documentArea: 'document_back' })}
                    />
                  ) : null}
                  {signedUrls.selfie ? (
                    <MediaPhotoCard
                      layout="document"
                      src={signedUrls.selfie}
                      title="Selfie"
                      subtitle="Verifica identità"
                      onOpen={() => setLightbox({ src: signedUrls.selfie!, title: 'Selfie verifica' })}
                      onRequestChange={() => setChangeRequestModal({ kind: 'document', documentArea: 'selfie' })}
                    />
                  ) : null}
                </div>
              )}
            </div>
          ) : null}

          {tab === 'richieste' ? (
            <div className="review-panel" style={{ padding: 0 }}>
              <h3 style={{ marginTop: 0 }}>Richieste di prenotazione</h3>
              {!requestsLoaded ? (
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  Caricamento richieste…
                </div>
              ) : requests.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  Nessuna richiesta per questo professionista
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Servizio</th>
                        <th>Cliente</th>
                        <th>Stato</th>
                        <th>Zona</th>
                        <th>Data prevista</th>
                        <th>Importo</th>
                        <th>Creata il</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((req) => (
                        <tr key={req.id}>
                          <td>{req.service_title}</td>
                          <td>{req.customers?.name ?? '—'}</td>
                          <td>{REQUEST_STATUS_LABELS[req.status] ?? req.status}</td>
                          <td>{req.zone ?? '—'}</td>
                          <td>
                            {req.scheduled_date
                              ? `${req.scheduled_date}${req.scheduled_time ? ` ${String(req.scheduled_time).slice(0, 5)}` : ''}`
                              : '—'}
                          </td>
                          <td>{req.price != null ? formatMoney(Number(req.price)) : '—'}</td>
                          <td>{formatDate(req.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null}

          {tab === 'chat' ? (
            <div className="review-panel" style={{ padding: 0 }}>
              <h3 style={{ marginTop: 0 }}>Conversazioni</h3>
              {!chatLoaded ? (
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  Caricamento chat…
                </div>
              ) : conversations.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  Nessuna conversazione
                </div>
              ) : (
                <div className="meta-list">
                  {conversations.map((conv) => (
                    <div key={conv.id} className="meta-row" style={{ alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{conv.customers?.name ?? 'Cliente'}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
                          {conv.last_message ?? 'Nessun messaggio'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(conv.last_message_at)}</div>
                        <Link to={`/chats/${conv.id}`} className="btn btn-ghost" style={{ padding: '6px 10px', marginTop: 6 }}>
                          Apri chat
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {tab === 'risposte' ? (
            <ProfessionalResponsesPanel
              professionalId={id}
              showToast={showToast}
              onReviewComplete={() => void load()}
            />
          ) : null}

          {tab === 'audit' ? (
            <div className="review-panel review-panel-spacious">
              <h3 className="section-title">Storico modifiche admin</h3>
              {bundle?.auditLogs.length ? (
                <div className="audit-timeline">
                  {bundle.auditLogs.map((log) => (
                    <AuditTimelineCard key={log.id} row={log} compact />
                  ))}
                </div>
              ) : (
                <div className="empty-state">Nessuna modifica registrata</div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <ImageLightbox
        open={Boolean(lightbox)}
        src={lightbox?.src ?? null}
        title={lightbox?.title}
        onClose={() => setLightbox(null)}
      />

      <ConfirmModal
        open={Boolean(confirmTarget)}
        title={
          confirmTarget?.kind === 'zone'
            ? 'Eliminare questa città?'
            : confirmTarget?.kind === 'service'
              ? 'Eliminare questo servizio?'
              : 'Eliminare questa foto?'
        }
        message={
          confirmTarget?.kind === 'zone'
            ? `La città "${confirmTarget.name}" verrà rimossa dal profilo.`
            : confirmTarget?.kind === 'service'
              ? `Il servizio "${confirmTarget.title}" verrà eliminato definitivamente.`
              : 'La foto verrà rimossa dal portfolio del professionista.'
        }
        confirmLabel="Elimina"
        confirmClassName="btn-danger"
        loading={busy}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setConfirmTarget(null)}
      />

      <ChangeRequestModal
        open={Boolean(changeRequestModal)}
        title={
          changeRequestModal?.kind === 'service'
            ? 'Richiedi modifica servizio'
            : changeRequestModal?.kind === 'photo'
              ? 'Richiedi modifica foto'
              : 'Richiedi modifica documenti'
        }
        presets={
          changeRequestModal?.kind === 'service'
            ? SERVICE_CHANGE_PRESETS
            : changeRequestModal?.kind === 'photo'
              ? PORTFOLIO_CHANGE_PRESETS
              : DOCUMENT_CHANGE_PRESETS
        }
        loading={busy}
        onConfirm={(payload) => void handleChangeRequestConfirm(payload)}
        onCancel={() => setChangeRequestModal(null)}
      />
    </>
  );
}
