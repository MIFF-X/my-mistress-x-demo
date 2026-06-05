const { useState, useEffect } = React;

const T = {
  bg: "#080810", card: "#0d0d1a", border: "#2a0050",
  purple: "#8b5cf6", pink: "#ec4899", gold: "#fbbf24",
  green: "#4ade80", text: "#ffffff", muted: "#666",
};

const RARITY_C = {
  Common: "#4ade80", Uncommon: "#60a5fa", Rare: "#a78bfa",
  Epic: "#e879f9", Legendary: "#fbbf24",
};

const MOCK_AUCTIONS = [
  { id: 1, label: "Founding Slave #1", emoji: "🌟", highestBid: 2.5, endMs: Date.now() + 3600000, rarity: "Legendary", bids: 7 },
  { id: 2, label: "Headmistress Seal", emoji: "🔱", highestBid: 5.0, endMs: Date.now() + 7200000, rarity: "Legendary", bids: 12 },
  { id: 3, label: "Founding Slave #2", emoji: "🌟", highestBid: 1.2, endMs: Date.now() + 900000,  rarity: "Legendary", bids: 3 },
];

const MOCK_LISTINGS = [
  { id: 1, label: "First Gift Badge",    emoji: "🎁", price: 0.05, stock: 3, rarity: "Common",    seller: "0xabc...123" },
  { id: 2, label: "30-Day Streak",       emoji: "💎", price: 0.25, stock: 1, rarity: "Epic",       seller: "0xdef...456" },
  { id: 3, label: "Premium Emoji Set",   emoji: "👑", price: 0.15, stock: 5, rarity: "Rare",       seller: "0x789...abc" },
  { id: 4, label: "Diamond Leash",       emoji: "💎", price: 1.50, stock: 1, rarity: "Legendary",  seller: "0xfed...321" },
  { id: 5, label: "7-Day Streak Badge",  emoji: "🔥", price: 0.08, stock: 2, rarity: "Common",    seller: "0x111...222" },
];

const MOCK_NFTS = [
  { id: 1,    label: "First Gift",       emoji: "🎁", rarity: "Common",    type: "badge" },
  { id: 2,    label: "High Roller",      emoji: "💰", rarity: "Rare",      type: "badge" },
  { id: 5,    label: "7-Day Streak",     emoji: "🔥", rarity: "Common",    type: "badge" },
  { id: 1000, label: "Golden Collar",    emoji: "🏆", rarity: "Legendary", type: "trophy" },
  { id: 2000, label: "Starter Emojis",   emoji: "😈", rarity: "Common",    type: "emoji_set" },
  { id: 3000, label: "Founding Slave",   emoji: "🌟", rarity: "Legendary", type: "collectible" },
];

function Countdown({ endMs }) {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => {
      const d = endMs - Date.now();
      if (d <= 0) { setT("Ended"); return; }
      const h = Math.floor(d / 3600000);
      const m = Math.floor((d % 3600000) / 60000);
      const s = Math.floor((d % 60000) / 1000);
      setT(`${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endMs]);
  return <span style={{ color: T.gold, fontWeight: "bold", fontSize: 13 }}>⏱ {t}</span>;
}

function RBadge({ rarity }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: "bold", padding: "2px 6px", borderRadius: 4,
      border: `1px solid ${RARITY_C[rarity]}`, color: RARITY_C[rarity],
      textTransform: "uppercase", letterSpacing: 1,
    }}>{rarity}</span>
  );
}

// ── Wallet Panel ──────────────────────────────────────────────────────────────
function WalletPanel() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const connect = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setConnected(true);
  };

  return (
    <div style={{ padding: 20 }}>
      {!connected ? (
        <div style={{ textAlign: "center", paddingTop: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔗</div>
          <p style={{ color: T.muted, marginBottom: 24 }}>Connect your MetaMask or WalletConnect wallet to access the full Web3 suite.</p>
          <button onClick={connect} disabled={loading} style={{
            background: "linear-gradient(135deg, #8b0000, #4a0080)",
            color: "#fff", border: "none", borderRadius: 10,
            padding: "14px 32px", fontSize: 16, cursor: "pointer", fontWeight: "bold",
          }}>
            {loading ? "⏳ Connecting..." : "🔗 Connect Wallet"}
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 13, color: T.muted, marginBottom: 4 }}>Connected Wallet</div>
            <div style={{ color: "#c084fc", fontFamily: "monospace", fontSize: 14 }}>0x742d...3f8a</div>
            <div style={{ marginTop: 16, fontSize: 36, fontWeight: "bold", color: T.purple }}>12.45</div>
            <div style={{ color: T.muted, fontSize: 13 }}>MATIC</div>
            <div style={{ marginTop: 10, display: "inline-block", padding: "4px 12px", borderRadius: 20, border: `1px solid ${T.green}`, color: T.green, fontSize: 12 }}>
              🟢 Polygon Mainnet
            </div>
          </div>
          {[
            { label: "NFTs Owned", value: "6", color: T.purple },
            { label: "Auctions Won", value: "2", color: T.gold },
            { label: "Marketplace Sales", value: "1", color: T.green },
            { label: "Total Spent", value: "8.7 MATIC", color: T.pink },
          ].map(s => (
            <div key={s.label} style={{
              background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
              padding: "12px 16px", display: "flex", justifyContent: "space-between",
            }}>
              <span style={{ color: T.muted, fontSize: 13 }}>{s.label}</span>
              <span style={{ color: s.color, fontWeight: "bold" }}>{s.value}</span>
            </div>
          ))}
          <button onClick={() => setConnected(false)} style={{
            background: "transparent", color: T.muted, border: `1px solid #333`,
            borderRadius: 8, padding: "10px", cursor: "pointer",
          }}>Disconnect</button>
        </div>
      )}
    </div>
  );
}

