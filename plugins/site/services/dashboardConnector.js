// dashboardConnector.js
// Simple frontend fetch wrapper to call analytics endpoints from the React dashboard
const API_BASE = process.env.REACT_APP_API_BASE || '/api/analytics';

export async function fetchDailyRevenue(start, end) {
  const res = await fetch(`${API_BASE}/daily-revenue?start=${start}&end=${end}`, { credentials: 'include' });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to load daily revenue');
  return res.json();
}

export async function fetchMonthlyRevenue(start, end, limit = 50) {
  const res = await fetch(`${API_BASE}/monthly-revenue?start=${start}&end=${end}&limit=${limit}`, { credentials: 'include' });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to load monthly revenue');
  return res.json();
}

export async function fetchCohort(weeks = 12) {
  const res = await fetch(`${API_BASE}/cohort?weeks=${weeks}`, { credentials: 'include' });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to load cohort');
  return res.json();
}

export async function fetchKPIs(since) {
  const res = await fetch(`${API_BASE}/kpis?since=${since}`, { credentials: 'include' });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to load KPIs');
  return res.json();
}

export async function triggerRefresh() {
  const res = await fetch(`${API_BASE}/refresh`, { method: 'POST', credentials: 'include' });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to trigger refresh');
  return res.json();
}
