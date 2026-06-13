import { Ionicons } from '@expo/vector-icons';

import { StyleSheet, View } from 'react-native';



import { AppText } from '@/components/AppText';

import { PrimaryButton } from '@/components/PrimaryButton';

import { Colors } from '@/constants/colors';

import { useServiceZone } from '@/context/ServiceZoneContext';



type HomeZoneEmptyVariant = 'no-city' | 'no-pros';



interface HomeZoneEmptyStateProps {

  variant?: HomeZoneEmptyVariant;

  onChangeZone?: () => void;

}



export function HomeZoneEmptyState({

  variant = 'no-pros',

  onChangeZone,

}: HomeZoneEmptyStateProps) {

  const { selectedCity, openCityPicker, openChangeZone } = useServiceZone();



  const isNoCity = variant === 'no-city';

  const cityLabel = selectedCity?.trim() || 'questa zona';



  const handlePress = onChangeZone ?? (isNoCity ? () => openCityPicker() : () => openChangeZone());



  return (

    <View style={styles.wrap}>

      <View style={styles.icon}>

        <Ionicons name="location-outline" size={28} color={Colors.accent} />

      </View>

      {!isNoCity ? (

        <AppText style={styles.title}>Stiamo arrivando anche nella tua città</AppText>

      ) : null}

      <AppText style={styles.message}>

        {isNoCity

          ? 'Seleziona una città per vedere i professionisti disponibili'

          : `Al momento non ci sono professionisti disponibili a ${cityLabel}, ma stiamo lavorando per attivare il servizio anche qui.`}

      </AppText>

      <PrimaryButton

        title={isNoCity ? 'Seleziona città' : 'Cambia zona'}

        onPress={handlePress}

        style={styles.button}

      />

    </View>

  );

}



const styles = StyleSheet.create({

  wrap: {

    alignItems: 'center',

    paddingVertical: 28,

    paddingHorizontal: 20,

    backgroundColor: Colors.card,

    borderRadius: 14,

    borderWidth: 1,

    borderColor: Colors.border,

    marginTop: 18,

    marginBottom: 8,

  },

  icon: {

    width: 56,

    height: 56,

    borderRadius: 28,

    backgroundColor: 'rgba(16, 185, 129, 0.1)',

    alignItems: 'center',

    justifyContent: 'center',

    marginBottom: 12,

  },

  title: {

    fontSize: 16,

    fontWeight: '700',

    color: Colors.primary,

    marginBottom: 6,

    textAlign: 'center',

  },

  message: {

    fontSize: 13,

    color: Colors.textSecondary,

    textAlign: 'center',

    lineHeight: 19,

    marginBottom: 16,

  },

  button: {

    minWidth: 160,

  },

});


