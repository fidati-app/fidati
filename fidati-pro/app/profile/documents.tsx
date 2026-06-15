import { Ionicons } from '@expo/vector-icons';

import { Image } from 'expo-image';

import { useRouter } from 'expo-router';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';



import { DocumentScannerModal } from '@/components/profile/DocumentScannerModal';

import { ProfileCompletionShell } from '@/components/profile/ProfileCompletionShell';

import { AppText } from '@/components/AppText';

import { PrimaryButton } from '@/components/PrimaryButton';

import { RevealContinueFooter } from '@/components/shared/RevealContinueFooter';

import {

  DocumentScanStep,

  getDocumentScanSteps,

  getScannerStepTitle,

} from '@/constants/documentScanner';

import { Colors } from '@/constants/colors';

import { Design } from '@/constants/design';

import { useMyProfessionalProfile } from '@/hooks/useMyProfessionalProfile';

import { useRevealContinue } from '@/hooks/useRevealContinue';

import {

  fetchVerificationDocument,

  isVerificationDocumentComplete,

  uploadVerificationImage,

  upsertVerificationDocument,

  VerificationDocumentType,

} from '@/services/professionalVerificationService';
import { getNextVerificationRoute } from '@/constants/profileVerificationFlow';
import { markVerificationStepContinued } from '@/services/verificationProgressStorage';



