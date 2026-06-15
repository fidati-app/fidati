import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { PermissionGate } from '@/components/auth/PermissionGate';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useToast } from '@/contexts/ToastContext';
import { usePermissions } from '@/hooks/usePermissions';
import {
  createCity,
  createDefaultService,
  createServiceCategory,
  deleteDefaultService,
  fetchCategoriesWithCount,
  fetchCities,
  fetchDefaultServices,
  fetchPlatformSetting,
  savePlatformSetting,
  updateCity,
  updateDefaultService,
  type CommissionDefault,
  type MessageTemplates,
  type VerificationRules,
} from '@/services/settingsService';
import { updateServiceCategory } from '@/services/professionalAdminService';
import type { CityCatalogRow, DefaultServiceRow, ServiceCategoryRow } from '@/types';

type SettingsTab = 'categorie' | 'servizi' | 'citta' | 'commissioni' | 'verifica' | 'template';

const TABS: { id: SettingsTab; label: string }[] = [
  { id: 'categorie', label: 'Categorie' },
  { id: 'servizi', label: 'Servizi predefiniti' },
  { id: 'citta', label: 'Città / zone' },
  { id: 'commissioni', label: 'Commissioni' },
  { id: 'verifica', label: 'Regole verifica' },
  { id: 'template', label: 'Template messaggi' },
];

