import { ProRequest } from '@/types';

export function getPendingRequestSummary(requests: ProRequest[]) {
  const pending = requests.filter((request) => request.status === 'pending');
  const overdue = pending.filter((request) => request.responseDeadlineMinutes <= 0);

  return {
    pendingCount: pending.length,
    overdueCount: overdue.length,
    activeCount: pending.length - overdue.length,
  };
}

export type UrgentRequestCopy = {
  title: string;
  subtitle: string;
  showBadge: boolean;
  badgeCount: number;
  showButton: boolean;
  tone: 'neutral' | 'warning' | 'urgent';
};

export function getUrgentRequestCopy(
  pendingCount: number,
  overdueCount: number,
): UrgentRequestCopy {
  if (pendingCount === 0) {
    return {
      title: 'Zero richieste in attesa',
      subtitle: 'Sei in pari: nessuna richiesta da gestire al momento.',
      showBadge: false,
      badgeCount: 0,
      showButton: true,
      tone: 'neutral',
    };
  }

  if (overdueCount > 0) {
    return {
      title: `Hai ${overdueCount} richieste a cui non hai risposto in tempo`,
      subtitle:
        pendingCount > overdueCount
          ? `Altre ${pendingCount - overdueCount} richieste sono ancora in tempo. Rispondi subito.`
          : 'Recupera le opportunità perdute il prima possibile.',
      showBadge: true,
      badgeCount: overdueCount,
      showButton: true,
      tone: 'urgent',
    };
  }

  return {
    title: `${pendingCount} richieste da rispondere`,
    subtitle: 'Rispondi entro 60 minuti per non perdere nuove opportunità.',
    showBadge: true,
    badgeCount: pendingCount,
    showButton: true,
    tone: 'warning',
  };
}
