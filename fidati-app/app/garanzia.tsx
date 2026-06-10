import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Logo } from '@/components/Logo';
import { FIDATI_GUARANTEE, FIDATI_TRUST_STATS } from '@/constants/homeMarketplace';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

const SECTION_BG = '#07254A';

export default function GaranziaScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[SECTION_BG, '#0A2C57']}
        style={[styles.hero, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.heroLogo}>
          <Logo size="sm" inverted />
        </View>
        <View style={styles.heroBadge}>
          <Ionicons name="shield-checkmark" size={14} color={Colors.accent} />
          <AppText style={styles.heroBadgeText}>Garanzia Fidati</AppText>
        </View>
        <AppText style={styles.heroTitle}>Prenota con tranquillità</AppText>
        <AppText style={styles.heroSubtitle}>
          Ogni intervento su Fidati è protetto da verifiche continue, recensioni autentiche e
          pagamenti sicuri.
        </AppText>
      </LinearGradient>

      <View style={styles.body}>
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

        <AppText style={styles.sectionTitle}>Cosa include la garanzia</AppText>

        <View style={styles.pillars}>
          {FIDATI_GUARANTEE.map((item) => (
            <View key={item.id} style={styles.pillar}>
              <View style={[styles.pillarIcon, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon} size={22} color={item.iconColor} />
              </View>
              <View style={styles.pillarBody}>
                <View style={styles.pillarHeader}>
                  <AppText style={styles.pillarTitle}>{item.title}</AppText>
                  <AppText style={styles.pillarProof}>{item.proof}</AppText>
                </View>
                <AppText style={styles.pillarDescription}>{item.description}</AppText>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.protectionCard}>
          <Image
            source={require('@/components/logo_icona.png')}
            style={styles.protectionIcon}
            contentFit="contain"
          />
          <View style={styles.protectionCopy}>
            <AppText style={styles.protectionTitle}>Protezione su ogni prenotazione</AppText>
            <AppText style={styles.protectionText}>
              Se qualcosa non va come previsto, il team Fidati ti assiste fino alla risoluzione
              dell&apos;intervento.
            </AppText>
          </View>
        </View>

        <AppText style={styles.closing}>
          Fidati è il modo più sicuro per trovare professionisti affidabili in tutta Italia.
        </AppText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hero: {
    paddingHorizontal: Design.spacing.screen,
    paddingBottom: 28,
    alignItems: 'center',
  },
  heroLogo: {
    marginBottom: 16,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    marginBottom: 12,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.5,
    lineHeight: 32,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.78)',
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 320,
  },
  body: {
    paddingHorizontal: Design.spacing.screen,
    paddingTop: 24,
    gap: 0,
  },
  statsPanel: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 16,
    marginBottom: 24,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.35,
    lineHeight: 23,
    marginBottom: 12,
  },
  pillars: {
    gap: 10,
    marginBottom: 20,
  },
  pillar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
    ...Design.shadow,
  },
  pillarIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  pillarBody: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  pillarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pillarTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.25,
    lineHeight: 19,
  },
  pillarProof: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 0.1,
  },
  pillarDescription: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  protectionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: SECTION_BG,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 20,
  },
  protectionIcon: {
    width: 36,
    height: 36,
    flexShrink: 0,
    marginTop: 2,
  },
  protectionCopy: {
    flex: 1,
    gap: 6,
  },
  protectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.25,
    lineHeight: 19,
  },
  protectionText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.78)',
    lineHeight: 18,
  },
  closing: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: -0.15,
    paddingHorizontal: 8,
  },
});
