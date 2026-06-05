import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';

export default function PpvGallery() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch('/ppv');
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Could not load PPV content.');
    } finally {
      setLoading(false);
    }
  }

  async function unlock(itemId) {
    setError('');

    try {
      await apiFetch('/ppv/unlock', {
        method: 'POST',
        body: JSON.stringify({ itemId }),
      });

      await loadItems();
    } catch (err) {
      setError(err.message || 'Could not unlock PPV content.');
    }
  }

  return (
    <section className="mx-ppv-gallery">
      <header>
        <p className="mx-eyebrow">Premium Content</p>
        <h2>Locked media</h2>
      </header>

      {loading && <p>Loading PPV content...</p>}
      {error && <p className="mx-error">{error}</p>}

      <div className="mx-ppv-grid">
        {items.map((item) => {
          const locked = !item.unlocked && !item.isUnlocked;
          const imageUrl = locked ? item.previewUrl : item.mediaUrl;

          return (
            <article key={item.id} className="mx-ppv-card">
              <div className="mx-ppv-media">
                {imageUrl ? (
                  <img src={imageUrl} alt={item.title} />
                ) : (
                  <div className="mx-ppv-placeholder">Preview unavailable</div>
                )}

                {locked && <span className="mx-ppv-lock">🔒</span>}
              </div>

              <h3>{item.title}</h3>
              {item.description && <p>{item.description}</p>}

              {locked ? (
                <button onClick={() => unlock(item.id)}>
                  Unlock ${String(item.price)}
                </button>
              ) : (
                <span className="mx-unlocked">Unlocked</span>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
