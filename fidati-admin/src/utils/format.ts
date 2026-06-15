import type { ClientVisibilityStatus, VerificationStatus } from '@/types';

export function clientVisibilityBadge(status: ClientVisibilityStatus | string | null | undefined) {
  switch (status) {
    case 'hidden_changes':
      return {
        label: 'Nascosto per modifiche richieste',
        className: 'badge-warning',
      };
    case 'pending_review':
      return {
        label: 'In revisione',
        className: 'badge-info',
      };
    default:
      return {
        label: 'Visibile',
        className: 'badge-success',
      };
  }
}

export function verificationBadge(status: VerificationStatus | string, accountStatus?: string) {
  if (accountStatus === 'banned') return { label: 'Bannato', className: 'badge-danger' };
  switch (status) {
    case 'verified':
      return { label: 'Verificato', className: 'badge-success' };
    case 'pending_review':
      return { label: 'In verifica', className: 'badge-warning' };
    case 'changes_requested':
      return { label: 'Modifiche richieste', className: 'badge-warning' };
    case 'rejected':
      return { label: 'Rifiutato', className: 'badge-danger' };
    default:
      return { label: 'Non verificato', className: 'badge-neutral' };
  }
}

export function actionLabel(action: string): string {
  const map: Record<string, string> = {
    approve_verification: 'Approvazione verifica',
    reject_verification: 'Rifiuto verifica',
    request_verification_changes: 'Richiesta modifiche',
    ban_professional: 'Ban professionista',
    unban_professional: 'Riattivazione professionista',
    link_admin: 'Collegamento staff',
    update_professional: 'Modifica professionista',
    update_report_ticket: 'Aggiornamento segnalazione',
    update_admin_permissions: 'Modifica permessi staff',
    update_platform_setting: 'Modifica impostazione',
    create_default_service: 'Creazione servizio predefinito',
    update_default_service: 'Modifica servizio predefinito',
    delete_default_service: 'Eliminazione servizio predefinito',
    create_city: 'Aggiunta città',
    update_city: 'Modifica città',
    create_category: 'Creazione categoria',
    update_category: 'Modifica categoria',
    request_service_change: 'Richiesta modifica servizio',
    request_portfolio_change: 'Richiesta modifica portfolio',
    request_document_change: 'Richiesta modifica documenti',
    request_professional_changes: 'Richiesta modifiche professionista',
    create_pro_notification: 'Notifica al professionista',
    approve_professional_verification: 'Approvazione verifica',
    reject_professional_verification: 'Rifiuto verifica',
  };
  return map[action] ?? action;
}

export function reportStatusLabel(status: string): string {
  const map: Record<string, string> = {
    open: 'Aperta',
    reviewing: 'In lavorazione',
    waiting_user: 'In attesa utente',
    resolved: 'Risolta',
    dismissed: 'Archiviata',
  };
  return map[status] ?? status;
}

export function reportPriorityLabel(priority: string): string {
  const map: Record<string, string> = {
    low: 'Bassa',
    normal: 'Normale',
    high: 'Alta',
    urgent: 'Urgente',
  };
  return map[priority] ?? priority;
}

export function accountStatusLabel(status: string): string {
  const map: Record<string, string> = {
    active: 'Attivo',
    suspended: 'Sospeso',
    banned: 'Bannato',
    unverified: 'Non verificato',
    in_review: 'In revisione',
    verified: 'Verificato',
  };
  return map[status] ?? status;
}

export function requestStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'In attesa',
    accepted: 'Accettata',
    declined: 'Rifiutata',
    completed: 'Completata',
    cancelled: 'Annullata',
  };
  return map[status] ?? status;
}
export function reportEventLabel(type: string): string {
  const map: Record<string, string> = {
    status_change: 'Cambio stato',
    priority_change: 'Cambio priorità',
    assignment: 'Assegnazione',
    note: 'Nota staff',
    created: 'Creazione',
  };
  return map[type] ?? type;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
}

export function documentTypeLabel(type: string | null | undefined) {
  switch (type) {
    case 'id_card':
      return "Carta d'identità";
    case 'driving_license':
      return 'Patente';
    case 'passport':
      return 'Passaporto';
    default:
      return type ?? '—';
  }
}
