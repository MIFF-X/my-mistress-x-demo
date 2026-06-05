export const MAGNETIC_FEATURE_CONTRACT_VERSION = "1.0.0";

export function createMagneticFeatureContract({
  id,
  name,
  zone,
  owner = "shared",
  status = "scaffold",
  surfaces = [],
  routes = [],
  stores = [],
  api = [],
  events = [],
  permissions = [],
  dependencies = [],
  fallback = "local-demo",
  notes = "",
} = {}) {
  if (!id) throw new Error("Magnetic feature contract requires an id.");
  if (!name) throw new Error("Magnetic feature contract requires a name.");
  if (!zone) throw new Error("Magnetic feature contract requires a zone.");

  return {
    contractVersion: MAGNETIC_FEATURE_CONTRACT_VERSION,
    id,
    name,
    zone,
    owner,
    status,
    surfaces,
    routes,
    stores,
    api,
    events,
    permissions,
    dependencies,
    fallback,
    notes,
    registeredAt: new Date().toISOString(),
  };
}

export function validateMagneticFeatureContract(contract) {
  const required = ["contractVersion", "id", "name", "zone", "status"];
  const missing = required.filter((key) => !contract?.[key]);
  return {
    ok: missing.length === 0,
    missing,
  };
}
