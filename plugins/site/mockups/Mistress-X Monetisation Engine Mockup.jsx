const { useState, useEffect } = React;

const T = {
  bg: "#0a0a0f", card: "#13131a", border: "#2a1a3e",
  accent: "#9b30ff", gold: "#f5c842", red: "#e63946",
  text: "#f0e6ff", muted: "#7a6a8a", pink: "#ff4da6",
};

const styles = {
  screen: { backgroundColor: T.bg, minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", color: T.text, padding: 20 },
  card: { backgroundColor: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, marginBottom: 16 },
  btn: (bg = T.accent) => ({ backgroundColor: bg, color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontWeight: 700 }),
  locked: { position: "relative", filter: "blur(10px)", opacity: 0.5, borderRadius: 8, overflow: "hidden" },
  lockOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    zIndex: 10, background: "rgba(0,0,0,0.6)", borderRadius: 8
  }
};

const POSTS = [
  { id: 1, type: "free", title: "Good morning servants", content: "A productive day starts with obedience.", likes: 42, comments: 5 },
  { id: 2, type: "paywalled", tier: "Diamond", title: "The Dressing Room Secret", preview: "https://placehold.co/600x400?text=LOCKED+PREVIEW", price: 50, likes: 128 },
  { id: 3, type: "ppv", price: 200, title: "Friday Discipline Session (HD)", preview: "https://placehold.co/600x400?text=PPV+TEASER", likes: 89 }
];

function CreatorView() {
  return (
    <div>
      <h3 style={{color: T.gold}}>Create New Post</h3>
      <div style={styles.card}>
        <input placeholder="Post Title" style={{width: '100%', padding: 10, marginBottom: 10, background: '#1a1a2e', border: 'none', color: '#fff'}} />
        <textarea placeholder="Write a caption..." style={{width: '100%', height: 80, padding: 10, marginBottom: 10, background: '#1a1a2e', border: 'none', color: '#fff'}} />
        <div style={{display: 'flex', gap: 10, marginBottom: 10}}>
          <select style={{background: '#1a1a2e', color: '#fff', border: 'none', padding: 5}}>
            <option>Standard (Free)</option>
            <option>Paywalled (Tier Required)</option>
            <option>Pay-Per-View</option>
          </select>
          <input placeholder="Price (Credits)" type="number" style={{background: '#1a1a2e', color: '#fff', border: 'none', padding: 5, width: 100}} />
        </div>
        <button style={styles.btn(T.pink)}>Post Content 🚀</button>
      </div>
    </div>
  );
}

function SubFeed() {
  return (
    <div>
      <h3 style={{color: T.accent}}>Mistress Vex's Feed</h3>
      {POSTS.map(post => (
        <div key={post.id} style={styles.card}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
            <span style={{fontWeight: 800}}>{post.title}</span>
            {post.type !== 'free' && <span style={{fontSize: 10, background: T.gold, color: '#000', padding: '2px 6px', borderRadius: 4, fontWeight: 900}}>{post.type.toUpperCase()}</span>}
          </div>

          {post.type === 'free' ? (
            <div style={{fontSize: 14, color: '#ccc'}}>{post.content}</div>
          ) : (
            <div style={{position: 'relative'}}>
              <div style={styles.locked}>
                <img src={post.preview} style={{width: '100%'}} />
              </div>
              <div style={styles.lockOverlay}>
                <div style={{fontSize: 40}}>🔒</div>
                <div style={{fontWeight: 700, margin: '10px 0'}}>
                  {post.type === 'paywalled' ? `${post.tier} Tier Required` : `Unlock for ${post.price} Credits`}
                </div>
                <button style={styles.btn(T.gold)}>
                  {post.type === 'paywalled' ? 'Upgrade Tier' : 'Unlock Post'}
                </button>
              </div>
            </div>
          )}

          <div style={{marginTop: 15, display: 'flex', gap: 20, fontSize: 13, color: T.muted}}>
            <span>❤️ {post.likes} Likes</span>
            <span>💬 {post.comments || 0} Comments</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function App() {
  const [view, setView] = useState("feed");
  return (
    <div style={styles.screen}>
      <div style={{display: 'flex', gap: 10, marginBottom: 20}}>
        <button onClick={() => setView("feed")} style={styles.btn(view === "feed" ? T.accent : T.card)}>Follower Feed</button>
        <button onClick={() => setView("editor")} style={styles.btn(view === "editor" ? T.accent : T.card)}>Creator Editor</button>
      </div>
      {view === "feed" ? <SubFeed /> : <CreatorView />}
    </div>
  );
}