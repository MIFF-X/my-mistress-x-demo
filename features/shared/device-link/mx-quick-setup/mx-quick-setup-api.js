const API_BASE = '/api/device-link';

function getToken() {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('token') || localStorage.getItem('access_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || 'MX Quick Setup request failed.');
  }
  return data;
}

export function createQuickSetupPairing({ devicePlatform = 'IOS', deviceLabel, redirectSurface = 'mx-stream-deck', requestedFrom = 'mx-quick-setup-qr' } = {}) {
  return request('/pairing-token', {
    method: 'POST',
    body: JSON.stringify({ devicePlatform, deviceLabel, redirectSurface, requestedFrom }),
  });
}

export function approveQuickSetupPairing({ pairingCode, tokenId, devicePlatform = 'IOS', deviceLabel, metadata } = {}) {
  return request('/approve', {
    method: 'POST',
    body: JSON.stringify({ pairingCode, tokenId, devicePlatform, deviceLabel, metadata }),
  });
}

export function listQuickSetupDevices() {
  return request('/trusted-devices');
}

export function removeQuickSetupDevice(trustedDeviceId, reason = 'Removed by user') {
  return request(`/trusted-devices/${trustedDeviceId}/revoke`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export function listQuickSetupAuditLogs() {
  return request('/audit-logs');
}
