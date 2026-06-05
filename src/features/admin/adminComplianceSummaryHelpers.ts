import type { AdminComplianceOverview } from '../../api/adminCommandApi';

export type AdminComplianceRiskLevel = 'clear' | 'watch' | 'attention' | 'escalation';

export type AdminComplianceSummary = {
  actionDetail: string;
  actionLabel: string;
  auditLogCount: number;
  bannedUsers: number;
  escalatedModeration: number;
  latestAuditAt: string | null;
  openModeration: number;
  restrictedUsers: number;
  riskLabel: string;
  riskLevel: AdminComplianceRiskLevel;
  riskScore: number;
  riskTone: string;
  suspendedUsers: number;
};

const TONES: Record<AdminComplianceRiskLevel, string> = {
  clear: '#1D9E75',
  watch: '#d4af37',
  attention: '#ff9abf',
  escalation: '#ff6b6b',
};

function countOf(value: number | undefined | null) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function latestAuditAt(logs: AdminComplianceOverview['recentAuditLogs']) {
  return logs.reduce<string | null>((latest, log) => {
    const createdAt = new Date(log.createdAt).getTime();
    if (!Number.isFinite(createdAt)) return latest;

    const latestTime = latest ? new Date(latest).getTime() : 0;
    return createdAt > latestTime ? new Date(createdAt).toISOString() : latest;
  }, null);
}

export function buildAdminComplianceSummary(
  compliance?: AdminComplianceOverview | null,
  fallbackOpenModeration = 0,
): AdminComplianceSummary {
  const openModeration = countOf(compliance?.counts.moderationOpen ?? fallbackOpenModeration);
  const escalatedModeration = countOf(compliance?.counts.moderationEscalated);
  const bannedUsers = countOf(compliance?.counts.bannedUsers);
  const suspendedUsers = countOf(compliance?.counts.suspendedUsers);
  const restrictedUsers = bannedUsers + suspendedUsers;
  const auditLogCount = compliance?.recentAuditLogs.length ?? 0;
  const riskScore = openModeration + escalatedModeration * 3 + bannedUsers * 2 + suspendedUsers;

  let riskLevel: AdminComplianceRiskLevel = 'clear';
  let riskLabel = 'Clear';
  let actionLabel = 'No active compliance action';
  let actionDetail = 'Keep monitoring the audit trail and refresh before owner decisions.';

  if (escalatedModeration > 0 || bannedUsers > 0) {
    riskLevel = 'escalation';
    riskLabel = 'Escalation needed';
    actionLabel = 'Assign owner review';
    actionDetail = 'Escalated reports or banned accounts are loaded and need a named owner before closure.';
  } else if (openModeration > 0 || suspendedUsers > 0) {
    riskLevel = 'attention';
    riskLabel = 'Attention needed';
    actionLabel = 'Review open queue';
    actionDetail = 'Open reports or restricted accounts should be triaged from the moderation and access panels.';
  } else if (auditLogCount > 0) {
    riskLevel = 'watch';
    riskLabel = 'Watching audit trail';
    actionLabel = 'Monitor recent actions';
    actionDetail = 'Recent compliance actions are loaded; verify no follow-up owner task is missing.';
  }

  return {
    actionDetail,
    actionLabel,
    auditLogCount,
    bannedUsers,
    escalatedModeration,
    latestAuditAt: latestAuditAt(compliance?.recentAuditLogs ?? []),
    openModeration,
    restrictedUsers,
    riskLabel,
    riskLevel,
    riskScore,
    riskTone: TONES[riskLevel],
    suspendedUsers,
  };
}

export function adminComplianceSummaryCards(summary: AdminComplianceSummary) {
  return [
    {
      hint: `${summary.escalatedModeration} escalated`,
      label: 'Open reports',
      tone: summary.openModeration ? '#ff9abf' : '#1D9E75',
      value: String(summary.openModeration),
    },
    {
      hint: summary.actionLabel,
      label: 'Risk score',
      tone: summary.riskTone,
      value: String(summary.riskScore),
    },
    {
      hint: `${summary.bannedUsers} banned / ${summary.suspendedUsers} suspended`,
      label: 'Restricted users',
      tone: summary.restrictedUsers ? '#ff6b6b' : '#1D9E75',
      value: String(summary.restrictedUsers),
    },
    {
      hint: summary.latestAuditAt ? `Latest ${new Date(summary.latestAuditAt).toLocaleString()}` : 'No loaded audit rows',
      label: 'Recent audits',
      tone: summary.auditLogCount ? '#d4af37' : '#1D9E75',
      value: String(summary.auditLogCount),
    },
  ];
}
