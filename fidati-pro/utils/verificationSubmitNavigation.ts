import type { Router } from 'expo-router';

/** Dopo il salvataggio di uno step, prova l'invio automatico della verifica. */
export function navigateToVerificationSubmit(router: Router): void {
  router.replace('/profile/verification-submit');
}