const DOC_TYPES: { id: VerificationDocumentType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [

  { id: 'id_card', label: "Carta d'identità", icon: 'card-outline' },

  { id: 'driving_license', label: 'Patente italiana', icon: 'car-outline' },

  { id: 'passport', label: 'Passaporto', icon: 'airplane-outline' },

];



type SlotKey = 'front' | 'back' | 'selfie';



function StepProgressRow({

  steps,

  completedSlots,

  currentSlot,

}: {

  steps: DocumentScanStep[];

  completedSlots: Set<SlotKey>;

  currentSlot: SlotKey | null;

}) {

  return (

    <View style={styles.progressRow}>

      {steps.map((step, index) => {

        const done = completedSlots.has(step.slot);

        const active = currentSlot === step.slot;

        return (

          <View key={step.slot} style={styles.progressItem}>

            <View

              style={[

                styles.progressDot,

                done && styles.progressDotDone,

                active && styles.progressDotActive,

              ]}

            >

              {done ? (

                <Ionicons name="checkmark" size={14} color={Colors.white} />

              ) : (

                <AppText style={styles.progressDotText}>{index + 1}</AppText>

              )}

            </View>

            <AppText style={[styles.progressLabel, done && styles.progressLabelDone]}>{step.label}</AppText>

            {index < steps.length - 1 ? <View style={styles.progressLine} /> : null}

          </View>

        );

      })}

    </View>

  );

}



export default function ProfileDocumentsScreen() {

  const router = useRouter();

  const { profileId, refresh } = useMyProfessionalProfile();

  const [docType, setDocType] = useState<VerificationDocumentType>('id_card');

  const [frontUri, setFrontUri] = useState<string | null>(null);

  const [backUri, setBackUri] = useState<string | null>(null);

  const [selfieUri, setSelfieUri] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [uploadingSlot, setUploadingSlot] = useState<SlotKey | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [scannerOpen, setScannerOpen] = useState(false);

  const [activeScanStep, setActiveScanStep] = useState<DocumentScanStep | null>(null);

  const { revealed, reveal } = useRevealContinue();



  const scanSteps = useMemo(() => getDocumentScanSteps(docType), [docType]);



  const completedSlots = useMemo(() => {

    const set = new Set<SlotKey>();

    if (frontUri) set.add('front');

    if (backUri) set.add('back');

    if (selfieUri) set.add('selfie');

    return set;

  }, [frontUri, backUri, selfieUri]);



  const nextScanStep = useMemo(

    () => scanSteps.find((step) => !completedSlots.has(step.slot)) ?? null,

    [scanSteps, completedSlots],

  );



  const isComplete = useMemo(() => {

    if (!profileId) return false;

    return isVerificationDocumentComplete({

      id: '',

      professionalId: profileId,

      documentType: docType,

      frontImageUrl: frontUri,

      backImageUrl: backUri,

      selfieImageUrl: selfieUri,

      status: 'uploaded',

    });

  }, [profileId, docType, frontUri, backUri, selfieUri]);



  useEffect(() => {

    if (isComplete) {

      reveal();

    }

  }, [isComplete, reveal]);



  const loadDoc = useCallback(async () => {

    if (!profileId) return;

    setIsLoading(true);

    try {

      const doc = await fetchVerificationDocument(profileId);

      if (doc) {

        setDocType(doc.documentType);

        setFrontUri(doc.frontImageUrl);

        setBackUri(doc.backImageUrl);

        setSelfieUri(doc.selfieImageUrl);

      }

    } catch (err) {

      setError(err instanceof Error ? err.message : 'Errore caricamento documenti.');

    } finally {

      setIsLoading(false);

    }

  }, [profileId]);



  useEffect(() => {

    void loadDoc();

  }, [loadDoc]);



  if (!profileId) return null;



  const needsBack = docType !== 'passport';



  const openScanner = (step: DocumentScanStep) => {

    setError(null);

    setActiveScanStep(step);

    setScannerOpen(true);

  };



  const applySlotUri = (slot: SlotKey, uri: string | null) => {

    if (slot === 'front') setFrontUri(uri);

    if (slot === 'back') setBackUri(uri);

    if (slot === 'selfie') setSelfieUri(uri);

  };



  const handleScanConfirm = async (localUri: string) => {

    if (!activeScanStep) return;



    const slot = activeScanStep.slot;

    setScannerOpen(false);

    setActiveScanStep(null);

    setUploadingSlot(slot);

    setError(null);



    try {

      const publicUrl = await uploadVerificationImage(profileId, slot, localUri);



      const nextFront = slot === 'front' ? publicUrl : frontUri;

      const nextBack = slot === 'back' ? publicUrl : backUri;

      const nextSelfie = slot === 'selfie' ? publicUrl : selfieUri;



      applySlotUri(slot, publicUrl);



      await upsertVerificationDocument(profileId, docType, {

        frontImageUrl: nextFront,

        backImageUrl: needsBack ? nextBack : null,

        selfieImageUrl: nextSelfie,

      });



      const updatedCompleted = new Set(completedSlots);
      updatedCompleted.add(slot);
      const nextAfter = scanSteps.find((s) => !updatedCompleted.has(s.slot));

      if (nextAfter) {
        setTimeout(() => openScanner(nextAfter), 400);
      } else {
        reveal();
      }

    } catch (err) {

      setError(err instanceof Error ? err.message : 'Impossibile caricare l’immagine.');

    } finally {

      setUploadingSlot(null);

    }

  };



  const handleSave = async () => {

    if (!isComplete) {

      setError('Completa tutte le scansioni prima di continuare.');

      return;

    }



    setIsSaving(true);

    setError(null);



    try {

      await upsertVerificationDocument(profileId, docType, {

        frontImageUrl: frontUri,

        backImageUrl: needsBack ? backUri : null,

        selfieImageUrl: selfieUri,

      });

      await refresh();

      await markVerificationStepContinued(profileId, 'documents');

      const next = getNextVerificationRoute('/profile/documents');
      router.replace((next ?? '/(tabs)') as '/profile/portfolio');

    } catch (err) {

      setError(err instanceof Error ? err.message : 'Impossibile salvare i documenti.');

    } finally {

      setIsSaving(false);

    }

  };



  const handleDocTypeChange = (type: VerificationDocumentType) => {

    setDocType(type);

    if (type === 'passport') {

      setBackUri(null);

    }

  };



  return (

    <>

      <ProfileCompletionShell

        stepNumber={2}

        title="Adesso proteggiamo la tua identità 🪪"

        subtitle="Scansiona documento e selfie con la fotocamera guidata. Solo Fidati potrà vederli."

        footerRevealed={revealed}

        footer={

          <RevealContinueFooter

            visible={revealed}

            title={isSaving ? 'Salvataggio…' : 'Salva e continua'}

            onPress={() => void handleSave()}

            disabled={isSaving || !isComplete || Boolean(uploadingSlot)}

            loading={isSaving}

          />

        }

      >

        <ScrollView showsVerticalScrollIndicator={false}>

          {isLoading ? (

            <ActivityIndicator color={Colors.navy} style={styles.loader} />

          ) : (

            <>

              <AppText style={styles.sectionTitle}>Tipo documento</AppText>

              <View style={styles.typeRow}>

                {DOC_TYPES.map((type) => {

                  const active = docType === type.id;

                  return (

                    <Pressable

                      key={type.id}

                      style={[styles.typeCard, active && styles.typeCardActive]}

                      onPress={() => handleDocTypeChange(type.id)}

                      disabled={Boolean(uploadingSlot)}

                    >

                      <Ionicons name={type.icon} size={20} color={active ? Colors.navy : Colors.textMuted} />

                      <AppText style={[styles.typeLabel, active && styles.typeLabelActive]}>{type.label}</AppText>

                    </Pressable>

                  );

                })}

              </View>



              <StepProgressRow

                steps={scanSteps}

                completedSlots={completedSlots}

                currentSlot={nextScanStep?.slot ?? null}

              />



              <View style={styles.thumbs}>

                {scanSteps.map((step) => {

                  const uri =

                    step.slot === 'front' ? frontUri : step.slot === 'back' ? backUri : selfieUri;

                  const loading = uploadingSlot === step.slot;

                  return (

                    <Pressable

                      key={step.slot}

                      style={styles.thumb}

                      onPress={() => openScanner(step)}

                      disabled={Boolean(uploadingSlot)}

                    >

                      {uri ? (

                        <Image source={{ uri }} style={styles.thumbImage} contentFit="cover" />

                      ) : (

                        <View style={styles.thumbEmpty}>

                          <Ionicons name="scan-outline" size={22} color={Colors.textMuted} />

                        </View>

                      )}

                      <AppText style={styles.thumbLabel}>{step.label}</AppText>

                      {loading ? (

                        <ActivityIndicator size="small" color={Colors.navy} style={styles.thumbLoader} />

                      ) : uri ? (

                        <Ionicons name="checkmark-circle" size={18} color={Colors.success} style={styles.thumbCheck} />

                      ) : null}

                    </Pressable>

                  );

                })}

              </View>



              {nextScanStep ? (

                <PrimaryButton

                  title={

                    uploadingSlot

                      ? 'Caricamento…'

                      : `Scansiona ${nextScanStep.label.toLowerCase()}`

                  }

                  onPress={() => openScanner(nextScanStep)}

                  disabled={Boolean(uploadingSlot) || isSaving}

                  style={styles.scanBtn}

                />

              ) : null}



              {uploadingSlot ? (

                <AppText style={styles.uploadHint}>Salvataggio su Fidati in corso…</AppText>

              ) : null}

              {error ? <AppText style={styles.error}>{error}</AppText> : null}

            </>

          )}

        </ScrollView>

      </ProfileCompletionShell>



      {activeScanStep ? (

        <DocumentScannerModal

          visible={scannerOpen}

          title={getScannerStepTitle(activeScanStep)}

          guideText={activeScanStep.guideText}

          mode={activeScanStep.mode}

          onClose={() => {

            setScannerOpen(false);

            setActiveScanStep(null);

          }}

          onConfirm={(uri) => void handleScanConfirm(uri)}

        />

      ) : null}

    </>

  );

}



const styles = StyleSheet.create({

  loader: { marginVertical: 24 },

  sectionTitle: {

    fontSize: 14,

    fontWeight: '800',

    color: Colors.navy,

    marginBottom: 10,

  },

  typeRow: { gap: 8, marginBottom: 18 },

  typeCard: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 10,

    padding: 14,

    borderRadius: Design.radius.lg,

    borderWidth: 1.5,

    borderColor: Colors.border,

    backgroundColor: Colors.white,

  },

  typeCardActive: {

    borderColor: Colors.success,

    backgroundColor: Colors.successSoft,

  },

  typeLabel: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },

  typeLabelActive: { color: Colors.navy, fontWeight: '800' },

  progressRow: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginBottom: 18,

    paddingHorizontal: 4,

  },

  progressItem: {

    flex: 1,

    alignItems: 'center',

    position: 'relative',

  },

  progressDot: {

    width: 28,

    height: 28,

    borderRadius: 14,

    borderWidth: 2,

    borderColor: Colors.border,

    backgroundColor: Colors.white,

    alignItems: 'center',

    justifyContent: 'center',

  },

  progressDotDone: {

    backgroundColor: Colors.success,

    borderColor: Colors.success,

  },

  progressDotActive: {

    borderColor: Colors.success,

  },

  progressDotText: {

    fontSize: 12,

    fontWeight: '800',

    color: Colors.textMuted,

  },

  progressLabel: {

    fontSize: 10,

    fontWeight: '600',

    color: Colors.textMuted,

    marginTop: 4,

  },

  progressLabelDone: {

    color: Colors.navy,

  },

  progressLine: {

    position: 'absolute',

    top: 14,

    right: -20,

    width: 40,

    height: 2,

    backgroundColor: Colors.borderLight,

  },

  thumbs: {

    flexDirection: 'row',

    gap: 10,

    marginBottom: 8,

  },

  thumb: {

    flex: 1,

    alignItems: 'center',

    gap: 6,

    padding: 10,

    borderRadius: Design.radius.lg,

    borderWidth: 1,

    borderColor: Colors.border,

    backgroundColor: Colors.white,

    minHeight: 100,

  },

  thumbImage: {

    width: '100%',

    aspectRatio: 1.2,

    borderRadius: Design.radius.md,

  },

  thumbEmpty: {

    width: '100%',

    aspectRatio: 1.2,

    borderRadius: Design.radius.md,

    backgroundColor: Colors.background,

    alignItems: 'center',

    justifyContent: 'center',

    borderWidth: 1.5,

    borderColor: Colors.border,

    borderStyle: 'dashed',

  },

  thumbLabel: {

    fontSize: 11,

    fontWeight: '700',

    color: Colors.navy,

  },

  thumbLoader: {

    position: 'absolute',

    top: 36,

  },

  thumbCheck: {

    position: 'absolute',

    top: 8,

    right: 8,

  },

  uploadHint: {

    marginTop: 12,

    fontSize: 13,

    color: Colors.textSecondary,

  },

  error: {

    marginTop: 12,

    fontSize: 13,

    fontWeight: '600',

    color: Colors.error,

  },

  scanBtn: {

    marginTop: 16,

  },

});

