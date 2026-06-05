import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, Text, TextInput, View, type DimensionValue } from 'react-native';
import {
  CreatorGrowthCampaign,
  CreatorGrowthCampaignAnalytics,
  getCreatorGrowthCampaignAnalytics,
  listMyCreatorGrowthCampaigns,
} from '../../api/creatorGrowthApi';
import { buildCreatorGrowthAnalyticsCsv } from './creatorGrowthAnalyticsCsv';
import { buildCreatorGrowthAnalyticsSummary } from './creatorGrowthAnalyticsSummary';

type AnalyticsSortMode = 'newest' | 'events' | 'conversions' | 'rate';
type AnalyticsDatePreset = 'all' | '7d' | '30d' | '90d';
type SuggestedAction = {
  title: string;
  body: string;
  priority: 'setup' | 'growth' | 'conversion' | 'scale';
};

const DATE_PRESET_LABELS: Record<AnalyticsDatePreset, string> = {
  all: 'All',
  '7d': '7 days',
  '30d': '30 days',
  '90d': '90 days',
};

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatType(type: string) {
  return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function sortEntries(record: Record<string, number>) {
  return Object.entries(record).sort(([, a], [, b]) => b - a);
}

function campaignMatchesSearch(campaign: CreatorGrowthCampaign, search: string) {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  return [
    campaign.name,
    campaign.destinationType,
    campaign.destinationLabel,
    campaign.trafficSource,
    campaign.ctaText,
    campaign.publicUrl,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(query));
}

function campaignMatchesDatePreset(campaign: CreatorGrowthCampaign, preset: AnalyticsDatePreset) {
  if (preset === 'all') return true;

  const createdAt = new Date(campaign.createdAt || '').getTime();
  if (!createdAt) return false;

  const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 90;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  return createdAt >= cutoff;
}

function MetricTile({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <View style={{ backgroundColor: '#111', borderRadius: 14, borderWidth: 1, borderColor: '#252525', padding: 12, flex: 1, minWidth: 140 }}>
      <Text style={{ color: '#888', fontSize: 11, fontWeight: '800' }}>{label}</Text>
      <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 4 }}>{value}</Text>
      {note ? <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>{note}</Text> : null}
    </View>
  );
}

function InsightTile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <View style={{ backgroundColor: '#080808', borderRadius: 14, borderWidth: 1, borderColor: '#2a2a2a', padding: 12, flex: 1, minWidth: 180 }}>
      <Text style={{ color: '#d4af37', fontSize: 11, fontWeight: '900' }}>{label}</Text>
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 5 }}>{value}</Text>
      {note ? <Text style={{ color: '#888', fontSize: 11, marginTop: 4 }}>{note}</Text> : null}
    </View>
  );
}

function SuggestedActionTile({ action }: { action: SuggestedAction }) {
  const label = action.priority.toUpperCase();

  return (
    <View style={{ backgroundColor: '#080808', borderRadius: 14, borderWidth: 1, borderColor: '#2a2a2a', padding: 12, gap: 6, flex: 1, minWidth: 220 }}>
      <Text style={{ color: '#d4af37', fontSize: 11, fontWeight: '900' }}>{label}</Text>
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>{action.title}</Text>
      <Text style={{ color: '#aaa', fontSize: 12, lineHeight: 18 }}>{action.body}</Text>
    </View>
  );
}

function SortChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: active ? '#d4af37' : '#111',
        borderColor: active ? '#d4af37' : '#333',
        borderWidth: 1,
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 12,
      }}
    >
      <Text style={{ color: active ? '#000' : '#fff', fontWeight: '900', fontSize: 12 }}>{label}</Text>
    </Pressable>
  );
}

