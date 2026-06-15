import { devLogSupabaseError } from '@/lib/devLog';

import { supabase } from '@/lib/supabaseClient';

import { uploadProfessionalImage } from '@/services/professionalStorageService';



export type VerificationDocumentType = 'id_card' | 'driving_license' | 'passport';



export interface VerificationDocument {

  id: string;

  professionalId: string;

  documentType: VerificationDocumentType;

  frontImageUrl: string | null;

  backImageUrl: string | null;

  selfieImageUrl: string | null;

  status: string;

}



interface VerificationRow {

  id: string;

  professional_id: string;

  document_type: VerificationDocumentType;

  front_image_url: string | null;

  back_image_url: string | null;

  selfie_image_url: string | null;

  status: string;

}



function devLogDocuments(label: string, payload: unknown) {

  if (__DEV__) {

    console.log(`[Fidati Pro Documents] ${label}`, payload);

  }

}



function formatSupabaseError(error: unknown): string {

  if (error && typeof error === 'object') {

    const row = error as { code?: string; message?: string };

    devLogDocuments('db insert/update error code/message', {

      code: row.code ?? 'unknown',

      message: row.message ?? String(error),

    });

    if (row.message) return row.message;

  }

  return 'Impossibile salvare i documenti.';

}



function mapRow(row: VerificationRow): VerificationDocument {

  return {

    id: row.id,

    professionalId: row.professional_id,

    documentType: row.document_type,

    frontImageUrl: row.front_image_url,

    backImageUrl: row.back_image_url,

    selfieImageUrl: row.selfie_image_url,

    status: row.status,

  };

}



export function isVerificationDocumentComplete(doc: VerificationDocument | null): boolean {

  if (!doc) return false;

  if (!doc.selfieImageUrl) return false;



  if (doc.documentType === 'passport') {

    return Boolean(doc.frontImageUrl);

  }



  return Boolean(doc.frontImageUrl && doc.backImageUrl);

}



export async function fetchVerificationDocument(

  professionalId: string,

): Promise<VerificationDocument | null> {

  const { data, error } = await supabase

    .from('professional_verification_documents')

    .select('*')

    .eq('professional_id', professionalId)

    .maybeSingle();



  if (error) {

    devLogSupabaseError('fetchVerificationDocument', error);

    throw error;

  }



  return data ? mapRow(data as VerificationRow) : null;

}



export async function upsertVerificationDocument(

  professionalId: string,

  documentType: VerificationDocumentType,

  patch: Partial<Pick<VerificationDocument, 'frontImageUrl' | 'backImageUrl' | 'selfieImageUrl'>>,

): Promise<VerificationDocument> {

  devLogDocuments('professional id', professionalId);

  devLogDocuments('document type', documentType);

  devLogDocuments('front uri', patch.frontImageUrl ?? null);

  devLogDocuments('back uri', patch.backImageUrl ?? null);

  devLogDocuments('selfie uri', patch.selfieImageUrl ?? null);



  const rowPayload = {

    document_type: documentType,

    front_image_url: patch.frontImageUrl ?? null,

    back_image_url: documentType === 'passport' ? null : (patch.backImageUrl ?? null),

    selfie_image_url: patch.selfieImageUrl ?? null,

    updated_at: new Date().toISOString(),

  };



  const existing = await fetchVerificationDocument(professionalId);



  if (existing) {

    const { data, error } = await supabase

      .from('professional_verification_documents')

      .update(rowPayload)

      .eq('professional_id', professionalId)

      .select('*')

      .single();



    if (error) {

      devLogSupabaseError('upsertVerificationDocument update', error);

      throw new Error(formatSupabaseError(error));

    }



    return mapRow(data as VerificationRow);

  }



  const { data, error } = await supabase

    .from('professional_verification_documents')

    .insert({

      professional_id: professionalId,

      ...rowPayload,

      status: 'uploaded',

    })

    .select('*')

    .single();



  if (error) {

    devLogSupabaseError('upsertVerificationDocument insert', error);

    throw new Error(formatSupabaseError(error));

  }



  return mapRow(data as VerificationRow);

}



const SLOT_FILE_NAMES: Record<'front' | 'back' | 'selfie', string> = {

  front: 'front.jpg',

  back: 'back.jpg',

  selfie: 'selfie.jpg',

};



export async function uploadVerificationImage(

  professionalId: string,

  slot: 'front' | 'back' | 'selfie',

  localUri: string,

): Promise<string> {

  const fileName = SLOT_FILE_NAMES[slot];

  const uploadPath = `${professionalId}/${fileName}`;

  devLogDocuments('upload path', uploadPath);



  try {

    return await uploadProfessionalImage(

      'professional-documents',

      professionalId,

      fileName,

      localUri,

    );

  } catch (error) {

    if (error && typeof error === 'object') {

      const storageError = error as { message?: string; statusCode?: string; error?: string };

      devLogDocuments('upload error code/message', {

        code: storageError.statusCode ?? storageError.error ?? 'unknown',

        message: storageError.message ?? String(error),

      });

    }

    throw error;

  }

}



export async function requestProfileVerification(professionalId: string): Promise<void> {

  const { error } = await supabase

    .from('professionals')

    .update({

      verification_status: 'pending_review',

      verification_requested_at: new Date().toISOString(),

      account_status: 'in_review',

      updated_at: new Date().toISOString(),

    })

    .eq('id', professionalId)

    .in('verification_status', ['unverified', 'rejected']);



  if (error) {

    devLogSupabaseError('requestProfileVerification', error);

    throw error;

  }

}

