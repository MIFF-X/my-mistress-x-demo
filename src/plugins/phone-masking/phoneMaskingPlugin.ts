import { apiRequest } from '../../api/apiClient';

export type PhoneMaskRouteMode = 'app_first' | 'carrier_first' | 'carrier_only' | 'app_only';
export type PhoneMaskProviderKey = 'internal_webrtc' | 'twilio' | 'telnyx' | 'vonage' | 'plivo' | 'messagebird' | 'custom_sip';

export type MaskedNumber = {
  id: string;
  userId: string;
  realPhoneNumber: string;
  maskedNumber: string;
  displayName: string;
  allowInbound: boolean;
  allowOutbound: boolean;
  preferredRouteMode?: PhoneMaskRouteMode;
  preferredProvider?: PhoneMaskProviderKey;
  status: 'pending_verification' | 'active' | 'revoked';
  createdAt: string;
};

export type HybridRoutePlan = {
  routeMode: PhoneMaskRouteMode;
  providerChain: PhoneMaskProviderKey[];
  primaryProvider: PhoneMaskProviderKey;
  primaryLeg: 'native_app' | 'webrtc' | 'carrier' | 'sip';
  fallbackAfterSeconds: number;
  fallbackLegs: Array<'webrtc' | 'carrier' | 'sip'>;
};

export type MaskedCallSession = {
  id: string;
  fromUserId: string;
  toUserId: string;
  maskedFromNumber: string;
  maskedToNumber: string;
  status: 'ringing' | 'answered' | 'declined' | 'ended' | 'missed' | 'fallback_started' | 'fallback_failed';
  purpose: 'chat' | 'booking' | 'live_show' | 'support' | 'other';
  routeMode: PhoneMaskRouteMode | 'native_push_ring' | 'web_rtc_fallback';
  activeLeg?: 'native_app' | 'webrtc' | 'carrier' | 'sip' | 'native_push_ring' | 'web_rtc_fallback';
  providerChain?: PhoneMaskProviderKey[];
  selectedProvider?: PhoneMaskProviderKey;
  fallbackAfterSeconds?: number;
  createdAt: string;
  updatedAt: string;
  ringInstruction: {
    type: 'incoming_call_push' | 'webrtc_ring' | 'pstn_bridge';
    title: string;
    body: string;
    deepLink: string;
  };
};

export const phoneMaskingPluginManifest = {
  id: 'phone-masking',
  title: 'Hybrid Phone Masking',
  summary: 'App-to-app calling first, native mobile ring where possible, carrier fallback later through pluggable providers.',
  capabilities: [
    'masked numbers',
    'app-first WebRTC calls',
    'native incoming call handoff',
    'carrier fallback adapters',
    'call session ledger',
  ],
};

export const phoneMaskingProviderOptions: Array<{ key: PhoneMaskProviderKey; label: string; mode: 'app' | 'carrier' | 'sip' }> = [
  { key: 'internal_webrtc', label: 'Mistress-X App Calling', mode: 'app' },
  { key: 'twilio', label: 'Twilio', mode: 'carrier' },
  { key: 'telnyx', label: 'Telnyx', mode: 'carrier' },
  { key: 'vonage', label: 'Vonage', mode: 'carrier' },
  { key: 'plivo', label: 'Plivo', mode: 'carrier' },
  { key: 'messagebird', label: 'MessageBird', mode: 'carrier' },
  { key: 'custom_sip', label: 'Custom SIP / wholesale route', mode: 'sip' },
];

export async function listMaskedNumbers() {
  return apiRequest<MaskedNumber[]>('/phone-masking/numbers');
}

export async function linkMaskedNumber(body: {
  phoneNumber: string;
  displayName?: string;
  allowInbound?: boolean;
  allowOutbound?: boolean;
  preferredRouteMode?: PhoneMaskRouteMode;
  preferredProvider?: PhoneMaskProviderKey;
}) {
  return apiRequest<MaskedNumber & { verificationRequired: boolean; nextStep?: string }>('/phone-masking/numbers/link', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function verifyMaskedNumber(numberId: string) {
  return apiRequest<MaskedNumber>(`/phone-masking/numbers/${numberId}/verify`, {
    method: 'PATCH',
  });
}

export async function registerMaskedCallDevice(body: {
  deviceId: string;
  platform: 'ios' | 'android' | 'web';
  pushToken?: string;
  supportsNativeCallUi?: boolean;
  supportsWebRtc?: boolean;
}) {
  return apiRequest('/phone-masking/devices', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function startMaskedCall(body: {
  fromUserId: string;
  toUserId: string;
  callerDeviceId?: string;
  calleeDeviceId?: string;
  purpose?: 'chat' | 'booking' | 'live_show' | 'support' | 'other';
  routeMode?: PhoneMaskRouteMode;
  providerPreference?: PhoneMaskProviderKey[];
  fallbackAfterSeconds?: number;
}) {
  return apiRequest<{ session: MaskedCallSession; dispatch: Record<string, unknown> }>('/phone-masking/sessions', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateMaskedCall(body: {
  sessionId: string;
  status: 'ringing' | 'answered' | 'declined' | 'ended' | 'missed' | 'fallback_started' | 'fallback_failed';
}) {
  return apiRequest<MaskedCallSession>('/phone-masking/sessions', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
