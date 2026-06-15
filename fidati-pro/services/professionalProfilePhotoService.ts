import { devLogSupabaseError } from '@/lib/devLog';
import { supabase } from '@/lib/supabaseClient';
import { uploadProfessionalImage } from '@/services/professionalStorageService';

export async function saveProfessionalProfilePhoto(
  professionalId: string,
  localUri: string,
): Promise<string> {
  const publicUrl = await uploadProfessionalImage(
    'professional-profile-photos',
    professionalId,
    'profile.jpg',
    localUri,
  );

  const { error } = await supabase
    .from('professionals')
    .update({ image_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', professionalId);

  if (error) {
    devLogSupabaseError('saveProfessionalProfilePhoto', error);
    throw error;
  }

  return publicUrl;
}
