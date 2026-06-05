import { useState } from 'react';

const quickActions = [
  'Freeze Wallet',
  'Suspend User',
  'Force Refund',
  'Hide Content',
  'Broadcast Notice',
  'Lockdown Mode',
];

const controlGroups = [
  {
    title: 'Revenue Controls',
    rows: ['Platform fee split', 'Mistress payout rules', 'Refund approvals', 'Payout hold queue'],
  },
  {
    title: 'User Controls',
    rows: ['Suspend / ban', 'Shadow restrictions', 'Identity review', 'Role override'],
  },
  {
    title: 'Content Controls',
    rows: ['PPV takedown', 'Marketplace item review', 'Flagged media', 'Restricted visibility'],
  },
  {
    title: 'Safety Controls',
    rows: ['Emergency lockdown', 'Disable purchases', 'Disable chat', 'Moderation escalation'],
  },
];

export default function HeadmistressControlPanel() {
  const [platformShare, setPlatformShare] = useState(30);
  const mistressShare = 100 - Number(platformShare || 0);
  const [lockdownEnabled, setLockdownEnabled] = useState(false);

  return (
    <section className="mx-headmistress-control-panel">
      <header>
        <p className="mx-eyebrow">Global Authority</p>
        <h2>Headmistress Controls</h2>
        <p>Frontend shell for platform overrides, safety controls, revenue rules, and emergency actions.</p>
      </header>

      <section className="mx-command-stats">
        <article className="mx-stat-card">
          <span>Platform Share</span>
          <strong>{platformShare}%</strong>
          <small>Backend fee config later</small>
        </article>
        <article className="mx-stat-card">
          <span>Mistress Share</span>
          <strong>{mistressShare}%</strong>
          <small>Auto-calculated preview</small>
        </article>
        <article className="mx-stat-card">
          <span>Lockdown</span>
          <strong>{lockdownEnabled ? 'ON' : 'OFF'}</strong>
          <small>Frontend state only</small>
        </article>
      </section>

      <section className="mx-command-panel">
        <h3>Fee Split Preview</h3>
        <label>
          Platform fee %
          <input
            type="number"
            min="0"
            max="100"
            value={platformShare}
            onChange={(event) => setPlatformShare(event.target.value)}
          />
        </label>
      </section>

      <section className="mx-command-grid">
        {controlGroups.map((group) => (
          <article key={group.title} className="mx-command-panel">
            <h3>{group.title}</h3>
            <ul>
              {group.rows.map((row) => (
                <li key={row}>{row}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="mx-command-panel">
        <h3>Quick Actions</h3>
        <div className="mx-panel-actions">
          {quickActions.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => {
                if (action === 'Lockdown Mode') setLockdownEnabled((value) => !value);
              }}
            >
              {action}
            </button>
          ))}
        </div>
      </section>

      <aside className="mx-command-note">
        <strong>Backend later:</strong> connect these controls to role guards,
        audit logs, moderation workflows, platform fee config, and emergency system events.
      </aside>
    </section>
  );
}
