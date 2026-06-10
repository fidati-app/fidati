import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { BookingSection } from '@/components/professionals/BookingSection';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

const MAX_PHOTOS = 4;
const PHOTO_SIZE = 68;

interface BookingNoteFieldProps {
  note: string;
  photos: string[];
  onNoteChange: (note: string) => void;
  onPhotosChange: (photos: string[]) => void;
}

export function BookingNoteField({
  note,
  photos,
  onNoteChange,
  onPhotosChange,
}: BookingNoteFieldProps) {
  const canAddMore = photos.length < MAX_PHOTOS;

  const appendPhotos = (uris: string[]) => {
    if (!uris.length) return;
    const remaining = MAX_PHOTOS - photos.length;
    onPhotosChange([...photos, ...uris.slice(0, remaining)]);
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Accesso alle foto',
        'Consenti l\'accesso alla galleria per allegare immagini alla prenotazione.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      appendPhotos(result.assets.map((asset) => asset.uri));
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Accesso alla fotocamera',
        'Consenti l\'accesso alla fotocamera per scattare foto da allegare alla prenotazione.',
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      appendPhotos([result.assets[0].uri]);
    }
  };

  const openPhotoPicker = () => {
    if (!canAddMore) return;

    Alert.alert('Aggiungi foto', 'Scegli come allegare un\'immagine', [
      { text: 'Galleria', onPress: pickFromLibrary },
      { text: 'Fotocamera', onPress: takePhoto },
      { text: 'Annulla', style: 'cancel' },
    ]);
  };

  const removePhoto = (uri: string) => {
    onPhotosChange(photos.filter((item) => item !== uri));
  };

  return (
    <BookingSection title="Dettagli" badge="optional">
      <TextInput
        style={styles.input}
        value={note}
        onChangeText={onNoteChange}
        placeholder="Descrivi il lavoro, es. perdita sotto il lavandino..."
        placeholderTextColor={Colors.textSecondary}
        multiline
        textAlignVertical="top"
        maxLength={500}
      />

      <View style={styles.photosHeader}>
        <View style={styles.photosTitleRow}>
          <Ionicons name="images-outline" size={15} color={Colors.textSecondary} />
          <AppText style={styles.photosTitle}>Foto allegate</AppText>
        </View>
        <AppText style={styles.photosCount}>
          {photos.length}/{MAX_PHOTOS}
        </AppText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.photosRow}
        bounces={false}
      >
        {photos.map((uri) => (
          <View key={uri} style={styles.photoWrap}>
            <Image source={{ uri }} style={styles.photo} contentFit="cover" />
            <Pressable
              onPress={() => removePhoto(uri)}
              hitSlop={6}
              style={({ pressed }) => [styles.removeBtn, pressed && styles.removeBtnPressed]}
            >
              <Ionicons name="close" size={12} color={Colors.white} />
            </Pressable>
          </View>
        ))}

        {canAddMore ? (
          <Pressable
            onPress={openPhotoPicker}
            style={({ pressed }) => [styles.addPhotoBtn, pressed && styles.addPhotoBtnPressed]}
          >
            <Ionicons name="add" size={22} color={Colors.accent} />
          </Pressable>
        ) : null}
      </ScrollView>
    </BookingSection>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 80,
    maxHeight: 120,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: Colors.primary,
    backgroundColor: Colors.background,
    borderRadius: Design.radius.button,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingTop: 11,
    paddingBottom: 11,
  },
  photosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  photosTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  photosTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  photosCount: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  photosRow: {
    gap: 8,
    alignItems: 'center',
  },
  photoWrap: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: Design.radius.button,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(1, 13, 32, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnPressed: {
    opacity: 0.85,
  },
  addPhotoBtn: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: Design.radius.button,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoBtnPressed: {
    opacity: 0.9,
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
    borderColor: Colors.accent,
  },
});