// ── Auction Panel ─────────────────────────────────────────────────────────────
function AuctionPanel() {
  const [selected, setSelected] = useState(null);
  const [bid, setBid] = useState("");
  const [placing, setPlacing] = useState(false);
  const [won, setWon] = useState(null);

  const placeBid = async () => {
    const v = parseFloat(bid);
    if (!v || v <= selected.highestBid) return;
    setPlacing(true);
    await new Promise(r => setTimeout(r, 2000));
    setPlacing(false);
    setWon(selected.label);
    setSelected(null);
    setBid("");
  };

  return (
    <div style={{ padding: 20 }}>
      {won && (
        <div style={{
          background: "#1a2a1a", border: `1px solid ${T.green}`, borderRadius: 10,
          padding: 14, marginBottom: 16, textAlign: "center",
        }}>
          <span style={{ color: T.green }}>✅ Bid placed on <strong>{won}</strong>! Tx submitted to Polygon.</span>
          <button onClick={() => setWon(null)} style={{ marginLeft: 12, background: "transparent", border: "none", color: T.muted, cursor: "pointer" }}>✕</button>
        </div>
      )}

      {selected ? (
        <div>
          <button onClick={() => setSelected(null)} style={{ background: "transparent", border: "none", color: T.muted, cursor: "pointer", marginBottom: 12 }}>← Back</button>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 64 }}>{selected.emoji}</div>
            <h3 style={{ color: "#fff", margin: "8px 0 4px" }}>{selected.label}</h3>
            <RBadge rarity={selected.rarity} />
            <div style={{ marginTop: 16, display: "flex", justifyContent: "space-around" }}>
              <div><div style={{ color: T.muted, fontSize: 12 }}>Highest Bid</div><div style={{ color: T.purple, fontWeight: "bold", fontSize: 20 }}>{selected.highestBid} MATIC</div></div>
              <div><div style={{ color: T.muted, fontSize: 12 }}>Total Bids</div><div style={{ color: "#fff", fontWeight: "bold", fontSize: 20 }}>{selected.bids}</div></div>
              <div><div style={{ color: T.muted, fontSize: 12 }}>Time Left</div><Countdown endMs={selected.endMs} /></div>
            </div>
            <div style={{ marginTop: 20 }}>
              <input
                value={bid}
                onChange={e => setBid(e.target.value)}
                type="number"
                placeholder={`Min: ${(selected.highestBid + 0.1).toFixed(1)} MATIC`}
                style={{
                  width: "100%", background: "#111", border: `1px solid ${T.border}`,
                  borderRadius: 8, padding: "12px", color: "#fff", fontSize: 15,
                  boxSizing: "border-box",
                }}
              />
              <button onClick={placeBid} disabled={placing} style={{
                width: "100%", marginTop: 10,
                background: "linear-gradient(135deg, #8b0000, #4a0080)",
                color: "#fff", border: "none", borderRadius: 10,
                padding: "14px", fontSize: 15, cursor: "pointer", fontWeight: "bold",
              }}>
                {placing ? "⏳ Submitting to Polygon..." : "🔨 Place Bid"}
              </button>
              <p style={{ color: T.muted, fontSize: 11, marginTop: 8 }}>
                70% to seller · 30% platform · Anti-snipe: +5 min if bid in last 5 min
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h3 style={{ color: T.purple, margin: "0 0 8px" }}>🔨 Live Auctions</h3>
          {MOCK_AUCTIONS.map(a => (
            <div key={a.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 36 }}>{a.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#fff", fontWeight: "bold" }}>{a.label}</div>
                  <RBadge rarity={a.rarity} />
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: T.muted, fontSize: 11 }}>Top Bid</div>
                  <div style={{ color: T.purple, fontWeight: "bold", fontSize: 18 }}>{a.highestBid} MATIC</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Countdown endMs={a.endMs} />
                <button onClick={() => setSelected(a)} style={{
                  background: "#4a0080", color: "#fff", border: "none",
                  borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: "bold",
                }}>Bid Now</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Marketplace Panel ─────────────────────────────────────────────────────────
function MarketplacePanel() {
  const [bought, setBought] = useState(new Set());
  const [filter, setFilter] = useState("all");

  const buy = (id) => setBought(prev => new Set([...prev, id]));
  const filtered = MOCK_LISTINGS.filter(l =>
    filter === "all" || l.rarity.toLowerCase() === filter
  );

  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ color: T.purple, margin: "0 0 12px" }}>🛒 Marketplace</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", "common", "rare", "epic", "legendary"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer",
            background: filter === f ? "#4a0080" : "#1a1a2e",
            border: `1px solid ${filter === f ? T.purple : "#333"}`,
            color: filter === f ? "#fff" : T.muted,
          }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(l => (
          <div key={l.id} style={{
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16,
            opacity: bought.has(l.id) ? 0.5 : 1,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 36 }}>{l.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontWeight: "bold" }}>{l.label}</div>
                <div style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>
                  {l.stock} in stock · Seller: {l.seller}
                </div>
                <div style={{ marginTop: 4 }}><RBadge rarity={l.rarity} /></div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: T.purple, fontWeight: "bold", fontSize: 20 }}>{l.price}</div>
                <div style={{ color: T.muted, fontSize: 11 }}>MATIC</div>
              </div>
            </div>
            <button
              onClick={() => buy(l.id)}
              disabled={bought.has(l.id)}
              style={{
                width: "100%", marginTop: 12,
                background: bought.has(l.id) ? "#1a2a1a" : "linear-gradient(135deg, #8b0000, #4a0080)",
                color: bought.has(l.id) ? T.green : "#fff",
                border: "none", borderRadius: 8, padding: "10px",
                cursor: bought.has(l.id) ? "default" : "pointer", fontWeight: "bold",
              }}
            >
              {bought.has(l.id) ? "✅ Purchased" : `Buy Now — ${l.price} MATIC`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Collection Panel ──────────────────────────────────────────────────────────
function CollectionPanel() {
  const [filter, setFilter] = useState("all");
  const filtered = MOCK_NFTS.filter(t => filter === "all" || t.type === filter);

  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ color: T.purple, margin: "0 0 12px" }}>🏅 My NFT Collection</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", "badge", "trophy", "emoji_set", "collectible"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer",
            background: filter === f ? "#4a0080" : "#1a1a2e",
            border: `1px solid ${filter === f ? T.purple : "#333"}`,
            color: filter === f ? "#fff" : T.muted,
          }}>{f === "all" ? "All" : f.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {filtered.map(t => (
          <div key={t.id} style={{
            background: T.card, border: `1px solid ${RARITY_C[t.rarity]}44`,
            borderRadius: 12, padding: 14, textAlign: "center",
            boxShadow: t.rarity === "Legendary" ? `0 0 12px ${RARITY_C[t.rarity]}33` : "none",
          }}>
            <div style={{ fontSize: 36 }}>{t.emoji}</div>
            <div style={{ color: "#fff", fontSize: 11, fontWeight: "bold", marginTop: 6, lineHeight: 1.3 }}>{t.label}</div>
            <div style={{ marginTop: 6 }}><RBadge rarity={t.rarity} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Deploy Panel ──────────────────────────────────────────────────────────────
function DeployPanel() {
  const steps = [
    { label: "Install dependencies",       cmd: "npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox\nnpm install @openzeppelin/contracts ethers dotenv" },
    { label: "Set environment variables",  cmd: "DEPLOYER_PRIVATE_KEY=0x...\nMUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com\nPOLYGON_RPC_URL=https://polygon-rpc.com\nPOLYGONSCAN_API_KEY=...\nNFT_BASE_URI=https://api.mistress-x.com/nft/metadata/" },
    { label: "Compile contracts",          cmd: "npx hardhat compile" },
    { label: "Deploy to Mumbai testnet",   cmd: "npx hardhat run scripts/deploy_mistress.js --network mumbai" },
    { label: "Verify on Polygonscan",      cmd: "# Auto-runs after deploy — or manually:\nnpx hardhat verify --network mumbai <CONTRACT_ADDRESS> \"https://api.mistress-x.com/nft/metadata/\"" },
    { label: "Deploy to Polygon mainnet",  cmd: "npx hardhat run scripts/deploy_mistress.js --network polygon" },
  ];

  const contracts = [
    { name: "MistressXCollectibles", file: "MistressX_NFT_Contract.sol",  desc: "ERC-1155 · Badges, Trophies, Emoji Sets, Collectibles" },
    { name: "MistressXAuction",      file: "MistressX_Auction.sol",       desc: "English auction · 70/30 split · Anti-snipe" },
    { name: "MistressXMarketplace",  file: "MistressX_Marketplace.sol",   desc: "Fixed-price P2P · EIP-2981 royalties · 3% platform fee" },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ color: T.purple, margin: "0 0 16px" }}>🚀 Deployment Guide</h3>
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ color: "#c084fc", marginBottom: 10 }}>Contracts to Deploy</h4>
        {contracts.map(c => (
          <div key={c.name} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14, marginBottom: 8 }}>
            <div style={{ color: "#fff", fontWeight: "bold" }}>{c.name}</div>
            <div style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>{c.file}</div>
            <div style={{ color: "#a78bfa", fontSize: 12, marginTop: 4 }}>{c.desc}</div>
          </div>
        ))}
      </div>
      <h4 style={{ color: "#c084fc", marginBottom: 10 }}>Deploy Steps</h4>
      {steps.map((step, i) => (
        <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{
              background: "#4a0080", color: "#fff", borderRadius: "50%",
              width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: "bold", flexShrink: 0,
            }}>{i + 1}</span>
            <span style={{ color: "#fff", fontWeight: "bold", fontSize: 13 }}>{step.label}</span>
          </div>
          <pre style={{
            background: "#111", borderRadius: 6, padding: 10, margin: 0,
            color: "#4ade80", fontSize: 11, overflowX: "auto", whiteSpace: "pre-wrap",
          }}>{step.cmd}</pre>
        </div>
      ))}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
