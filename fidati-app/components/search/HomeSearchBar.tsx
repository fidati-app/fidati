import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { useServiceZone } from '@/context/ServiceZoneContext';

interface HomeSearchBarProps {
  placeholder?: string;
}

export function HomeSearchBar({
  placeholder = 'Cerca pulizie, idraulico, giardiniere...',
}: HomeSearchBarProps) {
  const { openCityPicker } = useServiceZone();

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => openCityPicker()}
        hitSlop={6}
        style={({ pressed }) => [styles.locationBtn, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Seleziona città"
      >
        <Ionicons name="location-outline" size={20} color={Colors.accent} />
      </Pressable>

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        editable={false}
        pointerEvents="none"
      />

      <View style={styles.searchIcon}>
        <Ionicons name="search" size={17} color={Colors.white} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingLeft: 14,
    paddingRight: 10,
    paddingVertical: 8,
    minHeight: 56,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  locationBtn: {
    padding: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
    paddingVertical: 10,
    padding: 0,
  },
  searchIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
