import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { Booking, BookingStatus } from '@/types';
import { AppText } from './AppText';
import { Badge } from './Badge';
import { ProfileImage } from './ProfileImage';

const STATUS_MAP: Record<
  BookingStatus,
  { label: string; variant: 'confirmed' | 'incoming' | 'completed' | 'neutral' }
> = {
  confirmed: { label: 'Confermata', variant: 'confirmed' },
  incoming: { label: 'In arrivo', variant: 'incoming' },
  completed: { label: 'Completata', variant: 'completed' },
  cancelled: { label: 'Annullata', variant: 'neutral' },
};

interface BookingCardProps {
  booking: Booking;
  onPress?: () => void;
  variant?: 'card' | 'list';
  showBorder?: boolean;
}

export function BookingCard({
  booking,
  onPress,
  variant = 'card',
  showBorder = false,
}: BookingCardProps) {
  const status = STATUS_MAP[booking.status];
  const isList = variant === 'list';

  return (
    <Pressable
      style={({ pressed }) => [
        isList ? styles.listRow : styles.card,
        showBorder && styles.listRowBorder,
        pressed && (isList ? styles.listPressed : styles.pressed),
      ]}
      onPress={onPress}
    >
      <ProfileImage
        name={booking.professionalName}
        imageUrl={booking.professionalImageUrl}
        size={52}
        shape="circle"
      />

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <AppText style={styles.title} numberOfLines={1}>
            {booking.serviceTitle}
          </AppText>
          <Badge label={status.label} variant={status.variant} />
        </View>
        <AppText style={styles.proName}>{booking.professionalName}</AppText>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
          <AppText style={styles.date}>
            {booking.date} · {booking.time}
          </AppText>
        </View>
      </View>

      <View style={styles.right}>
        <AppText style={styles.price}>{booking.price}€</AppText>
        <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    padding: Design.spacing.card,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
    ...Design.shadow,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  listRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pressed: {
    opacity: 0.92,
  },
  listPressed: {
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: Design.font.title,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  proName: {
    fontSize: Design.font.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: Design.font.micro,
    color: Colors.textSecondary,
  },
  right: {
    alignItems: 'flex-end',
    gap: 8,
  },
  price: {
    fontSize: Design.font.title,
    fontWeight: '800',
    color: Colors.accent,
  },
});
