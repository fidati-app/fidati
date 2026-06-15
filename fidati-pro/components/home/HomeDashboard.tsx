import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { MiniLineChart } from '@/components/home/MiniLineChart';
import { ProgressRing } from '@/components/home/ProgressRing';
import { AdminChangeRequestsCard } from '@/components/profile/AdminChangeRequestsCard';
import { ProfileIncompleteCard } from '@/components/home/ProfileIncompleteCard';
import { ProfileVerificationApprovedCard } from '@/components/home/ProfileVerificationApprovedCard';
import { ProfileVerificationReviewCard } from '@/components/home/ProfileVerificationReviewCard';
import { ProfileCompletionSkeleton } from '@/components/profile/ProfileCompletionSkeleton';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { useMyProfessionalProfile } from '@/hooks/useMyProfessionalProfile';
import {
  getAppointmentsForDay,
  MOCK_REQUESTS,
} from '@/services/mockData';
import { ProAppointment } from '@/types';
import { getPendingRequestSummary, getUrgentRequestCopy } from '@/utils/requestSummary';
import {
  canProfessionalReceiveClients,
  getProfessionalGreetingName,
} from '@/utils/professionalDisplayName';
import { useVerificationResume } from '@/hooks/useVerificationResume';

const SCREEN_PAD = 22;
const CARD_RADIUS = 24;

export type PeriodKey = 'today' | 'yesterday' | 'tomorrow' | 'week' | 'month' | 'custom';

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'today', label: 'Oggi' },
  { key: 'yesterday', label: 'Ieri' },
  { key: 'tomorrow', label: 'Domani' },
  { key: 'week', label: 'Settimana' },
  { key: 'month', label: 'Mese' },
  { key: 'custom', label: 'Personalizzato' },
];

const EARNINGS_TITLE: Record<PeriodKey, string> = {
  today: 'Guadagni oggi',
  yesterday: 'Guadagni ieri',
  tomorrow: 'Guadagni domani',
  week: 'Guadagni settimana',
  month: 'Guadagni mese',
  custom: 'Guadagni periodo',
};

const PERIOD_DATA: Record<
  PeriodKey,
  {
    earnings: number;
    changePercent: number;
    compareLabel: string;
    chart: number[];
    requests: number;
    appointments: number;
    rating: number;
  }
> = {
  today: {
    earnings: 284,
    changePercent: 12,
    compareLabel: 'rispetto a ieri',
    chart: [120, 145, 138, 162, 178, 210, 284],
    requests: 5,
    appointments: 2,
    rating: 4.9,
  },
  yesterday: {
    earnings: 253,
    changePercent: -5,
    compareLabel: 'rispetto al giorno prima',
    chart: [180, 165, 190, 210, 198, 240, 253],
    requests: 3,
    appointments: 3,
    rating: 4.9,
  },
  tomorrow: {
    earnings: 0,
    changePercent: 0,
    compareLabel: 'prenotazioni confermate',
    chart: [0, 0, 0, 0, 0, 0, 0],
    requests: 2,
    appointments: 4,
    rating: 4.9,
  },
  week: {
    earnings: 720,
    changePercent: 8,
    compareLabel: 'rispetto alla sett. precedente',
    chart: [380, 420, 510, 490, 560, 640, 720],
    requests: 18,
    appointments: 9,
    rating: 4.92,
  },
  month: {
    earnings: 2840,
    changePercent: 15,
    compareLabel: 'rispetto al mese scorso',
    chart: [1200, 1450, 1680, 1920, 2100, 2480, 2840],
    requests: 62,
    appointments: 28,
    rating: 4.92,
  },
  custom: {
    earnings: 1560,
    changePercent: 3,
    compareLabel: 'rispetto al periodo precedente',
    chart: [900, 1020, 1100, 1180, 1300, 1420, 1560],
    requests: 24,
    appointments: 11,
    rating: 4.91,
  },
};

