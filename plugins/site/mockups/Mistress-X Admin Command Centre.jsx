const { useState, useEffect } = React;

const T = {
  bg: "#07070f", card: "#10101a", border: "#2a1a3e",
  accent: "#9b30ff", gold: "#f5c842", red: "#e63946",
  green: "#2ecc71", text: "#f0e6ff", muted: "#7a6a8a",
  pink: "#ff4da6", blue: "#00d4ff",
};

const s = {
  screen: { backgroundColor: T.bg, minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", color: T.text },
  card: (border = T.border) => ({ backgroundColor: T.card, border: `1px solid ${border}`, borderRadius: 12, padding: 16, marginBottom: 12 }),
  btn: (c = T.accent) => ({ backgroundColor: c, color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", cursor: "pointer", fontWeight: 700, fontSize: 13 }),
  input: { backgroundColor: "#1a1a2e", border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 12px", color: T.text, width: "100%", fontSize: 13, boxSizing: "border-box" },
  label: { fontSize: 11, color: T.muted, marginBottom: 4, display: "block" },
  row: { display: "flex", alignItems: "center", gap: 10 },
  badge: (c) => ({ display: "inline-block", backgroundColor: c + "22", color: c, border: `1px solid ${c}`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }),
  stat: (c = T.accent) => ({ backgroundColor: T.card, border: `1px solid ${c}`, borderRadius: 12, padding: "14px 16px", flex: 1, textAlign: "center" }),
};

// ── Mock Data ─────────────────────────────────────────────────────────────────
const STATS = [
  { label: "Active Users", value: "2,841", icon: "👥", color: T.blue },
  { label: "Revenue Today", value: "$4,290", icon: "💰", color: T.gold },
  { label: "Tributes", value: "318", icon: "💜", color: T.pink },
  { label: "New Subs", value: "47", icon: "🔗", color: T.green },
];

const RECENT_ACTIVITY = [
  { time: "2m ago", msg: "Mistress Vex received 500cr tribute", type: "tribute" },
  { time: "5m ago", msg: "slave_j earned 'Devoted' badge", type: "badge" },
  { time: "12m ago", msg: "Lady Noir published new blog post", type: "blog" },
  { time: "18m ago", msg: "New sub card submitted to Rolodex", type: "rolodex" },
  { time: "31m ago", msg: "Auction #44 ended — 1,200cr final bid", type: "auction" },
];

const MISTRESS_LIST = [
  { name: "Mistress Vex", tier: "Obsidian", earnings: 12400, subs: 34, status: "online" },
  { name: "Lady Noir", tier: "Diamond", earnings: 9800, subs: 28, status: "online" },
  { name: "Mistress Kira", tier: "Diamond", earnings: 8200, subs: 19, status: "away" },
  { name: "Domina Ash", tier: "Platinum", earnings: 6100, subs: 15, status: "offline" },
];

const BLOG_DRAFTS = [
  { title: "Weekly Throne Report — Top Earners", status: "draft", date: "Today" },
  { title: "New Auction Feature Announcement", status: "scheduled", date: "Tomorrow" },
  { title: "Mistress Spotlight: Lady Noir", status: "published", date: "Apr 10" },
];

const STATUS_COLOR = { online: T.green, away: T.gold, offline: T.muted };
const TIER_COLOR = { Obsidian: T.accent, Diamond: T.blue, Platinum: "#e0e0e0", Gold: T.gold };
const BLOG_COLOR = { draft: T.muted, scheduled: T.gold, published: T.green };

// ── Sections ──────────────────────────────────────────────────────────────────
function OverviewSection() {
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {STATS.map((st, i) => (
          <div key={i} style={s.stat(st.color)}>
            <div style={{ fontSize: 22 }}>{st.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: st.color }}>{st.value}</div>
            <div style={{ fontSize: 11, color: T.muted }}>{st.label}</div>
          </div>
        ))}
      </div>
      <div style={s.card()}>
        <div style={{ fontWeight: 700, marginBottom: 10, color: T.accent }}>⚡ Live Activity</div>
        {RECENT_ACTIVITY.map((a, i) => (
          <div key={i} style={{ ...s.row, padding: "7px 0", borderBottom: i < RECENT_ACTIVITY.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <div style={{ fontSize: 11, color: T.muted, minWidth: 50 }}>{a.time}</div>
            <div style={{ fontSize: 13 }}>{a.msg}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BroadcastSection() {
  const [msg, setMsg] = useState("");
  const [target, setTarget] = useState("all");
  const [sent, setSent] = useState([]);
  const [priority, setPriority] = useState("normal");

  const send = () => {
    if (!msg.trim()) return;
    setSent(prev => [{ msg, target, priority, time: new Date().toLocaleTimeString() }, ...prev]);
    setMsg("");
  };

  return (
    <div>
      <div style={s.card(T.accent)}>
        <div style={{ fontWeight: 700, color: T.accent, marginBottom: 12 }}>📢 Platform Broadcast</div>
        <label style={s.label}>Target Audience</label>
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {["all", "mistress", "sub"].map(t => (
            <button key={t} onClick={() => setTarget(t)} style={{ ...s.btn(target === t ? T.accent : "#2a1a3e"), flex: 1, textTransform: "capitalize" }}>{t === "all" ? "🌐 All" : t === "mistress" ? "👑 Mistresses" : "🔗 Subs"}</button>
          ))}
        </div>
        <label style={s.label}>Priority</label>
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {["normal", "high", "urgent"].map(p => (
            <button key={p} onClick={() => setPriority(p)} style={{ ...s.btn(priority === p ? (p === "urgent" ? T.red : p === "high" ? T.gold : T.accent) : "#2a1a3e"), flex: 1, textTransform: "capitalize" }}>{p}</button>
          ))}
        </div>
        <label style={s.label}>Message</label>
        <textarea value={msg} onChange={e => setMsg(e.target.value)} style={{ ...s.input, height: 80, resize: "vertical" }} placeholder="Type your announcement..." />
        <button onClick={send} style={{ ...s.btn(T.pink), width: "100%", marginTop: 10 }}>📣 Send Broadcast</button>
      </div>

      {sent.length > 0 && (
        <div style={s.card()}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: T.muted }}>Sent History</div>
          {sent.map((b, i) => (
            <div key={i} style={{ padding: "8px 0", borderBottom: i < sent.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <div style={{ ...s.row, marginBottom: 4 }}>
                <span style={s.badge(T.accent)}>{b.target}</span>
                <span style={s.badge(b.priority === "urgent" ? T.red : b.priority === "high" ? T.gold : T.muted)}>{b.priority}</span>
                <span style={{ fontSize: 11, color: T.muted, marginLeft: "auto" }}>{b.time}</span>
              </div>
              <div style={{ fontSize: 13 }}>{b.msg}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MistressesSection() {
  return (
    <div>
      {MISTRESS_LIST.map((m, i) => (
        <div key={i} style={s.card()}>
          <div style={s.row}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: STATUS_COLOR[m.status] }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{m.name}</div>
              <span style={s.badge(TIER_COLOR[m.tier] || T.accent)}>{m.tier}</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: T.gold, fontWeight: 800 }}>{m.earnings.toLocaleString()} cr</div>
              <div style={{ fontSize: 11, color: T.muted }}>{m.subs} subs</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            <button style={{ ...s.btn("#2a1a3e"), flex: 1, fontSize: 11 }}>👁 View Profile</button>
            <button style={{ ...s.btn("#2a1a3e"), flex: 1, fontSize: 11 }}>📩 Message</button>
            <button style={{ ...s.btn(T.red), flex: 1, fontSize: 11 }}>🚫 Suspend</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function BlogSection() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [published, setPublished] = useState(false);

  return (
    <div>
      <div style={s.card(T.gold)}>
        <div style={{ fontWeight: 700, color: T.gold, marginBottom: 12 }}>✍️ HEAD MISTRESS BLOG SPOT</div>
        <label style={s.label}>Article Title</label>
        <input style={{ ...s.input, marginBottom: 10 }} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Weekly Throne Report" />
        <label style={s.label}>Content</label>
        <textarea style={{ ...s.input, height: 100, resize: "vertical", marginBottom: 10 }} value={body} onChange={e => setBody(e.target.value)} placeholder="Write your article..." />
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...s.btn("#2a1a3e"), flex: 1 }}>💾 Save Draft</button>
          <button onClick={() => { if (title && body) setPublished(true); }} style={{ ...s.btn(T.gold), flex: 1, color: "#000" }}>🚀 Publish to Blogger</button>
        </div>
        {published && <div style={{ marginTop: 10, color: T.green, fontSize: 13, fontWeight: 700 }}>✅ Published to Google Blogger!</div>}
      </div>

      <div style={s.card()}>
        <div style={{ fontWeight: 700, marginBottom: 10, color: T.muted }}>Recent Posts</div>
        {BLOG_DRAFTS.map((b, i) => (
          <div key={i} style={{ ...s.row, padding: "8px 0", borderBottom: i < BLOG_DRAFTS.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{b.title}</div>
              <div style={{ fontSize: 11, color: T.muted }}>{b.date}</div>
            </div>
            <span style={s.badge(BLOG_COLOR[b.status])}>{b.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "broadcast", label: "Broadcast", icon: "📢" },
  { id: "mistresses", label: "Mistresses", icon: "👑" },
  { id: "blog", label: "Blog", icon: "✍️" },
];

function App() {
  const [tab, setTab] = useState("overview");

  return (
    <div style={s.screen}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #1a0a2e, #0a0a1a)`, padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 11, color: T.muted, letterSpacing: 2, textTransform: "uppercase" }}>Headmistress</div>
        <div style={{ fontSize: 20, fontWeight: 900 }}>
          <span style={{ color: T.gold }}>COMMAND</span>
          <span style={{ color: T.accent }}> CENTRE</span>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ display: "flex", backgroundColor: T.card, borderBottom: `1px solid ${T.border}` }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "10px 4px", background: "none", border: "none",
            color: tab === t.id ? T.accent : T.muted, fontSize: 10, cursor: "pointer",
            borderBottom: tab === t.id ? `2px solid ${T.accent}` : "2px solid transparent",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "16px 16px 30px" }}>
        {tab === "overview" && <OverviewSection />}
        {tab === "broadcast" && <BroadcastSection />}
        {tab === "mistresses" && <MistressesSection />}
        {tab === "blog" && <BlogSection />}
      </div>
    </div>
  );
}