import { UI_LAYOUT_PRESETS } from './layoutPresets';

export const UI_LAYOUT_SELECTOR_COPY = {
  title: 'Choose Your Mistress-X Layout',
  subtitle:
    'One shared design system that adapts across web, tablet, mobile and app. Users choose the mode; the platform keeps the components reusable.',
  lockedRule:
    'Build once with shared components, then let the responsive shell decide whether the experience becomes sidebar, rail, bottom tabs, grid, stack or live-room view.',
  sections: [
    {
      title: 'Shared Foundation',
      items: ['Design tokens', 'Theme packs', 'Cards', 'Buttons', 'Widgets', 'Navigation shells'],
    },
    {
      title: 'Responsive Behaviour',
      items: ['Desktop sidebars', 'Tablet rails', 'Mobile bottom tabs', 'Swipe rows', 'Stacked cards'],
    },
    {
      title: 'User Choice',
      items: ['Free layouts', 'Paid style packs', 'Custom build requests', 'AI/Tech Slave builder'],
    },
  ],
};

export const UI_LAYOUT_SELECTOR_PROGRESS = {
  presetsCaptured: UI_LAYOUT_PRESETS.length,
  currentBuildStage: 'scaffolded',
  nextIntegrationTarget: 'Wire presets into a visual selector screen and save the chosen layout per user role.',
};
