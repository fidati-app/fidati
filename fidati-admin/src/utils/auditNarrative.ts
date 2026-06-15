type AuditAdmin = { full_name?: string; role?: string } | null;

export type AuditRowInput = {
  action: string;
  target_type?: string;
  target_id?: string | null;
  metadata?: Record<string, unknown>;
  admin_users?: AuditAdmin | AuditAdmin[];
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  review_team: 'Team Revisione',
  accounting_team: 'Team Contabile',
  support_team: 'Team Supporto',
  operator: 'Operatore',
};

function normalizeAdminUser(admin: AuditRowInput['admin_users']): AuditAdmin {
  if (!admin) return null;
  if (Array.isArray(admin)) return admin[0] ?? null;
  return admin;
}

function adminLine(admin: AuditAdmin): string {
  const name = admin?.full_name ?? 'Staff Fidati';
  const role = admin?.role ? ROLE_LABELS[admin.role] ?? admin.role : null;
  return role ? `${name} (${role})` : name;
}

function pct(v: unknown): string {
  if (typeof v === 'number') return `${v}%`;
  if (typeof v === 'string' && v.trim()) return v.includes('%') ? v : `${v}%`;
  return String(v ?? '—');
}

export function formatAuditNarrative(row: AuditRowInput): { headline: string; body: string[]; badge: string } {
  const m = row.metadata ?? {};
  const admin = adminLine(normalizeAdminUser(row.admin_users));
  const lines: string[] = [];

  switch (row.action) {
    case 'approve_verification':
      lines.push('ha approvato il professionista');
      if (m.name) lines.push(`Professionista: ${m.name}`);
      if (m.category) lines.push(`Categoria: ${m.category}`);
      return { headline: admin, body: lines, badge: 'Verifica' };

    case 'reject_verification':
      lines.push('ha rifiutato la verifica del professionista');
      if (m.reason) lines.push(`Motivo: ${m.reason}`);
      return { headline: admin, body: lines, badge: 'Verifica' };

    case 'request_verification_changes':
    case 'request_professional_changes': {
      const section = String(m.target_section ?? '');
      const sectionLabel = targetSectionLabel(section);
      if (sectionLabel) {
        lines.push(`ha richiesto la modifica di ${sectionLabel}`);
      } else {
        lines.push('ha richiesto modifiche al profilo professionista');
      }
      if (Array.isArray(m.areas) && m.areas.length) {
        lines.push(`Sezioni: ${(m.areas as string[]).map(targetSectionLabel).join(', ')}`);
      }
      if (m.message || m.preset) lines.push(`Motivo: ${m.message ?? m.preset}`);
      return { headline: admin, body: lines, badge: sectionLabel ? 'Documenti' : 'Verifica' };
    }

    case 'ban_professional':
      lines.push(m.target_name ? `ha bannato ${m.target_name}` : 'ha bannato un professionista');
      if (m.reason) lines.push(`Motivo: ${m.reason}`);
      return { headline: admin, body: lines, badge: 'Sicurezza' };

    case 'unban_professional':
      lines.push('ha riattivato un professionista');
      return { headline: admin, body: lines, badge: 'Sicurezza' };

    case 'update_professional': {
      const before = m.before as Record<string, unknown> | undefined;
      const after = m.after as Record<string, unknown> | undefined;
      lines.push('ha modificato i dati del professionista');
      if (before && after) {
        for (const key of Object.keys(after)) {
          if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
            lines.push(`${fieldLabel(key)}: ${fmtVal(before[key])} → ${fmtVal(after[key])}`);
          }
        }
      }
      return { headline: admin, body: lines, badge: 'Professionisti' };
    }

    case 'update_platform_setting': {
      const key = String(m.key ?? '');
      const val = m.value as Record<string, unknown> | undefined;
      const prev = m.previous as Record<string, unknown> | undefined;
      if (key === 'commission_default' && val) {
        lines.push('ha modificato la commissione generale');
        if (prev?.percent != null && val.percent != null) {
          lines.push(`dal ${pct(prev.percent)} al ${pct(val.percent)}`);
        } else if (val.percent != null) {
          lines.push(`Nuova percentuale: ${pct(val.percent)}`);
        }
      } else if (key === 'verification_rules') {
        lines.push('ha aggiornato le regole di verifica');
      } else if (key === 'message_templates') {
        lines.push('ha aggiornato i template messaggi');
      } else {
        lines.push(`ha modificato l'impostazione "${settingLabel(key)}"`);
      }
      return { headline: admin, body: lines, badge: 'Impostazioni' };
    }

    case 'request_service_change':
      lines.push('ha richiesto la modifica di un servizio');
      if (m.message || m.preset) lines.push(`Motivo: ${m.message ?? m.preset}`);
      return { headline: admin, body: lines, badge: 'Servizi' };

    case 'request_portfolio_change':
      lines.push('ha richiesto la modifica di una foto lavoro');
      if (m.message || m.preset) lines.push(`Motivo: ${m.message ?? m.preset}`);
      return { headline: admin, body: lines, badge: 'Portfolio' };

    case 'request_document_change': {
      const docPart = String(m.document_part ?? m.target_section ?? '');
      const docLabel = documentPartLabel(docPart);
      lines.push(
        docLabel
          ? `ha richiesto la modifica del documento ${docLabel}`
          : 'ha richiesto la modifica dei documenti di verifica',
      );
      if (m.message || m.preset) lines.push(`Motivo: ${m.message ?? m.preset}`);
      return { headline: admin, body: lines, badge: 'Documenti' };
    }

    case 'update_report_ticket':
      lines.push('ha aggiornato una segnalazione');
      if (m.status) lines.push(`Nuovo stato: ${m.status}`);
      if (m.note) lines.push(`Nota: ${m.note}`);
      return { headline: admin, body: lines, badge: 'Segnalazioni' };

    case 'link_admin':
      lines.push('ha collegato un nuovo membro staff');
      if (m.email) lines.push(`Email: ${m.email}`);
      return { headline: admin, body: lines, badge: 'Staff' };

    case 'update_admin_permissions':
      lines.push('ha modificato i permessi di un membro staff');
      return { headline: admin, body: lines, badge: 'Staff' };

    case 'update_category':
      lines.push('ha modificato una categoria servizi');
      return { headline: admin, body: lines, badge: 'Impostazioni' };

    case 'create_category':
      lines.push('ha creato una categoria servizi');
      return { headline: admin, body: lines, badge: 'Impostazioni' };

    case 'create_pro_notification':
      lines.push('ha inviato una notifica interna al professionista');
      if (m.title) lines.push(String(m.title));
      return { headline: admin, body: lines, badge: 'Notifiche' };

    default:
      lines.push(actionFallback(row.action));
      return { headline: admin, body: lines, badge: 'Sistema' };
  }
}

