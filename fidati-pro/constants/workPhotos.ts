export const WORK_PHOTO_TITLE_EXAMPLES = [
  'Impianto elettrico completo',
  'Potatura ulivi',
  'Ristrutturazione bagno',
  'Installazione climatizzatore',
  'Riparazione caldaia',
  'Tinteggiatura interni',
] as const;

export function workPhotoTitlePlaceholder(index: number): string {
  return WORK_PHOTO_TITLE_EXAMPLES[index % WORK_PHOTO_TITLE_EXAMPLES.length];
}
