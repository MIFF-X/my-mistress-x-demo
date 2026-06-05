export type MagneticHttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

declare const process:
  | {
      env?: Record<string, string | undefined>;
    }
  | undefined;

export type MagneticApiRequest<TBody = unknown> = {
  method?: MagneticHttpMethod;
  path: string;
  body?: TBody;
  token?: string;
  headers?: Record<string, string>;
};

export type MagneticApiResponse<TData> = {
  data: TData | null;
  error: string | null;
  status: number;
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');
const trimLeadingSlash = (value: string) => value.replace(/^\/+/, '');

export const getMagneticApiBaseUrl = () => {
  const configuredUrl =
    typeof process !== 'undefined'
      ? process?.env?.EXPO_PUBLIC_API_URL
      : undefined;

  if (configuredUrl && configuredUrl.trim().length > 0) {
    return trimTrailingSlash(configuredUrl.trim());
  }

  return 'http://localhost:3000';
};

export async function magneticApiRequest<TData, TBody = unknown>({
  method = 'GET',
  path,
  body,
  token,
  headers = {},
}: MagneticApiRequest<TBody>): Promise<MagneticApiResponse<TData>> {
  const url = `${getMagneticApiBaseUrl()}/${trimLeadingSlash(path)}`;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();
    const parsed = text.length > 0 ? JSON.parse(text) : null;

    if (!response.ok) {
      return {
        data: null,
        error:
          parsed?.message ??
          parsed?.error ??
          `Magnetic API request failed with status ${response.status}`,
        status: response.status,
      };
    }

    return {
      data: parsed as TData,
      error: null,
      status: response.status,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown magnetic API error',
      status: 0,
    };
  }
}
