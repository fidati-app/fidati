import { useLocalSearchParams } from 'expo-router';

import { ChangeRequestScreen } from '@/components/change-requests/ChangeRequestScreen';

export default function ChangeRequestPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ChangeRequestScreen notificationId={id ?? ''} />;
}
