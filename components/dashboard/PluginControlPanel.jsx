import { useState } from 'react';

const pluginGroups = [
  {
    title: 'Monetisation Plugins',
    plugins: ['Wallet', 'PPV', 'Subscriptions', 'Marketplace', 'Gifts'],
  },
  {
    title: 'Engagement Plugins',
    plugins: ['Chat', 'Leaderboards', 'Notifications', 'Challenges', 'Dare Cards'],
  },
  {
    title: 'Collector Plugins',
    plugins: ['Sticker Book', 'Gift Vault', 'Trophy Room', 'Inventory', 'Showcase'],
  },
  {
    title: 'Command Plugins',
    plugins: ['Moderation', 'Analytics', 'System Events', 'Broadcasts', 'Audit Logs'],
  },
];

export default function PluginControlPanel() {
  const [enabled, setEnabled] = useState({});

  function togglePlugin(plugin) {
    setEnabled((prev) => ({
      ...prev,
      [plugin]: !prev[plugin],
    }));
  }

  return (
    <section className="mx-plugin-control-panel">
      <header>
        <p className="mx-eyebrow">Plugin Control</p>
        <h2>Platform Plugins</h2>
        <p>Frontend shell for feature toggles, plugin health, and monetisation switches.</p>
      </header>

      <div className="mx-command-grid">
        {pluginGroups.map((group) => (
          <article key={group.title} className="mx-command-panel">
            <h3>{group.title}</h3>

            <div className="mx-plugin-list">
              {group.plugins.map((plugin) => {
                const isEnabled = Boolean(enabled[plugin]);

                return (
                  <div key={plugin} className="mx-plugin-row">
                    <div>
                      <strong>{plugin}</strong>
                      <small>{isEnabled ? 'Enabled locally' : 'Disabled locally'}</small>
                    </div>
                    <button type="button" onClick={() => togglePlugin(plugin)}>
                      {isEnabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>

      <aside className="mx-command-note">
        <strong>Backend later:</strong> connect this panel to plugin config, role access,
        Headmistress controls, and system event logging.
      </aside>
    </section>
  );
}