function App() {
  const [tab, setTab] = useState("wallet");

  const tabs = [
    { id: "wallet",      label: "🔗 Wallet" },
    { id: "collection",  label: "🏅 NFTs" },
    { id: "auction",     label: "🔨 Auction" },
    { id: "marketplace", label: "🛒 Market" },
    { id: "deploy",      label: "🚀 Deploy" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: "#fff", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a0030, #0d0d1a)",
        borderBottom: `1px solid ${T.border}`, padding: "14px 20px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <span style={{ color: "#c084fc", fontWeight: "bold", fontSize: 18 }}>🔱 Mistress-X</span>
          <span style={{ color: T.muted, fontSize: 12, marginLeft: 10 }}>Web3 Suite — Phase 6</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["Polygon", "ERC-1155", "EIP-2981"].map(tag => (
            <span key={tag} style={{
              fontSize: 10, padding: "3px 8px", borderRadius: 4,
              border: `1px solid ${T.border}`, color: "#a78bfa",
            }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, background: "#0d0d1a", overflowX: "auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "12px 18px", background: "transparent", border: "none",
            borderBottom: tab === t.id ? `2px solid ${T.purple}` : "2px solid transparent",
            color: tab === t.id ? "#c084fc" : T.muted,
            cursor: "pointer", fontSize: 13, whiteSpace: "nowrap",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        {tab === "wallet"      && <WalletPanel />}
        {tab === "collection"  && <CollectionPanel />}
        {tab === "auction"     && <AuctionPanel />}
        {tab === "marketplace" && <MarketplacePanel />}
        {tab === "deploy"      && <DeployPanel />}
      </div>
    </div>
  );
}