import { useEffect, useState } from 'react';

export function useCountdown(deadline: number | null) {
  const [remainingMs, setRemainingMs] = useState(() =>
    deadline ? Math.max(0, deadline - Date.now()) : 0,
  );

  useEffect(() => {
    if (!deadline) {
      setRemainingMs(0);
      return;
    }

    const tick = () => {
      setRemainingMs(Math.max(0, deadline - Date.now()));
    };

    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [deadline]);

  return remainingMs;
}

export function formatCountdown(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