const QUICK_ACTIONS = [
  { icon: 'calendar-outline' as const, label: 'Disponibilità', route: '/profile/availability', bg: 'rgba(16, 185, 129, 0.12)', color: Colors.success },
  { icon: 'pricetag-outline' as const, label: 'Prezzi', route: '/profile/services', bg: 'rgba(244, 114, 182, 0.14)', color: '#DB2777' },
  { icon: 'images-outline' as const, label: 'Portfolio', route: '/profile/portfolio', bg: 'rgba(139, 92, 246, 0.12)', color: '#7C3AED' },
  { icon: 'star-outline' as const, label: 'Recensioni', route: '/profile/reviews', bg: 'rgba(251, 191, 36, 0.16)', color: '#D97706' },
  { icon: 'person-outline' as const, label: 'Profilo', route: '/profile/complete', bg: 'rgba(59, 130, 246, 0.12)', color: '#2563EB' },
];

const PERFORMANCE = [
  { emoji: '⭐', value: '4.92', label: 'Valutazione media', bg: 'rgba(251, 191, 36, 0.14)' },
  { emoji: '💼', value: '342', label: 'Lavori completati', bg: 'rgba(7, 37, 74, 0.08)' },
  { emoji: '💬', value: '128', label: 'Recensioni', bg: 'rgba(16, 185, 129, 0.12)' },
  { emoji: '👁', value: '53', label: 'Visite profilo', sublabel: 'Ultimi 7 giorni', bg: 'rgba(59, 130, 246, 0.12)' },
];

const APT_STATUS: Record<ProAppointment['status'], { label: string; color: string; bg: string }> = {
  in_progress: { label: 'IN CORSO', color: Colors.success, bg: Colors.successSoft },
  upcoming: { label: 'CONFERMATO', color: Colors.navy, bg: 'rgba(7, 37, 74, 0.08)' },
  done: { label: 'COMPLETATO', color: Colors.textMuted, bg: Colors.borderLight },
};

interface MetricRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  iconBg: string;
  iconColor: string;
  showDivider?: boolean;
}

