import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Logo } from '@/components/Logo';
import { FIDATI_GUARANTEE } from '@/constants/homeMarketplace';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

export function FidatiGuaranteeTeaser() {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.logoWrap}>
          <Logo size="sm" inverted style={styles.logo} />
        </View>

        <View style={styles.badge}>
          <Ionicons name="shield-checkmark" size={13} color={Colors.accent} />
          <AppText style={styles.badgeText}>Garanzia Fidati</AppText>
        </View>

        <AppText style={styles.title}>Prenota con tranquillità</AppText>
        <AppText style={styles.subtitle}>
          Ogni intervento è coperto da verifica professionisti, recensioni reali e pagamenti
          protetti.
        </AppText>

        <View style={styles.pillars}>
          {FIDATI_GUARANTEE.map((item) => (
            <View key={item.id} style={styles.pillar}>
              <View style={[styles.pillarIcon, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon} size={16} color={item.iconColor} />
              </View>
              <AppText style={styles.pillarLabel} numberOfLines={2}>
                {item.title}
              </AppText>
            </View>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          onPress={() => router.push('/garanzia')}
        >
          <AppText style={styles.ctaText}>Scopri la garanzia</AppText>
          <Ionicons name="arrow-forward" size={14} color={Colors.accent} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 20,
    marginBottom: 4,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.14)',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
    alignItems: 'center',
    ...Design.shadow,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 14,
  },
  logo: {
    alignSelf: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.35,
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  pillars: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginBottom: 16,
  },
  pillar: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 2,
  },
  pillarIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: -0.1,
    lineHeight: 13,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
  },
  ctaPressed: {
    opacity: 0.7,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: -0.15,
  },
});
