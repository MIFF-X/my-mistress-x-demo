export default function Hamper({ items = [] }) {
  return (
    <div className="hamper">
      <h2>Lucky Dip / Hamper</h2>

      <p>Pick a random item curated by Mistress.</p>

      <button className="big">Open Hamper</button>

      <div className="items">
        {items.map((item, i) => (
          <div key={i} className="item">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
