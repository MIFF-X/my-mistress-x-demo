import { useMemo, useState } from 'react';

const starterPunishments = [
  { id: 'p-1', title: 'Tribute Reminder', status: 'Active', reward: 'XP + obedience score' },
  { id: 'p-2', title: 'Timed Task', status: 'Pending', reward: 'Badge progress' },
  { id: 'p-3', title: 'Redemption Task', status: 'Draft', reward: 'Forgiveness token' },
];

export default function PunishmentPanel() {
  const [tasks, setTasks] = useState(starterPunishments);

  const activeCount = useMemo(() => tasks.filter((task) => task.status === 'Active').length, [tasks]);

  function addDraftTask() {
    setTasks((prev) => [
      {
        id: `p-${Date.now()}`,
        title: 'New Draft Punishment',
        status: 'Draft',
        reward: 'Configure reward later',
      },
      ...prev,
    ]);
  }

  return (
    <section className="mx-punishment-panel">
      <header>
        <p className="mx-eyebrow">Control Loop</p>
        <h2>Punishments & Tasks</h2>
        <p>Frontend shell for assigning tasks, timed penalties, redemption loops, rewards, and completion tracking.</p>
      </header>

      <section className="mx-command-stats">
        <article className="mx-stat-card">
          <span>Active Tasks</span>
          <strong>{activeCount}</strong>
          <small>Frontend preview</small>
        </article>
        <article className="mx-stat-card">
          <span>Total Drafts</span>
          <strong>{tasks.length}</strong>
          <small>Ready for backend task table</small>
        </article>
      </section>

      <div className="mx-panel-actions">
        <button type="button" onClick={addDraftTask}>Create Draft Task</button>
      </div>

      <div className="mx-command-grid">
        {tasks.map((task) => (
          <article key={task.id} className="mx-command-panel">
            <h3>{task.title}</h3>
            <p>Status: {task.status}</p>
            <small>{task.reward}</small>
          </article>
        ))}
      </div>

      <aside className="mx-command-note">
        <strong>Backend later:</strong> task assignment, deadline timers, completion proof, reward payout, auto-penalty rules, and audit logs.
      </aside>
    </section>
  );
}
