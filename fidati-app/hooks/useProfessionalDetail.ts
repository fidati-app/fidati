import { useEffect, useMemo, useState } from 'react';

import {
  getProfessionalServices,
  ProfessionalServiceItem,
} from '@/constants/professionalServices';
import { fetchProfessionalDetail } from '@/services/professionalsService';
import { Professional } from '@/types';
import { getProfessionalGalleryImages } from '@/utils/professionalGallery';

export function findPackageInServices(
  services: ProfessionalServiceItem[],
  packageId: string,
) {
  for (const service of services) {
    const match = service.packages.find((pkg) => pkg.id === packageId);
    if (match) return match;
  }
  return undefined;
}

export function useProfessionalDetail(professionalId: string, professional: Professional | undefined) {
  const mockServices = useMemo(
    () => (professional ? getProfessionalServices(professional.categorySlug) : []),
    [professional],
  );
  const mockGallery = useMemo(
    () => (professional ? getProfessionalGalleryImages(professional) : []),
    [professional],
  );

  const [services, setServices] = useState<ProfessionalServiceItem[]>(mockServices);
  const [galleryImages, setGalleryImages] = useState<string[]>(mockGallery);

  useEffect(() => {
    setServices(mockServices);
    setGalleryImages(mockGallery);
  }, [mockServices, mockGallery]);

  useEffect(() => {
    if (!professional || !professionalId) return;

    let active = true;
    fetchProfessionalDetail(professionalId, professional).then((detail) => {
      if (!active || !detail) return;
      if (detail.services.length > 0) setServices(detail.services);
      if (detail.galleryImages.length > 0) setGalleryImages(detail.galleryImages);
    });

    return () => {
      active = false;
    };
  }, [professionalId, professional?.id]);

  return { services, galleryImages };
}
