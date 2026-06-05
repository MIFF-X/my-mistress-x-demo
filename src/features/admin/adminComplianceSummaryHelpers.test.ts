import type { AdminComplianceOverview } from '../../api/adminCommandApi';
import {
  adminComplianceSummaryCards,
  buildAdminComplianceSummary,
} from './adminComplianceSummaryHelpers';

function makeCompliance(overrides: Partial<AdminComplianceOverview> = {}): AdminComplianceOverview {
  return {
    counts: {
      moderationOpen: 0,
      moderationEscalated: 0,
      bannedUsers: 0,
      suspendedUsers: 0,
      ...overrides.counts,
    },
    recentAuditLogs: overrides.recentAuditLogs || [],
  };
}

describe('adminComplianceSummaryHelpers', () => {
  it('returns a clear posture when no active counts or audit rows are loaded', () => {
    const summary = buildAdminComplianceSummary(makeCompliance());

    expect(summary).toMatchObject({
      actionLabel: 'No active compliance action',
      riskLabel: 'Clear',
      riskLevel: 'clear',
      riskScore: 0,
      riskTone: '#1D9E75',
    });
  });

  it('escalates when escalated moderation or banned users are present', () => {
    const summary = buildAdminComplianceSummary(makeCompliance({
      counts: {
        moderationOpen: 2,
        moderationEscalated: 1,
        bannedUsers: 1,
        suspendedUsers: 3,
      },
    }));

    expect(summary).toMatchObject({
      actionLabel: 'Assign owner review',
      restrictedUsers: 4,
      riskLabel: 'Escalation needed',
      riskLevel: 'escalation',
      riskScore: 10,
      riskTone: '#ff6b6b',
    });
  });

  it('marks attention when open reports or suspended users need triage', () => {
    const summary = buildAdminComplianceSummary(makeCompliance({
      counts: {
        moderationOpen: 3,
        moderationEscalated: 0,
        bannedUsers: 0,
        suspendedUsers: 1,
      },
    }));

    expect(summary).toMatchObject({
      actionLabel: 'Review open queue',
      riskLabel: 'Attention needed',
      riskLevel: 'attention',
      riskScore: 4,
      riskTone: '#ff9abf',
    });
  });

  it('watches recent audit rows and exposes the newest audit timestamp', () => {
    const summary = buildAdminComplianceSummary(makeCompliance({
      recentAuditLogs: [
        { id: 'audit_1', action: 'first', createdAt: '2026-05-30T10:00:00.000Z' },
        { id: 'audit_2', action: 'latest', createdAt: '2026-05-31T12:00:00.000Z' },
      ],
    }));

    expect(summary).toMatchObject({
      actionLabel: 'Monitor recent actions',
      auditLogCount: 2,
      latestAuditAt: '2026-05-31T12:00:00.000Z',
      riskLabel: 'Watching audit trail',
      riskLevel: 'watch',
    });
  });

  it('builds dashboard cards from the shared summary', () => {
    const cards = adminComplianceSummaryCards(buildAdminComplianceSummary(makeCompliance({
      counts: {
        moderationOpen: 2,
        moderationEscalated: 1,
        bannedUsers: 0,
        suspendedUsers: 1,
      },
      recentAuditLogs: [
        { id: 'audit_1', action: 'review', createdAt: '2026-05-31T12:00:00.000Z' },
      ],
    })));

    expect(cards.map((card) => ({ label: card.label, value: card.value, tone: card.tone }))).toEqual([
      { label: 'Open reports', value: '2', tone: '#ff9abf' },
      { label: 'Risk score', value: '6', tone: '#ff6b6b' },
      { label: 'Restricted users', value: '1', tone: '#ff6b6b' },
      { label: 'Recent audits', value: '1', tone: '#d4af37' },
    ]);
  });
});
