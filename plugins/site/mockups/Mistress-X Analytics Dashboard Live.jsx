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

function RevenueChart({ data }) {
  return (
    <div style={{ ...card(), minHeight: 180 }}>
      <h3 style={{ margin: 0 }}>Revenue (30 days)</h3>
      <div style={{ marginTop: 12 }}><Sparkline values={data} /></div>
    </div>
  );
}

function CohortGrid({ matrix }) {
  if (!matrix) return <div>Loading cohort data...</div>;
  const cohorts = Object.keys(matrix).sort().reverse();
  return (
    <div style={{ ...card() }}>
      <h3 style={{ marginTop: 0 }}>Weekly Cohort Retention</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', color: theme.muted }}>Cohort</th>
            {[...Array(4).keys()].map(i => <th key={i} style={{ color: theme.muted }}>W{i}</th>)}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((cohort, i) => (
            <tr key={i}>
              <td style={{ padding: '8px 4px' }}>{cohort}</td>
              {[0,1,2,3].map(w => <td key={w} style={{ padding: '8px 4px', textAlign: 'center' }}>{matrix[cohort][w] || 0}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Leaderboard({ rows }) {
  if (!rows) return <div>Loading leaderboard...</div>;
  return (
    <div style={{ ...card() }}>
      <h3 style={{ marginTop: 0 }}>Top Mistresses</h3>
      <ol style={{ margin: '12px 0 0 18px' }}>
        {rows.map((r, i) => (
          <li key={i} style={{ marginBottom: 8 }}>
            <strong>{r.mistress_username || r.name}</strong> — ${r.gross || r.revenue} • {r.conversion || r.conversion_rate}% conv.
          </li>
        ))}
      </ol>
    </div>
  );
}

function App() {
  const [dailyRevenue, setDailyRevenue] = useState(null);
  const [cohortData, setCohortData] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch daily revenue for last 30 days
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 29);
        const startStr = start.toISOString().slice(0,10);
        const endStr = end.toISOString().slice(0,10);

        const dailyRes = await fetch(`/api/analytics/daily-revenue?start=${startStr}&end=${endStr}`);
        if (!dailyRes.ok) throw new Error('Failed to fetch daily revenue');
        const dailyJson = await dailyRes.json();
        const dailyValues = dailyJson.data.map(d => d.gross_revenue);
        setDailyRevenue(dailyValues);

        // Fetch monthly revenue leaderboard for last 3 months
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - 3);
        const monthStartStr = monthStart.toISOString().slice(0,10);
        const monthEndStr = endStr;
        const monthlyRes = await fetch(`/api/analytics/monthly-revenue?start=${monthStartStr}&end=${monthEndStr}&limit=10`);
        if (!monthlyRes.ok) throw new Error('Failed to fetch monthly revenue');
        const monthlyJson = await monthlyRes.json();
        setLeaderboard(monthlyJson.data);

        // Fetch cohort retention
        const cohortRes = await fetch(`/api/analytics/cohort?weeks=4`);
        if (!cohortRes.ok) throw new Error('Failed to fetch cohort data');
        const cohortJson = await cohortRes.json();
        setCohortData(cohortJson.data);

        // Fetch KPIs since 30 days ago
        const kpiRes = await fetch(`/api/analytics/kpis?since=${startStr}`);
        if (!kpiRes.ok) throw new Error('Failed to fetch KPIs');
        const kpiJson = await kpiRes.json();
        setKpis(kpiJson.data);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: 20, color: theme.text }}>Loading analytics data...</div>;
  if (error) return <div style={{ padding: 20, color: theme.danger }}>Error: {error}</div>;

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', padding: 24, color: theme.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0, color: theme.gold }}>Headmistress Analytics</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            <KPIBox title="Gross Revenue" value={`$${kpis.grossRevenue.toFixed(2)}`} change={4.2} spark={dailyRevenue.slice(-7)} />
            <KPIBox title="Active Payers" value={kpis.uniquePayers} change={1.1} spark={dailyRevenue.slice(-7)} />
            <KPIBox title="ARPU" value={`$${kpis.arpu.toFixed(2)}`} change={-0.4} spark={dailyRevenue.slice(-7)} />
          </div>

          <RevenueChart data={dailyRevenue} />
          <CohortGrid matrix={cohortData} />
        </div>
        <div>
          <Leaderboard rows={leaderboard} />
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