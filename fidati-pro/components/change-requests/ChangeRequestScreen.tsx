import { Ionicons } from '@expo/vector-icons';

import { useRouter } from 'expo-router';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { ActivityIndicator, StyleSheet, View } from 'react-native';

import Animated, { FadeInDown } from 'react-native-reanimated';



import { AppText } from '@/components/AppText';

import { PrimaryButton } from '@/components/PrimaryButton';

import { ProfilePageShell } from '@/components/profile/ProfilePageShell';

import { DocumentFixFlow } from '@/components/change-requests/DocumentFixFlow';

import { PortfolioFixFlow } from '@/components/change-requests/PortfolioFixFlow';

import { ProfilePhotoFixFlow } from '@/components/change-requests/ProfilePhotoFixFlow';

import { ServicePriceFixFlow } from '@/components/change-requests/ServicePriceFixFlow';

import { ZonesFixFlow } from '@/components/change-requests/ZonesFixFlow';

import { useAdminChangeRequests } from '@/contexts/AdminChangeRequestsContext';

import { useMyProfessionalProfile } from '@/hooks/useMyProfessionalProfile';

import {

  fetchChangeRequestById,

  fetchPendingAdminChangeRequests,

  type AdminChangeRequest,

} from '@/services/professionalInternalNotificationsService';

import {

  flowScreenTitle,

  resolveChangeRequestFlow,

  type ChangeRequestFlowKind,

} from '@/utils/changeRequestRouting';

import { Colors } from '@/constants/colors';

import { Design } from '@/constants/design';



type Props = {

  notificationId: string;

};



const SECTION_ROUTES: Partial<Record<ChangeRequestFlowKind, string>> = {

  availability: '/profile/availability',

  urgent_jobs: '/profile/availability',

  profile_data: '/profile/complete',

};



function isActionableRequest(request: AdminChangeRequest): boolean {

  return request.status !== 'correction_submitted' && request.status !== 'resolved';

}



function GenericFixFlow({

  request,

  readOnly,

  flow,

}: {

  request: AdminChangeRequest;

  readOnly?: boolean;

  flow: ChangeRequestFlowKind;

}) {

  const router = useRouter();

  const route = SECTION_ROUTES[flow] ?? '/profile/complete';

  const fallback = flow === 'generic';



  return (

    <Animated.View entering={FadeInDown.duration(350)} style={styles.generic}>

      <AppText style={styles.lead}>

        {fallback

          ? 'Non riusciamo a riconoscere esattamente cosa sistemare.'

          : request.friendlyReason}

      </AppText>

      <AppText style={styles.hint}>

        {fallback

          ? 'Apri la sezione indicata e completa la modifica richiesta.'

          : request.friendlyHint}

      </AppText>

      {request.adminMessage ? <AppText style={styles.note}>{request.adminMessage}</AppText> : null}

      {readOnly ? (

        <AppText style={styles.review}>La tua correzione è in revisione.</AppText>

      ) : (

        <PrimaryButton title="Vai a sistemare" onPress={() => router.push(route as '/profile/complete')} />

      )}

    </Animated.View>

  );

}



