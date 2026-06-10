import { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ProfilePageShell } from '@/components/profile/ProfilePageShell';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

const INITIAL = {
  messages: true,
  bookings: true,
  offers: false,
  reminders: true,
  marketing: false,
};

export default function ProfileNotificationsScreen() {
  const [prefs, setPrefs] = useState(INITIAL);

  const toggle = (key: keyof typeof INITIAL) => {
    setPrefs((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <ProfilePageShell title="Notifiche" subtitle="Scegli cosa ricevere">
      <View style={styles.card}>
        <ToggleRow
          label="Messaggi"
          description="Nuove risposte dai professionisti"
          value={prefs.messages}
          onToggle={() => toggle('messages')}
        />
        <ToggleRow
          label="Prenotazioni"
          description="Conferme, promemoria e aggiornamenti"
          value={prefs.bookings}
          onToggle={() => toggle('bookings')}
          bordered
        />
        <ToggleRow
          label="Offerte"
          description="Promozioni nella tua zona"
          value={prefs.offers}
          onToggle={() => toggle('offers')}
          bordered
        />
        <ToggleRow
          label="Promemoria appuntamento"
          description="24 ore e 1 ora prima del servizio"
          value={prefs.reminders}
          onToggle={() => toggle('reminders')}
          bordered
        />
        <ToggleRow
          label="Novità Fidati"
          description="Aggiornamenti e consigli utili"
          value={prefs.marketing}
          onToggle={() => toggle('marketing')}
          bordered
        />
      </View>
    </ProfilePageShell>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onToggle,
  bordered = false,
}: {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  bordered?: boolean;
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={[styles.row, bordered && styles.rowBorder]}
    >
      <View style={styles.copy}>
        <AppText style={styles.label}>{label}</AppText>
        <AppText style={styles.description}>{description}</AppText>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.border, true: 'rgba(16, 185, 129, 0.35)' }}
        thumbColor={value ? Colors.accent : Colors.card}
      />
    </Pressable>
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
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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
  description: {
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textSecondary,
  },
});
