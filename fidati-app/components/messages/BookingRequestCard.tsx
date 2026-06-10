import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { BookingRequest } from '@/services/bookingRequests';

interface BookingRequestCardProps {
  request: BookingRequest;
  timestamp: string;
  onImagePress?: (uri: string) => void;
}

export function BookingRequestCard({
  request,
  timestamp,
  onImagePress,
}: BookingRequestCardProps) {
  const hasNote = request.note.trim().length > 0;
  const hasPhotos = request.photos.length > 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="document-text-outline" size={18} color={Colors.accent} />
          </View>
          <View style={styles.headerCopy}>
            <AppText style={styles.headerTitle}>Richiesta inviata</AppText>
            <AppText style={styles.headerMeta}>In attesa di risposta</AppText>
          </View>
          <View style={styles.statusBadge}>
            <AppText style={styles.statusBadgeText}>In attesa</AppText>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.serviceRow}>
          <AppText style={styles.serviceTitle} numberOfLines={2}>
            {request.packageTitle}
          </AppText>
          <AppText style={styles.servicePrice}>{request.servicePrice}€</AppText>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={14} color={Colors.accent} />
          <AppText style={styles.detailText}>
            {request.bookingDate} · {request.bookingTime}
          </AppText>
        </View>

        {hasNote ? (
          <View style={styles.noteBlock}>
            <AppText style={styles.noteLabel}>Nota</AppText>
            <AppText style={styles.noteText}>{request.note.trim()}</AppText>
          </View>
        ) : null}

        {hasPhotos ? (
          <View style={styles.photosBlock}>
            <AppText style={styles.photosLabel}>
              Foto allegate · {request.photos.length}
            </AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosRow}
              bounces={false}
            >
              {request.photos.map((uri) => (
                <Pressable key={uri} onPress={() => onImagePress?.(uri)}>
                  <Image source={{ uri }} style={styles.photo} contentFit="cover" />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </View>

      <AppText style={styles.timestamp}>Inviata alle {timestamp}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: 6,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    borderBottomRightRadius: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    gap: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  headerMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accent,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  serviceTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    lineHeight: 19,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.accent,
    flexShrink: 0,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 12,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  noteBlock: {
    marginHorizontal: 14,
    marginBottom: 12,
    padding: 10,
    borderRadius: Design.radius.button,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  noteLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.primary,
  },
  photosBlock: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 8,
  },
  photosLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  photosRow: {
    gap: 8,
  },
  photo: {
    width: 88,
    height: 88,
    borderRadius: Design.radius.button,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timestamp: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
});
