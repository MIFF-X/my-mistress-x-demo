import CommandCentreMount from './CommandCentreMount';

export const commandCentreRoute = {
  id: 'command-centre',
  label: 'Command Centre',
  path: '/command-centre',
  roles: ['HEADMISTRESS', 'ADMIN'],
  component: CommandCentreMount,
  description:
    'Admin command centre for revenue, wallet, ledger, chat, events, collector systems, plugins, analytics, and controls.',
};

export default commandCentreRoute;
