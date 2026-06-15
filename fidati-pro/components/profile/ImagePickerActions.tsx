import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface ImagePickerActionsProps {
  onPick: (uri: string) => void;
  disabled?: boolean;
}

async function pickImage(source: 'camera' | 'library'): Promise<string | null> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error('Permesso negato. Abilita fotocamera o galleria nelle impostazioni.');
  }

  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
        });

  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  return result.assets[0].uri;
}

export function ImagePickerActions({ onPick, disabled }: ImagePickerActionsProps) {
  const handlePick = async (source: 'camera' | 'library') => {
    if (disabled) return;
    try {
      const uri = await pickImage(source);
      if (uri) onPick(uri);
    } catch (err) {
      throw err;
    }
  };

  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.btn, disabled && styles.btnDisabled]}
        onPress={() => void handlePick('camera')}
        disabled={disabled}
      >
        <Ionicons name="camera-outline" size={22} color={Colors.navy} />
        <AppText style={styles.btnText}>Scatta foto</AppText>
      </Pressable>
      <Pressable
        style={[styles.btn, disabled && styles.btnDisabled]}
        onPress={() => void handlePick('library')}
        disabled={disabled}
      >
        <Ionicons name="images-outline" size={22} color={Colors.navy} />
        <AppText style={styles.btnText}>Scegli dalla galleria</AppText>
      </Pressable>
    </View>
  );
}

export async function pickImageFromLibrary(aspect: [number, number] = [4, 3]): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Permesso galleria negato.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect,
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]?.uri) return null;
  return result.assets[0].uri;
}

export async function pickMultipleImagesFromLibrary(maxCount: number): Promise<string[]> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Permesso galleria negato.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: maxCount,
    quality: 0.85,
  });

  if (result.canceled || !result.assets?.length) return [];
  return result.assets.map((asset) => asset.uri).filter(Boolean);
}

export async function pickImageFromCamera(aspect: [number, number] = [4, 3]): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Permesso fotocamera negato.');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect,
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]?.uri) return null;
  return result.assets[0].uri;
}

const styles = StyleSheet.create({
  row: {
    gap: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: Design.radius.lg,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Design.shadowSoft,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.navy,
  },
});
