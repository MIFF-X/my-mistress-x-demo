import { CreatorGrowthCampaign, CreatorGrowthCampaignAnalytics } from '../../api/creatorGrowthApi';

export type CreatorGrowthAnalyticsCsvInput = {
  campaigns: CreatorGrowthCampaign[];
  analyticsByCampaign: Record<string, CreatorGrowthCampaignAnalytics>;
  filteredCampaignIds?: string[];
  datePresetLabel?: string;
  searchText?: string;
};

function escapeCsv(value: unknown) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function formatPercent(value?: number) {
  if (typeof value !== 'number') return '0%';
  return `${Math.round(value * 100)}%`;
}

function serializeRecord(record?: Record<string, number> | Partial<Record<string, number>>) {
  if (!record) return '';
  return Object.entries(record)
    .map(([key, value]) => `${key}:${value}`)
    .join(' | ');
}

export function buildCreatorGrowthAnalyticsCsv({
  campaigns,
  analyticsByCampaign,
  filteredCampaignIds,
  datePresetLabel = 'All',
  searchText = '',
}: CreatorGrowthAnalyticsCsvInput) {
  const visibleCampaignIds = new Set(filteredCampaignIds || campaigns.map((campaign) => campaign.id));
  const visibleCampaigns = campaigns.filter((campaign) => visibleCampaignIds.has(campaign.id));

  const headers = [
    'campaignId',
    'campaignName',
    'destinationType',
    'destinationLabel',
    'trafficSource',
    'ctaText',
    'publicUrl',
    'datePreset',
    'searchText',
    'totalEvents',
    'clickLikeEvents',
    'conversionEvents',
    'conversionRate',
    'byEventType',
    'bySource',
    'latestEventAt',
    'analyticsLoaded',
    'productionReady',
    'createdAt',
  ];

  const rows = visibleCampaigns.map((campaign) => {
    const analytics = analyticsByCampaign[campaign.id];

    return [
      campaign.id,
      campaign.name,
      campaign.destinationType,
      campaign.destinationLabel,
      campaign.trafficSource,
      campaign.ctaText,
      campaign.publicUrl,
      datePresetLabel,
      searchText,
      analytics?.totalEvents ?? 0,
      analytics?.clickLikeEvents ?? 0,
      analytics?.conversionEvents ?? 0,
      formatPercent(analytics?.conversionRate),
      serializeRecord(analytics?.byEventType),
      serializeRecord(analytics?.bySource),
      analytics?.latestEventAt || '',
      analytics ? 'yes' : 'no',
      analytics?.productionReady ? 'yes' : 'no',
      campaign.createdAt,
    ];
  });

  return [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(','))
    .join('\n');
}
