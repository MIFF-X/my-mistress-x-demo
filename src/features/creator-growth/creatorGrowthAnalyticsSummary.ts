import { CreatorGrowthCampaign, CreatorGrowthCampaignAnalytics } from '../../api/creatorGrowthApi';

export type CreatorGrowthAnalyticsSummaryInput = {
  campaigns: CreatorGrowthCampaign[];
  analyticsByCampaign: Record<string, CreatorGrowthCampaignAnalytics>;
  filteredCampaignIds?: string[];
  datePresetLabel?: string;
  searchText?: string;
  topSources?: [string, number][];
  topEventTypes?: [string, number][];
};

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function safeText(value?: string | null) {
  const text = (value || '').trim();
  return text || 'none';
}

export function buildCreatorGrowthAnalyticsSummary({
  campaigns,
  analyticsByCampaign,
  filteredCampaignIds,
  datePresetLabel = 'All',
  searchText = '',
  topSources = [],
  topEventTypes = [],
}: CreatorGrowthAnalyticsSummaryInput) {
  const visibleCampaignIds = new Set(filteredCampaignIds || campaigns.map((campaign) => campaign.id));
  const visibleCampaigns = campaigns.filter((campaign) => visibleCampaignIds.has(campaign.id));
  const visibleAnalytics = Object.values(analyticsByCampaign).filter((analytics) => visibleCampaignIds.has(analytics.campaignId));

  const totalEvents = visibleAnalytics.reduce((sum, analytics) => sum + analytics.totalEvents, 0);
  const clickLikeEvents = visibleAnalytics.reduce((sum, analytics) => sum + analytics.clickLikeEvents, 0);
  const conversionEvents = visibleAnalytics.reduce((sum, analytics) => sum + analytics.conversionEvents, 0);
  const conversionRate = clickLikeEvents > 0 ? conversionEvents / clickLikeEvents : 0;

  const bestCampaign = [...visibleAnalytics].sort((a, b) => b.totalEvents - a.totalEvents)[0];
  const bestRate = [...visibleAnalytics].sort((a, b) => b.conversionRate - a.conversionRate)[0];
  const topSource = topSources[0];
  const topEventType = topEventTypes[0];

  const filterLines = [
    `Date preset: ${datePresetLabel}`,
    `Search: ${safeText(searchText)}`,
    `Campaigns shown: ${visibleCampaigns.length} of ${campaigns.length}`,
  ];

  const metricLines = [
    `Events: ${totalEvents}`,
    `Click-like events: ${clickLikeEvents}`,
    `Conversions: ${conversionEvents}`,
    `Conversion rate: ${formatPercent(conversionRate)}`,
  ];

  const insightLines = [
    `Top campaign by events: ${bestCampaign ? `${bestCampaign.campaignName} (${bestCampaign.totalEvents})` : 'not loaded yet'}`,
    `Strongest conversion rate: ${bestRate ? `${bestRate.campaignName} (${formatPercent(bestRate.conversionRate)})` : 'not loaded yet'}`,
    `Top source: ${topSource ? `${topSource[0]} (${topSource[1]})` : 'not loaded yet'}`,
    `Top event type: ${topEventType ? `${topEventType[0]} (${topEventType[1]})` : 'not loaded yet'}`,
  ];

  return [
    'Creator Growth Analytics Summary',
    '',
    'Filters',
    ...filterLines,
    '',
    'Totals',
    ...metricLines,
    '',
    'Insights',
    ...insightLines,
    '',
    'Note: draft analytics are based on currently loaded in-memory campaign events until Prisma-backed aggregation is wired.',
  ].join('\n');
}
