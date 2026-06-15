import { VerificationDocumentType } from '@/services/professionalVerificationService';

export type ScannerFrameMode = 'card' | 'passport' | 'selfie';

export type DocumentScanSlot = 'front' | 'back' | 'selfie';

export interface DocumentScanStep {
  slot: DocumentScanSlot;
  label: string;
  mode: ScannerFrameMode;
  guideText: string;
}

/** Proporzioni cornice (larghezza % schermo, aspect ratio w/h). */
export const SCANNER_FRAME = {
  card: { widthPercent: 0.88, aspectRatio: 1.586 },
  passport: { widthPercent: 0.82, aspectRatio: 0.72 },
  selfie: { widthPercent: 0.62, aspectRatio: 0.78, oval: true },
} as const;

export function getDocumentScanSteps(docType: VerificationDocumentType): DocumentScanStep[] {
  if (docType === 'passport') {
    return [
      {
        slot: 'front',
        label: 'Documento',
        mode: 'passport',
        guideText: 'Posiziona il passaporto aperto dentro il riquadro',
      },
      {
        slot: 'selfie',
        label: 'Selfie',
        mode: 'selfie',
        guideText: 'Guarda la fotocamera e resta fermo',
      },
    ];
  }

  const docLabel = docType === 'driving_license' ? 'patente' : "carta d'identità";

  return [
    {
      slot: 'front',
      label: 'Fronte',
      mode: 'card',
      guideText: `Posiziona il fronte della ${docLabel} dentro il riquadro`,
    },
    {
      slot: 'back',
      label: 'Retro',
      mode: 'card',
      guideText: `Posiziona il retro della ${docLabel} dentro il riquadro`,
    },
    {
      slot: 'selfie',
      label: 'Selfie',
      mode: 'selfie',
      guideText: 'Guarda la fotocamera e resta fermo',
    },
  ];
}

export function getScannerStepTitle(step: DocumentScanStep): string {
  if (step.mode === 'selfie') return 'Selfie di verifica';
  if (step.slot === 'front' && step.mode === 'passport') return 'Passaporto';
  return `Documento — ${step.label}`;
}
