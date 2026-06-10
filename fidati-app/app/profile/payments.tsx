import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProfilePageShell } from '@/components/profile/ProfilePageShell';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

const PAYMENT_METHODS = [
  { id: '1', label: 'Visa ···· 4242', meta: 'Predefinito', icon: 'card-outline' as const },
  { id: '2', label: 'PayPal', meta: 'marco.rossi@email.com', icon: 'logo-paypal' as const },
];

export default function ProfilePaymentsScreen() {
  return (
    <ProfilePageShell title="Metodi di pagamento" subtitle="Gestisci carte e wallet">
      <View style={styles.card}>
        {PAYMENT_METHODS.map((method, index) => (
          <Pressable
            key={method.id}
            style={[styles.row, index < PAYMENT_METHODS.length - 1 && styles.rowBorder]}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={method.icon} size={18} color={Colors.accent} />
            </View>
            <View style={styles.copy}>
              <AppText style={styles.label}>{method.label}</AppText>
              <AppText style={styles.meta}>{method.meta}</AppText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
          </Pressable>
        ))}
      </View>

      <PrimaryButton title="Aggiungi metodo di pagamento" variant="outline" onPress={() => {}} />

      <View style={styles.infoCard}>
        <Ionicons name="lock-closed-outline" size={18} color={Colors.accent} />
        <AppText style={styles.infoText}>
          I pagamenti su Fidati sono protetti e crittografati. Non salviamo il CVV della carta.
        </AppText>
      </View>
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: Design.radius.card,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.18)',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
});