function RollupPanel({ title, items, emptyLabel }: { title: string; items: [string, number][]; emptyLabel: string }) {
  const maxValue = Math.max(...items.map(([, value]) => value), 1);

  return (
    <View style={{ backgroundColor: '#0f0f0f', borderRadius: 18, borderWidth: 1, borderColor: '#222', padding: 14, gap: 10, flex: 1, minWidth: 240 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{title}</Text>
      {items.length > 0 ? (
        items.map(([label, value], index) => {
          const widthPercent = `${Math.max(8, Math.round((value / maxValue) * 100))}%` as DimensionValue;

          return (
            <View key={label} style={{ backgroundColor: '#080808', borderRadius: 12, padding: 10, gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <Text style={{ color: index === 0 ? '#d4af37' : '#aaa', fontWeight: '800', flex: 1 }}>{label}</Text>
                <Text style={{ color: '#fff', fontWeight: '900' }}>{value}</Text>
              </View>
              <View style={{ height: 7, backgroundColor: '#191919', borderRadius: 999, overflow: 'hidden' }}>
                <View style={{ width: widthPercent, height: 7, backgroundColor: index === 0 ? '#d4af37' : '#444', borderRadius: 999 }} />
              </View>
            </View>
          );
        })
      ) : (
        <Text style={{ color: '#888' }}>{emptyLabel}</Text>
      )}
    </View>
  );
}

function AnalyticsCard({
  campaign,
  analytics,
  onLoad,
  loading,
}: {
  campaign: CreatorGrowthCampaign;
  analytics?: CreatorGrowthCampaignAnalytics;
  onLoad: () => void;
  loading: boolean;
}) {
  return (
    <View style={{ backgroundColor: '#0f0f0f', borderRadius: 18, borderWidth: 1, borderColor: '#222', padding: 14, gap: 10 }}>
      <View>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{campaign.name}</Text>
        <Text style={{ color: '#d4af37', fontSize: 12, marginTop: 3 }}>{formatType(campaign.destinationType)} · {campaign.trafficSource}</Text>
      </View>

      {analytics ? (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <MetricTile label="Events" value={analytics.totalEvents} />
            <MetricTile label="Click-like" value={analytics.clickLikeEvents} />
            <MetricTile label="Conversions" value={analytics.conversionEvents} />
            <MetricTile label="Rate" value={formatPercent(analytics.conversionRate)} />
          </View>

          <View style={{ backgroundColor: '#080808', borderRadius: 14, padding: 12, gap: 6 }}>
            <Text style={{ color: '#d4af37', fontWeight: '900' }}>Breakdown</Text>
            <Text style={{ color: '#aaa', fontSize: 12 }}>
              By event: {Object.entries(analytics.byEventType || {}).map(([key, value]) => `${key} ${value}`).join(' · ') || 'No events yet'}
            </Text>
            <Text style={{ color: '#aaa', fontSize: 12 }}>
              By source: {Object.entries(analytics.bySource || {}).map(([key, value]) => `${key} ${value}`).join(' · ') || 'No sources yet'}
            </Text>
            {analytics.latestEventAt ? <Text style={{ color: '#777', fontSize: 11 }}>Latest event: {analytics.latestEventAt}</Text> : null}
          </View>

          {!analytics.productionReady ? (
            <Text style={{ color: '#ffb020', fontSize: 11 }}>
              Draft analytics: calculated from in-memory events until Prisma aggregation is wired.
            </Text>
          ) : null}
        </>
      ) : (
        <Text style={{ color: '#888' }}>Analytics not loaded for this campaign yet.</Text>
      )}

      <Pressable
        onPress={onLoad}
        disabled={loading}
        style={{ backgroundColor: loading ? '#333' : '#d4af37', borderRadius: 999, paddingVertical: 10, alignItems: 'center' }}
      >
        <Text style={{ color: loading ? '#777' : '#000', fontWeight: '900' }}>{loading ? 'Loading...' : analytics ? 'Refresh Analytics' : 'Load Analytics'}</Text>
      </Pressable>
    </View>
  );
}

export function CreatorGrowthAnalyticsDashboard() {
  const [campaigns, setCampaigns] = useState<CreatorGrowthCampaign[]>([]);
  const [analyticsByCampaign, setAnalyticsByCampaign] = useState<Record<string, CreatorGrowthCampaignAnalytics>>({});
  const [sortMode, setSortMode] = useState<AnalyticsSortMode>('newest');
  const [datePreset, setDatePreset] = useState<AnalyticsDatePreset>('all');
  const [searchText, setSearchText] = useState('');
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [loadingAnalyticsId, setLoadingAnalyticsId] = useState<string | null>(null);
  const [sharingSummary, setSharingSummary] = useState(false);
  const [sharingCsv, setSharingCsv] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaignMatchesDatePreset(campaign, datePreset) && campaignMatchesSearch(campaign, searchText)),
    [campaigns, datePreset, searchText],
  );

  const totals = useMemo(() => {
    const filteredCampaignIds = new Set(filteredCampaigns.map((campaign) => campaign.id));
    const analytics = Object.values(analyticsByCampaign).filter((item) => filteredCampaignIds.has(item.campaignId));
    const bySource: Record<string, number> = {};
    const byEventType: Record<string, number> = {};

    const totalEvents = analytics.reduce((sum, item) => {
      Object.entries(item.bySource || {}).forEach(([key, value]) => {
        bySource[key] = (bySource[key] || 0) + value;
      });
      Object.entries(item.byEventType || {}).forEach(([key, value]) => {
        byEventType[key] = (byEventType[key] || 0) + value;
      });
      return sum + item.totalEvents;
    }, 0);
    const totalClicks = analytics.reduce((sum, item) => sum + item.clickLikeEvents, 0);
    const totalConversions = analytics.reduce((sum, item) => sum + item.conversionEvents, 0);
    const conversionRate = totalClicks > 0 ? totalConversions / totalClicks : 0;

    return {
      totalEvents,
      totalClicks,
      totalConversions,
      conversionRate,
      loadedCampaigns: analytics.length,
      topSources: sortEntries(bySource),
      topEventTypes: sortEntries(byEventType),
    };
  }, [analyticsByCampaign, filteredCampaigns]);

  const insights = useMemo(() => {
    const filteredCampaignIds = new Set(filteredCampaigns.map((campaign) => campaign.id));
    const loadedAnalytics = Object.values(analyticsByCampaign).filter((item) => filteredCampaignIds.has(item.campaignId));
    const campaignById = new Map(filteredCampaigns.map((campaign) => [campaign.id, campaign]));
    const bestByEvents = [...loadedAnalytics].sort((a, b) => b.totalEvents - a.totalEvents)[0];
    const bestByRate = [...loadedAnalytics].sort((a, b) => b.conversionRate - a.conversionRate)[0];
    const topSource = totals.topSources[0];
    const topEventType = totals.topEventTypes[0];

    return {
      bestCampaignName: bestByEvents ? campaignById.get(bestByEvents.campaignId)?.name || bestByEvents.campaignName : 'Load analytics first',
      bestCampaignNote: bestByEvents ? `${bestByEvents.totalEvents} events` : 'No campaign analytics loaded yet',
      bestRateName: bestByRate ? campaignById.get(bestByRate.campaignId)?.name || bestByRate.campaignName : 'Load analytics first',
      bestRateNote: bestByRate ? `${formatPercent(bestByRate.conversionRate)} conversion rate` : 'No rate data loaded yet',
      topSourceName: topSource?.[0] || 'Load analytics first',
      topSourceNote: topSource ? `${topSource[1]} events` : 'No source data loaded yet',
      topEventName: topEventType?.[0] || 'Load analytics first',
      topEventNote: topEventType ? `${topEventType[1]} events` : 'No event data loaded yet',
    };
  }, [analyticsByCampaign, filteredCampaigns, totals.topEventTypes, totals.topSources]);

  const suggestedActions = useMemo<SuggestedAction[]>(() => {
    if (campaigns.length === 0) {
      return [
        {
          title: 'Create your first growth campaign',
          body: 'Start with a profile, subscription, or link-in-bio campaign so the analytics dashboard has something to measure.',
          priority: 'setup',
        },
      ];
    }

    if (totals.loadedCampaigns === 0) {
      return [
        {
          title: 'Load analytics for your filtered campaigns',
          body: 'Use Load Filtered Analytics to populate campaign events, sources, conversions, and insight cards.',
          priority: 'setup',
        },
      ];
    }

    const actions: SuggestedAction[] = [];

    if (totals.totalEvents === 0) {
      actions.push({
        title: 'Share a public campaign link or QR payload',
        body: 'Your loaded campaigns have no events yet. Push the strongest link to social, QR cards, or profile surfaces to start collecting signal.',
        priority: 'growth',
      });
    }

    if (totals.totalClicks > 0 && totals.conversionRate < 0.1) {
      actions.push({
        title: 'Tighten the CTA or destination match',
        body: 'People are clicking, but conversion is low. Test a clearer CTA, a better destination, or a more specific offer.',
        priority: 'conversion',
      });
    }

    if (totals.topSources[0]) {
      actions.push({
        title: `Double down on ${totals.topSources[0][0]}`,
        body: `${totals.topSources[0][0]} is currently your strongest traffic source in this view. Create a second campaign for it or reuse its CTA pattern.`,
        priority: 'scale',
      });
    }

    if (totals.topEventTypes[0]) {
      actions.push({
        title: `Watch ${totals.topEventTypes[0][0]} behaviour`,
        body: `${totals.topEventTypes[0][0]} is your leading event type. Use it to decide whether the next test should focus on reach, clicks, or conversions.`,
        priority: 'growth',
      });
    }

    if (actions.length === 0) {
      actions.push({
        title: 'Keep testing campaign variants',
        body: 'Your filtered campaigns have usable data. Compare source, CTA, and destination patterns before scaling spend or promotion.',
        priority: 'scale',
      });
    }

    return actions.slice(0, 4);
  }, [campaigns.length, totals.conversionRate, totals.loadedCampaigns, totals.topEventTypes, totals.topSources, totals.totalClicks, totals.totalEvents]);

  const sortedCampaigns = useMemo(() => {
    const nextCampaigns = [...filteredCampaigns];

    if (sortMode === 'newest') {
      return nextCampaigns.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    }

    return nextCampaigns.sort((a, b) => {
      const aAnalytics = analyticsByCampaign[a.id];
      const bAnalytics = analyticsByCampaign[b.id];

      if (sortMode === 'events') {
        return (bAnalytics?.totalEvents || 0) - (aAnalytics?.totalEvents || 0);
      }
      if (sortMode === 'conversions') {
        return (bAnalytics?.conversionEvents || 0) - (aAnalytics?.conversionEvents || 0);
      }
      if (sortMode === 'rate') {
        return (bAnalytics?.conversionRate || 0) - (aAnalytics?.conversionRate || 0);
      }

      return 0;
    });
  }, [analyticsByCampaign, filteredCampaigns, sortMode]);

  async function loadCampaigns() {
    try {
      setLoadingCampaigns(true);
      setError(null);
      setNotice(null);
      const nextCampaigns = await listMyCreatorGrowthCampaigns();
      setCampaigns(nextCampaigns);
      setNotice(`Loaded ${nextCampaigns.length} active campaign${nextCampaigns.length === 1 ? '' : 's'}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Campaigns could not be loaded.');
    } finally {
      setLoadingCampaigns(false);
    }
  }

  async function loadCampaignAnalytics(campaignId: string) {
    try {
      setLoadingAnalyticsId(campaignId);
      setError(null);
      setNotice(null);
      const analytics = await getCreatorGrowthCampaignAnalytics(campaignId);
      setAnalyticsByCampaign((current) => ({ ...current, [campaignId]: analytics }));
      setNotice(`Analytics loaded for ${analytics.campaignName}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analytics could not be loaded.');
    } finally {
      setLoadingAnalyticsId(null);
    }
  }

  async function loadAllAnalytics() {
    try {
      setError(null);
      setNotice(null);
      for (const campaign of filteredCampaigns) {
        setLoadingAnalyticsId(campaign.id);
        const analytics = await getCreatorGrowthCampaignAnalytics(campaign.id);
        setAnalyticsByCampaign((current) => ({ ...current, [campaign.id]: analytics }));
      }
      setNotice('All available filtered campaign analytics loaded.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Some analytics could not be loaded.');
    } finally {
      setLoadingAnalyticsId(null);
    }
  }

  async function shareSummary() {
    try {
      setSharingSummary(true);
      setError(null);
      setNotice(null);
      const summary = buildCreatorGrowthAnalyticsSummary({
        campaigns,
        analyticsByCampaign,
        filteredCampaignIds: filteredCampaigns.map((campaign) => campaign.id),
        datePresetLabel: DATE_PRESET_LABELS[datePreset],
        searchText,
        topSources: totals.topSources,
        topEventTypes: totals.topEventTypes,
      });

      await Share.share({ message: summary });
      setNotice('Analytics summary opened in the native share sheet.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analytics summary could not be shared.');
    } finally {
      setSharingSummary(false);
    }
  }

  async function shareCsv() {
    try {
      setSharingCsv(true);
      setError(null);
      setNotice(null);
      const csv = buildCreatorGrowthAnalyticsCsv({
        campaigns,
        analyticsByCampaign,
        filteredCampaignIds: filteredCampaigns.map((campaign) => campaign.id),
        datePresetLabel: DATE_PRESET_LABELS[datePreset],
        searchText,
      });

      await Share.share({ message: csv });
      setNotice('Analytics CSV opened in the native share sheet.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analytics CSV could not be shared.');
    } finally {
      setSharingCsv(false);
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <View>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Creator Growth Analytics</Text>
        <Text style={{ color: '#999', marginTop: 4 }}>
          First-pass campaign analytics dashboard for saved creator growth campaigns.
        </Text>
      </View>

      <View style={{ backgroundColor: '#0f0f0f', borderRadius: 18, borderWidth: 1, borderColor: '#222', padding: 14, gap: 12 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Overview</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <MetricTile label="Campaigns" value={campaigns.length} note={`${totals.loadedCampaigns} loaded`} />
          <MetricTile label="Showing" value={sortedCampaigns.length} note={searchText.trim() || datePreset !== 'all' ? 'filtered' : 'all'} />
          <MetricTile label="Events" value={totals.totalEvents} />
          <MetricTile label="Click-like" value={totals.totalClicks} />
          <MetricTile label="Conversions" value={totals.totalConversions} />
          <MetricTile label="Rate" value={formatPercent(totals.conversionRate)} />
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Pressable
            onPress={loadCampaigns}
            disabled={loadingCampaigns}
            style={{ backgroundColor: loadingCampaigns ? '#333' : '#d4af37', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14 }}
          >
            <Text style={{ color: loadingCampaigns ? '#777' : '#000', fontWeight: '900' }}>{loadingCampaigns ? 'Loading...' : 'Load Campaigns'}</Text>
          </Pressable>
          <Pressable
            onPress={loadAllAnalytics}
            disabled={filteredCampaigns.length === 0 || Boolean(loadingAnalyticsId)}
            style={{ backgroundColor: filteredCampaigns.length === 0 || loadingAnalyticsId ? '#222' : '#1b1b1b', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14 }}
          >
            <Text style={{ color: filteredCampaigns.length === 0 || loadingAnalyticsId ? '#666' : '#fff', fontWeight: '900' }}>Load Filtered Analytics</Text>
          </Pressable>
          <Pressable
            onPress={shareSummary}
            disabled={sharingSummary}
            style={{ backgroundColor: sharingSummary ? '#333' : '#1b1b1b', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14 }}
          >
            <Text style={{ color: sharingSummary ? '#777' : '#fff', fontWeight: '900' }}>{sharingSummary ? 'Sharing...' : 'Share Summary'}</Text>
          </Pressable>
          <Pressable
            onPress={shareCsv}
            disabled={sharingCsv}
            style={{ backgroundColor: sharingCsv ? '#333' : '#1b1b1b', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14 }}
          >
            <Text style={{ color: sharingCsv ? '#777' : '#fff', fontWeight: '900' }}>{sharingCsv ? 'Sharing CSV...' : 'Share CSV'}</Text>
          </Pressable>
        </View>

        {notice ? <Text style={{ color: '#d4af37', fontSize: 12 }}>{notice}</Text> : null}
        {error ? <Text style={{ color: '#ff6b6b', fontSize: 12 }}>{error}</Text> : null}
      </View>

      <View style={{ backgroundColor: '#0f0f0f', borderRadius: 18, borderWidth: 1, borderColor: '#222', padding: 14, gap: 12 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Quick Insights</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <InsightTile label="Top campaign by events" value={insights.bestCampaignName} note={insights.bestCampaignNote} />
          <InsightTile label="Strongest conversion rate" value={insights.bestRateName} note={insights.bestRateNote} />
          <InsightTile label="Top source" value={insights.topSourceName} note={insights.topSourceNote} />
          <InsightTile label="Top event type" value={insights.topEventName} note={insights.topEventNote} />
        </View>
      </View>

      <View style={{ backgroundColor: '#0f0f0f', borderRadius: 18, borderWidth: 1, borderColor: '#222', padding: 14, gap: 12 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Suggested Actions</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {suggestedActions.map((action) => (
            <SuggestedActionTile key={`${action.priority}-${action.title}`} action={action} />
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <RollupPanel title="Top Sources" items={totals.topSources} emptyLabel="Load analytics to compare campaign sources." />
        <RollupPanel title="Top Event Types" items={totals.topEventTypes} emptyLabel="Load analytics to compare event types." />
      </View>

      <View style={{ backgroundColor: '#0f0f0f', borderRadius: 18, borderWidth: 1, borderColor: '#222', padding: 14, gap: 10 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Campaign Cards</Text>
        <Text style={{ color: '#d4af37', fontWeight: '900', fontSize: 12 }}>Date preset</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <SortChip label="All" active={datePreset === 'all'} onPress={() => setDatePreset('all')} />
          <SortChip label="7 days" active={datePreset === '7d'} onPress={() => setDatePreset('7d')} />
          <SortChip label="30 days" active={datePreset === '30d'} onPress={() => setDatePreset('30d')} />
          <SortChip label="90 days" active={datePreset === '90d'} onPress={() => setDatePreset('90d')} />
        </View>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search by campaign, destination, source, CTA, or URL"
          placeholderTextColor="#666"
          style={{ backgroundColor: '#080808', borderColor: '#252525', borderWidth: 1, borderRadius: 12, color: '#fff', paddingHorizontal: 12, paddingVertical: 10 }}
        />
        {searchText.trim() || datePreset !== 'all' ? (
          <Pressable
            onPress={() => {
              setSearchText('');
              setDatePreset('all');
            }}
            style={{ alignSelf: 'flex-start', paddingVertical: 4 }}
          >
            <Text style={{ color: '#d4af37', fontWeight: '900', fontSize: 12 }}>Clear filters</Text>
          </Pressable>
        ) : null}
        <Text style={{ color: '#d4af37', fontWeight: '900', fontSize: 12 }}>Sort cards</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <SortChip label="Newest" active={sortMode === 'newest'} onPress={() => setSortMode('newest')} />
          <SortChip label="Events" active={sortMode === 'events'} onPress={() => setSortMode('events')} />
          <SortChip label="Conversions" active={sortMode === 'conversions'} onPress={() => setSortMode('conversions')} />
          <SortChip label="Rate" active={sortMode === 'rate'} onPress={() => setSortMode('rate')} />
        </View>
      </View>

      {campaigns.length === 0 ? (
        <View style={{ backgroundColor: '#0f0f0f', borderRadius: 18, borderWidth: 1, borderColor: '#222', padding: 14 }}>
          <Text style={{ color: '#888' }}>Load campaigns to view analytics cards.</Text>
        </View>
      ) : null}

      {campaigns.length > 0 && sortedCampaigns.length === 0 ? (
        <View style={{ backgroundColor: '#0f0f0f', borderRadius: 18, borderWidth: 1, borderColor: '#222', padding: 14 }}>
          <Text style={{ color: '#888' }}>No campaigns match the current filters.</Text>
        </View>
      ) : null}

      {sortedCampaigns.map((campaign) => (
        <AnalyticsCard
          key={campaign.id}
          campaign={campaign}
          analytics={analyticsByCampaign[campaign.id]}
          loading={loadingAnalyticsId === campaign.id}
          onLoad={() => loadCampaignAnalytics(campaign.id)}
        />
      ))}
    </ScrollView>
  );
}
