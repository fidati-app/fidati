import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors } from '@/constants/colors';

interface CategoryZoneEmptyStateProps {
  onChangeZone: () => void;
  variant?: 'no-city' | 'no-pros';
}

export function CategoryZoneEmptyState({
  onChangeZone,
  variant = 'no-pros',
}: CategoryZoneEmptyStateProps) {
  const isNoCity = variant === 'no-city';

  return (
    <View style={styles.wrap}>
      <View style={styles.icon}>
        <Ionicons name="location-outline" size={28} color={Colors.accent} />
      </View>
      <AppText style={styles.message}>
        {isNoCity
          ? 'Seleziona una città per vedere i professionisti disponibili'
          : 'Nessun professionista disponibile per questa categoria nella tua zona.'}
      </AppText>
      <PrimaryButton
        title={isNoCity ? 'Seleziona città' : 'Cambia zona'}
        onPress={onChangeZone}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 8,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  button: {
    minWidth: 160,
  },
});
