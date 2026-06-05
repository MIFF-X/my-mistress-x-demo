export const SHARED_GAME_PLUGINS = [
  {
    id: 'lotto',
    title: 'Lotto',
    route: '/games/lotto',
    status: 'bridge-ready',
    owner: 'shared',
  },
  {
    id: 'raffles',
    title: 'Raffles',
    route: '/games/raffles',
    status: 'bridge-ready',
    owner: 'shared',
  },
  {
    id: 'mystery-box',
    title: 'Mystery Box',
    route: '/games/mystery-boxes',
    status: 'bridge-ready',
    owner: 'shared',
  },
  {
    id: 'polls',
    title: 'Polls',
    route: '/polls',
    status: 'bridge-ready',
    owner: 'shared',
  },
  {
    id: 'scavenger-hunt',
    title: 'Scavenger Hunt',
    route: '/games/scavenger-hunt',
    status: 'bridge-ready',
    owner: 'shared',
  },
  {
    id: 'scratch-card',
    title: 'Scratch Card',
    route: '/games/scratch-card',
    status: 'bridge-ready',
    owner: 'shared',
  },
  {
    id: 'spin-wheel',
    title: 'Spin Wheel',
    route: '/games/spin-wheel',
    status: 'bridge-ready',
    owner: 'shared',
  },
];

export function listSharedGamePlugins() {
  return SHARED_GAME_PLUGINS.map((plugin) => ({ ...plugin }));
}

export function getSharedGamePlugin(pluginId) {
  return SHARED_GAME_PLUGINS.find((plugin) => plugin.id === pluginId) || null;
}

export function createSharedGamesHub(overrides = {}) {
  return {
    id: overrides.id || 'shared-games-hub',
    title: overrides.title || 'Shared Games',
    plugins: overrides.plugins || listSharedGamePlugins(),
    updatedAt: overrides.updatedAt || new Date().toISOString(),
  };
}
