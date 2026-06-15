import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface UrgentJobsSectionProps {
  enabled: boolean;
  disabled?: boolean;
  compact?: boolean;
  onChange: (value: boolean) => void;
}

export function UrgentJobsSection({ enabled, disabled, compact = false, onChange }: UrgentJobsSectionProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleToggle = (next: boolean) => {
    if (next) {
      setSheetOpen(true);
      return;
    }
    onChange(false);
  };

  const handleAcceptUrgent = () => {
    onChange(true);
    setSheetOpen(false);
  };

  const handleDeclineUrgent = () => {
    onChange(false);
    setSheetOpen(false);
  };

  return (
    <>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.copy}>
            <AppText style={styles.title}>Accetti lavori urgenti?</AppText>
            {!compact ? (
              <AppText style={styles.subtitle}>
                Ricevi richieste urgenti nella tua categoria e zona quando sei disponibile.
              </AppText>
            ) : null}
          </View>
          <Switch
            value={enabled}
            onValueChange={handleToggle}
            disabled={disabled}
            trackColor={{ false: Colors.border, true: 'rgba(251, 191, 36, 0.55)' }}
            thumbColor={enabled ? '#F59E0B' : Colors.white}
          />
        </View>

        {!compact ? (
          <Pressable style={styles.link} onPress={() => setSheetOpen(true)} disabled={disabled}>
            <AppText style={styles.linkText}>Come funzionano i lavori urgenti?</AppText>
            <AppText style={styles.linkHint}>Scopri di più</AppText>
          </Pressable>
        ) : (
          <Pressable style={styles.link} onPress={() => setSheetOpen(true)} disabled={disabled}>
            <AppText style={styles.linkText}>Maggiori dettagli</AppText>
          </Pressable>
        )}
      </View>

      <Modal visible={sheetOpen} transparent animationType="slide" onRequestClose={() => setSheetOpen(false)}>
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSheetOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <AppText style={styles.sheetTitle}>Come funzionano i lavori urgenti?</AppText>

            <AppText style={styles.paragraph}>
              Quando un cliente ha bisogno subito di un intervento urgente nella tua categoria, Fidati
              può inviare la richiesta a più professionisti disponibili nella stessa zona.
            </AppText>
            <AppText style={styles.paragraph}>
              Il lavoro viene preso dal professionista che risponde più velocemente ed è realmente
              disponibile.
            </AppText>
            <AppText style={styles.paragraph}>
              Per le prenotazioni normali invece il cliente sceglie direttamente te, il giorno e
              l&apos;orario.
            </AppText>

            <PrimaryButton title="Sì, voglio accettare lavori urgenti" onPress={handleAcceptUrgent} />
            <PrimaryButton
              title="No, disattiva lavori urgenti"
              variant="outline"
              onPress={handleDeclineUrgent}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 12,
    ...Design.shadowSoft,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.navy,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  link: {
    paddingTop: 4,
    gap: 2,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.success,
  },
  linkHint: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Design.radius.xl,
    borderTopRightRadius: Design.radius.xl,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: 4,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.navy,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textSecondary,
  },
});
