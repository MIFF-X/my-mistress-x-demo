import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import {
  archiveCreatorGrowthCampaign,
  CreatorGrowthCampaign,
  CreatorGrowthCampaignAnalytics,
  CreatorGrowthCampaignDestinationType,
  CreatorGrowthCampaignPolicy,
  getCreatorGrowthCampaignAnalytics,
  listCreatorGrowthCampaignPolicies,
  listMyCreatorGrowthCampaigns,
} from '../../api/creatorGrowthApi';
import { CampaignBuilderPreview } from './CampaignBuilderPreview';

function policyIcon(type: string) {
  if (type === 'CREATOR_PROFILE') return '👤';
  if (type === 'SUBSCRIPTION_TIER') return '💎';
  if (type === 'LIVE_ROOM') return '🎥';
  if (type === 'PPV_DROP') return '🔐';
  if (type === 'MARKETPLACE_DROP') return '🛍️';
  if (type === 'STICKER_DROP') return '🏷️';
  if (type === 'LINK_IN_BIO') return '🔗';
  return '📣';
}

function formatType(type: string) {
  return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function PolicyCard({
  policy,
  selected,
  onSelect,
}: {
  policy: CreatorGrowthCampaignPolicy;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <View style={{ backgroundColor: '#111', borderRadius: 18, borderWidth: 1, borderColor: selected ? '#d4af37' : '#252525', padding: 14, gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>
            {policyIcon(policy.type)} {policy.label}
          </Text>
          <Text style={{ color: '#888', marginTop: 4, fontSize: 12 }}>{formatType(policy.type)}</Text>
        </View>
        <View style={{ backgroundColor: '#19130a', borderColor: '#d4af37', borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
          <Text style={{ color: '#d4af37', fontWeight: '900', fontSize: 11 }}>{policy.suggestedCta}</Text>
        </View>
      </View>

      <Text style={{ color: '#aaa', lineHeight: 20 }}>{policy.description}</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {policy.publicSafeLandingRequired ? (
          <Text style={{ color: '#fff', backgroundColor: '#16251f', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, fontSize: 11 }}>
            public-safe landing
          </Text>
        ) : null}
        {policy.supportsQrCode ? (
          <Text style={{ color: '#fff', backgroundColor: '#1b1b1b', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, fontSize: 11 }}>
            QR ready
          </Text>
        ) : null}
        {policy.supportsExpiry ? (
          <Text style={{ color: '#fff', backgroundColor: '#1b1b1b', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, fontSize: 11 }}>
            expiry supported
          </Text>
        ) : null}
        {policy.supportsConversionTracking ? (
          <Text style={{ color: '#fff', backgroundColor: '#1b1b1b', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, fontSize: 11 }}>
            conversion tracking
          </Text>
        ) : null}
      </View>

      <View style={{ backgroundColor: '#080808', borderRadius: 12, padding: 10 }}>
        <Text style={{ color: '#d4af37', fontWeight: '900', marginBottom: 6 }}>Tracked events</Text>
        <Text style={{ color: '#aaa', fontSize: 12 }}>{policy.trackingEvents.join(' → ')}</Text>
      </View>

      <Pressable
        onPress={onSelect}
        style={{ backgroundColor: selected ? '#d4af37' : '#252525', borderRadius: 999, paddingVertical: 10, alignItems: 'center' }}
      >
        <Text style={{ color: selected ? '#000' : '#fff', fontWeight: '900' }}>
          {selected ? 'Selected For Builder' : 'Use This Destination'}
        </Text>
      </Pressable>
    </View>
  );
}

function AnalyticsPreview({ analytics }: { analytics: CreatorGrowthCampaignAnalytics }) {
  return (
    <View style={{ backgroundColor: '#080808', borderRadius: 12, padding: 10, gap: 8, marginTop: 4 }}>
      <Text style={{ color: '#d4af37', fontWeight: '900' }}>Analytics Preview</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Text style={{ color: '#fff', backgroundColor: '#1b1b1b', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8, fontSize: 11 }}>
          Events: {analytics.totalEvents}
        </Text>
        <Text style={{ color: '#fff', backgroundColor: '#1b1b1b', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8, fontSize: 11 }}>
          Click-like: {analytics.clickLikeEvents}
        </Text>
        <Text style={{ color: '#fff', backgroundColor: '#1b1b1b', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8, fontSize: 11 }}>
          Conversions: {analytics.conversionEvents}
        </Text>
        <Text style={{ color: '#fff', backgroundColor: '#1b1b1b', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8, fontSize: 11 }}>
          Rate: {formatPercent(analytics.conversionRate)}
        </Text>
      </View>
      <Text style={{ color: '#aaa', fontSize: 12 }}>By event: {Object.entries(analytics.byEventType || {}).map(([key, value]) => `${key} ${value}`).join(' · ') || 'No events yet'}</Text>
      <Text style={{ color: '#aaa', fontSize: 12 }}>By source: {Object.entries(analytics.bySource || {}).map(([key, value]) => `${key} ${value}`).join(' · ') || 'No sources yet'}</Text>
      {analytics.latestEventAt ? <Text style={{ color: '#777', fontSize: 11 }}>Latest event: {analytics.latestEventAt}</Text> : null}
      {!analytics.productionReady ? <Text style={{ color: '#ffb020', fontSize: 11 }}>Draft analytics: in-memory scaffold until Prisma aggregation is added</Text> : null}
    </View>
  );
}

function SavedCampaignsPanel({
  campaigns,
  onRefresh,
  onArchived,
  loading,
}: {
  campaigns: CreatorGrowthCampaign[];
  onRefresh: () => void;
  onArchived: (campaignId: string) => void;
  loading: boolean;
}) {
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [analyticsLoadingId, setAnalyticsLoadingId] = useState<string | null>(null);
  const [analyticsByCampaign, setAnalyticsByCampaign] = useState<Record<string, CreatorGrowthCampaignAnalytics>>({});
  const [notice, setNotice] = useState<string | null>(null);

  async function shareCampaign(campaign: CreatorGrowthCampaign, kind: 'publicUrl' | 'qrPayload') {
    const value = kind === 'publicUrl' ? campaign.publicUrl : campaign.qrPayload;
    const label = kind === 'publicUrl' ? 'Public URL' : 'QR Payload';

    try {
      setSharingId(`${campaign.id}:${kind}`);
      setNotice(null);
      await Share.share({
        title: `${campaign.name} ${label}`,
        message: value,
      });
      setNotice(`${label} opened in the native share sheet.`);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : `${label} could not be shared.`);
    } finally {
      setSharingId(null);
    }
  }

  async function archiveCampaign(campaign: CreatorGrowthCampaign) {
    try {
      setArchivingId(campaign.id);
      setNotice(null);
      await archiveCreatorGrowthCampaign(campaign.id);
      onArchived(campaign.id);
      setAnalyticsByCampaign((current) => {
        const next = { ...current };
        delete next[campaign.id];
        return next;
      });
      setNotice(`Archived draft campaign: ${campaign.name}`);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Campaign could not be archived.');
    } finally {
      setArchivingId(null);
    }
  }

  async function loadAnalytics(campaign: CreatorGrowthCampaign) {
    try {
      setAnalyticsLoadingId(campaign.id);
      setNotice(null);
      const analytics = await getCreatorGrowthCampaignAnalytics(campaign.id);
      setAnalyticsByCampaign((current) => ({ ...current, [campaign.id]: analytics }));
      setNotice(`Analytics loaded for: ${campaign.name}`);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Campaign analytics could not be loaded.');
    } finally {
      setAnalyticsLoadingId(null);
    }
  }

  return (
    <View style={{ backgroundColor: '#0f0f0f', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#222', gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <View>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Saved Draft Campaigns</Text>
          <Text style={{ color: '#888', fontSize: 12 }}>{campaigns.length} draft campaign{campaigns.length === 1 ? '' : 's'}</Text>
        </View>
        <Pressable
          onPress={onRefresh}
          disabled={loading}
          style={{ backgroundColor: loading ? '#333' : '#1b1b1b', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 999 }}
        >
          <Text style={{ color: loading ? '#777' : '#fff', fontWeight: '900' }}>{loading ? 'Loading...' : 'Refresh'}</Text>
        </Pressable>
      </View>

      {notice ? <Text style={{ color: '#d4af37', fontSize: 12 }}>{notice}</Text> : null}
      {campaigns.length === 0 ? <Text style={{ color: '#777' }}>No saved draft campaigns yet.</Text> : null}
      {campaigns.map((campaign) => {
        const sharingPublic = sharingId === `${campaign.id}:publicUrl`;
        const sharingQr = sharingId === `${campaign.id}:qrPayload`;
        const archiving = archivingId === campaign.id;
        const loadingAnalytics = analyticsLoadingId === campaign.id;
        const analytics = analyticsByCampaign[campaign.id];
        const busy = Boolean(sharingId || archivingId || analyticsLoadingId);

        return (
          <View key={campaign.id} style={{ backgroundColor: '#111', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#252525', gap: 6 }}>
            <Text style={{ color: '#fff', fontWeight: '900' }}>{campaign.name}</Text>
            <Text style={{ color: '#d4af37', fontSize: 12 }}>{campaign.destinationLabel} · {formatType(campaign.destinationType)}</Text>
            <Text style={{ color: '#aaa', fontSize: 12 }}>Source: {campaign.trafficSource} · CTA: {campaign.ctaText}</Text>
            <Text style={{ color: '#888', fontSize: 12 }}>{campaign.publicUrl}</Text>
            {campaign.qrEnabled ? <Text style={{ color: '#1D9E75', fontSize: 12 }}>QR payload ready</Text> : null}
            {!campaign.productionReady ? <Text style={{ color: '#ffb020', fontSize: 11 }}>Draft scaffold: database persistence pending</Text> : null}

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              <Pressable
                onPress={() => shareCampaign(campaign, 'publicUrl')}
                disabled={busy}
                style={{ backgroundColor: '#d4af37', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 }}
              >
                <Text style={{ color: '#000', fontWeight: '900', fontSize: 12 }}>{sharingPublic ? 'Sharing...' : 'Share URL'}</Text>
              </Pressable>
              <Pressable
                onPress={() => shareCampaign(campaign, 'qrPayload')}
                disabled={busy || !campaign.qrEnabled}
                style={{ backgroundColor: campaign.qrEnabled ? '#252525' : '#151515', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 }}
              >
                <Text style={{ color: campaign.qrEnabled ? '#fff' : '#555', fontWeight: '900', fontSize: 12 }}>{sharingQr ? 'Sharing...' : 'Share QR Payload'}</Text>
              </Pressable>
              <Pressable
                onPress={() => loadAnalytics(campaign)}
                disabled={busy}
                style={{ backgroundColor: '#161f2d', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 }}
              >
                <Text style={{ color: '#9ec5ff', fontWeight: '900', fontSize: 12 }}>{loadingAnalytics ? 'Loading...' : 'Analytics'}</Text>
              </Pressable>
              <Pressable
                onPress={() => archiveCampaign(campaign)}
                disabled={busy}
                style={{ backgroundColor: '#2a1212', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 }}
              >
                <Text style={{ color: '#ff9a9a', fontWeight: '900', fontSize: 12 }}>{archiving ? 'Archiving...' : 'Archive Draft'}</Text>
              </Pressable>
            </View>

            {analytics ? <AnalyticsPreview analytics={analytics} /> : null}
          </View>
        );
      })}
    </View>
  );
}

export function CreatorGrowthToolsScreen() {
  const [policies, setPolicies] = useState<CreatorGrowthCampaignPolicy[]>([]);
  const [campaigns, setCampaigns] = useState<CreatorGrowthCampaign[]>([]);
  const [selectedType, setSelectedType] = useState<CreatorGrowthCampaignDestinationType | undefined>();
  const [loading, setLoading] = useState(false);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPolicy = useMemo(
    () => policies.find((policy) => policy.type === selectedType),
    [policies, selectedType],
  );

  async function loadPolicies() {
    try {
      setLoading(true);
      setError(null);
      const nextPolicies = await listCreatorGrowthCampaignPolicies();
      setPolicies(nextPolicies);
      setSelectedType((current) => current || nextPolicies[0]?.type);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Creator growth tools failed to load.');
    } finally {
      setLoading(false);
    }
  }

  async function loadCampaigns() {
    try {
      setCampaignsLoading(true);
      setError(null);
      setCampaigns(await listMyCreatorGrowthCampaigns());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Saved campaigns failed to load.');
    } finally {
      setCampaignsLoading(false);
    }
  }

  useEffect(() => {
    void loadPolicies();
    void loadCampaigns();
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <View>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Creator Growth Tools</Text>
        <Text style={{ color: '#999', marginTop: 4 }}>
          Built-in discovery and external traffic tools for profile links, QR codes, subscription tiers, drops, and campaign tracking.
        </Text>
      </View>

      <CampaignBuilderPreview
        selectedPolicy={selectedPolicy}
        onCreated={(campaign) => setCampaigns((current) => [campaign, ...current])}
      />

      <SavedCampaignsPanel
        campaigns={campaigns}
        onRefresh={loadCampaigns}
        onArchived={(campaignId) => setCampaigns((current) => current.filter((campaign) => campaign.id !== campaignId))}
        loading={campaignsLoading}
      />

      <View style={{ backgroundColor: '#0f0f0f', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#222', gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <View>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Campaign Destinations</Text>
            <Text style={{ color: '#888', fontSize: 12 }}>{policies.length} destination type{policies.length === 1 ? '' : 's'}</Text>
          </View>
          <Pressable
            onPress={loadPolicies}
            disabled={loading}
            style={{ backgroundColor: loading ? '#333' : '#1b1b1b', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 999 }}
          >
            <Text style={{ color: loading ? '#777' : '#fff', fontWeight: '900' }}>{loading ? 'Loading...' : 'Refresh'}</Text>
          </Pressable>
        </View>

        {error ? <Text style={{ color: '#ff6b6b' }}>{error}</Text> : null}
        {!loading && policies.length === 0 ? <Text style={{ color: '#777' }}>No growth campaign policies loaded yet.</Text> : null}

        <View style={{ gap: 12 }}>
          {policies.map((policy) => (
            <PolicyCard
              key={policy.type}
              policy={policy}
              selected={policy.type === selectedType}
              onSelect={() => setSelectedType(policy.type)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
