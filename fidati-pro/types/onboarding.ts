export type OnboardingAccountKind = 'individual' | 'company';

export interface SelectedOnboardingService {
  title: string;
  serviceSlug: string;
  isCustom: boolean;
}

export interface ServicePriceDraft {
  title: string;
  minRaw: string;
  maxRaw: string;
  quoteRequired: boolean;
}
