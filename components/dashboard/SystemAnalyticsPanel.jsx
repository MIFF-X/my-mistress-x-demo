const metricCards = [
  { label: 'Revenue Today', value: '$0.00', detail: 'Connect to analytics rollup later' },
  { label: 'New Users', value: '0', detail: 'Connect to auth/user stats later' },
  { label: 'PPV Unlocks', value: '0', detail: 'Connect to PPV events later' },
  { label: 'Chat Unlocks', value: '0', detail: 'Connect to chat events later' },
  { label: 'Marketplace Orders', value: '0', detail: 'Connect to order events later' },
  { label: 'Active Sockets', value: '0', detail: 'Connect to gateway health later' },
];

const analyticsSections = [
  {
    title: 'Revenue Trends',
    rows: ['Daily platform share', 'Mistress earnings', 'Feature revenue split'],
  },
  {
    title: 'User Activity',
    rows: ['Signups', 'Active subs', 'Active mistresses'],
  },
  {
    title: 'Feature Usage',
    rows: ['Chat messages', 'PPV unlocks', 'Gifts sent', 'Marketplace purchases'],
  },
  {
    title: 'System Events',
    rows: ['Latest events', 'Failed handlers', 'Pending notifications'],
  },
];

export default function SystemAnalyticsPanel() {
  return (
    <section className="mx-system-analytics-panel">
      <header>
        <p className="mx-eyebrow">System Intelligence</p>
        <h2>Analytics</h2>
        <p>Command Centre overview for revenue, activity, usage, and system event health.</p>
      </header>

      <div className="mx-command-stats">
        {metricCards.map((card) => (
          <article key={card.label} className="mx-stat-card">
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.detail}</small>
          </article>
        ))}
      </div>

      <div className="mx-command-grid">
        {analyticsSections.map((section) => (
          <article key={section.title} className="mx-command-panel">
            <h3>{section.title}</h3>
            <ul>
              {section.rows.map((row) => (
                <li key={row}>{row}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <aside className="mx-command-note">
        <strong>Backend later:</strong> connect this panel to SystemEvent,
        analytics aggregation tables, wallet ledger, and WebSocket health feeds.
      </aside>
    </section>
  );
}