function MetricRow({ icon, label, value, iconBg, iconColor, showDivider }: MetricRowProps) {
  return (
    <Pressable style={[styles.metricRow, showDivider && styles.metricRowDivider]}>
      <View style={[styles.metricIconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={15} color={iconColor} />
      </View>
      <View style={styles.metricCopy}>
        <AppText style={styles.metricLabel} numberOfLines={1}>
          {label}
        </AppText>
        <AppText style={styles.metricValue} numberOfLines={1}>
          {value}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={12} color={Colors.textMuted} style={styles.metricChevron} />
    </Pressable>
  );
}

function TimelineItem({ apt, isLast }: { apt: ProAppointment; isLast?: boolean }) {
  const status = APT_STATUS[apt.status];
  const dotColor = apt.status === 'in_progress' ? Colors.success : Colors.navy;

  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineRail}>
        <View style={[styles.timelineDot, { backgroundColor: dotColor }]} />
        {!isLast ? <View style={styles.timelineLine} /> : null}
      </View>
      <View style={styles.timelineCard}>
        <View style={styles.timelineCardTop}>
          <View style={styles.timelineCardMain}>
            <AppText style={styles.timelineTime}>{apt.time}</AppText>
            <AppText style={styles.timelineService} numberOfLines={1} ellipsizeMode="tail">
              {apt.serviceTitle}
            </AppText>
            <AppText style={styles.timelineClient} numberOfLines={1} ellipsizeMode="tail">
              {apt.clientName}
            </AppText>
          </View>
          <View style={[styles.timelineBadge, { backgroundColor: status.bg }]}>
            <AppText
              style={[styles.timelineBadgeText, { color: status.color }]}
              numberOfLines={1}
            >
              {status.label}
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}

export function HomeDashboard({
  showVerificationReviewCard = false,
  showProfileIncompleteCard = false,
  showVerifiedCelebrationCard = false,
  onDismissVerifiedCard,
}: {
  showVerificationReviewCard?: boolean;
  showProfileIncompleteCard?: boolean;
  showVerifiedCelebrationCard?: boolean;
  onDismissVerifiedCard?: () => void;
} = {}) {
  const router = useRouter();
  const { navigateToResume, resumeRoute } = useVerificationResume();
  const [period, setPeriod] = useState<PeriodKey>('today');
  const { profile } = useMyProfessionalProfile();
  const {
    percent: completionPercent,
    completedCount: completionDone,
    total: completionTotal,
    pending: completionPending,
    nextStep,
    verificationStatus,
    canSubmitVerification,
    prerequisiteSteps,
    isLoading: profileCompletionLoading,
  } = useProfileCompletion();

  if (!profile) {
    return null;
  }

  const firstName = getProfessionalGreetingName(profile);
  const showEarnings = canProfessionalReceiveClients(profile);
  const data = PERIOD_DATA[period];
  const isPositive = data.changePercent >= 0;
  const todayAppointments = getAppointmentsForDay('2026-06-09');
  const requestSummary = useMemo(() => getPendingRequestSummary(MOCK_REQUESTS), []);
  const urgentCopy = useMemo(
    () => getUrgentRequestCopy(requestSummary.pendingCount, requestSummary.overdueCount),
    [requestSummary.pendingCount, requestSummary.overdueCount],
  );
  const [chartWidth, setChartWidth] = useState(0);

  const onChartLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.floor(event.nativeEvent.layout.width);
    if (nextWidth > 0 && nextWidth !== chartWidth) {
      setChartWidth(nextWidth);
    }
  };

  const earningsLabel = `${data.earnings.toLocaleString('it-IT')}\u00A0€`;

  return (
    <View style={styles.root}>
      <View style={styles.greetingSection}>
        <View style={styles.greetingRow}>
          <AppText style={styles.greeting}>Ciao, {firstName}</AppText>
          <View style={styles.greetingDot} />
          <AppText style={styles.greetingSub} numberOfLines={1}>
            {profile.category}
          </AppText>
        </View>
      </View>

      {showProfileIncompleteCard ? (
        <View style={styles.verificationCardWrap}>
          <ProfileIncompleteCard
            completionPercent={completionPercent}
            completedSteps={completionDone}
            totalSteps={completionTotal}
            prerequisiteSteps={prerequisiteSteps}
            nextStepTitle={nextStep?.title ?? null}
          />
        </View>
      ) : null}

      {showVerificationReviewCard ? (
        <View style={styles.verificationCardWrap}>
          <ProfileVerificationReviewCard />
        </View>
      ) : null}

      {showVerifiedCelebrationCard ? (
        <View style={styles.verificationCardWrap}>
          <ProfileVerificationApprovedCard onDismiss={() => onDismissVerifiedCard?.()} />
        </View>
      ) : null}

      {showEarnings ? (
        <View style={styles.periodSegmentWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.periodScroll}
          >
            {PERIODS.map((item) => {
              const active = item.key === period;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => setPeriod(item.key)}
                  style={[styles.periodPill, active && styles.periodPillActive]}
                >
                  <AppText style={[styles.periodLabel, active && styles.periodLabelActive]}>
                    {item.label}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.body}>
        {showEarnings ? (
        <View style={styles.earningsCard}>
          <View style={styles.earningsLeft}>
            <AppText style={styles.earningsTitle} numberOfLines={2}>
              {EARNINGS_TITLE[period]}
            </AppText>
            <AppText
              style={styles.earningsAmount}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.72}
            >
              {earningsLabel}
            </AppText>
            <View style={styles.changeRow}>
              <View style={[styles.changeBadge, isPositive ? styles.changeBadgeUp : styles.changeBadgeDown]}>
                <AppText
                  style={[styles.changeBadgeText, isPositive ? styles.changeUp : styles.changeDown]}
                  numberOfLines={1}
                >
                  {isPositive ? '↑' : '↓'} {isPositive ? '+' : ''}
                  {data.changePercent}%
                </AppText>
              </View>
              <AppText style={styles.changeHint} numberOfLines={1} ellipsizeMode="tail">
                {data.compareLabel}
              </AppText>
            </View>
            <View style={styles.chartWrap} onLayout={onChartLayout}>
              {chartWidth > 0 ? (
                <MiniLineChart data={data.chart} width={chartWidth} height={34} />
              ) : null}
            </View>
          </View>

          <View style={styles.earningsRight}>
            <MetricRow
              icon="mail-unread-outline"
              label="Richieste"
              value={String(data.requests)}
              iconBg="rgba(59, 130, 246, 0.12)"
              iconColor="#2563EB"
            />
            <MetricRow
              icon="calendar-outline"
              label="Appuntamenti"
              value={String(data.appointments)}
              iconBg="rgba(139, 92, 246, 0.12)"
              iconColor="#7C3AED"
              showDivider
            />
            <MetricRow
              icon="star"
              label="Valutazione media"
              value={`${data.rating.toFixed(1)} ⭐`}
              iconBg="rgba(251, 191, 36, 0.16)"
              iconColor="#D97706"
              showDivider
            />
          </View>
        </View>
        ) : null}

        <AdminChangeRequestsCard variant="home" />

        {!showProfileIncompleteCard && !showVerificationReviewCard ? (
        <Pressable
          style={styles.profileCard}
          onPress={() => {
            if (verificationStatus === 'unverified' || verificationStatus === 'rejected') {
              if (resumeRoute) {
                navigateToResume();
              } else {
                router.push('/profile/photo');
              }
              return;
            }
            if (canSubmitVerification) {
              if (resumeRoute) {
                navigateToResume();
              } else {
                router.push('/profile/photo');
              }
              return;
            }
            router.push((nextStep?.route ?? '/profile/complete') as '/profile/complete');
          }}
        >
          {profileCompletionLoading ? (
            <View style={styles.profileRingSkeleton} />
          ) : (
            <ProgressRing
              percent={completionPercent}
              size={40}
              stroke={5}
              label={`${completionDone}/${completionTotal}`}
              labelSize={10}
            />
          )}
          <View style={styles.profileCardCopy}>
            <View style={styles.profileCardTitleRow}>
              <AppText style={styles.profileCardTitle}>
                {profileCompletionLoading
                  ? 'Caricamento profilo…'
                  : `Profilo completato al ${completionPercent}%`}
              </AppText>
              {!profileCompletionLoading && verificationStatus === 'pending_review' ? (
                <View style={styles.reviewBadge}>
                  <AppText style={styles.reviewBadgeText}>In verifica</AppText>
                </View>
              ) : !profileCompletionLoading && verificationStatus === 'verified' ? (
                <View style={styles.verifiedBadge}>
                  <AppText style={styles.verifiedBadgeText}>Verificato</AppText>
                </View>
              ) : null}
            </View>
            {profileCompletionLoading ? (
              <ProfileCompletionSkeleton variant="compact" />
            ) : (
              prerequisiteSteps.map((item) => (
                <View key={item.id} style={styles.suggestionRow}>
                  <Ionicons
                    name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
                    size={14}
                    color={item.done ? Colors.success : Colors.textMuted}
                  />
                  <AppText
                    style={[styles.suggestionText, item.done && styles.suggestionTextDone]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </AppText>
                </View>
              ))
            )}
            {!profileCompletionLoading ? (
              <AppText style={styles.profileCardLine} numberOfLines={2}>
                {canSubmitVerification
                  ? verificationStatus === 'rejected'
                    ? '⭐ Reinvia richiesta verifica Fidati'
                    : '⭐ Completa e invia verifica'
                  : verificationStatus === 'pending_review'
                    ? 'Richiesta inviata — in attesa di approvazione'
                    : verificationStatus === 'verified'
                      ? 'Profilo verificato Fidati'
                      : nextStep
                        ? `Prossimo: ${nextStep.title}`
                        : 'Continua il completamento profilo'}
              </AppText>
            ) : null}
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </Pressable>
        ) : null}

        <View
          style={[
            styles.urgentCard,
            urgentCopy.tone === 'neutral' && styles.urgentCardNeutral,
            urgentCopy.tone === 'urgent' && styles.urgentCardOverdue,
          ]}
        >
          <View style={styles.urgentTop}>
            <View style={styles.urgentLeft}>
              <View
                style={[
                  styles.urgentIconWrap,
                  urgentCopy.tone === 'neutral' && styles.urgentIconNeutral,
                  urgentCopy.tone === 'urgent' && styles.urgentIconOverdue,
                ]}
              >
                <Ionicons
                  name={urgentCopy.tone === 'neutral' ? 'checkmark' : 'flash'}
                  size={18}
                  color={Colors.white}
                />
                {urgentCopy.showBadge ? (
                  <View style={styles.urgentCountBadge}>
                    <AppText style={styles.urgentCountText}>{urgentCopy.badgeCount}</AppText>
                  </View>
                ) : null}
              </View>
            </View>
            <View style={styles.urgentCopy}>
              <AppText style={styles.urgentTitle} numberOfLines={2}>
                {urgentCopy.title}
              </AppText>
              <AppText style={styles.urgentSub} numberOfLines={2}>
                {urgentCopy.subtitle}
              </AppText>
            </View>
          </View>
          {urgentCopy.showButton ? (
            <Pressable
              style={[
                styles.urgentBtn,
                urgentCopy.tone === 'neutral' && styles.urgentBtnNeutral,
              ]}
              onPress={() => router.push('/(tabs)/requests')}
            >
              <AppText style={styles.urgentBtnText}>
                {urgentCopy.tone === 'neutral' ? 'Vai alle richieste' : 'Vedi richieste'}
              </AppText>
              <Ionicons name="arrow-forward" size={14} color={Colors.white} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.dayCard}>
          <View style={styles.cardHeader}>
            <AppText style={styles.cardTitle}>La tua giornata</AppText>
            <Pressable onPress={() => router.push('/(tabs)/agenda')} hitSlop={8}>
              <AppText style={styles.cardLink}>Vedi agenda ›</AppText>
            </Pressable>
          </View>
          <View style={styles.timeline}>
            {todayAppointments.map((apt, index) => (
              <TimelineItem
                key={apt.id}
                apt={apt}
                isLast={index === todayAppointments.length - 1}
              />
            ))}
            <Pressable
              style={styles.addAptRow}
              onPress={() => router.push('/(tabs)/agenda')}
            >
              <View style={styles.timelineRail}>
                <View style={styles.addAptDot}>
                  <Ionicons name="add" size={12} color={Colors.textMuted} />
                </View>
              </View>
              <View style={styles.addAptCard}>
                <AppText style={styles.addAptTime}>18:00</AppText>
                <AppText style={styles.addAptLabel} numberOfLines={1}>
                  Aggiungi appuntamento
                </AppText>
              </View>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Azioni rapide</AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shortcutsScroll}
          >
            {QUICK_ACTIONS.map((action) => (
              <Pressable
                key={action.label}
                style={styles.shortcut}
                onPress={() => router.push(action.route as '/profile/complete')}
              >
                <View style={[styles.shortcutIcon, { backgroundColor: action.bg }]}>
                  <Ionicons name={action.icon} size={20} color={action.color} />
                </View>
                <AppText
                  style={styles.shortcutLabel}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {action.label}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.performanceCard}>
          <AppText style={styles.performanceTitle}>Le tue performance</AppText>
          <View style={styles.performanceRow}>
            {PERFORMANCE.map((item, index) => (
              <View
                key={item.label}
                style={[styles.performanceMetric, index < PERFORMANCE.length - 1 && styles.performanceDivider]}
              >
                <View style={[styles.performanceIcon, { backgroundColor: item.bg }]}>
                  <AppText style={styles.performanceEmoji}>{item.emoji}</AppText>
                </View>
                <AppText style={styles.performanceValue}>{item.value}</AppText>
                <AppText style={styles.performanceLabel} numberOfLines={2}>
                  {item.label}
                </AppText>
                {'sublabel' in item && item.sublabel ? (
                  <AppText style={styles.performanceSublabel} numberOfLines={1}>
                    {item.sublabel}
                  </AppText>
                ) : null}
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  greetingSection: {
    paddingHorizontal: SCREEN_PAD,
    paddingTop: 16,
    paddingBottom: 12,
  },
  verificationCardWrap: {
    paddingHorizontal: SCREEN_PAD,
    marginBottom: 12,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: -0.5,
  },
  greetingDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  greetingSub: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  periodSegmentWrap: {
    marginHorizontal: SCREEN_PAD,
    minHeight: 48,
    justifyContent: 'center',
    backgroundColor: '#ECEFF3',
    borderRadius: 14,
    padding: 4,
  },
  periodScroll: {
    gap: 4,
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  periodPill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    minHeight: 38,
    justifyContent: 'center',
  },
  periodPillActive: {
    backgroundColor: Colors.white,
    shadowColor: '#07254A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  periodLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  periodLabelActive: {
    color: Colors.navy,
    fontWeight: '700',
  },
  body: {
    paddingHorizontal: SCREEN_PAD,
    paddingTop: 18,
    gap: 16,
    paddingBottom: 8,
  },
  earningsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: CARD_RADIUS,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(7, 37, 74, 0.06)',
    ...Design.shadow,
    overflow: 'hidden',
  },
  earningsLeft: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
  },
  earningsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
    lineHeight: 16,
  },
  earningsAmount: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: -1,
    lineHeight: 34,
    fontVariant: ['tabular-nums'],
    flexShrink: 0,
  },
  chartWrap: {
    marginTop: 8,
    height: 34,
    width: '100%',
    overflow: 'hidden',
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    flexWrap: 'nowrap',
  },
  changeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  changeBadgeUp: {
    backgroundColor: Colors.successSoft,
  },
  changeBadgeDown: {
    backgroundColor: Colors.pendingSoft,
  },
  changeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  changeUp: { color: Colors.success },
  changeDown: { color: Colors.pending },
  changeHint: {
    flex: 1,
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500',
    minWidth: 0,
  },
  earningsRight: {
    width: 124,
    flexShrink: 0,
    borderLeftWidth: 1,
    borderLeftColor: Colors.borderLight,
    paddingLeft: 10,
    justifyContent: 'center',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  metricRowDivider: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  metricIconBox: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  metricCopy: {
    flex: 1,
    gap: 1,
    minWidth: 0,
  },
  metricChevron: {
    flexShrink: 0,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.navy,
    fontVariant: ['tabular-nums'],
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(7, 37, 74, 0.06)',
    ...Design.shadowSoft,
  },
  profileRingSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.border,
  },
  profileCardCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  profileCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  profileCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: -0.2,
  },
  reviewBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  reviewBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  verifiedBadge: {
    backgroundColor: Colors.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.success,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  suggestionText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  suggestionTextDone: {
    color: Colors.navy,
  },
  profileCardLine: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  urgentCard: {
    gap: 10,
    backgroundColor: '#FFF7ED',
    borderRadius: CARD_RADIUS,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.18)',
  },
  urgentCardNeutral: {
    backgroundColor: '#F0FDF4',
    borderColor: 'rgba(16, 185, 129, 0.18)',
  },
  urgentCardOverdue: {
    backgroundColor: '#FEF2F2',
    borderColor: 'rgba(239, 68, 68, 0.18)',
  },
  urgentTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  urgentLeft: {
    flexShrink: 0,
  },
  urgentIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.pending,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgentIconNeutral: {
    backgroundColor: Colors.success,
  },
  urgentIconOverdue: {
    backgroundColor: '#EF4444',
  },
  urgentCountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFF7ED',
  },
  urgentCountText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.white,
  },
  urgentCopy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  urgentTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: -0.2,
  },
  urgentSub: {
    fontSize: 11,
    lineHeight: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  urgentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.pending,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'stretch',
  },
  urgentBtnNeutral: {
    backgroundColor: Colors.navy,
  },
  urgentBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  dayCard: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: CARD_RADIUS,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(7, 37, 74, 0.06)',
    ...Design.shadowSoft,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: -0.2,
  },
  cardLink: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.navy,
    opacity: 0.55,
  },
  timeline: {
    gap: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  timelineRail: {
    width: 16,
    alignItems: 'center',
    flexShrink: 0,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 14,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.borderLight,
    marginTop: 4,
    minHeight: 20,
  },
  timelineCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  timelineCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  timelineCardMain: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  timelineTime: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.navy,
    fontVariant: ['tabular-nums'],
  },
  timelineService: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.navy,
  },
  timelineClient: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  timelineBadge: {
    flexShrink: 0,
    marginTop: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Design.radius.full,
  },
  timelineBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  addAptRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  addAptDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  addAptCard: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    backgroundColor: '#FAFBFC',
    gap: 2,
  },
  addAptTime: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  addAptLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: -0.2,
  },
  shortcutsScroll: {
    gap: 12,
    paddingRight: 8,
  },
  shortcut: {
    alignItems: 'center',
    width: 72,
    gap: 6,
  },
  shortcutIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.navy,
    textAlign: 'center',
    lineHeight: 13,
    width: '100%',
  },
  performanceCard: {
    backgroundColor: Colors.card,
    borderRadius: CARD_RADIUS,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(7, 37, 74, 0.06)',
    ...Design.shadow,
    marginBottom: 4,
    overflow: 'hidden',
  },
  performanceTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.navy,
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  performanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  performanceMetric: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 2,
    minWidth: 0,
  },
  performanceDivider: {
    borderRightWidth: 1,
    borderRightColor: Colors.borderLight,
  },
  performanceIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  performanceEmoji: {
    fontSize: 14,
  },
  performanceValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.navy,
    fontVariant: ['tabular-nums'],
  },
  performanceLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 11,
    width: '100%',
  },
  performanceSublabel: {
    fontSize: 7,
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 10,
    width: '100%',
  },
});
