import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { ProAppointment } from '@/types';

const STATUS: Record<ProAppointment['status'], { label: string; color: string }> = {
  upcoming: { label: 'Programmato', color: Colors.navy },
  in_progress: { label: 'In corso', color: Colors.success },
  done: { label: 'Completato', color: Colors.textMuted },
};

interface AppointmentRowProps {
  appointment: ProAppointment;
  showBorder?: boolean;
  onPress?: () => void;
}

export function AppointmentRow({ appointment, showBorder, onPress }: AppointmentRowProps) {
  const status = STATUS[appointment.status];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        showBorder && styles.border,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.timeCol}>
        <AppText style={styles.time}>{appointment.time}</AppText>
        <AppText style={styles.endTime}>{appointment.endTime}</AppText>
      </View>
      <View style={styles.timeline}>
        <View style={[styles.dot, appointment.status === 'in_progress' && styles.dotActive]} />
        <View style={styles.line} />
      </View>
      <View style={styles.copy}>
        <AppText style={styles.title}>{appointment.serviceTitle}</AppText>
        <AppText style={styles.client}>{appointment.clientName}</AppText>
        <AppText style={styles.meta}>
          {appointment.zone} · {appointment.address}
        </AppText>
        <AppText style={[styles.status, { color: status.color }]}>{status.label}</AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  pressed: { backgroundColor: Colors.overlay },
  timeCol: { width: 48, alignItems: 'flex-end', paddingTop: 2 },
  time: { fontSize: 13, fontWeight: '800', color: Colors.navy },
  endTime: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  timeline: { alignItems: 'center', width: 12, paddingTop: 4 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    borderWidth: 2,
    borderColor: Colors.card,
  },
  dotActive: { backgroundColor: Colors.success },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.borderLight,
    marginTop: 4,
    minHeight: 24,
  },
  copy: { flex: 1, gap: 3 },
  title: { fontSize: 15, fontWeight: '700', color: Colors.navy },
  client: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  meta: { fontSize: 11, color: Colors.textMuted },
  status: { fontSize: 11, fontWeight: '700', marginTop: 2 },
});
