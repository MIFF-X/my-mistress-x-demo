import { useEffect, useState } from 'react';

export default function Marketplace() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/marketplace/products')
      .then(res => res.json())
      .then(setProducts);
  }, []);

  return (
    <div className="marketplace">
      <h2>Store</h2>

      <div className="grid">
        {products.map(p => (
          <div key={p.id} className="card">
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            <strong>${p.price}</strong>
            <button onClick={() => buy(p.id)}>Buy</button>
          </div>
        ))}
      </div>
    </div>
  );

  function buy(id) {
    fetch('/marketplace/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: id })
    });
  }
}
