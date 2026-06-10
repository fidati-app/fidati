import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { FIDATI_TRUST_STATS } from '@/constants/homeMarketplace';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';


const TAB_BAR_EXTRA_PADDING = 24;

export function FidatiGuarantee() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View style={styles.sectionWrap}>
      <View style={styles.topCornerFill} />
      <View style={[styles.section, { paddingBottom: tabBarHeight + TAB_BAR_EXTRA_PADDING }]}>
      <AppText style={styles.heading}>Perché migliaia di italiani scelgono Fidati</AppText>

      <View style={styles.statsPanel}>
        {FIDATI_TRUST_STATS.map((stat, index) => (
          <View key={stat.id} style={styles.statRow}>
            {index > 0 ? <View style={styles.statDivider} /> : null}
            <View style={styles.statContent}>
              <AppText style={styles.statValue}>{stat.value}</AppText>
              <AppText style={styles.statLabel}>{stat.label}</AppText>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.closingRow}>
        <AppText style={styles.closingText}>Ogni prenotazione è protetta da</AppText>
        <View style={styles.closingBrandGroup}>
          <Image
            source={require('@/components/logo_icona.png')}
            style={styles.closingIcon}
            contentFit="contain"
          />
          <AppText style={styles.closingBrand}>Fidati</AppText>
        </View>
        <AppText style={styles.closingText}>.</AppText>
      </View>

      <Pressable
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        onPress={() => router.push('/garanzia')}
      >
        <Image
          source={require('@/components/logo_icona.png')}
          style={styles.ctaIcon}
          contentFit="contain"
        />
        <AppText style={styles.ctaText}>Scopri la garanzia</AppText>
        <Ionicons name="arrow-forward" size={16} color={Colors.accent} />
      </Pressable>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionWrap: {
    marginHorizontal: -Design.spacing.screen,
    backgroundColor: Colors.sectionNavy,
  },
  topCornerFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: Colors.sectionGreen,
  },
  section: {
    paddingHorizontal: Design.spacing.screen,
    paddingTop: 28,
    backgroundColor: Colors.sectionNavy,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  heading: {
    fontSize: Design.font.display,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.4,
    lineHeight: 28,
    marginBottom: 18,
  },
  statsPanel: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 16,
    marginBottom: 18,
    ...Design.shadow,
  },
  statRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  statContent: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
    lineHeight: 22,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.1,
    textTransform: 'lowercase',
  },
  closingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  closingBrandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  closingText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.88)',
    letterSpacing: -0.2,
  },
  closingIcon: {
    width: 18,
    height: 18,
    flexShrink: 0,
  },
  closingBrand: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: -0.2,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'center',
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: Design.radius.button,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
  },
  ctaPressed: {
    opacity: 0.88,
  },
  ctaIcon: {
    width: 22,
    height: 22,
    flexShrink: 0,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: -0.2,
  },
});
