import { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api';

export default function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch('/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Users failed to load');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-users-panel">
      <header>
        <p className="mx-eyebrow">User Control</p>
        <h2>Users</h2>
        <p>Search, inspect, and manage platform accounts from the Command Centre.</p>
      </header>

      {loading && <p>Loading users...</p>}
      {error && <p className="mx-error">{error}</p>}

      <div className="mx-panel-actions">
        <button type="button" onClick={loadUsers}>Refresh</button>
      </div>

      <div className="mx-user-list">
        {users.length === 0 && !loading && <p>No users loaded yet.</p>}

        {users.map((user) => (
          <article key={user.id} className="mx-user-row">
            <div>
              <strong>{user.displayName || user.username || user.email}</strong>
              <small>{user.email} · {user.role || 'USER'} · {user.status || 'UNKNOWN'}</small>
            </div>
            <div className="mx-user-actions">
              <button type="button">View</button>
              <button type="button">Status</button>
            </div>
          </article>
        ))}
      </div>

      <aside className="mx-command-note">
        <strong>Backend later:</strong> add admin user search, status update, suspension, role override, profile inspection, and audit logging endpoints.
      </aside>
    </section>
  );
}
