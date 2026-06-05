const controlRoutes = [
  'POST /api/relationship-controls',
  'GET /api/relationship-controls/sub/:subUserId',
  'GET /api/relationship-controls/effective/:subUserId',
  'PATCH /api/relationship-controls/:id/revoke',
];

const controlTypes = [
  {
    key: 'blockUser',
    title: 'Block',
    glyph: 'BK',
    accent: '#fb7185',
    assetSlot: 'frontend/assets/action-row-buttons/block-user.png',
    description: 'Stops chat, gifts, content, and custom requests for one Mistress/Sub relationship.',
    surfaces: ['chat', 'paid messages', 'gifts', 'custom requests'],
  },
  {
    key: 'banUser',
    title: 'Ban',
    glyph: 'BN',
    accent: '#ef4444',
    assetSlot: 'frontend/assets/action-row-buttons/ban-user.png',
    description: 'Harder access removal for repeated disrespect, with optional timed duration.',
    surfaces: ['profile', 'store', 'live rooms', 'booking requests'],
  },
  {
    key: 'makeInvisible',
    title: 'Invisible',
    glyph: 'IN',
    accent: '#60a5fa',
    assetSlot: 'frontend/assets/action-row-buttons/make-invisible.png',
    description: 'Lets a Mistress hide herself from a Sub for hours, days, or indefinitely.',
    surfaces: ['directory', 'profile cards', 'search results', 'recommendations'],
  },
  {
    key: 'extinguishUser',
    title: 'Extinguish',
    glyph: 'EX',
    accent: '#ff0055',
    assetSlot: 'frontend/assets/action-row-buttons/extinguish-user.png',
    description: 'Combined block, ban, invisibility, and access removal with audit visibility.',
    surfaces: ['all access', 'wallet-gated actions', 'content unlocks', 'admin audit'],
  },
];

const durationPresets = [
  '6 hours',
  '24 hours',
  '3 days',
  '7 days',
  '30 days',
  'indefinite',
];

const relationshipActionFlow = [
  'Mistress selects Sub, control type, duration, and reason.',
  'Backend writes relationship-control record plus audit log.',
  'Effective-access endpoint returns block/ban/invisibility/extinguish state.',
  'Chat, profile, store, PPV, gifts, live rooms, bookings, and directory checks obey the control.',
  'Headmistress can review, override, or revoke from Command Centre.',
];

const chipStyle = {
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: 999,
  display: 'inline-flex',
  fontSize: 12,
  fontWeight: 700,
  margin: '0 6px 6px 0',
  padding: '6px 10px',
};

export default function RelationshipControlPanel() {
  return (
    <section className="mx-command-grid">
      <article className="mx-command-panel">
        <header>
          <h2>Relationship Controls</h2>
          <button type="button">Scaffolded</button>
        </header>
        <div style={{ display: 'grid', gap: 10 }}>
          {controlTypes.map((item) => (
            <button
              key={item.key}
              type="button"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${item.accent}`,
                borderRadius: 14,
                color: '#fff',
                cursor: 'default',
                padding: 12,
                textAlign: 'left',
              }}
            >
              <strong style={{ color: item.accent, display: 'block', fontSize: 16 }}>
                {item.glyph} {item.title}
              </strong>
              <span style={{ display: 'block', marginTop: 6 }}>{item.description}</span>
              <small style={{ color: '#aaa', display: 'block', marginTop: 8 }}>
                PNG slot: {item.assetSlot}
              </small>
            </button>
          ))}
        </div>
      </article>

      <article className="mx-command-panel">
        <header>
          <h2>Duration Presets</h2>
          <button type="button">Timed</button>
        </header>
        <div>
          {durationPresets.map((preset) => (
            <span key={preset} style={chipStyle}>{preset}</span>
          ))}
        </div>
        <p>
          These presets support punishments where a Sub cannot see or access a Mistress for a fixed window, with indefinite available for permanent controls.
        </p>
      </article>

      <article className="mx-command-panel">
        <header>
          <h2>Affected Surfaces</h2>
          <button type="button">Access</button>
        </header>
        {controlTypes.map((item) => (
          <div key={`${item.key}-surfaces`} style={{ marginBottom: 10 }}>
            <strong style={{ color: item.accent }}>{item.title}</strong>
            <div style={{ marginTop: 6 }}>
              {item.surfaces.map((surface) => (
                <span key={surface} style={chipStyle}>{surface}</span>
              ))}
            </div>
          </div>
        ))}
      </article>

      <article className="mx-command-panel">
        <header>
          <h2>Backend API</h2>
          <button type="button">JWT</button>
        </header>
        <ul>
          {controlRoutes.map((route) => (
            <li key={route}>{route}</li>
          ))}
        </ul>
      </article>

      <article className="mx-command-panel">
        <header>
          <h2>Control Flow</h2>
          <button type="button">Audit</button>
        </header>
        <ul>
          {relationshipActionFlow.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}
