import { Ionicons } from '@expo/vector-icons';
import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardEvent,
  ListRenderItemInfo,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { formatMunicipalityLabel, searchMunicipalities } from '@/data/italianMunicipalities';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { useServiceZone } from '@/context/ServiceZoneContext';
import { ItalianMunicipality } from '@/types';

const SEARCH_RESULT_LIMIT = 30;
const ROW_HEIGHT = 44;

/** Allineato a HomeHero/CategoriesHero: paddingTop + Logo lg + gap sotto il logo */
const HERO_TOP_PADDING = 12;
const LOGO_LG_HEIGHT = 72;
const LOGO_BOTTOM_GAP = 8;

type MunicipalityListItemProps = {
  municipality: ItalianMunicipality;
  active: boolean;
  onSelect: (municipality: ItalianMunicipality) => void;
};

const MunicipalityListItem = memo(function MunicipalityListItem({
  municipality,
  active,
  onSelect,
}: MunicipalityListItemProps) {
  return (
    <Pressable
      onPress={() => onSelect(municipality)}
      style={({ pressed }) => [
        styles.suggestionRow,
        active && styles.suggestionRowActive,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name="location-outline"
        size={16}
        color={active ? Colors.accent : Colors.textSecondary}
      />
      <AppText style={[styles.suggestionLabel, active && styles.suggestionLabelActive]}>
        {formatMunicipalityLabel(municipality)}
      </AppText>
      {active ? <Ionicons name="checkmark" size={18} color={Colors.accent} /> : null}
    </Pressable>
  );
});

function NoResultsMessage() {
  return (
    <View style={styles.messageWrap}>
      <AppText style={styles.noResults}>Nessuna città trovata</AppText>
    </View>
  );
}

export function ServiceCityPickerModal() {
  const insets = useSafeAreaInsets();
  const searchInputRef = useRef<TextInput>(null);
  const {
    showCityPicker,
    pickerRequired,
    isLoadingLocation,
    locationDenied,
    selectedCity,
    selectedMunicipality,
    selectMunicipality,
    useMyLocation,
    closeCityPicker,
  } = useServiceZone();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState<ItalianMunicipality[]>([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const isSearching = searchQuery.trim().length > 0;
  const logoClearanceTop =
    insets.top + HERO_TOP_PADDING + LOGO_LG_HEIGHT + LOGO_BOTTOM_GAP;
  const listBottomPadding = Math.max(keyboardHeight, 8);

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
    searchInputRef.current?.blur();
  }, []);

  useEffect(() => {
    if (!showCityPicker) {
      setKeyboardHeight(0);
      return;
    }

    setSearchQuery('');
    setFilteredResults([]);

    const focusTimer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 150);

    return () => clearTimeout(focusTimer);
  }, [showCityPicker]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (event: KeyboardEvent) => {
      setKeyboardHeight(event.endCoordinates.height);
    };
    const onHide = () => {
      setKeyboardHeight(0);
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useLayoutEffect(() => {
    if (!showCityPicker) return;

    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setFilteredResults([]);
      return;
    }

    setFilteredResults(searchMunicipalities(searchQuery, SEARCH_RESULT_LIMIT));
  }, [searchQuery, showCityPicker]);

  useEffect(() => {
    if (!__DEV__ || !showCityPicker) return;

    console.log('[Fidati City Search]', {
      searchQuery,
      isSearching,
      resultsCount: filteredResults.length,
      firstResult: filteredResults[0] ? formatMunicipalityLabel(filteredResults[0]) : null,
    });
  }, [showCityPicker, searchQuery, isSearching, filteredResults]);

  const handleClose = useCallback(() => {
    dismissKeyboard();
    if (pickerRequired && !selectedCity) return;
    setSearchQuery('');
    setFilteredResults([]);
    closeCityPicker();
  }, [dismissKeyboard, pickerRequired, selectedCity, closeCityPicker]);

  const handleBackdropPress = useCallback(() => {
    dismissKeyboard();
    if (pickerRequired && !selectedCity) return;
    setSearchQuery('');
    setFilteredResults([]);
    closeCityPicker();
  }, [dismissKeyboard, pickerRequired, selectedCity, closeCityPicker]);

  const handleUseMyLocation = useCallback(() => {
    dismissKeyboard();
    void useMyLocation();
  }, [dismissKeyboard, useMyLocation]);

  const handleSelectMunicipality = useCallback(
    (municipality: ItalianMunicipality) => {
      dismissKeyboard();
      setSearchQuery('');
      setFilteredResults([]);
      void selectMunicipality(municipality);
    },
    [dismissKeyboard, selectMunicipality],
  );

  const handleSearchSubmit = useCallback(() => {
    dismissKeyboard();
  }, [dismissKeyboard]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);

    const trimmed = text.trim();
    if (!trimmed) {
      setFilteredResults([]);
      return;
    }

    setFilteredResults(searchMunicipalities(text, SEARCH_RESULT_LIMIT));
  }, []);

  const isActiveMunicipality = useCallback(
    (municipality: ItalianMunicipality) => {
      if (selectedMunicipality?.istatCode && municipality.istatCode) {
        return selectedMunicipality.istatCode === municipality.istatCode;
      }
      return (
        selectedMunicipality?.name === municipality.name &&
        selectedMunicipality?.province === municipality.province
      );
    },
    [selectedMunicipality],
  );

  const keyExtractor = useCallback(
    (item: ItalianMunicipality) => item.istatCode || `${item.name}-${item.province}`,
    [],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ItalianMunicipality>) => (
      <MunicipalityListItem
        municipality={item}
        active={isActiveMunicipality(item)}
        onSelect={handleSelectMunicipality}
      />
    ),
    [handleSelectMunicipality, isActiveMunicipality],
  );

  if (!showCityPicker) return null;

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      presentationStyle="overFullScreen"
    >
      <View style={styles.backdrop}>
        <Pressable
          style={[styles.logoClearance, { height: logoClearanceTop }]}
          onPress={dismissKeyboard}
        />

        <View style={styles.sheetContainer}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleBackdropPress} />

          <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
            <View
              style={[
                styles.sheet,
                {
                  paddingBottom: Math.max(insets.bottom, 12),
                },
              ]}
            >
            <View style={styles.fixedHeader}>
              <View style={styles.handle} />

              <View style={styles.header}>
                <AppText style={styles.title}>Scegli la città</AppText>
                {!pickerRequired ? (
                  <Pressable onPress={handleClose} hitSlop={8} style={styles.closeBtn}>
                    <Ionicons name="close" size={22} color={Colors.textSecondary} />
                  </Pressable>
                ) : null}
              </View>

              <Pressable
                onPress={handleUseMyLocation}
                disabled={isLoadingLocation}
                style={({ pressed }) => [
                  styles.locationOption,
                  pressed && styles.pressed,
                  isLoadingLocation && styles.disabled,
                ]}
              >
              <Ionicons name="navigate" size={20} color={Colors.accent} />
              <View style={styles.locationCopy}>
                <AppText style={styles.locationTitle}>Usa la mia posizione attuale</AppText>
                <AppText style={styles.locationHint}>
                  Rileviamo la città più vicina al tuo GPS
                </AppText>
              </View>
              {isLoadingLocation ? (
                <ActivityIndicator size="small" color={Colors.accent} />
              ) : (
                <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
              )}
            </Pressable>

            {locationDenied ? (
              <AppText style={styles.denied}>
                Permesso posizione negato. Cerca la città manualmente.
              </AppText>
            ) : null}

            <View style={styles.searchField}>
              <Ionicons name="search" size={18} color={Colors.textSecondary} />
              <TextInput
                ref={searchInputRef}
                value={searchQuery}
                onChangeText={handleSearchChange}
                placeholder="Scrivi la tua città"
                placeholderTextColor={Colors.textSecondary}
                style={styles.searchInput}
                autoCorrect={false}
                autoCapitalize="none"
                autoComplete="off"
                returnKeyType="search"
                clearButtonMode={Platform.OS === 'ios' ? 'while-editing' : 'never'}
                blurOnSubmit
                onSubmitEditing={handleSearchSubmit}
                enablesReturnKeyAutomatically={false}
              />
              {Platform.OS !== 'ios' && isSearching ? (
                <Pressable onPress={() => handleSearchChange('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
                </Pressable>
              ) : null}
            </View>
          </View>

          <View style={styles.resultsArea}>
            {!isSearching ? (
              <Pressable style={[styles.messageWrap, { paddingBottom: listBottomPadding }]} onPress={dismissKeyboard}>
                <AppText style={styles.idleHint}>
                  Scrivi il nome della tua città oppure usa la posizione attuale.
                </AppText>
              </Pressable>
            ) : (
              <FlatList
                data={filteredResults}
                extraData={`${searchQuery}|${selectedMunicipality?.istatCode ?? ''}|${keyboardHeight}`}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListEmptyComponent={NoResultsMessage}
                style={styles.suggestions}
                contentContainerStyle={[
                  styles.suggestionsContent,
                  filteredResults.length === 0 && styles.suggestionsContentEmpty,
                  { paddingBottom: listBottomPadding },
                ]}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
                initialNumToRender={20}
                maxToRenderPerBatch={20}
                windowSize={10}
                removeClippedSubviews={Platform.OS === 'ios' ? false : true}
              />
            )}
          </View>

          {pickerRequired ? (
            <AppText style={styles.requiredHint}>
              Seleziona una città per vedere i professionisti disponibili
            </AppText>
          ) : null}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  logoClearance: {
    backgroundColor: 'transparent',
  },
  sheetContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'rgba(1, 13, 32, 0.45)',
  },
  sheet: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Design.spacing.screen,
    paddingTop: 10,
    overflow: 'hidden',
  },
  fixedHeader: {
    flexShrink: 0,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.4,
  },
  closeBtn: {
    padding: 4,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.18)',
    marginBottom: 12,
  },
  locationCopy: {
    flex: 1,
    gap: 2,
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  locationHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  denied: {
    fontSize: 12,
    color: Colors.error,
    marginBottom: 10,
    lineHeight: 16,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.primary,
    padding: 0,
  },
  resultsArea: {
    flex: 1,
    minHeight: 0,
  },
  messageWrap: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  idleHint: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    textAlign: 'center',
  },
  suggestions: {
    flex: 1,
  },
  suggestionsContent: {
    paddingBottom: 8,
  },
  suggestionsContentEmpty: {
    flexGrow: 1,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: ROW_HEIGHT,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  suggestionRowActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  suggestionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  suggestionLabelActive: {
    color: Colors.accent,
  },
  noResults: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 12,
  },
  requiredHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 17,
    flexShrink: 0,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.65,
  },
});
