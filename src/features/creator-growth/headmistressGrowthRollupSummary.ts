import { CreatorGrowthPlatformAnalyticsRollup } from '../../api/creatorGrowthApi';

export type HeadmistressGrowthRollupSummaryInput = {
  rollup: CreatorGrowthPlatformAnalyticsRollup | null;
};

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatTopEntries(entries: Array<{ label: string; count: number }>) {
  if (!entries.length) return ['none loaded'];
  return entries.slice(0, 5).map((entry, index) => `${index + 1}. ${entry.label}: ${entry.count}`);
}

export function buildHeadmistressGrowthRollupSummary({ rollup }: HeadmistressGrowthRollupSummaryInput) {
  if (!rollup) {
    return [
      'Headmistress Growth Rollup Summary',
      '',
      'No platform rollup has been loaded yet.',
      'Open the Platform Growth Rollup screen and load analytics first.',
    ].join('\n');
  }

  const overviewLines = [
    `Creators: ${rollup.totalCreators}`,
    `Campaigns: ${rollup.totalCampaigns}`,
    `Active campaigns: ${rollup.activeCampaigns}`,
    `Archived campaigns: ${rollup.archivedCampaigns}`,
    `Events: ${rollup.totalEvents}`,
    `Click-like events: ${rollup.clickLikeEvents}`,
    `Conversions: ${rollup.conversionEvents}`,
    `Conversion rate: ${formatPercent(rollup.conversionRate)}`,
    `Latest event: ${rollup.latestEventAt || 'none loaded'}`,
  ];

  const topCampaignLines = rollup.topCampaigns.length
    ? rollup.topCampaigns.slice(0, 5).map((campaign, index) => (
        `${index + 1}. ${campaign.campaignName}: ${campaign.totalEvents} events (${campaign.destinationType}, ${campaign.trafficSource})`
      ))
    : ['none loaded'];

  return [
    'Headmistress Growth Rollup Summary',
    '',
    'Overview',
    ...overviewLines,
    '',
    'Top Sources',
    ...formatTopEntries(rollup.topSources),
    '',
    'Top Event Types',
    ...formatTopEntries(rollup.topEventTypes),
    '',
    'Top Destinations',
    ...formatTopEntries(rollup.topDestinationTypes),
    '',
    'Top Campaigns',
    ...topCampaignLines,
    '',
    'Note: draft platform analytics are based on in-memory campaign events until Prisma-backed aggregation is wired.',
  ].join('\n');
}
