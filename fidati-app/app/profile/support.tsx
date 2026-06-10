import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProfilePageShell } from '@/components/profile/ProfilePageShell';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

const FAQ = [
  {
    question: 'Come modifico una prenotazione?',
    answer: 'Apri la prenotazione dalla tab Prenota e contatta il professionista in chat.',
  },
  {
    question: 'Quando viene addebitato il pagamento?',
    answer: 'Il pagamento viene pre-autorizzato alla conferma e addebitato al termine del servizio.',
  },
  {
    question: 'Cosa copre la Garanzia Fidati?',
    answer: 'Professionisti verificati, assistenza dedicata e rimborso in caso di problemi documentati.',
  },
];

export default function ProfileSupportScreen() {
  return (
    <ProfilePageShell title="Assistenza" subtitle="Siamo qui per aiutarti">
      <View style={styles.quickActions}>
        <QuickAction icon="chatbubble-ellipses-outline" label="Chat live" />
        <QuickAction icon="mail-outline" label="Email" />
        <QuickAction icon="call-outline" label="Chiamaci" />
      </View>

      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Domande frequenti</AppText>
        {FAQ.map((item, index) => (
          <View key={item.question} style={[styles.faqItem, index > 0 && styles.faqBorder]}>
            <AppText style={styles.faqQuestion}>{item.question}</AppText>
            <AppText style={styles.faqAnswer}>{item.answer}</AppText>
          </View>
        ))}
      </View>

      <PrimaryButton title="Apri un ticket" onPress={() => {}} />

      <View style={styles.hoursCard}>
        <Ionicons name="time-outline" size={18} color={Colors.accent} />
        <View style={styles.hoursCopy}>
          <AppText style={styles.hoursTitle}>Orari assistenza</AppText>
          <AppText style={styles.hoursText}>Lun–Ven 9:00–19:00 · Sab 9:00–13:00</AppText>
        </View>
      </View>
    </ProfilePageShell>
  );
}

function QuickAction({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <Pressable style={styles.quickAction}>
      <View style={styles.quickIcon}>
        <Ionicons name={icon} size={20} color={Colors.accent} />
      </View>
      <AppText style={styles.quickLabel}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  quickActions: {
    flexDirection: 'row',
    gap: 10,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: Design.radius.card,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Design.shadow,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 12,
    ...Design.shadow,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  faqItem: {
    gap: 4,
  },
  faqBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  faqAnswer: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  hoursCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: Design.radius.card,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hoursCopy: {
    flex: 1,
    gap: 2,
  },
  hoursTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  hoursText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
