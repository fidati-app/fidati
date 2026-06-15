import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SCANNER_FRAME, ScannerFrameMode } from '@/constants/documentScanner';
import { Colors } from '@/constants/colors';

type AlignmentPhase = 'waiting' | 'aligning' | 'ready' | 'countdown' | 'capturing';
type ScannerPhase = 'camera' | 'preview';

interface DocumentScannerModalProps {
  visible: boolean;
  title: string;
  guideText: string;
  mode: ScannerFrameMode;
  onClose: () => void;
  onConfirm: (uri: string) => void;
}

const ALIGNMENT_DELAY_MS = 1500;
const READY_STABLE_MS = 1000;
const COUNTDOWN_START = 3;

function frameBorderColor(phase: AlignmentPhase): string {
  switch (phase) {
    case 'waiting':
      return 'rgba(255, 255, 255, 0.55)';
    case 'aligning':
      return '#F97316';
    case 'ready':
    case 'countdown':
    case 'capturing':
      return Colors.success;
    default:
      return 'rgba(255, 255, 255, 0.55)';
  }
}

export function DocumentScannerModal({
  visible,
  title,
  guideText,
  mode,
  onClose,
  onConfirm,
}: DocumentScannerModalProps) {
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [scannerPhase, setScannerPhase] = useState<ScannerPhase>('camera');
  const [alignmentPhase, setAlignmentPhase] = useState<AlignmentPhase>('waiting');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const captureLockRef = useRef(false);

  const frameConfig = SCANNER_FRAME[mode];
  const frameW = screenW * frameConfig.widthPercent;
  const frameH = frameW / frameConfig.aspectRatio;
  const frameLeft = (screenW - frameW) / 2;
  const frameTop = (screenH - frameH) / 2 - 40;

  const borderColor = frameBorderColor(alignmentPhase);
  const isSelfie = mode === 'selfie';

  const resetScanner = useCallback(() => {
    captureLockRef.current = false;
    setScannerPhase('camera');
    setAlignmentPhase('waiting');
    setCountdown(null);
    setPreviewUri(null);
    setCameraReady(false);
  }, []);

  useEffect(() => {
    if (!visible) {
      resetScanner();
      return;
    }
    void requestPermission();
  }, [visible, requestPermission, resetScanner]);

  useEffect(() => {
    if (!visible || !cameraReady || scannerPhase !== 'camera') return;

    setAlignmentPhase('waiting');
    const t1 = setTimeout(() => setAlignmentPhase('aligning'), ALIGNMENT_DELAY_MS);
    const t2 = setTimeout(() => setAlignmentPhase('ready'), ALIGNMENT_DELAY_MS + 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [visible, cameraReady, scannerPhase, mode]);

  const capturePhoto = useCallback(async () => {
    if (captureLockRef.current || !cameraRef.current) return;
    captureLockRef.current = true;
    setAlignmentPhase('capturing');

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.88,
        skipProcessing: false,
      });

      if (photo?.uri) {
        setPreviewUri(photo.uri);
        setScannerPhase('preview');
      } else {
        captureLockRef.current = false;
        setAlignmentPhase('ready');
      }
    } catch {
      captureLockRef.current = false;
      setAlignmentPhase('ready');
    }
  }, []);

  useEffect(() => {
    if (alignmentPhase !== 'ready' || scannerPhase !== 'camera' || !cameraReady) return;

    const stableTimer = setTimeout(() => {
      setAlignmentPhase('countdown');
      setCountdown(COUNTDOWN_START);
    }, READY_STABLE_MS);

    return () => clearTimeout(stableTimer);
  }, [alignmentPhase, scannerPhase, cameraReady]);

  useEffect(() => {
    if (alignmentPhase !== 'countdown' || countdown === null) return;

    if (countdown <= 0) {
      void capturePhoto();
      return;
    }

    const tick = setTimeout(() => setCountdown((value) => (value !== null ? value - 1 : null)), 1000);
    return () => clearTimeout(tick);
  }, [alignmentPhase, countdown, capturePhoto]);

  const statusHint = useMemo(() => {
    if (scannerPhase === 'preview') return '';
    if (alignmentPhase === 'waiting') return 'Inquadra il documento…';
    if (alignmentPhase === 'aligning') return 'Avvicina o allontana per centrare';
    if (alignmentPhase === 'ready') return 'Perfetto! Resta fermo…';
    if (alignmentPhase === 'countdown' && countdown !== null && countdown > 0) {
      return `Scatto tra ${countdown}…`;
    }
    if (alignmentPhase === 'capturing') return 'Scatto in corso…';
    return guideText;
  }, [alignmentPhase, countdown, guideText, scannerPhase]);

  const handleRetake = () => {
    resetScanner();
  };

  const handleUsePhoto = () => {
    if (previewUri) {
      onConfirm(previewUri);
      resetScanner();
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        {permission?.granted ? (
          scannerPhase === 'camera' ? (
            <>
              <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing={isSelfie ? 'front' : 'back'}
                onCameraReady={() => setCameraReady(true)}
              />

              {/* Overlay scuro attorno alla cornice */}
              <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <View style={[styles.overlay, { height: Math.max(0, frameTop) }]} />
                <View style={{ flexDirection: 'row', height: frameH }}>
                  <View style={[styles.overlay, { width: frameLeft }]} />
                  <View
                    style={[
                      styles.frame,
                      {
                        width: frameW,
                        height: frameH,
                        borderColor,
                        borderRadius: 'oval' in frameConfig && frameConfig.oval ? frameH / 2 : 14,
                      },
                    ]}
                  />
                  <View style={[styles.overlay, { flex: 1 }]} />
                </View>
                <View style={[styles.overlay, { flex: 1 }]} />
              </View>

              {/* Header */}
              <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
                  <Ionicons name="close" size={22} color={Colors.white} />
                </Pressable>
                <View style={styles.headerCopy}>
                  <AppText style={styles.headerTitle}>{title}</AppText>
                  <AppText style={styles.headerSub}>{guideText}</AppText>
                </View>
              </View>

              {/* Countdown grande */}
              {alignmentPhase === 'countdown' && countdown !== null && countdown > 0 ? (
                <View style={styles.countdownWrap} pointerEvents="none">
                  <AppText style={styles.countdownText}>{countdown}</AppText>
                </View>
              ) : null}

              {/* Footer controlli */}
              <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
                <AppText style={styles.statusHint}>{statusHint}</AppText>
                <View style={styles.footerRow}>
                  <PrimaryButton
                    title="Scatta manualmente"
                    variant="outline"
                    onPress={() => void capturePhoto()}
                    style={styles.manualBtn}
                  />
                </View>
                <AppText style={styles.simHint}>
                  Allineamento simulato — posiziona il documento nel riquadro verde
                </AppText>
              </View>
            </>
          ) : (
            <>
              {previewUri ? (
                <Image source={{ uri: previewUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
              ) : null}
              <View style={[styles.previewHeader, { paddingTop: insets.top + 12 }]}>
                <AppText style={styles.previewTitle}>Anteprima</AppText>
                <AppText style={styles.previewSub}>La foto è nitida e leggibile?</AppText>
              </View>
              <View style={[styles.previewFooter, { paddingBottom: insets.bottom + 16 }]}>
                <View style={styles.previewActions}>
                  <PrimaryButton title="Rifai" variant="outline" onPress={handleRetake} style={styles.previewBtn} />
                  <PrimaryButton title="Usa questa foto" onPress={handleUsePhoto} style={styles.previewBtn} />
                </View>
              </View>
            </>
          )
        ) : (
          <View style={[styles.permissionScreen, { paddingTop: insets.top + 24 }]}>
            <Ionicons name="camera-outline" size={48} color={Colors.navy} />
            <AppText style={styles.permissionTitle}>Serve la fotocamera</AppText>
            <AppText style={styles.permissionSub}>
              Per scansionare documento e selfie dobbiamo usare la fotocamera del dispositivo.
            </AppText>
            <PrimaryButton title="Consenti fotocamera" onPress={() => void requestPermission()} />
            <PrimaryButton title="Annulla" variant="outline" onPress={onClose} style={styles.permissionCancel} />
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  frame: {
    borderWidth: 3,
    backgroundColor: 'transparent',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    gap: 4,
    paddingTop: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
  },
  headerSub: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.85)',
  },
  countdownWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontSize: 96,
    fontWeight: '900',
    color: Colors.white,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    gap: 10,
    alignItems: 'center',
  },
  statusHint: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
  },
  footerRow: {
    width: '100%',
  },
  manualBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.35)',
  },
  simHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
  },
  previewHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingBottom: 16,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
  },
  previewSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  previewFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingTop: 16,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 10,
  },
  previewBtn: {
    flex: 1,
    minHeight: 48,
  },
  permissionScreen: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    paddingHorizontal: 28,
    gap: 12,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.navy,
    marginTop: 8,
  },
  permissionSub: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  permissionCancel: {
    marginTop: 4,
    alignSelf: 'stretch',
  },
});
