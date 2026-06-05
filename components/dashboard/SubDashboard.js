import Leaderboard from '../leaderboard/Leaderboard';

export default function SubDashboard({ mistressId, stats = {} }) {
  const cards = [
    { label: 'Wallet Balance', value: stats.walletBalance || '$0' },
    { label: 'Total Spent', value: stats.totalSpent || '$0' },
    { label: 'Rank', value: stats.rank || '-' },
    { label: 'Subscriptions', value: stats.subscriptions || 0 },
  ];

  return (
    <main className="mx-dashboard mx-dashboard--sub">
      <section className="mx-dashboard-hero">
        <p className="mx-eyebrow">Sub Dashboard</p>
        <h1>Your devotion hub</h1>
        <p>Track your spending, rank, subscriptions, and interact with your chosen Mistress in real time.</p>
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
        <button>Open Chat</button>
        <button>Send Gift</button>
        <button>Buy Item</button>
        <button>View Leaderboard</button>
      </section>

      <section className="mx-dashboard-grid">
        <article className="mx-panel">
          <h2>Your position</h2>
          <p>Climb the ranks to earn status.</p>
        </article>

        <article className="mx-panel">
          <h2>Leaderboard</h2>
          <Leaderboard mistressId={mistressId} />
        </article>
      </section>
    </main>
  );
}
