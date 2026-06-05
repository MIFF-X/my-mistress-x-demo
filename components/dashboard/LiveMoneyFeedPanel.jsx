import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../services/api';
import { getSocket } from '../../services/socket';

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

const MONEY_EVENTS = ['wallet.event', 'wallet.transactionCreated', 'system.walletEvent'];

export default function LiveMoneyFeedPanel() {
  const [transactions, setTransactions] = useState([]);
  const [pulseAmount, setPulseAmount] = useState(null);
  const [socketStatus, setSocketStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    loadFeed();
  }, []);

  useEffect(() => {
    const socket = getSocket();

    function handleConnect() {
      setSocketStatus('connected');
    }

    function handleDisconnect() {
      setSocketStatus('disconnected');
    }

    function handleMoneyEvent(event) {
      const amount = Number(event?.amount || event?.transaction?.amount || 0);
      const row = event?.transaction || {
        id: event?.id || `socket-${Date.now()}`,
        type: event?.type || 'LIVE_EVENT',
        reason: event?.reason || 'live money event',
        amount,
        platformAmount: event?.platformAmount || 0,
        mistressAmount: event?.mistressAmount || 0,
      };

      setTransactions((prev) => [row, ...prev].slice(0, 12));

      if (amount > 0) {
        setPulseAmount(amount);
        window.setTimeout(() => setPulseAmount(null), 1800);
      }
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    MONEY_EVENTS.forEach((eventName) => socket.on(eventName, handleMoneyEvent));

    if (socket.connected) setSocketStatus('connected');

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      MONEY_EVENTS.forEach((eventName) => socket.off(eventName, handleMoneyEvent));
    };
  }, []);

  async function loadFeed() {
    setError('');

    try {
      const data = await apiFetch('/wallet/transactions');
      const rows = Array.isArray(data) ? data : [];
      setTransactions(rows.slice(0, 12));

      if (rows[0]) {
        setPulseAmount(Number(rows[0].amount || 0));
        window.setTimeout(() => setPulseAmount(null), 1800);
      }
    } catch (err) {
      setError(err.message || 'Live money feed failed to load');
    }
  }

  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        acc.total += Number(tx.amount || 0);
        acc.platform += Number(tx.platformAmount || 0);
        acc.mistress += Number(tx.mistressAmount || 0);
        return acc;
      },
      { total: 0, platform: 0, mistress: 0 },
    );
  }, [transactions]);

  return (
    <section className="mx-live-money-feed-panel">
      <header>
        <p className="mx-eyebrow">Live Money Feed</p>
        <h2>Revenue Pulse</h2>
        <p>Real-time-ready feed for wallet events, split previews, and socket money pulses.</p>
      </header>

      {error && <p className="mx-error">{error}</p>}

      {pulseAmount !== null && (
        <div className="mx-money-pulse">+ {money(pulseAmount)}</div>
      )}

      <section className="mx-command-stats">
        <article className="mx-stat-card">
          <span>Visible Feed Total</span>
          <strong>{money(totals.total)}</strong>
          <small>Latest loaded ledger rows</small>
        </article>
        <article className="mx-stat-card">
          <span>Platform Cut</span>
          <strong>{money(totals.platform)}</strong>
          <small>Fee preview</small>
        </article>
        <article className="mx-stat-card">
          <span>Mistress Earnings</span>
          <strong>{money(totals.mistress)}</strong>
          <small>Creator share preview</small>
        </article>
        <article className="mx-stat-card">
          <span>Socket Status</span>
          <strong>{socketStatus}</strong>
          <small>Wallet event stream</small>
        </article>
      </section>

      <div className="mx-panel-actions">
        <button type="button" onClick={loadFeed}>Refresh Feed</button>
      </div>

      <div className="mx-transaction-list">
        {transactions.length === 0 && <p>No live money events yet.</p>}
        {transactions.map((tx) => (
          <article key={tx.id} className="mx-transaction-row mx-money-event">
            <div>
              <strong>{tx.type}</strong>
              <small>{tx.reason || 'money event'}</small>
            </div>
            <span>{money(tx.amount)}</span>
          </article>
        ))}
      </div>

      <aside className="mx-command-note">
        <strong>Backend later:</strong> emit wallet.event, wallet.transactionCreated, or system.walletEvent from the SystemEvent engine for instant +amount animations.
      </aside>
    </section>
  );
}
