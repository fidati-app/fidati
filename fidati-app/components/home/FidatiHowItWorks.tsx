import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { FIDATI_HOW_IT_WORKS } from '@/constants/homeMarketplace';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

export function FidatiHowItWorks() {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Ionicons name="sparkles" size={12} color={Colors.accent} />
          <AppText style={styles.headerBadgeText}>Semplice e veloce</AppText>
        </View>
        <AppText style={styles.title}>Come funziona Fidati?</AppText>
        <AppText style={styles.subtitle}>
          Tre passaggi per trovare e prenotare il professionista giusto
        </AppText>
      </View>

      <View style={styles.steps}>
        {FIDATI_HOW_IT_WORKS.map((step, index) => {
          const isLast = index === FIDATI_HOW_IT_WORKS.length - 1;

          return (
            <View key={step.id} style={styles.stepWrap}>
              <View style={styles.stepCard}>
                <View style={styles.stepAccent} />
                <View style={styles.stepRow}>
                  <View style={styles.stepNumber}>
                    <AppText style={styles.stepNumberText}>{step.step}</AppText>
                  </View>
                  <View style={styles.stepCopy}>
                    <AppText style={styles.stepTitle}>{step.label}</AppText>
                    <AppText style={styles.stepDescription}>{step.description}</AppText>
                  </View>
                  <View style={styles.iconWrap}>
                    <Ionicons name={step.icon} size={20} color={Colors.accent} />
                  </View>
                </View>
              </View>

              {!isLast ? (
                <View style={styles.connector}>
                  <View style={styles.connectorLine} />
                  <View style={styles.connectorDot} />
                  <View style={styles.connectorLine} />
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 30,
    marginHorizontal: -Design.spacing.screen,
    paddingHorizontal: Design.spacing.screen,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: Colors.sectionGreen,
    borderTopWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.16)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    marginBottom: 14,
    gap: 6,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: -0.1,
  },
  title: {
    fontSize: Design.font.display,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.4,
    lineHeight: 26,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 16,
    textAlign: 'center',
    maxWidth: 300,
  },
  steps: {
    gap: 0,
  },
  stepWrap: {
    alignItems: 'center',
  },
  stepCard: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.14)',
    overflow: 'hidden',
    ...Design.shadow,
  },
  stepAccent: {
    height: 3,
    backgroundColor: Colors.accent,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.accent,
    lineHeight: 16,
  },
  stepCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.3,
    lineHeight: 19,
  },
  stepDescription: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  connector: {
    alignItems: 'center',
    paddingVertical: 4,
    gap: 2,
  },
  connectorLine: {
    width: 2,
    height: 6,
    borderRadius: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.28)',
  },
  connectorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
});
