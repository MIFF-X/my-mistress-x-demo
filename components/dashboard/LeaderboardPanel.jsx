import { useState } from 'react';

export default function LeaderboardPanel() {
  const [leaders] = useState([
    { name: 'Top Sub #1', amount: 1200 },
    { name: 'Top Sub #2', amount: 850 },
    { name: 'Top Sub #3', amount: 600 },
  ]);

  return (
    <section className="mx-leaderboard-panel">
      <header>
        <p className="mx-eyebrow">Leaderboard Engine</p>
        <h2>Top Spenders</h2>
      </header>

      <div className="mx-leaderboard-list">
        {leaders.map((l, i) => (
          <div key={i} className="mx-leaderboard-row">
            <strong>#{i + 1}</strong>
            <span>{l.name}</span>
            <span>${l.amount}</span>
          </div>
        ))}
      </div>

      <aside className="mx-command-note">
        Next: connect to positions + wallet transactions for real rankings.
      </aside>
    </section>
  );
}
