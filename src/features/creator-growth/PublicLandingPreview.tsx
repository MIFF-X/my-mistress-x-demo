import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  CreatorGrowthPublicLanding,
  resolveCreatorGrowthPublicLanding,
  trackCreatorGrowthCampaignEvent,
} from '../../api/creatorGrowthApi';

function formatType(type: string) {
  return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function LandingRuleChip({ label }: { label: string }) {
  return (
    <Text style={{ color: '#fff', backgroundColor: '#17251f', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8, fontSize: 11 }}>
      {label}
    </Text>
  );
}

export function PublicLandingPreview({
  destinationSlug,
  campaignSlug,
  onContinue,
}: {
  destinationSlug: string;
  campaignSlug: string;
  onContinue?: (landing: CreatorGrowthPublicLanding) => void;
}) {
  const [landing, setLanding] = useState<CreatorGrowthPublicLanding | null>(null);
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadLanding() {
    try {
      setLoading(true);
      setError(null);
      setNotice(null);
      const nextLanding = await resolveCreatorGrowthPublicLanding(destinationSlug, campaignSlug);
      setLanding(nextLanding);
      if (nextLanding.allowedTrackingEvents.includes('link_view')) {
        await trackCreatorGrowthCampaignEvent(nextLanding.campaignId, {
          eventType: 'link_view',
          source: nextLanding.trafficSource || 'public-landing',
          metadata: {
            destinationSlug,
            campaignSlug,
            publicPath: nextLanding.publicPath,
          },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Public campaign landing could not be loaded.');
    } finally {
      setLoading(false);
    }
  }

  async function handleContinue() {
    if (!landing) return;

    try {
      setTracking(true);
      setNotice(null);
      if (landing.allowedTrackingEvents.includes('destination_click')) {
        await trackCreatorGrowthCampaignEvent(landing.campaignId, {
          eventType: 'destination_click',
          source: landing.trafficSource || 'public-landing',
          metadata: {
            destinationSlug,
            campaignSlug,
            targetId: landing.targetId,
            destinationType: landing.destinationType,
          },
        });
      }
      setNotice('Destination request recorded. Access checks still apply before protected content opens.');
      onContinue?.(landing);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Destination click could not be tracked.');
      onContinue?.(landing);
    } finally {
      setTracking(false);
    }
  }

  useEffect(() => {
    void loadLanding();
  }, [destinationSlug, campaignSlug]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <View>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Creator Campaign</Text>
        <Text style={{ color: '#999', marginTop: 4 }}>
          Public-safe preview. Login, payment, verification, visibility, and content locks still apply.
        </Text>
      </View>

      {loading ? (
        <View style={{ backgroundColor: '#0f0f0f', borderRadius: 18, borderWidth: 1, borderColor: '#222', padding: 14 }}>
          <Text style={{ color: '#fff', fontWeight: '900' }}>Loading campaign...</Text>
          <Text style={{ color: '#888', marginTop: 4 }}>{destinationSlug}/{campaignSlug}</Text>
        </View>
      ) : null}

      {error ? (
        <View style={{ backgroundColor: '#1f0f0f', borderRadius: 18, borderWidth: 1, borderColor: '#552222', padding: 14, gap: 10 }}>
          <Text style={{ color: '#ff9a9a', fontWeight: '900' }}>Campaign unavailable</Text>
          <Text style={{ color: '#ffcccc' }}>{error}</Text>
          <Pressable onPress={loadLanding} style={{ backgroundColor: '#2a1212', borderRadius: 999, paddingVertical: 10, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '900' }}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {landing ? (
        <View style={{ backgroundColor: '#0f0f0f', borderRadius: 18, borderWidth: 1, borderColor: '#222', padding: 14, gap: 12 }}>
          <View>
            <Text style={{ color: '#d4af37', fontSize: 12, fontWeight: '900' }}>{formatType(landing.destinationType)}</Text>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 4 }}>{landing.campaignName}</Text>
            <Text style={{ color: '#aaa', marginTop: 4 }}>{landing.destinationLabel} · Source: {landing.trafficSource}</Text>
          </View>

          <View style={{ backgroundColor: '#080808', borderRadius: 14, padding: 12, gap: 6 }}>
            <Text style={{ color: '#fff', fontWeight: '900' }}>Public-safe link</Text>
            <Text style={{ color: '#888', fontSize: 12 }}>{landing.publicUrl}</Text>
            {landing.qrEnabled ? <Text style={{ color: '#1D9E75', fontSize: 12 }}>QR campaign ready</Text> : null}
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {landing.accessRules.loginRequiredBeforePrivateContent ? <LandingRuleChip label="login required before private content" /> : null}
            {landing.accessRules.paymentRulesStillApply ? <LandingRuleChip label="payment rules apply" /> : null}
            {landing.accessRules.verificationRulesStillApply ? <LandingRuleChip label="verification applies" /> : null}
            {landing.accessRules.visibilityRulesStillApply ? <LandingRuleChip label="visibility rules apply" /> : null}
            {landing.accessRules.contentLocksStillApply ? <LandingRuleChip label="content locks apply" /> : null}
          </View>

          <View style={{ backgroundColor: '#111', borderRadius: 14, padding: 12, gap: 6 }}>
            <Text style={{ color: '#d4af37', fontWeight: '900' }}>Tracking events allowed</Text>
            <Text style={{ color: '#aaa', fontSize: 12 }}>{landing.allowedTrackingEvents.join(' → ')}</Text>
          </View>

          {notice ? <Text style={{ color: '#d4af37', fontSize: 12 }}>{notice}</Text> : null}

          <Pressable
            onPress={handleContinue}
            disabled={tracking}
            style={{ backgroundColor: tracking ? '#333' : '#d4af37', borderRadius: 999, paddingVertical: 12, alignItems: 'center' }}
          >
            <Text style={{ color: tracking ? '#777' : '#000', fontWeight: '900' }}>
              {tracking ? 'Recording...' : landing.ctaText || 'Continue'}
            </Text>
          </Pressable>

          {!landing.productionReady ? (
            <Text style={{ color: '#ffb020', fontSize: 11 }}>
              Draft landing scaffold: resolves from in-memory campaigns until Prisma persistence is wired.
            </Text>
          ) : null}
        </View>
      ) : null}
    </ScrollView>
  );
}
