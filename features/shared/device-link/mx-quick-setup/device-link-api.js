const DEFAULT_API_ROOTS = ['/api/device-link', '/device-link'];

function getStoredToken() {
  try {
    if (typeof localStorage !== 'undefined') return localStorage.getItem('token') || localStorage.getItem('access_token');
  } catch {}
  return null;
}

async function requestDeviceLink(path, options = {}) {
  const token = options.token || getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  let lastError;
  for (const root of DEFAULT_API_ROOTS) {
    try {
      const response = await fetch(`${root}${path}`, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (response.status === 404) {
        lastError = new Error('Device Link endpoint not found.');
        continue;
      }

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      if (!response.ok) throw new Error(data.message || data.error || 'Device Link request failed.');
      return data;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Device Link request failed.');
}

export function createDevicePairingToken(payload = {}, token) {
  return requestDeviceLink('/pairing-token', {
    method: 'POST',
    body: payload,
    token,
  });
}

export function approveDevicePairing(payload = {}, token) {
  return requestDeviceLink('/approve', {
    method: 'POST',
    body: payload,
    token,
  });
}

export function listTrustedDevices(token) {
  return requestDeviceLink('/trusted-devices', { token });
}

export function revokeTrustedDevice(trustedDeviceId, payload = {}, token) {
  return requestDeviceLink(`/trusted-devices/${trustedDeviceId}/revoke`, {
    method: 'POST',
    body: payload,
    token,
  });
}

export function listDeviceLinkAuditLogs(token) {
  return requestDeviceLink('/audit-logs', { token });
}
