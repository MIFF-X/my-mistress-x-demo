import { useMemo, useState } from 'react';

const starterListings = [
  { id: 'sm-rare-set', name: 'Rare Set Sticker', rarity: 'Rare', price: 25, seller: 'Creator Vault' },
  { id: 'sm-drop-12', name: 'Drop #12 Sticker', rarity: 'Common', price: 10, seller: 'Collector Drop' },
  { id: 'sm-crown', name: 'Crowned Devotee Badge', rarity: 'Epic', price: 45, seller: 'Headmistress' },
];

export default function StickerMarketplacePanel() {
  const [listings] = useState(starterListings);
  const [cart, setCart] = useState([]);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price || 0), 0), [cart]);

  function addToCart(item) {
    setCart((prev) => [item, ...prev]);
  }

  return (
    <section className="mx-sticker-marketplace-panel">
      <header>
        <p className="mx-eyebrow">Sticker Economy</p>
        <h2>Sticker Marketplace</h2>
        <p>Frontend shell for collectible listings, ownership transfer, rarity value, and future resale fees.</p>
      </header>

      <section className="mx-command-stats">
        <article className="mx-stat-card">
          <span>Listings</span>
          <strong>{listings.length}</strong>
          <small>Frontend starter set</small>
        </article>
        <article className="mx-stat-card">
          <span>Cart Total</span>
          <strong>${cartTotal.toFixed(2)}</strong>
          <small>{cart.length} selected</small>
        </article>
      </section>

      <section className="mx-command-grid">
        {listings.map((listing) => (
          <article key={listing.id} className="mx-command-panel">
            <h3>{listing.name}</h3>
            <strong>{listing.rarity}</strong>
            <p>Seller: {listing.seller}</p>
            <p>${listing.price}</p>
            <div className="mx-panel-actions">
              <button type="button" onClick={() => addToCart(listing)}>Add to Cart</button>
            </div>
          </article>
        ))}
      </section>

      <section className="mx-command-panel">
        <h3>Cart Preview</h3>
        {cart.length === 0 && <p>No stickers selected yet.</p>}
        <div className="mx-transaction-list">
          {cart.map((item, index) => (
            <article key={`${item.id}-${index}`} className="mx-transaction-row">
              <div>
                <strong>{item.name}</strong>
                <small>{item.rarity}</small>
              </div>
              <span>${item.price}</span>
            </article>
          ))}
        </div>
      </section>

      <aside className="mx-command-note">
        <strong>Backend later:</strong> add StickerListing, ownership transfer, wallet purchase, resale fee, listing expiry, and moderation checks.
      </aside>
    </section>
  );
}
