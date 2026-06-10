import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface ProfileBlockProps {
  title: string;
  children: ReactNode;
}

export function ProfileBlock({ title, children }: ProfileBlockProps) {
  return (
    <View style={styles.block}>
      <AppText style={styles.title}>{title}</AppText>
      {children}
    </View>
  );
}

export function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={16} color={Colors.navy} />
      </View>
      <View style={styles.rowCopy}>
        <AppText style={styles.rowLabel}>{label}</AppText>
        <AppText style={styles.rowValue}>{value}</AppText>
      </View>
    </View>
  );
}

export function ReviewCard({
  clientName,
  rating,
  date,
  text,
  serviceTitle,
}: {
  clientName: string;
  rating: number;
  date: string;
  text: string;
  serviceTitle: string;
}) {
  return (
    <View style={styles.review}>
      <View style={styles.reviewTop}>
        <AppText style={styles.reviewName}>{clientName}</AppText>
        <View style={styles.stars}>
          <Ionicons name="star" size={12} color={Colors.star} />
          <AppText style={styles.rating}>{rating.toFixed(1)}</AppText>
        </View>
      </View>
      <AppText style={styles.reviewService}>{serviceTitle}</AppText>
      <AppText style={styles.reviewText}>{text}</AppText>
      <AppText style={styles.reviewDate}>{date}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 12,
    ...Design.shadowSoft,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.navy,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: { flex: 1, gap: 2 },
  rowLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  rowValue: { fontSize: 14, fontWeight: '600', color: Colors.navy, lineHeight: 20 },
  review: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 4,
  },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewName: { fontSize: 14, fontWeight: '700', color: Colors.navy },
  stars: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rating: { fontSize: 12, fontWeight: '700', color: Colors.navy },
  reviewService: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  reviewText: { fontSize: 13, lineHeight: 19, color: Colors.textSecondary },
  reviewDate: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
});