function fieldLabel(key: string): string {
  const map: Record<string, string> = {
    name: 'Nome',
    phone: 'Telefono',
    category_label: 'Categoria',
    base_city: 'Città operante',
    account_status: 'Stato account',
    verification_status: 'Stato verifica',
  };
  return map[key] ?? key;
}

function fmtVal(v: unknown): string {
  if (v == null || v === '') return '—';
  return String(v);
}

function settingLabel(key: string): string {
  const map: Record<string, string> = {
    commission_default: 'Commissioni',
    verification_rules: 'Regole verifica',
    message_templates: 'Template messaggi',
    urgent_jobs: 'Lavori urgenti',
  };
  return map[key] ?? key;
}

function actionFallback(action: string): string {
  const map: Record<string, string> = {
    add_zone: 'ha aggiunto una città servita',
    remove_zone: 'ha rimosso una città servita',
    add_service: 'ha aggiunto un servizio',
    update_service: 'ha modificato un servizio',
    delete_service: 'ha eliminato un servizio',
    update_availability: 'ha modificato la disponibilità',
    update_request_status: 'ha modificato lo stato di una richiesta',
    create_default_service: 'ha creato un servizio predefinito',
    update_default_service: 'ha modificato un servizio predefinito',
    delete_default_service: 'ha eliminato un servizio predefinito',
    create_city: 'ha aggiunto una città al catalogo',
    update_city: 'ha modificato una città nel catalogo',
    update_staff: 'ha modificato un membro staff',
    approve_professional_verification: 'ha approvato il professionista',
    reject_professional_verification: 'ha rifiutato la verifica del professionista',
  };
  return map[action] ?? `ha eseguito un'azione di sistema`;
}

function targetSectionLabel(section: string): string {
  const map: Record<string, string> = {
    profile: 'foto profilo',
    profile_photo: 'foto profilo',
    document_front: 'documento fronte',
    document_back: 'documento retro',
    selfie: 'selfie',
    documents: 'documenti',
    work_photos: 'foto lavori',
    portfolio: 'portfolio',
    services: 'servizi',
    prices: 'prezzi',
    zones: 'zone servite',
    availability: 'disponibilità',
    other: 'altro',
  };
  return map[section] ?? (section ? section.replace(/_/g, ' ') : '');
}

function documentPartLabel(part: string): string {
  const map: Record<string, string> = {
    front: 'fronte',
    back: 'retro',
    selfie: 'selfie',
    document_front: 'fronte',
    document_back: 'retro',
  };
  return map[part] ?? '';
}

export { ROLE_LABELS };
