import { useCallback, useRef, useState } from 'react';

/** Mostra il CTA "Continua" una sola volta; resta visibile anche se la tastiera si chiude. */
export function useRevealContinue() {
  const [revealed, setRevealed] = useState(false);
  const latchedRef = useRef(false);

  const reveal = useCallback(() => {
    if (latchedRef.current) return;
    latchedRef.current = true;
    setRevealed(true);
  }, []);

  return { revealed, reveal };
}
