import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ProfilePageShell } from '@/components/profile/ProfilePageShell';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

const ITEMS = [
  { icon: 'key-outline' as const, label: 'Cambia password', meta: 'Ultimo aggiornamento 3 mesi fa' },
  { icon: 'finger-print-outline' as const, label: 'Accesso biometrico', meta: 'Face ID attivo' },
  { icon: 'document-text-outline' as const, label: 'Termini di servizio', meta: 'Leggi le condizioni' },
  { icon: 'shield-outline' as const, label: 'Informativa privacy', meta: 'Come trattiamo i tuoi dati' },
  { icon: 'download-outline' as const, label: 'Scarica i miei dati', meta: 'Richiedi una copia' },
];

export default function ProfilePrivacyScreen() {
  return (
    <ProfilePageShell title="Privacy e sicurezza" subtitle="Proteggi account e dati personali">
      <View style={styles.card}>
        {ITEMS.map((item, index) => (
          <Pressable
            key={item.label}
            style={[styles.row, index < ITEMS.length - 1 && styles.rowBorder]}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon} size={18} color={Colors.accent} />
            </View>
            <View style={styles.copy}>
              <AppText style={styles.label}>{item.label}</AppText>
              <AppText style={styles.meta}>{item.meta}</AppText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.dangerBtn}>
        <Ionicons name="trash-outline" size={16} color={Colors.error} />
        <AppText style={styles.dangerText}>Elimina account</AppText>
      </Pressable>
    </ProfilePageShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Design.shadow,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  meta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: Design.radius.button,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
  },
  dangerText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.error,
  },
});
