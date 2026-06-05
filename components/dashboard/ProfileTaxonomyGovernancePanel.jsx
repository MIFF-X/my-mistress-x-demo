const reviewQueues = [
  {
    title: 'Mistress Categories',
    items: ['Public-safe directory chips', 'Sensitive categories needing review', 'Verified in-person only gates'],
  },
  {
    title: 'Sub Labels',
    items: ['Preset identity labels', 'Custom wording review', 'Rolodex/search visibility'],
  },
  {
    title: 'Profession & Services',
    items: ['Profession taxonomy', 'Services offered to Mistress', 'Regulated advice disclaimers'],
  },
  {
    title: 'Database / API',
    items: ['Profile.settings.profileTaxonomy JSON', 'GET/PATCH /api/profile/taxonomy', 'GET /api/profile/taxonomy/catalog'],
  },
];

export default function ProfileTaxonomyGovernancePanel() {
  return (
    <section className="mx-command-grid">
      {reviewQueues.map((queue) => (
        <article key={queue.title} className="mx-command-panel">
          <header>
            <h2>{queue.title}</h2>
            <button type="button">Review</button>
          </header>
          <ul>
            {queue.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      ))}

      <article className="mx-command-panel">
        <header>
          <h2>Control Rules</h2>
          <button type="button">Locked</button>
        </header>
        <ul>
          <li>No disposable-income field.</li>
          <li>Custom labels remain moderation-ready.</li>
          <li>Offline/in-person categories require verification and policy review.</li>
          <li>Professional services are informational unless separately qualified and approved.</li>
        </ul>
      </article>
    </section>
  );
}
