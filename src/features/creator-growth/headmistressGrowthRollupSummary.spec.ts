import { CreatorGrowthPlatformAnalyticsRollup } from '../../api/creatorGrowthApi';
import { buildHeadmistressGrowthRollupSummary } from './headmistressGrowthRollupSummary';

describe('buildHeadmistressGrowthRollupSummary', () => {
  it('returns a helpful empty-state summary when no rollup is loaded', () => {
    const summary = buildHeadmistressGrowthRollupSummary({ rollup: null });

    expect(summary).toContain('Headmistress Growth Rollup Summary');
    expect(summary).toContain('No platform rollup has been loaded yet.');
    expect(summary).toContain('Open the Platform Growth Rollup screen and load analytics first.');
  });

  it('builds a plain-text platform rollup summary with overview, top lists and draft note', () => {
    const rollup: CreatorGrowthPlatformAnalyticsRollup = {
      totalCreators: 3,
      totalCampaigns: 5,
      activeCampaigns: 4,
      archivedCampaigns: 1,
      totalEvents: 24,
      clickLikeEvents: 12,
      conversionEvents: 6,
      conversionRate: 0.5,
      byEventType: { click: 8, subscribe: 6 },
      bySource: { instagram: 15, direct: 9 },
      byDestinationType: { SUBSCRIPTION_TIER: 3, LIVE_ROOM: 1 },
      topSources: [
        { label: 'instagram', count: 15 },
        { label: 'direct', count: 9 },
      ],
      topEventTypes: [
        { label: 'click', count: 8 },
        { label: 'subscribe', count: 6 },
      ],
      topDestinationTypes: [
        { label: 'SUBSCRIPTION_TIER', count: 3 },
        { label: 'LIVE_ROOM', count: 1 },
      ],
      topCampaigns: [
        {
          campaignId: 'growth_1',
          campaignName: 'VIP Tier Push',
          creatorUserId: 'creator-1',
          destinationType: 'SUBSCRIPTION_TIER',
          trafficSource: 'instagram',
          totalEvents: 15,
        },
      ],
      latestEventAt: '2026-05-15T10:00:00.000Z',
      productionReady: false,
      note: 'Draft platform analytics.',
    };

    const summary = buildHeadmistressGrowthRollupSummary({ rollup });

    expect(summary).toContain('Headmistress Growth Rollup Summary');
    expect(summary).toContain('Creators: 3');
    expect(summary).toContain('Campaigns: 5');
    expect(summary).toContain('Active campaigns: 4');
    expect(summary).toContain('Archived campaigns: 1');
    expect(summary).toContain('Events: 24');
    expect(summary).toContain('Click-like events: 12');
    expect(summary).toContain('Conversions: 6');
    expect(summary).toContain('Conversion rate: 50%');
    expect(summary).toContain('Latest event: 2026-05-15T10:00:00.000Z');
    expect(summary).toContain('1. instagram: 15');
    expect(summary).toContain('1. click: 8');
    expect(summary).toContain('1. SUBSCRIPTION_TIER: 3');
    expect(summary).toContain('1. VIP Tier Push: 15 events (SUBSCRIPTION_TIER, instagram)');
    expect(summary).toContain('draft platform analytics are based on in-memory campaign events');
  });
});
