import type { MxReorderItem, MxReorderMotionPreset } from './reorderTypes';

export const mxReorderMotionPresets: MxReorderMotionPreset[] = [
  {
    id: 'soft-pop-snap',
    name: 'Soft Pop Snap',
    liftScale: 1.025,
    liftShadow: '0 12px 30px rgba(0, 0, 0, 0.28)',
    snapDurationMs: 160,
    hapticHint: true,
  },
  {
    id: 'card-lift-snap',
    name: 'Card Lift Snap',
    liftScale: 1.04,
    liftShadow: '0 18px 40px rgba(0, 0, 0, 0.36)',
    snapDurationMs: 210,
    hapticHint: true,
  },
];

export const mxDemoReorderItems: MxReorderItem[] = [
  {
    id: 'wallet-widget',
    label: 'Wallet widget',
    description: 'Balance, top-up and spend summary.',
    surface: 'dashboard-widgets',
    order: 1,
    visible: true,
  },
  {
    id: 'chat-widget',
    label: 'Chat widget',
    description: 'Messages, expression tray and quick replies.',
    surface: 'dashboard-widgets',
    order: 2,
    visible: true,
  },
  {
    id: 'sticker-store-module',
    label: 'Sticker store',
    description: 'Featured, all and installed sticker packs.',
    surface: 'app-market-modules',
    order: 3,
    visible: true,
  },
];

export function reorderMxItems<T extends { order: number }>(items: T[], fromIndex: number, toIndex: number): T[] {
  const next = [...items].sort((a, b) => a.order - b.order);
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next.map((item, index) => ({ ...item, order: index + 1 }));
}
