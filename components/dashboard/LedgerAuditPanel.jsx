import { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api';

export default function LedgerAuditPanel() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('ALL');
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
      setError(err.message || 'Ledger failed to load');
    } finally {
      setLoading(false);
    }
  }

  const visibleTransactions = transactions.filter((tx) => {
    if (filter === 'ALL') return true;
    return tx.type === filter;
  });

  return (
    <section className="mx-ledger-audit-panel">
      <header>
        <p className="mx-eyebrow">Financial Audit</p>
        <h2>Ledger Audit</h2>
        <p>Inspect wallet movement, platform split, mistress share, and future anomaly flags.</p>
      </header>

      {loading && <p>Loading ledger...</p>}
      {error && <p className="mx-error">{error}</p>}

      <div className="mx-panel-actions">
        <button type="button" onClick={loadTransactions}>Refresh</button>
        <select value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="ALL">All</option>
          <option value="GIFT">Gifts</option>
          <option value="CHAT_UNLOCK">Chat Unlocks</option>
          <option value="PPV_UNLOCK">PPV Unlocks</option>
          <option value="SUBSCRIPTION_PAYMENT">Subscriptions</option>
          <option value="PURCHASE">Marketplace</option>
        </select>
      </div>

      <div className="mx-ledger-table">
        {visibleTransactions.length === 0 && <p>No ledger rows found.</p>}

        {visibleTransactions.map((tx) => (
          <article key={tx.id} className="mx-ledger-row">
            <div>
              <strong>{tx.type}</strong>
              <small>{tx.reason || 'ledger event'}</small>
            </div>
            <div>
              <span>Total: ${String(tx.amount)}</span>
              <small>Platform: ${String(tx.platformAmount || '0.00')}</small>
              <small>Mistress: ${String(tx.mistressAmount || '0.00')}</small>
            </div>
            <div>
              <small>Sender: {tx.senderUserId || 'n/a'}</small>
              <small>Receiver: {tx.receiverUserId || 'n/a'}</small>
            </div>
          </article>
        ))}
      </div>

      <aside className="mx-command-note">
        <strong>Backend later:</strong> add transaction statuses, reference IDs,
        refund/dispute workflow, wallet freeze controls, and anomaly detection.
      </aside>
    </section>
  );
}
