import { StyleSheet, View } from 'react-native';

import { AuthLoadingScreen } from '@/components/auth/AuthLoadingScreen';
import { ProfessionalLoadErrorScreen } from '@/components/auth/ProfessionalLoadErrorScreen';
import { ProfessionalNotFoundScreen } from '@/components/auth/ProfessionalNotFoundScreen';
import { useAuth } from '@/contexts/AuthContext';
import { useMyProfessional } from '@/contexts/MyProfessionalContext';

/** Overlay sopra lo stack autenticato finché il profilo non è risolto. */
export function ProfessionalGate() {
  const { signOut } = useAuth();
  const { status, error, refresh } = useMyProfessional();

  if (status === 'ready') {
    return null;
  }

  let content = null;

  if (status === 'idle' || status === 'loading') {
    content = <AuthLoadingScreen caption="Caricamento profilo professionista…" />;
  } else if (status === 'not_found') {
    content = <ProfessionalNotFoundScreen onRetry={refresh} onSignOut={signOut} />;
  } else if (status === 'error') {
    content = (
      <ProfessionalLoadErrorScreen
        message={error}
        onRetry={refresh}
        onSignOut={signOut}
      />
    );
  }

  if (!content) {
    return null;
  }

  return <View style={styles.overlay}>{content}</View>;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: 100,
  },
});
