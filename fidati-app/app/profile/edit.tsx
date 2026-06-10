import { StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProfileImage } from '@/components/ProfileImage';
import { ProfilePageShell } from '@/components/profile/ProfilePageShell';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { MOCK_USER } from '@/services/mockData';

export default function ProfileEditScreen() {
  return (
    <ProfilePageShell title="Il mio profilo" subtitle="Aggiorna i tuoi dati personali">
      <View style={styles.card}>
        <View style={styles.avatarWrap}>
          <ProfileImage
            name={MOCK_USER.name}
            imageUrl={MOCK_USER.imageUrl}
            fallbackColor={MOCK_USER.avatarColor}
            size={84}
            shape="circle"
          />
          <AppText style={styles.changePhoto}>Cambia foto</AppText>
        </View>

        <Field label="Nome completo" value={MOCK_USER.name} />
        <Field label="Email" value={MOCK_USER.email} />
        <Field label="Telefono" value="+39 333 123 4567" />
        <Field label="Città" value="Milano" />
      </View>

      <PrimaryButton title="Salva modifiche" onPress={() => {}} />
    </ProfilePageShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <AppText style={styles.fieldLabel}>{label}</AppText>
      <TextInput style={styles.fieldInput} defaultValue={value} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 14,
    ...Design.shadow,
  },
  avatarWrap: {
    alignItems: 'center',
    gap: 8,
    paddingBottom: 4,
  },
  changePhoto: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accent,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  fieldInput: {
    minHeight: 44,
    borderRadius: Design.radius.button,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    fontSize: 15,
    color: Colors.primary,
  },
});
