import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import {
  INITIAL_COMPLETED_STEPS,
  PROFILE_STEP_TOTAL,
  ProfileStepId,
} from '@/constants/profileSteps';

interface ProfileProgressContextValue {
  completedSteps: ProfileStepId[];
  completedCount: number;
  totalSteps: number;
  percent: number;
  stepsLeft: number;
  isStepCompleted: (id: ProfileStepId) => boolean;
  completeStep: (id: ProfileStepId) => void;
}

const ProfileProgressContext = createContext<ProfileProgressContextValue | null>(null);

export function ProfileProgressProvider({ children }: { children: ReactNode }) {
  const [completedSteps, setCompletedSteps] = useState<ProfileStepId[]>(INITIAL_COMPLETED_STEPS);

  const completeStep = useCallback((id: ProfileStepId) => {
    setCompletedSteps((current) => (current.includes(id) ? current : [...current, id]));
  }, []);

  const value = useMemo(() => {
    const completedCount = completedSteps.length;
    const stepsLeft = Math.max(0, PROFILE_STEP_TOTAL - completedCount);
    const percent = Math.round((completedCount / PROFILE_STEP_TOTAL) * 100);

    return {
      completedSteps,
      completedCount,
      totalSteps: PROFILE_STEP_TOTAL,
      percent,
      stepsLeft,
      isStepCompleted: (id: ProfileStepId) => completedSteps.includes(id),
      completeStep,
    };
  }, [completedSteps, completeStep]);

  return (
    <ProfileProgressContext.Provider value={value}>{children}</ProfileProgressContext.Provider>
  );
}

export function useProfileProgress() {
  const context = useContext(ProfileProgressContext);
  if (!context) {
    throw new Error('useProfileProgress must be used within ProfileProgressProvider');
  }
  return context;
}
