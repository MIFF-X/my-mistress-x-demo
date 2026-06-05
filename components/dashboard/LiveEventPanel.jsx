import { useMemo, useState } from 'react';

const eventTemplates = [
  { id: 'double-xp', name: 'Double XP Hour', type: 'XP_MULTIPLIER', duration: '60 min' },
  { id: 'bonus-rewards', name: 'Bonus Rewards', type: 'REWARD_BOOST', duration: '30 min' },
  { id: 'flash-sale', name: 'Flash Sale', type: 'MARKETPLACE_BOOST', duration: '20 min' },
  { id: 'leaderboard-rush', name: 'Leaderboard Rush', type: 'STATUS_RACE', duration: '15 min' },
];

export default function LiveEventPanel() {
  const [activeEvents, setActiveEvents] = useState([]);

  const activeCount = useMemo(() => activeEvents.length, [activeEvents]);

  function triggerEvent(template) {
    setActiveEvents((prev) => [
      {
        ...template,
        instanceId: `${template.id}-${Date.now()}`,
        startedAt: new Date().toISOString(),
        status: 'ACTIVE',
      },
      ...prev,
    ]);
  }

  return (
    <section className="mx-live-event-panel">
      <header>
        <p className="mx-eyebrow">Live Event Engine</p>
        <h2>Event Triggers</h2>
        <p>Frontend command shell for flash events, XP boosts, rewards, sales, and leaderboard races.</p>
      </header>

      <section className="mx-command-stats">
        <article className="mx-stat-card">
          <span>Active Events</span>
          <strong>{activeCount}</strong>
          <small>Frontend preview</small>
        </article>
        <article className="mx-stat-card">
          <span>Event Templates</span>
          <strong>{eventTemplates.length}</strong>
          <small>Ready for SystemEvent wiring</small>
        </article>
      </section>

      <section className="mx-command-grid">
        {eventTemplates.map((event) => (
          <article key={event.id} className="mx-command-panel">
            <h3>{event.name}</h3>
            <p>{event.type}</p>
            <small>Duration: {event.duration}</small>
            <div className="mx-panel-actions">
              <button type="button" onClick={() => triggerEvent(event)}>Trigger</button>
            </div>
          </article>
        ))}
      </section>

      <section className="mx-command-panel">
        <h3>Active Event Feed</h3>
        {activeEvents.length === 0 && <p>No active events yet.</p>}
        <div className="mx-transaction-list">
          {activeEvents.map((event) => (
            <article key={event.instanceId} className="mx-transaction-row">
              <div>
                <strong>{event.name}</strong>
                <small>{event.status} · {new Date(event.startedAt).toLocaleString()}</small>
              </div>
              <span>{event.duration}</span>
            </article>
          ))}
        </div>
      </section>

      <aside className="mx-command-note">
        <strong>Backend later:</strong> create SystemEvent records, broadcast active events by WebSocket, add expiry timers, and connect boosts to XP, rewards, marketplace, and leaderboards.
      </aside>
    </section>
  );
}
