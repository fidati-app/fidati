import { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ProfilePageShell } from '@/components/profile/ProfilePageShell';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

const OPTIONS = [
  { id: 'requests', label: 'Nuove richieste', default: true },
  { id: 'messages', label: 'Messaggi clienti', default: true },
  { id: 'reminders', label: 'Promemoria appuntamenti', default: true },
  { id: 'reviews', label: 'Nuove recensioni', default: false },
  { id: 'marketing', label: 'Consigli e novità Fidati', default: false },
];

export default function ProfileNotificationsScreen() {
  const [values, setValues] = useState<Record<string, boolean>>(
    Object.fromEntries(OPTIONS.map((option) => [option.id, option.default])),
  );

  return (
    <ProfilePageShell title="Notifiche" subtitle="Scegli cosa ricevere">
      <View style={styles.card}>
        {OPTIONS.map((option, index) => (
          <Pressable
            key={option.id}
            style={[styles.row, index > 0 && styles.rowBorder]}
            onPress={() => setValues((current) => ({ ...current, [option.id]: !current[option.id] }))}
          >
            <AppText style={styles.label}>{option.label}</AppText>
            <Switch
              value={values[option.id]}
              onValueChange={(next) => setValues((current) => ({ ...current, [option.id]: next }))}
              trackColor={{ false: Colors.border, true: Colors.successSoft }}
              thumbColor={values[option.id] ? Colors.success : Colors.card}
            />
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
    justifyContent: 'space-between',
    padding: 14,
    gap: 12,
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: Colors.borderLight },
  label: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.navy },
});
