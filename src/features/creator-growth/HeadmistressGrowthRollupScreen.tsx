import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  CreatorGrowthPlatformAnalyticsRollup,
  CreatorGrowthPlatformTopCampaign,
  CreatorGrowthPlatformTopEntry,
  getCreatorGrowthPlatformAnalyticsRollup,
} from '../../api/creatorGrowthApi';

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
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

function TopEntryPanel({ title, items, emptyLabel }: { title: string; items: CreatorGrowthPlatformTopEntry[]; emptyLabel: string }) {
  return (
    <View style={{ backgroundColor: '#0f0f0f', borderRadius: 18, borderWidth: 1, borderColor: '#222', padding: 14, gap: 10, flex: 1, minWidth: 230 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{title}</Text>
      {items.length > 0 ? (
        items.map((item, index) => (
          <View key={`${item.label}-${index}`} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, backgroundColor: '#080808', borderRadius: 12, padding: 10 }}>
            <Text style={{ color: index === 0 ? '#d4af37' : '#aaa', fontWeight: '800', flex: 1 }}>{item.label}</Text>
            <Text style={{ color: '#fff', fontWeight: '900' }}>{item.count}</Text>
          </View>
        ))
      ) : (
        <Text style={{ color: '#888' }}>{emptyLabel}</Text>
      )}
    </View>
  );
}

function TopCampaignCard({ campaign }: { campaign: CreatorGrowthPlatformTopCampaign }) {
  return (
    <View style={{ backgroundColor: '#080808', borderRadius: 14, borderWidth: 1, borderColor: '#252525', padding: 12, gap: 5 }}>
      <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>{campaign.campaignName}</Text>
      <Text style={{ color: '#d4af37', fontSize: 12 }}>{campaign.destinationType} · {campaign.trafficSource}</Text>
      <Text style={{ color: '#888', fontSize: 12 }}>Creator: {campaign.creatorUserId}</Text>
      <Text style={{ color: '#fff', fontWeight: '900' }}>{campaign.totalEvents} events</Text>
    </View>
  );
}

export function HeadmistressGrowthRollupScreen() {
  const [rollup, setRollup] = useState<CreatorGrowthPlatformAnalyticsRollup | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadRollup() {
    try {
      setLoading(true);
      setError(null);
      setNotice(null);
      const nextRollup = await getCreatorGrowthPlatformAnalyticsRollup();
      setRollup(nextRollup);
      setNotice('Platform creator growth rollup loaded.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Platform creator growth rollup could not be loaded.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <View>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Platform Growth Rollup</Text>
        <Text style={{ color: '#999', marginTop: 4 }}>
          Headmistress/Admin view for creator-growth campaigns, events, sources, destinations, and top campaigns.
        </Text>
      </View>

      <View style={{ backgroundColor: '#0f0f0f', borderRadius: 18, borderWidth: 1, borderColor: '#222', padding: 14, gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Overview</Text>
          <Pressable
            onPress={loadRollup}
            disabled={loading}
            style={{ backgroundColor: loading ? '#333' : '#d4af37', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14 }}
          >
            <Text style={{ color: loading ? '#777' : '#000', fontWeight: '900' }}>{loading ? 'Loading...' : 'Load Platform Rollup'}</Text>
          </Pressable>
        </View>

        {rollup ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <MetricTile label="Creators" value={rollup.totalCreators} />
            <MetricTile label="Campaigns" value={rollup.totalCampaigns} note={`${rollup.activeCampaigns} active`} />
            <MetricTile label="Archived" value={rollup.archivedCampaigns} />
            <MetricTile label="Events" value={rollup.totalEvents} />
            <MetricTile label="Conversions" value={rollup.conversionEvents} />
            <MetricTile label="Rate" value={formatPercent(rollup.conversionRate)} />
          </View>
        ) : (
          <Text style={{ color: '#888' }}>Load the platform rollup to see Headmistress analytics.</Text>
        )}

        {notice ? <Text style={{ color: '#d4af37', fontSize: 12 }}>{notice}</Text> : null}
        {error ? <Text style={{ color: '#ff6b6b', fontSize: 12 }}>{error}</Text> : null}
        {rollup && !rollup.productionReady ? (
          <Text style={{ color: '#ffb020', fontSize: 11 }}>
            Draft rollup: calculated from in-memory campaigns/events until Prisma-backed aggregation is wired.
          </Text>
        ) : null}
      </View>

      {rollup ? (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <TopEntryPanel title="Top Sources" items={rollup.topSources || []} emptyLabel="No source data yet." />
            <TopEntryPanel title="Top Event Types" items={rollup.topEventTypes || []} emptyLabel="No event type data yet." />
            <TopEntryPanel title="Top Destinations" items={rollup.topDestinationTypes || []} emptyLabel="No destination data yet." />
          </View>

          <View style={{ backgroundColor: '#0f0f0f', borderRadius: 18, borderWidth: 1, borderColor: '#222', padding: 14, gap: 10 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Top Campaigns</Text>
            {rollup.topCampaigns.length > 0 ? (
              rollup.topCampaigns.map((campaign) => <TopCampaignCard key={campaign.campaignId} campaign={campaign} />)
            ) : (
              <Text style={{ color: '#888' }}>No campaign event data yet.</Text>
            )}
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}
