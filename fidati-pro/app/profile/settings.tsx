import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ProfilePageShell } from '@/components/profile/ProfilePageShell';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { MOCK_PRO_PROFILE } from '@/services/mockData';

const ITEMS = [
  { icon: 'person-outline' as const, label: 'Dati personali', value: MOCK_PRO_PROFILE.name },
  { icon: 'mail-outline' as const, label: 'Email', value: MOCK_PRO_PROFILE.email },
  { icon: 'call-outline' as const, label: 'Telefono', value: MOCK_PRO_PROFILE.phone },
  { icon: 'shield-checkmark-outline' as const, label: 'Stato account', value: 'Verificato' },
  { icon: 'lock-closed-outline' as const, label: 'Password e sicurezza', value: 'Aggiorna' },
];

export default function ProfileSettingsScreen() {
  return (
    <ProfilePageShell title="Impostazioni account" subtitle="Gestisci accesso e dati">
      <View style={styles.card}>
        {ITEMS.map((item, index) => (
          <Pressable key={item.label} style={[styles.row, index > 0 && styles.rowBorder]}>
            <Ionicons name={item.icon} size={18} color={Colors.navy} />
            <View style={styles.copy}>
              <AppText style={styles.label}>{item.label}</AppText>
              <AppText style={styles.value} numberOfLines={1}>
                {item.value}
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </Pressable>
        ))}
      </View>
    </ProfilePageShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Design.shadowSoft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: Colors.borderLight },
  copy: { flex: 1, gap: 2, minWidth: 0 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.navy },
  value: { fontSize: 12, color: Colors.textSecondary },
});
