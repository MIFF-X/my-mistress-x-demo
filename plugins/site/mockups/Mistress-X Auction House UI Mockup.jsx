const { useState, useEffect } = React;

const T = {
  bg: "#07070f", dark: "#10101a", border: "#2a1a3e",
  accent: "#9b30ff", gold: "#f5c842", red: "#e63946",
  text: "#f0e6ff", muted: "#7a6a8a", green: "#2ecc71"
};

const styles = {
  screen: { backgroundColor: T.bg, minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", color: T.text, padding: 20 },
  header: { fontSize: 24, fontWeight: 900, marginBottom: 20, color: T.gold, textAlign: 'center' },
  card: { backgroundColor: T.dark, border: `2px solid ${T.border}`, borderRadius: 16, padding: 20, maxWidth: 500, margin: '0 auto' },
  bidRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${T.border}` },
  input: { flex: 1, padding: 12, backgroundColor: '#1a1a2e', color: '#fff', border: `1px solid ${T.border}`, borderRadius: 8, marginRight: 10 },
  btn: (bg = T.accent) => ({ backgroundColor: bg, color: "#fff", border: "none", borderRadius: 8, padding: "12px 24px", cursor: "pointer", fontWeight: 700, fontSize: 16 }),
  timer: { fontSize: 32, fontWeight: 900, color: T.accent, textAlign: 'center', margin: '15px 0', fontVariantNumeric: 'tabular-nums' }
};

function AuctionApp() {
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour mock
  const [bid, setBid] = useState("");
  const [highestBid, setHighestBid] = useState(2.5);
  const [status, setStatus] = useState("idle"); // idle, bidding, success

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => prev > 0 ? prev - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handlePlaceBid = () => {
    if (parseFloat(bid) <= highestBid) return alert("Must be higher than current bid");
    setStatus("bidding");
    setTimeout(() => {
      setHighestBid(parseFloat(bid));
      setStatus("success");
      setBid("");
      setTimeout(() => setStatus("idle"), 3000);
    }, 1500);
  };

  return (
    <div style={styles.screen}>
      <h1 style={styles.header}>LIVE AUCTION ⚡</h1>

      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: 15 }}>
          <img src="https://placehold.co/400x400?text=Obsidian+Collar+NFT" style={{ width: '100%', borderRadius: 12, border: `1px solid ${T.accent}` }} />
          <h2 style={{ margin: '10px 0 5px' }}>Obsidian Devotion Collar #001</h2>
          <p style={{ color: T.muted, fontSize: 13 }}>Rare Legacy Asset • 1 of 1</p>
        </div>

        <div style={styles.timer}>{formatTime(timeLeft)}</div>
        <p style={{ textAlign: 'center', fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: 1 }}>Time Remaining</p>

        <div style={{ margin: '20px 0' }}>
          <div style={styles.bidRow}>
            <span>Current Highest Bid</span>
            <span style={{ fontWeight: 800, color: T.gold }}>{highestBid} ETH</span>
          </div>
          <div style={styles.bidRow}>
            <span>Bidders</span>
            <span style={{ color: T.text }}>14 active</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input 
            type="number" 
            placeholder="Min 2.6 ETH" 
            style={styles.input} 
            value={bid}
            onChange={(e) => setBid(e.target.value)}
          />
          <button 
            style={styles.btn(status === 'bidding' ? T.muted : T.accent)} 
            disabled={status === 'bidding'}
            onClick={handlePlaceBid}
          >
            {status === 'bidding' ? "Confirming..." : "PLACE BID"}
          </button>
        </div>

        {status === "success" && (
          <div style={{ color: T.green, textAlign: 'center', marginTop: 15, fontWeight: 700 }}>
            ✅ Bid Placed Successfully!
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: T.muted }}>
        Integrated with Mistress-X Web3 Wallet • 70% to Seller
      </div>
    </div>
  );
}

function App() {
  return <AuctionApp />;
}