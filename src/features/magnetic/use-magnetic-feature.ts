import { useCallback, useMemo, useState } from 'react';

import {
  magneticApiRequest,
  type MagneticApiResponse,
  type MagneticHttpMethod,
} from '@/api/magnetic-api-client';

export type MagneticFeatureStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error';

export type MagneticFeatureAction<TBody = unknown> = {
  method?: MagneticHttpMethod;
  path: string;
  body?: TBody;
  token?: string;
};

export function useMagneticFeature(featureKey: string) {
  const [status, setStatus] = useState<MagneticFeatureStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const runAction = useCallback(
    async <TData, TBody = unknown>(
      action: MagneticFeatureAction<TBody>,
    ): Promise<MagneticApiResponse<TData>> => {
      setStatus('loading');
      setError(null);

      const response = await magneticApiRequest<TData, TBody>({
        method: action.method,
        path: action.path,
        body: action.body,
        token: action.token,
        headers: {
          'X-MX-Feature-Key': featureKey,
        },
      });

      if (response.error) {
        setStatus('error');
        setError(response.error);
        return response;
      }

      setStatus('success');
      return response;
    },
    [featureKey],
  );

  return useMemo(
    () => ({
      featureKey,
      status,
      error,
      isIdle: status === 'idle',
      isLoading: status === 'loading',
      isSuccess: status === 'success',
      isError: status === 'error',
      runAction,
    }),
    [error, featureKey, runAction, status],
  );
}
