import { devLog, devLogSupabaseError } from '@/lib/devLog';
import type { AdminChangeRequest } from '@/services/professionalInternalNotificationsService';
import {
  fetchWorkPhotoById,
  fetchWorkPhotos,
  type WorkPhoto,
} from '@/services/professionalWorkPhotosService';

export type PortfolioChangeTarget = {
  photos: WorkPhoto[];
  targetPhoto: WorkPhoto | null;
  needsManualSelection: boolean;
  resolvedPhotoId: string | null;
};

/** Messaggio UI generico; dettagli solo in console (__DEV__). */
export const PORTFOLIO_UPLOAD_USER_ERROR =
  'Non siamo riusciti a caricare la foto. Riprova tra poco.';

export function logPortfolioChangeRequest(request: AdminChangeRequest, extra?: Record<string, unknown>) {
  if (!__DEV__) return;
  devLog('Portfolio change request — payload completo', {
    notificationId: request.id,
    type: request.type,
    target_section: request.target_section,
    related_entity_type: request.related_entity_type,
    related_entity_id: request.related_entity_id,
    professional_id: request.professional_id,
    title: request.title,
    message: request.message,
    status: request.status,
    ...extra,
  });
}

export function logPortfolioError(context: string, err: unknown) {
  if (!__DEV__) return;
  devLogSupabaseError(`PortfolioFixFlow.${context}`, err);
  if (err && typeof err === 'object' && 'message' in err) {
    console.warn(`[Fidati Pro PortfolioFix] ${context}:`, (err as { message: string }).message);
  }
}

/**
 * Ricava il photo_id dalla notifica.
 * - portfolio_change_requested + work_photo → related_entity_id
 * - verification_changes_requested → spesso related_entity_id = professional_id (non valido)
 */
function inferPhotoIdFromNotification(request: AdminChangeRequest): string | null {
  const entityId = request.related_entity_id;
  if (!entityId) return null;

  if (request.related_entity_type === 'work_photo' && entityId !== request.professional_id) {
    return entityId;
  }

  if (request.type === 'portfolio_change_requested' && entityId !== request.professional_id) {
    return entityId;
  }

  return null;
}

export async function resolvePortfolioChangeTarget(
  request: AdminChangeRequest,
  professionalId: string,
): Promise<PortfolioChangeTarget> {
  const photos = await fetchWorkPhotos(professionalId);
  const inferredId = inferPhotoIdFromNotification(request);

  logPortfolioChangeRequest(request, {
    inferredPhotoId: inferredId,
    portfolioPhotoCount: photos.length,
    portfolioIds: photos.map((p) => p.id),
  });

  if (inferredId) {
    const fromList = photos.find((p) => p.id === inferredId);
    if (fromList) {
      return {
        photos,
        targetPhoto: fromList,
        needsManualSelection: false,
        resolvedPhotoId: fromList.id,
      };
    }

    try {
      const direct = await fetchWorkPhotoById(inferredId, professionalId);
      if (direct) {
        return {
          photos,
          targetPhoto: direct,
          needsManualSelection: false,
          resolvedPhotoId: direct.id,
        };
      }
    } catch (err) {
      logPortfolioError('fetchWorkPhotoById', err);
    }
  }

  if (photos.length === 1) {
    return {
      photos,
      targetPhoto: photos[0],
      needsManualSelection: false,
      resolvedPhotoId: photos[0].id,
    };
  }

  return {
    photos,
    targetPhoto: null,
    needsManualSelection: photos.length > 1 || photos.length === 0,
    resolvedPhotoId: null,
  };
}

export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  return url.trim();
}
