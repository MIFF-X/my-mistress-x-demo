export const MONETIZATION_HUB_ENDPOINTS = Object.freeze({
  config: "/api/monetization/config",
  payments: "/api/monetization/payments",
  tips: "/api/monetization/tips",
  ppvUnlocks: "/api/monetization/ppv-unlocks",
  providerQueue: "/api/monetization/provider-queue"
});

export function getMonetizationHubEndpoint(key) {
  const endpoint = MONETIZATION_HUB_ENDPOINTS[key];

  if (!endpoint) {
    throw new Error(`Unknown monetization hub endpoint: ${key}`);
  }

  return endpoint;
}

export function createMonetizationRequestConfig(endpointKey, options = {}) {
  const { method = "GET", body, token, headers = {} } = options;
  const requestHeaders = {
    Accept: "application/json",
    ...headers
  };

  const config = {
    endpoint: getMonetizationHubEndpoint(endpointKey),
    init: {
      method,
      headers: requestHeaders
    }
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
    config.init.body = JSON.stringify(body);
  }

  return config;
}
