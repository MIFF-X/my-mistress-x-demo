const { useState, useEffect } = React;

const theme = { bg: '#071028', panel: '#0f1724', accent: '#8b5cf6', gold: '#f6c84c', text: '#e6eef8', muted: '#93a3bf' };

const card = (children) => ({ background: theme.panel, borderRadius: 12, padding: 16, marginBottom: 16 });

function Sparkline({ values = [] }) {
  const max = Math.max(...values, 1);
  return (
    <svg viewBox="0 0 100 30" style={{ width: '100%', height: 40 }}>
      <polyline
        fill="none"
        stroke={theme.accent}
        strokeWidth={2}
        points={values.map((v,i) => `${(i/(values.length-1||1))*100},${30 - (v/max*28)}`).join(' ')}
      />
    </svg>
  );
}

function KPIBox({ title, value, change, spark }) {
  return (
    <div style={{ ...card(), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ color: theme.muted, fontSize: 12 }}>{title}</div>
        <div style={{ fontSize: 24, fontWeight: 800 }}>{value}</div>
        {typeof change !== 'undefined' && <div style={{ color: change >= 0 ? '#2ecc71' : '#ff6b6b' }}>{change >=0 ? '+' : ''}{change}%</div>}
      </div>
      <div style={{ width: 160 }}><Sparkline values={spark} /></div>
    </div>
  );
}

function RevenueChart() {
  const [data] = useState([120,140,160,200,220,210,240,260,310,300]);
  return (
    <div style={{ ...card(), minHeight: 180 }}>
      <h3 style={{ margin: 0 }}>Revenue (30 days)</h3>
      <div style={{ marginTop: 12 }}><Sparkline values={data} /></div>
    </div>
  );
}

function CohortGrid() {
  const [matrix] = useState([
    [100, 60, 45, 30],
    [90, 55, 40, 25],
    [120, 80, 50, 32]
  ]);
  return (
    <div style={{ ...card() }}>
      <h3 style={{ marginTop: 0 }}>Weekly Cohort Retention</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', color: theme.muted }}>Cohort</th>
            <th style={{ color: theme.muted }}>W0</th>
            <th style={{ color: theme.muted }}>W1</th>
            <th style={{ color: theme.muted }}>W2</th>
            <th style={{ color: theme.muted }}>W3</th>
          </tr>
        </thead>
        <tbody>
          {matrix.map((r, i) => (
            <tr key={i}>
              <td style={{ padding: '8px 4px' }}>Week {-i}</td>
              {r.map((v, j) => <td key={j} style={{ padding: '8px 4px', textAlign: 'center' }}>{v}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Leaderboard() {
  const [rows] = useState([
    { name: 'Mistress Vex', revenue: 3200, conversion: 12.4 },
    { name: 'Lady Nyx', revenue: 2400, conversion: 9.2 },
    { name: 'Madam Rouge', revenue: 1800, conversion: 7.1 }
  ]);
  return (
    <div style={{ ...card() }}>
      <h3 style={{ marginTop: 0 }}>Top Mistresses</h3>
      <ol style={{ margin: '12px 0 0 18px' }}>
        {rows.map((r, i) => (
          <li key={i} style={{ marginBottom: 8 }}>
            <strong>{r.name}</strong> — ${r.revenue} • {r.conversion}% conv.
          </li>
        ))}
      </ol>
    </div>
  );
}

function App() {
  return (
    <div style={{ background: theme.bg, minHeight: '100vh', padding: 24, color: theme.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0, color: theme.gold }}>Headmistress Analytics</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            <KPIBox title="Gross Revenue" value="$24,320" change={4.2} spark={[10,12,13,14,16,18,20]} />
            <KPIBox title="Active Payers" value="1,234" change={1.1} spark={[5,6,7,9,8,10,11]} />
            <KPIBox title="ARPU" value="$8.23" change={-0.4} spark={[2,2.1,2.2,2,1.9,2.3,2.4]} />
          </div>

          <RevenueChart />
          <CohortGrid />
        </div>
        <div>
          <Leaderboard />
          <div style={{ ...card(), textAlign: 'center' }}>
            <h3 style={{ marginTop: 0 }}>Alerts</h3>
            <div style={{ color: '#ffd3a5' }}>No high-severity anomalies detected.</div>
            <button style={{ marginTop: 12, background: theme.accent, color: '#fff', padding: '10px 14px', borderRadius: 8, border: 'none' }}>Export CSV</button>
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));