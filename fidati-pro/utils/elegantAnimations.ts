import { Easing, FadeIn, FadeOut, withTiming, type EntryAnimationsValues } from 'react-native-reanimated';

const ELEGANT_EASING = Easing.out(Easing.cubic);

export const elegantFadeIn = FadeIn.duration(200).easing(ELEGANT_EASING);

export const elegantFadeOut = FadeOut.duration(180).easing(Easing.in(Easing.cubic));

export function elegantZoomIn(duration = 220) {
  return (targetValues: EntryAnimationsValues) => {
    'worklet';
    return {
      initialValues: {
        opacity: 0,
        transform: [{ scale: 0.96 }],
      },
      animations: {
        opacity: withTiming(1, { duration, easing: ELEGANT_EASING }),
        transform: [{ scale: withTiming(1, { duration, easing: ELEGANT_EASING }) }],
      },
    };
  };
}
