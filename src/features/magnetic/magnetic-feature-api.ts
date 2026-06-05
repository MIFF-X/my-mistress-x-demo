import { magneticApiRequest } from '@/api/magnetic-api-client';

import type { MagneticFeatureContract } from './magnetic-feature-types';

export const listMagneticFeatures = (token?: string) =>
  magneticApiRequest<MagneticFeatureContract[]>({
    method: 'GET',
    path: '/magnetic/features',
    token,
  });

export const getMagneticFeature = (featureKey: string, token?: string) =>
  magneticApiRequest<MagneticFeatureContract>({
    method: 'GET',
    path: `/magnetic/features/${featureKey}`,
    token,
  });
