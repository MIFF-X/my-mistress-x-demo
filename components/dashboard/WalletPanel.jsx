import { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api';

export default function WalletPanel() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWallet();
  }, []);

  async function loadWallet() {
    setLoading(true);
    setError('');

    try {
      const walletData = await apiFetch('/wallet');
      const txData = await apiFetch('/wallet/transactions');

      setWallet(walletData);
      setTransactions(Array.isArray(txData) ? txData : []);
    } catch (err) {
      setError(err.message || 'Wallet failed to load');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-wallet-panel">
      <header>
        <p className="mx-eyebrow">Wallet Control</p>
        <h2>Wallet & Ledger</h2>
      </header>

      {loading && <p>Loading wallet...</p>}
      {error && <p className="mx-error">{error}</p>}

      <div className="mx-stat-card">
        <span>Balance</span>
        <strong>${String(wallet?.balance || '0.00')}</strong>
      </div>

      <div className="mx-panel-actions">
        <button type="button" onClick={loadWallet}>Refresh</button>
      </div>

      <h3>Transactions</h3>

      <div className="mx-transaction-list">
        {transactions.length === 0 && <p>No transactions yet.</p>}

        {transactions.map((tx) => (
          <article key={tx.id} className="mx-transaction-row">
            <div>
              <strong>{tx.type}</strong>
              <small>{tx.reason || 'transaction'}</small>
            </div>
            <span>${String(tx.amount)}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
