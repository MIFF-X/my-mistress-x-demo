import { useMemo, useState } from 'react';
import ChatControlPanel from './ChatControlPanel';
import CollectorPanel from './CollectorPanel';
import HeadmistressControlPanel from './HeadmistressControlPanel';
import LeaderboardPanel from './LeaderboardPanel';
import LedgerAuditPanel from './LedgerAuditPanel';
import LiveEventPanel from './LiveEventPanel';
import LiveMoneyFeedPanel from './LiveMoneyFeedPanel';
import MonetisationDashboardPanel from './MonetisationDashboardPanel';
import PluginControlPanel from './PluginControlPanel';
import ProfileTaxonomyGovernancePanel from './ProfileTaxonomyGovernancePanel';
import PunishmentPanel from './PunishmentPanel';
import RelationshipControlPanel from './RelationshipControlPanel';
import RevenuePanel from './RevenuePanel';
import StickerGeneratorPanel from './StickerGeneratorPanel';
import StickerMarketplacePanel from './StickerMarketplacePanel';
import SystemAnalyticsPanel from './SystemAnalyticsPanel';
import UsersPanel from './UsersPanel';
import WalletPanel from './WalletPanel';
import './command-centre.css';

const statCards = [
  { label: 'Platform Revenue', value: '$0.00', note: 'Wallet + ledger feed later' },
  { label: 'Active Users', value: '0', note: 'Auth/session feed later' },
  { label: 'Live Chats', value: '0', note: 'Socket feed later' },
  { label: 'Open Flags', value: '0', note: 'Moderation feed later' },
];

const navItems = [
  { key: 'overview', label: 'Overview' },
  { key: 'users', label: 'Users' },
  { key: 'money', label: 'Money Engine' },
  { key: 'live-money', label: 'Live Feed' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'wallet', label: 'Wallet' },
  { key: 'ledger', label: 'Ledger Audit' },
  { key: 'chat', label: 'Chat Control' },
  { key: 'relationship-controls', label: 'Relationship Controls' },
  { key: 'profile-taxonomy', label: 'Profile Taxonomy' },
  { key: 'punishments', label: 'Punishments' },
  { key: 'events', label: 'Live Events' },
  { key: 'collector', label: 'Collector' },
  { key: 'stickers', label: 'Sticker Generator' },
  { key: 'sticker-market', label: 'Sticker Market' },
  { key: 'leaderboard', label: 'Leaderboard' },
  { key: 'plugins', label: 'Plugins' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'controls', label: 'Headmistress Controls' },
];

const overviewPanels = [
  {
    title: 'Revenue Control',
    items: ['Platform split controls', 'Mistress earnings', 'Refunds/disputes', 'Payout queue'],
  },
  {
    title: 'Users',
    items: ['Search users', 'Suspend/ban', 'Top spenders', 'Top earners'],
  },
  {
    title: 'Profile Taxonomy',
    items: ['Mistress category chips', 'Sub identity labels', 'Profession/service fields', 'Custom wording moderation'],
  },
  {
    title: 'Relationship Controls',
    items: ['Block', 'Ban', 'Timed invisibility', 'Extinguish'],
  },
  {
    title: 'Wallets & Ledger',
    items: ['Live transaction feed', 'Manual adjustment', 'Wallet freeze', 'Audit trail'],
  },
  {
    title: 'Content',
    items: ['PPV review', 'Marketplace items', 'Flagged uploads', 'Approve/remove'],
  },
  {
    title: 'Chat & Live',
    items: ['Active rooms', 'Paid unlocks', 'Flagged messages', 'Live show status'],
  },
  {
    title: 'Punishment Loop',
    items: ['Task assignment', 'Deadlines', 'Rewards', 'Penalty escalation'],
  },
  {
    title: 'Live Event Engine',
    items: ['Double XP', 'Bonus rewards', 'Flash sales', 'Leaderboard rushes'],
  },
  {
    title: 'Collector Economy',
    items: ['Sticker generation', 'Rarity tiers', 'Collection vault', 'Future resale marketplace'],
  },
  {
    title: 'Leaderboards',
    items: ['Ranking categories', 'Reset timers', 'Prize pools', 'Badge rewards'],
  },
  {
    title: 'Notifications',
    items: ['Broadcasts', 'Failed sends', 'Unread totals', 'Event triggers'],
  },
  {
    title: 'System Health',
    items: ['API status', 'Database status', 'Socket status', 'Error logs'],
  },
];

function OverviewPanel() {
  return (
    <>
      <section className="mx-command-stats">
        {statCards.map((card) => (
          <article key={card.label} className="mx-stat-card">
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.note}</small>
          </article>
        ))}
      </section>

      <section className="mx-command-grid">
        {overviewPanels.map((panel) => (
          <article key={panel.title} className="mx-command-panel">
            <header>
              <h2>{panel.title}</h2>
              <button type="button">Open</button>
            </header>
            <ul>
              {panel.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </>
  );
}

export default function HeadmistressCommandCentre() {
  const [activePanel, setActivePanel] = useState('overview');

  const panelTitle = useMemo(() => {
    return navItems.find((item) => item.key === activePanel)?.label || 'Overview';
  }, [activePanel]);

  return (
    <main className="mx-command-centre mx-command-centre--wired">
      <aside className="mx-command-sidebar">
        <h2>Command</h2>
        <nav>
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={activePanel === item.key ? 'active' : ''}
              onClick={() => setActivePanel(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="mx-command-main">
        <section className="mx-command-hero">
          <p className="mx-eyebrow">Headmistress Control</p>
          <h1>{panelTitle}</h1>
          <p>
            Central control shell for revenue, users, wallets, content,
            moderation, leaderboards, notifications, and system health.
          </p>
        </section>

        {activePanel === 'overview' && <OverviewPanel />}
        {activePanel === 'users' && <UsersPanel />}
        {activePanel === 'money' && <MonetisationDashboardPanel />}
        {activePanel === 'live-money' && <LiveMoneyFeedPanel />}
        {activePanel === 'revenue' && <RevenuePanel />}
        {activePanel === 'wallet' && <WalletPanel />}
        {activePanel === 'ledger' && <LedgerAuditPanel />}
        {activePanel === 'chat' && <ChatControlPanel />}
        {activePanel === 'relationship-controls' && <RelationshipControlPanel />}
        {activePanel === 'profile-taxonomy' && <ProfileTaxonomyGovernancePanel />}
        {activePanel === 'punishments' && <PunishmentPanel />}
        {activePanel === 'events' && <LiveEventPanel />}
        {activePanel === 'collector' && <CollectorPanel />}
        {activePanel === 'stickers' && <StickerGeneratorPanel />}
        {activePanel === 'sticker-market' && <StickerMarketplacePanel />}
        {activePanel === 'leaderboard' && <LeaderboardPanel />}
        {activePanel === 'plugins' && <PluginControlPanel />}
        {activePanel === 'analytics' && <SystemAnalyticsPanel />}
        {activePanel === 'controls' && <HeadmistressControlPanel />}
      </section>
    </main>
  );
}
