export const HUMAN_LOADING_MESSAGES = [
  'Stiamo preparando il tuo spazio professionale...',
  'Quasi fatto...',
  'Organizziamo i tuoi dati...',
  'Ancora qualche secondo...',
  'Perfetto, ci siamo quasi...',
  'Prepariamo tutto per iniziare...',
] as const;

export const ONBOARDING_CONTINUE_LABEL = 'Perfetto, continuiamo →';

export type OnboardingPhase =
  | 'intro'
  | 'account'
  | 'step1'
  | 'step2'
  | 'step3'
  | 'step4'
  | 'submitting'
  | 'complete'
  | 'email-confirmation';

/** Fasi profilo contate nella barra di progresso (esclusi intro, account, complete). */
export const ONBOARDING_PROFILE_PHASES: OnboardingPhase[] = ['step1', 'step2', 'step3', 'step4'];

export function getOnboardingProgress(phase: OnboardingPhase): number {
  if (phase === 'intro' || phase === 'account') return 0;
  if (phase === 'complete' || phase === 'email-confirmation' || phase === 'submitting') return 1;
  const index = ONBOARDING_PROFILE_PHASES.indexOf(phase);
  if (index < 0) return 0;
  return (index + 1) / ONBOARDING_PROFILE_PHASES.length;
}
