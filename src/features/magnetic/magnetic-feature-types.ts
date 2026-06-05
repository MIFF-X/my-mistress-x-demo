export type MxRole =
  | 'HEADMISTRESS'
  | 'MISTRESS'
  | 'SUB'
  | 'ADMIN_MEMBER'
  | 'GUEST';

export type MagneticEndpointMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export type MagneticEndpointContract = {
  key: string;
  method: MagneticEndpointMethod;
  path: string;
  description: string;
  requiresAuth: boolean;
  roles: MxRole[];
};

export type MagneticFeatureContract = {
  featureKey: string;
  displayName: string;
  description: string;
  status: 'planned' | 'scaffolded' | 'integrating' | 'tested' | 'deploy-ready';
  roles: MxRole[];
  endpoints: MagneticEndpointContract[];
  frontendRoutes: string[];
  databaseModels: string[];
  walletEvents: string[];
  realtimeEvents: string[];
  docs: string[];
  tests: string[];
};
