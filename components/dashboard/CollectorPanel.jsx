import { useState } from 'react';

export default function CollectorPanel() {
  const [collection] = useState([
    { id: 1, name: 'Worn Socks #12', rarity: 'Common' },
    { id: 2, name: 'Latex Set #3', rarity: 'Rare' },
  ]);

  return (
    <section className="mx-collector-panel">
      <header>
        <p className="mx-eyebrow">Collector System</p>
        <h2>Sticker Economy</h2>
        <p>Each purchased item can generate a collectible sticker tied to the item and Mistress.</p>
      </header>

      <div className="mx-command-grid">
        {collection.map((item) => (
          <article key={item.id} className="mx-command-panel">
            <h3>{item.name}</h3>
            <strong>{item.rarity}</strong>
            <p>Linked to purchased item.</p>
          </article>
        ))}
      </div>

      <aside className="mx-command-note">
        <strong>Next:</strong> connect purchases → sticker generation → rarity tiers → resale marketplace.
      </aside>
    </section>
  );
}