export function ChangeRequestScreen({ notificationId }: Props) {

  const router = useRouter();

  const { profileId, refresh: refreshProfile } = useMyProfessionalProfile();

  const { requests, refresh } = useAdminChangeRequests();

  const [request, setRequest] = useState<AdminChangeRequest | null>(null);

  const [loading, setLoading] = useState(true);



  useEffect(() => {

    if (!profileId) return;

    void fetchChangeRequestById(notificationId, profileId)

      .then(setRequest)

      .finally(() => setLoading(false));

  }, [notificationId, profileId]);



  const readOnly = request?.isInReview ?? false;

  const otherPending = useMemo(

    () => requests.filter((r) => r.id !== notificationId && isActionableRequest(r)).length,

    [notificationId, requests],

  );

  const flow = request ? resolveChangeRequestFlow(request) : 'generic';



  const handleSuccess = useCallback(async () => {

    if (!profileId) return;



    await refresh();

    await refreshProfile();



    const updated = await fetchPendingAdminChangeRequests(profileId);

    const next = updated.find((r) => isActionableRequest(r));



    if (__DEV__) {

      console.log('[CHANGE_REQUEST] success navigation', {

        completed: notificationId,

        remaining: updated.filter((r) => isActionableRequest(r)).length,

        nextId: next?.id ?? null,

      });

    }



    if (next) {

      router.replace({ pathname: '/change-requests/[id]', params: { id: next.id } });

      return;

    }



    router.replace('/(tabs)');

  }, [notificationId, profileId, refresh, refreshProfile, router]);



  if (loading) {

    return (

      <View style={styles.loading}>

        <ActivityIndicator size="large" color={Colors.success} />

      </View>

    );

  }



  if (!request) {

    return (

      <ProfilePageShell title="Ops" subtitle="Non troviamo più questa richiesta">

        <AppText style={styles.missing}>Forse è già stata risolta. Grazie!</AppText>

        <PrimaryButton title="Torna alla Home" onPress={() => router.replace('/(tabs)')} />

      </ProfilePageShell>

    );

  }



  const renderFlow = () => {

    switch (flow) {

      case 'document_front':

      case 'document_back':

      case 'selfie':

        return (

          <DocumentFixFlow

            request={request}

            professionalId={profileId!}

            otherPendingCount={otherPending}

            onSuccess={() => void handleSuccess()}

            readOnly={readOnly}

          />

        );

      case 'portfolio_photo':

        return (

          <PortfolioFixFlow

            request={request}

            professionalId={profileId!}

            otherPendingCount={otherPending}

            onSuccess={() => void handleSuccess()}

            readOnly={readOnly}

          />

        );

      case 'service_price':

        return (

          <ServicePriceFixFlow

            request={request}

            professionalId={profileId!}

            otherPendingCount={otherPending}

            onSuccess={() => void handleSuccess()}

            readOnly={readOnly}

          />

        );

      case 'zones':

        return (

          <ZonesFixFlow

            request={request}

            professionalId={profileId!}

            otherPendingCount={otherPending}

            onSuccess={() => void handleSuccess()}

            readOnly={readOnly}

          />

        );

      case 'profile_photo':

        return (

          <ProfilePhotoFixFlow

            request={request}

            professionalId={profileId!}

            otherPendingCount={otherPending}

            onSuccess={() => void handleSuccess()}

            readOnly={readOnly}

          />

        );

      default:

        return <GenericFixFlow request={request} readOnly={readOnly} flow={flow} />;

    }

  };



  return (

    <ProfilePageShell
      title={flowScreenTitle(flow)}
      scroll={flow === 'zones' ? false : undefined}
      subtitle={

        otherPending > 0

          ? `Ancora ${otherPending + (readOnly ? 0 : 1)} ${otherPending + (readOnly ? 0 : 1) === 1 ? 'modifica' : 'modifiche'} da completare.`

          : 'Ci siamo quasi — un piccolo passo e ricontrolliamo tutto.'

      }

    >

      <View style={styles.areaBadge}>

        <Ionicons name="sparkles-outline" size={16} color={Colors.success} />

        <AppText style={styles.areaBadgeText}>{request.areaLabel}</AppText>

      </View>

      {renderFlow()}

    </ProfilePageShell>

  );

}



const styles = StyleSheet.create({

  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F7FA' },

  areaBadge: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 6,

    alignSelf: 'flex-start',

    backgroundColor: Colors.successSoft,

    paddingHorizontal: 12,

    paddingVertical: 6,

    borderRadius: Design.radius.full,

    marginBottom: 16,

  },

  areaBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.navy },

  missing: { fontSize: 14, color: Colors.textSecondary, marginBottom: 16 },

  generic: { gap: 12 },

  lead: { fontSize: 16, fontWeight: '700', color: Colors.navy },

  hint: { fontSize: 14, lineHeight: 21, color: Colors.textSecondary },

  note: {

    fontSize: 13,

    color: Colors.textSecondary,

    backgroundColor: Colors.pendingSoft,

    padding: 12,

    borderRadius: Design.radius.md,

  },

  review: { fontSize: 13, fontWeight: '600', color: Colors.pending },

});


