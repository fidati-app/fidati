import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { normalizeSearchText } from '@/data/italianMunicipalities';
import {
  findCityCatalogExactMatch,
  searchCityCatalog,
  type CityCatalogResult,
} from '@/services/cityCatalogService';

interface CityPickerProps {
  cities: string[];
  query: string;
  onChangeQuery: (value: string) => void;
  onAddCity: (city: string) => void;
  onRemoveCity: (city: string) => void;
  disabled?: boolean;
  hint?: string;
  placeholder?: string;
  excludeCities?: string[];
  onInputFocus?: () => void;
  /** Mostra chip città già selezionate sotto la lista */
  showSelectedChips?: boolean;
}

function HighlightedCityName({ name, query }: { name: string; query: string }) {
  const term = normalizeSearchText(query);
  const normalizedName = normalizeSearchText(name);

  if (!term || !normalizedName.startsWith(term)) {
    return <AppText style={styles.suggestionName}>{name}</AppText>;
  }

  const matchLength = name.length >= term.length ? term.length : name.length;
  let endIndex = 0;
  let normalizedProgress = '';
  for (let i = 0; i < name.length; i += 1) {
    normalizedProgress = normalizeSearchText(name.slice(0, i + 1));
    if (normalizedProgress.length >= term.length) {
      endIndex = i + 1;
      break;
    }
  }
  if (endIndex === 0) endIndex = Math.min(name.length, term.length);

  return (
    <AppText style={styles.suggestionName}>
      <AppText style={styles.suggestionNameMatch}>{name.slice(0, endIndex)}</AppText>
      {name.slice(endIndex)}
    </AppText>
  );
}

function CitySuggestionRow({
  item,
  query,
  onSelect,
  disabled,
}: {
  item: CityCatalogResult;
  query: string;
  onSelect: (city: string) => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.suggestionRow, pressed && styles.suggestionRowPressed]}
      onPress={() => onSelect(item.name)}
      disabled={disabled}
    >
      <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
      <View style={styles.suggestionCopy}>
        <HighlightedCityName name={item.name} query={query} />
        <AppText style={styles.suggestionMeta}>
          {item.province}
          {item.region ? ` · ${item.region}` : ''}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </Pressable>
  );
}

export function CityPicker({
  cities,
  query,
  onChangeQuery,
  onAddCity,
  onRemoveCity,
  disabled,
  hint,
  placeholder = 'Cerca la tua città',
  excludeCities = [],
  onInputFocus,
  showSelectedChips = true,
}: CityPickerProps) {
  const normalizedQuery = query.trim();
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const selectingRef = useRef(false);

  const blockedSet = useMemo(
    () =>
      new Set(
        [...cities, ...excludeCities]
          .map((city) => city.trim().toLowerCase())
          .filter(Boolean),
      ),
    [cities, excludeCities],
  );

  const suggestions = useMemo(() => {
    if (normalizedQuery.length < 1) return [];
    return searchCityCatalog(normalizedQuery, 20).filter(
      (row) => !blockedSet.has(row.name.toLowerCase()),
    );
  }, [blockedSet, normalizedQuery]);

  useEffect(() => {
    if (__DEV__) {
      console.log('[WORK_AREA] query changed', normalizedQuery, suggestions.length);
    }
  }, [normalizedQuery, suggestions.length]);

  const selectCity = (cityName: string) => {
    const trimmed = cityName.trim();
    if (!trimmed || disabled) return;
    if (blockedSet.has(trimmed.toLowerCase())) return;
    if (selectingRef.current) return;

    selectingRef.current = true;
    setLookupError(null);
    onAddCity(trimmed);
    if (query !== '') onChangeQuery('');

    setTimeout(() => {
      selectingRef.current = false;
    }, 300);
  };

  const trySelectExactMatch = () => {
    if (normalizedQuery.length < 1 || selectingRef.current) return;
    setLookupError(null);
    setIsResolving(true);
    try {
      const match = findCityCatalogExactMatch(normalizedQuery);
      if (!match || blockedSet.has(match.name.toLowerCase())) {
        setLookupError('Comune non trovato');
        return;
      }
      selectCity(match.name);
    } catch {
      setLookupError('Impossibile verificare il comune. Riprova.');
    } finally {
      setIsResolving(false);
    }
  };

  const isSearching = isResolving;
  const showNotFound =
    normalizedQuery.length >= 1 && !isSearching && suggestions.length === 0 && lookupError === null;

  return (
    <View>
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={(value) => {
            onChangeQuery(value);
            setLookupError(null);
          }}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          style={styles.searchInput}
          autoCapitalize="words"
          editable={!disabled}
          onSubmitEditing={trySelectExactMatch}
          onFocus={onInputFocus}
        />
        {isSearching ? <ActivityIndicator size="small" color={Colors.accent} /> : null}
      </View>

      {lookupError ? <AppText style={styles.errorText}>{lookupError}</AppText> : null}

      {normalizedQuery.length >= 1 && isSearching ? (
        <AppText style={styles.loadingText}>Cerco città…</AppText>
      ) : null}

      {showNotFound ? <AppText style={styles.errorText}>Comune non trovato</AppText> : null}

      {suggestions.length > 0 ? (
        <View style={[styles.listWrap, suggestions.length > 6 && styles.listScroll]}>
          {suggestions.map((item) => (
            <CitySuggestionRow
              key={item.id}
              item={item}
              query={normalizedQuery}
              onSelect={selectCity}
              disabled={disabled}
            />
          ))}
        </View>
      ) : null}

      {showSelectedChips && cities.length > 0 ? (
        <View style={styles.selectedWrap}>
          {cities.map((city) => (
            <Pressable
              key={city}
              style={styles.selectedChip}
              onPress={() => onRemoveCity(city)}
              disabled={disabled}
            >
              <AppText style={styles.selectedText}>{city}</AppText>
              <Ionicons name="close" size={14} color={Colors.navy} />
            </Pressable>
          ))}
        </View>
      ) : null}

      {hint ? <AppText style={styles.hint}>{hint}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.navy,
    padding: 0,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 10,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
    marginBottom: 10,
  },
  listWrap: {
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    marginBottom: 12,
  },
  listScroll: {
    maxHeight: 280,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  suggestionRowPressed: {
    backgroundColor: Colors.background,
  },
  suggestionCopy: {
    flex: 1,
    gap: 2,
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.navy,
  },
  suggestionNameMatch: {
    fontWeight: '800',
    color: Colors.success,
  },
  suggestionMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  selectedWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    minHeight: 44,
    marginBottom: 12,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Design.radius.full,
    backgroundColor: Colors.successSoft,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  selectedText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.navy,
  },
  hint: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
