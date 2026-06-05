import Leaderboard from '../leaderboard/Leaderboard';

export default function MistressDashboard({ mistressId, stats = {} }) {
  const cards = [
    { label: 'Wallet Balance', value: stats.walletBalance || '$0' },
    { label: 'Monthly Revenue', value: stats.monthlyRevenue || '$0' },
    { label: 'Subscribers', value: stats.subscribers || 0 },
    { label: 'Open Orders', value: stats.openOrders || 0 },
  ];

  return (
    <main className="mx-dashboard mx-dashboard--mistress">
      <section className="mx-dashboard-hero">
        <p className="mx-eyebrow">Mistress Control Room</p>
        <h1>Your empire dashboard</h1>
        <p>Manage chat, gifts, subscribers, store items, positions, and live supporter activity from one command screen.</p>
      </section>

      <section className="mx-stat-grid">
        {cards.map((card) => (
          <article key={card.label} className="mx-stat-card">
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </section>

      <section className="mx-action-grid">
        <button>Create PPV</button>
        <button>Start Live Show</button>
        <button>Add Store Item</button>
        <button>Open Rolodex</button>
      </section>

      <section className="mx-dashboard-grid">
        <article className="mx-panel">
          <h2>Priority alerts</h2>
          <p>No urgent alerts yet.</p>
        </article>

        <article className="mx-panel">
          <h2>Top supporters</h2>
          <Leaderboard mistressId={mistressId} />
        </article>
      </section>
    </main>
  );
}
