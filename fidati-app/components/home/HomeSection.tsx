import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { SectionHeader } from '@/components/SectionHeader';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

const TOP_DECOR = [
  { top: 10, left: 18, size: 44, color: 'rgba(251, 191, 36, 0.22)', round: true },
  { top: 48, right: 32, size: 28, color: 'rgba(16, 185, 129, 0.18)', round: true },
  { bottom: 36, left: 56, size: 20, color: 'rgba(244, 114, 182, 0.2)', round: true },
  { bottom: 18, right: 48, size: 36, color: 'rgba(251, 191, 36, 0.16)', round: true },
  { top: 22, right: 88, w: 7, h: 12, color: 'rgba(16, 185, 129, 0.45)', rotate: '18deg' },
  { top: 64, left: 120, w: 6, h: 10, color: 'rgba(251, 191, 36, 0.55)', rotate: '-24deg' },
  { bottom: 52, right: 110, w: 8, h: 5, color: 'rgba(96, 165, 250, 0.4)', rotate: '32deg' },
  { bottom: 28, left: 28, w: 5, h: 9, color: 'rgba(244, 114, 182, 0.42)', rotate: '-12deg' },
] as const;

function TopProfessionalsHeader({
  actionLabel,
  onAction,
}: {
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.topHeader}>
      <AppText style={styles.topEyebrow}>🏆 Classifica settimanale</AppText>
      <AppText style={styles.topTitle}>
        Top <AppText style={styles.topTitleAccent}>professionisti</AppText>
      </AppText>
      <AppText style={styles.topSubtitle}>
        I migliori scelti da <AppText style={styles.topSubtitleFidati}>Fidati</AppText> questa
        settimana
      </AppText>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8} style={styles.topActionWrap}>
          <AppText style={styles.topAction}>{actionLabel}</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

function TopProfessionalsDecor() {
  return (
    <View style={styles.topDecorLayer} pointerEvents="none">
      {TOP_DECOR.map((item, index) => (
        <View
          key={index}
          style={[
            'round' in item && item.round
              ? {
                  position: 'absolute',
                  width: item.size,
                  height: item.size,
                  borderRadius: item.size / 2,
                  backgroundColor: item.color,
                  top: 'top' in item ? item.top : undefined,
                  bottom: 'bottom' in item ? item.bottom : undefined,
                  left: 'left' in item ? item.left : undefined,
                  right: 'right' in item ? item.right : undefined,
                }
              : {
                  position: 'absolute',
                  width: item.w,
                  height: item.h,
                  borderRadius: 2,
                  backgroundColor: item.color,
                  top: item.top,
                  bottom: 'bottom' in item ? item.bottom : undefined,
                  left: 'left' in item ? item.left : undefined,
                  right: 'right' in item ? item.right : undefined,
                  transform: [{ rotate: item.rotate }],
                },
          ]}
        />
      ))}
    </View>
  );
}

interface HomeSectionProps {
  title: string;
  titleLeading?: ReactNode;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Prima sezione marketplace: meno spazio sopra */
  first?: boolean;
  /** Sfondo a contrasto per la sezione */
  highlight?: 'urgent' | 'top';
  children: ReactNode;
}

export function HomeSection({
  title,
  titleLeading,
  subtitle,
  actionLabel,
  onAction,
  first = false,
  highlight,
  children,
}: HomeSectionProps) {
  const header = (
    <>
      {highlight === 'top' ? (
        <TopProfessionalsHeader actionLabel={actionLabel} onAction={onAction} />
      ) : (
        <SectionHeader
          leading={titleLeading}
          title={
            highlight === 'urgent' ? (
              <>
                Interventi{' '}
                <AppText variant="display" style={styles.urgentTitleAccent}>
                  urgenti
                </AppText>
              </>
            ) : (
              title
            )
          }
          actionLabel={actionLabel}
          onAction={onAction}
        />
      )}
      {subtitle && highlight !== 'top' ? (
        <AppText style={styles.subtitle}>{subtitle}</AppText>
      ) : null}
      {children}
    </>
  );

  if (highlight === 'top') {
    return (
      <View style={[styles.section, styles.sectionTop]}>
        <View style={styles.topNeonLineTop} pointerEvents="none" />
        <View style={styles.topNeonLineBottom} pointerEvents="none" />
        <TopProfessionalsDecor />
        <View style={styles.sectionTopContent}>{header}</View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.section,
        first && styles.sectionFirst,
        highlight === 'urgent' && styles.sectionUrgent,
      ]}
    >
      {header}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 30,
  },
  sectionFirst: {
    marginTop: 6,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: -8,
    marginBottom: 12,
    letterSpacing: -0.1,
  },
  sectionUrgent: {
    marginHorizontal: -Design.spacing.screen,
    paddingHorizontal: Design.spacing.screen,
    paddingTop: 8,
    paddingBottom: 22,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  sectionTop: {
    marginHorizontal: -Design.spacing.screen,
    paddingTop: 8,
    paddingBottom: 22,
    backgroundColor: '#FFF8E6',
    overflow: 'hidden',
    position: 'relative',
  },
  sectionTopContent: {
    paddingHorizontal: Design.spacing.screen,
    zIndex: 1,
  },
  topDecorLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  topNeonLineTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(251, 191, 36, 0.95)',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 2,
  },
  topNeonLineBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(251, 191, 36, 0.95)',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 2,
  },
  urgentTitleAccent: {
    color: Colors.accent,
    fontWeight: '700',
  },
  topHeader: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 2,
  },
  topEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  topTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: -0.6,
    lineHeight: 30,
    marginTop: 4,
  },
  topTitleAccent: {
    color: '#D97706',
    fontWeight: '800',
  },
  topSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 2,
    paddingHorizontal: 12,
  },
  topSubtitleFidati: {
    color: Colors.accent,
    fontWeight: '700',
  },
  topActionWrap: {
    marginTop: 8,
  },
  topAction: {
    fontSize: Design.font.caption,
    fontWeight: '600',
    color: Colors.accent,
    textAlign: 'center',
  },
});
