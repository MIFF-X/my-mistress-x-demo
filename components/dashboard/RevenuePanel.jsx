import { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api';

export default function RevenuePanel() {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRevenue();
  }, []);

  async function loadRevenue() {
    setLoading(true);
    setError('');

    try {
      const txData = await apiFetch('/wallet/transactions');
      const rows = Array.isArray(txData) ? txData : [];

      const totals = rows.reduce(
        (acc, tx) => {
          const amount = Number(tx.amount || 0);
          const platformAmount = Number(tx.platformAmount || 0);
          const mistressAmount = Number(tx.mistressAmount || 0);

          acc.total += amount;
          acc.platform += platformAmount;
          acc.mistress += mistressAmount;
          return acc;
        },
        { total: 0, platform: 0, mistress: 0 },
      );

      setSummary(totals);
      setTransactions(rows.slice(0, 10));
    } catch (err) {
      setError(err.message || 'Revenue failed to load');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-revenue-panel">
      <header>
        <p className="mx-eyebrow">Revenue Control</p>
        <h2>Revenue</h2>
      </header>

      {loading && <p>Loading revenue...</p>}
      {error && <p className="mx-error">{error}</p>}

      <div className="mx-command-stats">
        <article className="mx-stat-card">
          <span>Total Processed</span>
          <strong>${summary?.total?.toFixed(2) || '0.00'}</strong>
        </article>
        <article className="mx-stat-card">
          <span>Platform Share</span>
          <strong>${summary?.platform?.toFixed(2) || '0.00'}</strong>
        </article>
        <article className="mx-stat-card">
          <span>Mistress Share</span>
          <strong>${summary?.mistress?.toFixed(2) || '0.00'}</strong>
        </article>
      </div>

      <div className="mx-panel-actions">
        <button type="button" onClick={loadRevenue}>Refresh</button>
      </div>

      <h3>Recent Revenue Events</h3>
      <div className="mx-transaction-list">
        {transactions.length === 0 && <p>No revenue activity yet.</p>}
        {transactions.map((tx) => (
          <article key={tx.id} className="mx-transaction-row">
            <div>
              <strong>{tx.type}</strong>
              <small>{tx.reason || 'revenue event'}</small>
            </div>
            <span>${String(tx.amount)}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
