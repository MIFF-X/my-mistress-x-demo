import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../services/api';

const featureBuckets = [
  { key: 'CHAT_UNLOCK', label: 'Chat Unlocks' },
  { key: 'PAID_MESSAGE', label: 'Paid Messages' },
  { key: 'PPV_UNLOCK', label: 'PPV Unlocks' },
  { key: 'GIFT', label: 'Gifts' },
  { key: 'SUBSCRIPTION_PAYMENT', label: 'Subscriptions' },
  { key: 'PURCHASE', label: 'Marketplace' },
];

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default function MonetisationDashboardPanel() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch('/wallet/transactions');
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Monetisation data failed to load');
    } finally {
      setLoading(false);
    }
  }

  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        const amount = Number(tx.amount || 0);
        const platformAmount = Number(tx.platformAmount || 0);
        const mistressAmount = Number(tx.mistressAmount || 0);

        acc.total += amount;
        acc.platform += platformAmount;
        acc.mistress += mistressAmount;
        acc.count += 1;

        if (!acc.byType[tx.type]) acc.byType[tx.type] = 0;
        acc.byType[tx.type] += amount;

        return acc;
      },
      { total: 0, platform: 0, mistress: 0, count: 0, byType: {} },
    );
  }, [transactions]);

  return (
    <section className="mx-monetisation-dashboard-panel">
      <header>
        <p className="mx-eyebrow">Money Engine</p>
        <h2>Monetisation Dashboard</h2>
        <p>Live-ready revenue cockpit for wallet, PPV, chat, subscriptions, gifts, and marketplace income.</p>
      </header>

      {loading && <p>Loading monetisation data...</p>}
      {error && <p className="mx-error">{error}</p>}

      <section className="mx-command-stats">
        <article className="mx-stat-card">
          <span>Total Processed</span>
          <strong>{money(summary.total)}</strong>
          <small>{summary.count} ledger events</small>
        </article>
        <article className="mx-stat-card">
          <span>Platform Share</span>
          <strong>{money(summary.platform)}</strong>
          <small>System fee preview</small>
        </article>
        <article className="mx-stat-card">
          <span>Mistress Share</span>
          <strong>{money(summary.mistress)}</strong>
          <small>Creator earnings preview</small>
        </article>
      </section>

      <div className="mx-panel-actions">
        <button type="button" onClick={loadTransactions}>Refresh</button>
      </div>

      <section className="mx-command-grid">
        {featureBuckets.map((bucket) => (
          <article key={bucket.key} className="mx-command-panel">
            <h3>{bucket.label}</h3>
            <strong>{money(summary.byType[bucket.key])}</strong>
            <p>Ready for SystemEvent analytics wiring.</p>
          </article>
        ))}
      </section>

      <section className="mx-command-panel">
        <h3>Top Earner Preview</h3>
        <p>Backend later: aggregate transactions by mistressUserId and rank top earners by day, week, month, and all-time.</p>
      </section>

      <aside className="mx-command-note">
        <strong>Backend later:</strong> connect this panel to SystemEvent, analytics rollups,
        platform fee configuration, live WebSocket revenue events, and payout batch status.
      </aside>
    </section>
  );
}