export function SettingsPage() {
  const { can } = usePermissions();
  const { showToast } = useToast();
  const [tab, setTab] = useState<SettingsTab>('categorie');
  const editable = can('settings.edit');

  return (
    <PermissionGate permission="settings.view">
      <div className="page-header">
        <h2>Impostazioni</h2>
        <p>Categorie, servizi, zone, commissioni e regole piattaforma — salvataggio reale su Supabase</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`tab-btn${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="tab-panel">
          {tab === 'categorie' ? <CategoriesSection editable={editable} showToast={showToast} /> : null}
          {tab === 'servizi' ? <ServicesSection editable={editable} showToast={showToast} /> : null}
          {tab === 'citta' ? <CitiesSection editable={editable} showToast={showToast} /> : null}
          {tab === 'commissioni' ? <CommissionSection editable={editable} showToast={showToast} /> : null}
          {tab === 'verifica' ? <VerificationSection editable={editable} showToast={showToast} /> : null}
          {tab === 'template' ? <TemplatesSection editable={editable} showToast={showToast} /> : null}
        </div>
      </div>
    </PermissionGate>
  );
}

function CategoriesSection({
  editable,
  showToast,
}: {
  editable: boolean;
  showToast: (msg: string, type?: 'error') => void;
}) {
  const [rows, setRows] = useState<ServiceCategoryRow[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');

  const load = () => void fetchCategoriesWithCount().then(setRows);
  useEffect(load, []);

  const save = async (id: string) => {
    try {
      await updateServiceCategory(id, { name: editName, slug: editSlug });
      showToast('Categoria aggiornata');
      setEditing(null);
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Errore', 'error');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateServiceCategory(id, { is_active: !isActive });
      showToast(isActive ? 'Categoria disattivata' : 'Categoria attivata');
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Errore', 'error');
    }
  };

  const create = async () => {
    if (!newName.trim() || !newSlug.trim()) return;
    try {
      await createServiceCategory({ name: newName, slug: newSlug });
      showToast('Categoria creata');
      setNewName('');
      setNewSlug('');
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Errore', 'error');
    }
  };

  return (
    <>
      {editable ? (
        <div className="inline-actions" style={{ marginBottom: 16 }}>
          <input placeholder="Nome categoria" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <input placeholder="slug-categoria" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} />
          <button type="button" className="btn btn-primary" onClick={() => void create()}>Crea categoria</button>
        </div>
      ) : null}
      {rows.length === 0 ? (
        <div className="empty-state">Nessuna categoria</div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Slug</th>
                <th>Professionisti</th>
                <th>Attiva</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    {editing === cat.id ? (
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                    ) : (
                      cat.name
                    )}
                  </td>
                  <td>
                    {editing === cat.id ? (
                      <input value={editSlug} onChange={(e) => setEditSlug(e.target.value)} />
                    ) : (
                      cat.slug
                    )}
                  </td>
                    <td>
                      <Link to={`/professionals?categoryId=${cat.id}`} className="kpi-card-link">
                        {cat.professional_count} professionisti
                      </Link>
                    </td>
                  <td>{cat.is_active ? 'Sì' : 'No'}</td>
                  <td>
                    {editable ? (
                      editing === cat.id ? (
                        <button type="button" className="btn btn-success" style={{ padding: '6px 10px' }} onClick={() => void save(cat.id)}>
                          Salva
                        </button>
                      ) : (
                        <div className="inline-actions">
                          <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ padding: '6px 10px' }}
                            onClick={() => {
                              setEditing(cat.id);
                              setEditName(cat.name);
                              setEditSlug(cat.slug);
                            }}
                          >
                            Modifica
                          </button>
                          <button type="button" className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => void toggleActive(cat.id, cat.is_active)}>
                            {cat.is_active ? 'Disattiva' : 'Attiva'}
                          </button>
                        </div>
                      )
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function ServicesSection({
  editable,
  showToast,
}: {
  editable: boolean;
  showToast: (msg: string, type?: 'error') => void;
}) {
  const [categories, setCategories] = useState<ServiceCategoryRow[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [rows, setRows] = useState<DefaultServiceRow[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState('');

  useEffect(() => {
    void fetchCategoriesWithCount().then((cats) => {
      setCategories(cats);
      if (cats[0]) setCategoryId(cats[0].id);
    });
  }, []);

  const load = () => {
    if (!categoryId) return;
    void fetchDefaultServices(categoryId).then(setRows);
  };

  useEffect(load, [categoryId]);

  const create = async () => {
    if (!categoryId || !newTitle.trim()) return;
    try {
      await createDefaultService({
        category_id: categoryId,
        title: newTitle,
        from_price: Number(newPrice) || 0,
      });
      showToast('Servizio creato');
      setNewTitle('');
      setNewPrice('');
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Errore', 'error');
    }
  };

  return (
    <>
      <div className="inline-actions" style={{ marginBottom: 16 }}>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      {editable ? (
        <div className="inline-actions" style={{ marginBottom: 16 }}>
          <input placeholder="Nome servizio" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <input placeholder="Prezzo da €" type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
          <button type="button" className="btn btn-primary" onClick={() => void create()}>Aggiungi servizio</button>
        </div>
      ) : null}
      {rows.length === 0 ? (
        <div className="empty-state">Nessun servizio predefinito per questa categoria</div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Servizio</th>
                <th>Prezzo da</th>
                <th>Attivo</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <ServiceRow
                  key={s.id}
                  service={s}
                  editable={editable}
                  showToast={showToast}
                  onSaved={load}
                  onDeleteRequest={(id, title) => {
                    setDeleteId(id);
                    setDeleteTitle(title);
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmModal
        open={Boolean(deleteId)}
        title="Elimina servizio"
        message={`Eliminare il servizio "${deleteTitle}"?`}
        confirmLabel="Elimina"
        confirmClassName="btn-danger"
        onConfirm={() => {
          if (!deleteId) return;
          void deleteDefaultService(deleteId)
            .then(() => {
              showToast('Servizio eliminato');
              setDeleteId(null);
              load();
            })
            .catch((err) => showToast(err instanceof Error ? err.message : 'Errore', 'error'));
        }}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

function ServiceRow({
  service,
  editable,
  showToast,
  onSaved,
  onDeleteRequest,
}: {
  service: DefaultServiceRow;
  editable: boolean;
  showToast: (msg: string, type?: 'error') => void;
  onSaved: () => void;
  onDeleteRequest: (id: string, title: string) => void;
}) {
  const [title, setTitle] = useState(service.title);
  const [price, setPrice] = useState(String(service.from_price));

  const save = async () => {
    try {
      await updateDefaultService(service.id, { title, from_price: Number(price) || 0 });
      showToast('Servizio aggiornato');
      onSaved();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Errore', 'error');
    }
  };

  const remove = () => onDeleteRequest(service.id, service.title);

  const toggle = async () => {
    try {
      await updateDefaultService(service.id, { is_active: !service.is_active });
      showToast(service.is_active ? 'Servizio disattivato' : 'Servizio attivato');
      onSaved();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Errore', 'error');
    }
  };

  return (
    <tr>
      <td>{editable ? <input value={title} onChange={(e) => setTitle(e.target.value)} /> : title}</td>
      <td>{editable ? <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: 90 }} /> : `${price} €`}</td>
      <td>{service.is_active ? 'Sì' : 'No'}</td>
      <td>
        {editable ? (
          <div className="inline-actions">
            <button type="button" className="btn btn-success" style={{ padding: '6px 10px' }} onClick={() => void save()}>Salva</button>
            <button type="button" className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => void toggle()}>{service.is_active ? 'Disattiva' : 'Attiva'}</button>
            <button type="button" className="btn btn-danger" style={{ padding: '6px 10px' }} onClick={remove}>Elimina</button>
          </div>
        ) : null}
      </td>
    </tr>
  );
}

function CitiesSection({
  editable,
  showToast,
}: {
  editable: boolean;
  showToast: (msg: string, type?: 'error') => void;
}) {
  const [rows, setRows] = useState<CityCatalogRow[]>([]);
  const [newName, setNewName] = useState('');
  const [newProvince, setNewProvince] = useState('BT');

  const load = () => void fetchCities().then(setRows);
  useEffect(load, []);

  const create = async () => {
    if (!newName.trim()) return;
    try {
      await createCity({ name: newName, province: newProvince });
      showToast('Città aggiunta');
      setNewName('');
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Errore', 'error');
    }
  };

  const toggle = async (id: string, isActive: boolean) => {
    try {
      await updateCity(id, { is_active: !isActive });
      showToast(isActive ? 'Città disattivata' : 'Città attivata');
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Errore', 'error');
    }
  };

  return (
    <>
      {editable ? (
        <div className="inline-actions" style={{ marginBottom: 16 }}>
          <input placeholder="Nome città" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <input placeholder="Provincia" value={newProvince} onChange={(e) => setNewProvince(e.target.value)} style={{ width: 80 }} />
          <button type="button" className="btn btn-primary" onClick={() => void create()}>Aggiungi città</button>
        </div>
      ) : null}
      {rows.length === 0 ? (
        <div className="empty-state">Nessuna città nel catalogo</div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Città</th>
                <th>Provincia</th>
                <th>Regione</th>
                <th>Attiva</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.province ?? '—'}</td>
                  <td>{c.region}</td>
                  <td>{c.is_active ? 'Sì' : 'No'}</td>
                  <td>
                    {editable ? (
                      <button type="button" className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => void toggle(c.id, c.is_active)}>
                        {c.is_active ? 'Disattiva' : 'Attiva'}
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function CommissionSection({
  editable,
  showToast,
}: {
  editable: boolean;
  showToast: (msg: string, type?: 'error') => void;
}) {
  const [commission, setCommission] = useState<CommissionDefault>({ percent: 12, min_eur: 2, max_eur: 500 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchPlatformSetting<CommissionDefault>('commission_default', { percent: 12, min_eur: 2, max_eur: 500 })
      .then(setCommission)
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    try {
      await savePlatformSetting('commission_default', commission);
      showToast('Commissioni salvate');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Errore', 'error');
    }
  };

  if (loading) return <div className="empty-state">Caricamento…</div>;

  return (
    <div className="meta-list" style={{ maxWidth: 420 }}>
      <div className="form-field">
        <label>Percentuale commissione default (%)</label>
        <input
          type="number"
          value={commission.percent}
          disabled={!editable}
          onChange={(e) => setCommission({ ...commission, percent: Number(e.target.value) })}
        />
      </div>
      <div className="form-field">
        <label>Commissione minima (€)</label>
        <input
          type="number"
          value={commission.min_eur}
          disabled={!editable}
          onChange={(e) => setCommission({ ...commission, min_eur: Number(e.target.value) })}
        />
      </div>
      <div className="form-field">
        <label>Commissione massima (€)</label>
        <input
          type="number"
          value={commission.max_eur}
          disabled={!editable}
          onChange={(e) => setCommission({ ...commission, max_eur: Number(e.target.value) })}
        />
      </div>
      {editable ? (
        <button type="button" className="btn btn-primary" onClick={() => void save()}>Salva commissioni</button>
      ) : null}
    </div>
  );
}

function VerificationSection({
  editable,
  showToast,
}: {
  editable: boolean;
  showToast: (msg: string, type?: 'error') => void;
}) {
  const [rules, setRules] = useState<VerificationRules>({
    min_work_photos: 1,
    max_work_photos: 6,
    require_document: true,
    require_selfie: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchPlatformSetting<VerificationRules>('verification_rules', rules).then(setRules).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    try {
      await savePlatformSetting('verification_rules', rules);
      showToast('Regole verifica salvate');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Errore', 'error');
    }
  };

  if (loading) return <div className="empty-state">Caricamento…</div>;

  return (
    <div className="meta-list" style={{ maxWidth: 420 }}>
      <div className="form-field">
        <label>Foto lavori minime</label>
        <input type="number" min={1} max={6} value={rules.min_work_photos} disabled={!editable} onChange={(e) => setRules({ ...rules, min_work_photos: Number(e.target.value) })} />
      </div>
      <div className="form-field">
        <label>Foto lavori massime</label>
        <input type="number" min={1} max={12} value={rules.max_work_photos} disabled={!editable} onChange={(e) => setRules({ ...rules, max_work_photos: Number(e.target.value) })} />
      </div>
      <div className="form-field">
        <label>
          <input type="checkbox" checked={rules.require_document} disabled={!editable} onChange={(e) => setRules({ ...rules, require_document: e.target.checked })} />
          {' '}Documento obbligatorio
        </label>
      </div>
      <div className="form-field">
        <label>
          <input type="checkbox" checked={rules.require_selfie} disabled={!editable} onChange={(e) => setRules({ ...rules, require_selfie: e.target.checked })} />
          {' '}Selfie obbligatorio
        </label>
      </div>
      {editable ? (
        <button type="button" className="btn btn-primary" onClick={() => void save()}>Salva regole</button>
      ) : null}
    </div>
  );
}

function TemplatesSection({
  editable,
  showToast,
}: {
  editable: boolean;
  showToast: (msg: string, type?: 'error') => void;
}) {
  const [templates, setTemplates] = useState<MessageTemplates>({
    verification_approved: '',
    verification_rejected: '',
    verification_changes_requested: '',
    account_banned: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchPlatformSetting<MessageTemplates>('message_templates', templates)
      .then(setTemplates)
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    try {
      await savePlatformSetting('message_templates', templates);
      showToast('Template salvati');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Errore', 'error');
    }
  };

  if (loading) return <div className="empty-state">Caricamento…</div>;

  const fields: { key: keyof MessageTemplates; label: string }[] = [
    { key: 'verification_approved', label: 'Approvazione verifica' },
    { key: 'verification_rejected', label: 'Rifiuto verifica' },
    { key: 'verification_changes_requested', label: 'Richiesta modifiche' },
    { key: 'account_banned', label: 'Ban account' },
  ];

  return (
    <div className="meta-list">
      {fields.map((f) => (
        <div key={f.key} className="form-field">
          <label>{f.label}</label>
          <textarea
            rows={3}
            value={templates[f.key]}
            disabled={!editable}
            onChange={(e) => setTemplates({ ...templates, [f.key]: e.target.value })}
          />
        </div>
      ))}
      {editable ? (
        <button type="button" className="btn btn-primary" onClick={() => void save()}>Salva template</button>
      ) : null}
    </div>
  );
}
