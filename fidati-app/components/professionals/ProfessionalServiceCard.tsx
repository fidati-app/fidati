import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PackageCard } from '@/components/PackageCard';
import { CATEGORY_COLORS } from '@/constants/categoryColors';
import { ProfessionalServiceItem } from '@/constants/professionalServices';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { CategorySlug } from '@/types';

interface ProfessionalServiceCardProps {
  service: ProfessionalServiceItem;
  categorySlug: CategorySlug;
  expanded: boolean;
  selectedPackageId: string | null;
  onToggle: () => void;
  onSelectPackage: (packageId: string) => void;
}

export function ProfessionalServiceCard({
  service,
  categorySlug,
  expanded,
  selectedPackageId,
  onToggle,
  onSelectPackage,
}: ProfessionalServiceCardProps) {
  const accent = CATEGORY_COLORS[categorySlug];

  return (
    <View style={styles.wrap}>
      <Pressable
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
        onPress={onToggle}
      >
        <View style={[styles.iconWrap, { backgroundColor: `${accent}14` }]}>
          <Ionicons name={service.icon} size={16} color={accent} />
        </View>
        <View style={styles.copy}>
          <AppText style={styles.title}>{service.title}</AppText>
          <AppText style={styles.description} numberOfLines={1}>
            {service.description}
          </AppText>
        </View>
        <View style={styles.right}>
          <AppText style={[styles.fromPrice, { color: accent }]}>
            da {service.fromPrice}€
          </AppText>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={Colors.textSecondary}
          />
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.packages}>
          {service.packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              selected={selectedPackageId === pkg.id}
              onPress={() => onSelectPackage(pkg.id)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 10,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    overflow: 'hidden',
    ...Design.shadow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  pressed: {
    opacity: 0.92,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 14,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
  fromPrice: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  packages: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 2,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: '#FAFBFC',
  },
});
