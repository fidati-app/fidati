import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { CATEGORY_COLORS, getCategoryBorderColor } from '@/constants/categoryColors';
import { HomeServiceTile } from '@/constants/homeMarketplace';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { CategorySlug } from '@/types';

interface ServiceAreasBlockProps {
  casa: HomeServiceTile[];
  azienda: HomeServiceTile[];
}

const COLUMN_META = {
  casa: {
    title: 'Per la tua casa',
    icon: 'home-outline' as const,
    accent: Colors.accent,
    iconBg: 'rgba(16, 185, 129, 0.12)',
  },
  azienda: {
    title: 'Per la tua azienda',
    icon: 'business-outline' as const,
    accent: '#3B82F6',
    iconBg: 'rgba(59, 130, 246, 0.12)',
  },
};

function ServiceAreaColumn({
  variant,
  services,
}: {
  variant: 'casa' | 'azienda';
  services: HomeServiceTile[];
}) {
  const router = useRouter();
  const meta = COLUMN_META[variant];
  const borderColor =
    variant === 'casa'
      ? getCategoryBorderColor('pulizie', 0.35)
      : getCategoryBorderColor('idraulici', 0.35);

  return (
    <View style={[styles.column, { borderColor }]}>
      <View style={styles.columnHeader}>
        <View style={[styles.headerIcon, { backgroundColor: meta.iconBg }]}>
          <Ionicons name={meta.icon} size={18} color={meta.accent} />
        </View>
        <AppText style={styles.columnTitle} numberOfLines={2}>
          {meta.title}
        </AppText>
      </View>

      <View style={styles.list}>
        {services.map((service, index) => {
          const accent = CATEGORY_COLORS[service.slug as CategorySlug];

          return (
            <View key={service.id}>
              <Pressable
                style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                onPress={() => router.push(`/service/${service.slug}`)}
              >
                <View style={[styles.orb, { borderColor: accent }]}>
                  <Ionicons name={service.icon} size={20} color={accent} />
                </View>
                <AppText style={styles.itemLabel} numberOfLines={1} ellipsizeMode="tail">
                  {service.title}
                </AppText>
                <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
              </Pressable>
              {index < services.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function ServiceAreasBlock({ casa, azienda }: ServiceAreasBlockProps) {
  return (
    <View style={styles.block}>
      <ServiceAreaColumn variant="casa" services={casa} />
      <ServiceAreaColumn variant="azienda" services={azienda} />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'stretch',
  },
  column: {
    flex: 1,
    minWidth: 0,
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    overflow: 'hidden',
    ...Design.shadow,
  },
  columnHeader: {
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 10,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  columnTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.3,
    lineHeight: 18,
  },
  list: {
    paddingBottom: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  itemPressed: {
    backgroundColor: Colors.background,
  },
  orb: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 60,
    marginRight: 12,
  },
});
