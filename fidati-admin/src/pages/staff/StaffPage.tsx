import { useEffect, useMemo, useState } from 'react';

import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { ALL_PERMISSIONS } from '@/constants/permissions';
import { useToast } from '@/contexts/ToastContext';
import { usePermissions, ROLE_PERMISSIONS, type Permission } from '@/hooks/usePermissions';
import { fetchAdminUsers } from '@/services/adminService';
import { fetchAdminPermissions, saveAdminPermissions } from '@/services/permissionsService';
import { linkStaffByEmail, updateStaffMember } from '@/services/professionalAdminService';

export function StaffPage() {
  const { can } = usePermissions();
  const { showToast } = useToast();
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchAdminUsers>>>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('review_team');
  const [busy, setBusy] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editPerms, setEditPerms] = useState<Permission[]>([]);
  const [useCustomPerms, setUseCustomPerms] = useState(false);
  const [permBusy, setPermBusy] = useState(false);

  const load = () => {
    void fetchAdminUsers().then(setRows).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const groupedPerms = useMemo(() => {
    const groups = new Map<string, typeof ALL_PERMISSIONS>();
    for (const p of ALL_PERMISSIONS) {
      const list = groups.get(p.group) ?? [];
      list.push(p);
      groups.set(p.group, list);
    }
    return Array.from(groups.entries());
  }, []);

  const handleCreate = async () => {
    setBusy(true);
    try {
      await linkStaffByEmail(email, fullName, role);
      showToast('Staff collegato con successo');
      setCreateOpen(false);
      setEmail('');
      setFullName('');
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Errore creazione staff', 'error');
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateStaffMember(id, { is_active: !isActive });
      showToast(isActive ? 'Staff disattivato' : 'Staff riattivato');
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Errore', 'error');
    }
  };

  const openPermissions = async (adminId: string, adminRole: string) => {
    setEditId(adminId);
    try {
      const perms = await fetchAdminPermissions(adminId);
      setUseCustomPerms(perms.length > 0);
      setEditPerms(perms.length > 0 ? perms : [...(ROLE_PERMISSIONS[adminRole as keyof typeof ROLE_PERMISSIONS] ?? [])]);
    } catch {
      setUseCustomPerms(false);
      setEditPerms([...(ROLE_PERMISSIONS[adminRole as keyof typeof ROLE_PERMISSIONS] ?? [])]);
    }
  };

  const togglePerm = (perm: Permission) => {
    setEditPerms((prev) => (prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]));
    setUseCustomPerms(true);
  };

  const applyRoleDefaults = (adminRole: string) => {
    setUseCustomPerms(false);
    setEditPerms([...(ROLE_PERMISSIONS[adminRole as keyof typeof ROLE_PERMISSIONS] ?? [])]);
  };

  const savePermissions = async () => {
    if (!editId) return;
    setPermBusy(true);
    try {
      if (useCustomPerms) {
        await saveAdminPermissions(editId, editPerms);
      } else {
        await saveAdminPermissions(editId, []);
      }
      showToast(useCustomPerms ? 'Permessi personalizzati salvati' : 'Permessi reset al ruolo predefinito');
      setEditId(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Errore salvataggio permessi', 'error');
    } finally {
      setPermBusy(false);
    }
  };

  const editingRow = rows.find((r) => r.id === editId);

  return (
    <PermissionGate permission="staff.view">
      <div className="page-header">
        <h2>Staff Fidati</h2>
        <p>Gestione team interno, ruoli e permessi granulari</p>
      </div>

      {can('staff.create') ? (
        <button type="button" className="btn btn-primary" style={{ marginBottom: 14 }} onClick={() => setCreateOpen(true)}>
          + Crea staff
        </button>
      ) : null}

      <div className="card review-panel" style={{ marginBottom: 14 }}>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
          Per creare staff: prima crea l&apos;utente in Supabase Auth con la stessa email, poi collegalo qui.
          Solo <strong>super_admin</strong> può aggiungere membri e modificare permessi granulari.
        </p>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">Caricamento…</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">Nessun admin configurato</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Ruolo</th>
                  <th>Attivo</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.full_name}</td>
                    <td>{row.email}</td>
                    <td><span className="badge badge-purple">{row.role}</span></td>
                    <td>{row.is_active ? 'Sì' : 'No'}</td>
                    <td>
                      <div className="inline-actions">
                        {can('staff.edit') ? (
                          <button type="button" className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => void toggleActive(row.id, row.is_active)}>
                            {row.is_active ? 'Disattiva' : 'Riattiva'}
                          </button>
                        ) : null}
                        {can('staff.edit') ? (
                          <button type="button" className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => void openPermissions(row.id, row.role)}>
                            Permessi
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editId && editingRow ? (
        <div className="card review-panel" style={{ marginTop: 16 }}>
          <h3>Permessi — {editingRow.full_name}</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Ruolo: <strong>{editingRow.role}</strong>.
            {useCustomPerms ? ' Permessi personalizzati attivi.' : ' Usa permessi predefiniti del ruolo.'}
          </p>
          <div className="inline-actions" style={{ marginBottom: 12 }}>
            <button type="button" className="btn btn-ghost" onClick={() => applyRoleDefaults(editingRow.role)}>
              Usa permessi ruolo
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setUseCustomPerms(true)}>
              Personalizza
            </button>
          </div>
          {groupedPerms.map(([group, perms]) => (
            <div key={group} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>{group}</div>
              <div className="permission-grid">
                {perms.map((p) => (
                  <label key={p.key} className="permission-check">
                    <input
                      type="checkbox"
                      checked={editPerms.includes(p.key)}
                      disabled={!can('staff.edit') || editingRow.role === 'super_admin'}
                      onChange={() => togglePerm(p.key)}
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
          {can('staff.edit') && editingRow.role !== 'super_admin' ? (
            <div className="inline-actions">
              <button type="button" className="btn btn-primary" disabled={permBusy} onClick={() => void savePermissions()}>
                Salva permessi
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setEditId(null)}>Annulla</button>
            </div>
          ) : null}
        </div>
      ) : null}

      <ConfirmModal
        open={createOpen}
        title="Collega nuovo staff"
        message="L'utente deve già esistere in Supabase Authentication con questa email."
        confirmLabel="Collega staff"
        requireText="email"
        textValue={email}
        onTextChange={setEmail}
        textPlaceholder="Email staff…"
        loading={busy}
        onConfirm={() => void handleCreate()}
        onCancel={() => setCreateOpen(false)}
      />

      {createOpen ? (
        <div className="card review-panel" style={{ marginTop: 14 }}>
          <div className="form-field">
            <label>Nome completo</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Ruolo</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="super_admin">Super admin</option>
              <option value="review_team">Team revisione</option>
              <option value="accounting_team">Team contabile</option>
              <option value="support_team">Team supporto</option>
              <option value="operator">Operatore</option>
            </select>
          </div>
        </div>
      ) : null}
    </PermissionGate>
  );
}
