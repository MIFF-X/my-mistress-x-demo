import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CreatorGrowthPublicLanding } from '../../api/creatorGrowthApi';

function formatType(type: string) {
  return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function destinationLabel(type: string) {
  if (type === 'CREATOR_PROFILE') return 'Creator profile gate';
  if (type === 'SUBSCRIPTION_TIER') return 'Subscription tier gate';
  if (type === 'LIVE_ROOM') return 'Live room access gate';
  if (type === 'PPV_DROP') return 'PPV unlock gate';
  if (type === 'MARKETPLACE_DROP') return 'Marketplace item gate';
  if (type === 'STICKER_DROP') return 'Sticker collection gate';
  if (type === 'LINK_IN_BIO') return 'External/social link gate';
  return 'Creator Growth destination gate';
}

function GateCheck({ label, active }: { label: string; active: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#111', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: active ? '#294536' : '#252525' }}>
      <Text style={{ color: active ? '#1D9E75' : '#777', fontWeight: '900' }}>{active ? '✓' : '—'}</Text>
      <Text style={{ color: active ? '#fff' : '#888', flex: 1 }}>{label}</Text>
    </View>
  );
}

export function CreatorGrowthDestinationGate({
  landing,
  onLoginRequired,
  onOpenDestination,
}: {
  landing: CreatorGrowthPublicLanding;
  onLoginRequired?: (landing: CreatorGrowthPublicLanding) => void;
  onOpenDestination?: (landing: CreatorGrowthPublicLanding) => void;
}) {
  const mustLogin = landing.accessRules.loginRequiredBeforePrivateContent;

  function handlePrimaryAction() {
    if (mustLogin) {
      onLoginRequired?.(landing);
      return;
    }
    onOpenDestination?.(landing);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <View>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Access Gate</Text>
        <Text style={{ color: '#999', marginTop: 4 }}>
          This gate confirms what must be checked before opening the campaign destination.
        </Text>
      </View>

      <View style={{ backgroundColor: '#0f0f0f', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#222', gap: 12 }}>
        <View>
          <Text style={{ color: '#d4af37', fontSize: 12, fontWeight: '900' }}>{formatType(landing.destinationType)}</Text>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 4 }}>{landing.campaignName}</Text>
          <Text style={{ color: '#aaa', marginTop: 4 }}>{destinationLabel(landing.destinationType)}</Text>
        </View>

        <View style={{ backgroundColor: '#080808', borderRadius: 14, padding: 12, gap: 6 }}>
          <Text style={{ color: '#fff', fontWeight: '900' }}>Destination target</Text>
          <Text style={{ color: '#888', fontSize: 12 }}>Target ID: {landing.targetId || 'not set yet'}</Text>
          <Text style={{ color: '#888', fontSize: 12 }}>CTA: {landing.ctaText}</Text>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ color: '#d4af37', fontWeight: '900' }}>Required checks</Text>
          <GateCheck label="Login before private content" active={landing.accessRules.loginRequiredBeforePrivateContent} />
          <GateCheck label="Payment/subscription rules still apply" active={landing.accessRules.paymentRulesStillApply} />
          <GateCheck label="Verification rules still apply" active={landing.accessRules.verificationRulesStillApply} />
          <GateCheck label="Visibility rules still apply" active={landing.accessRules.visibilityRulesStillApply} />
          <GateCheck label="Content locks still apply" active={landing.accessRules.contentLocksStillApply} />
        </View>

        <View style={{ backgroundColor: '#14100a', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#3d2f14' }}>
          <Text style={{ color: '#ffcf66', fontWeight: '900' }}>Safety lock</Text>
          <Text style={{ color: '#d8c08a', marginTop: 4, lineHeight: 19 }}>
            Campaign links and QR codes can advertise a destination, but this gate must not bypass login, payment, verification, visibility, or content-lock checks.
          </Text>
        </View>

        <Pressable
          onPress={handlePrimaryAction}
          style={{ backgroundColor: '#d4af37', borderRadius: 999, paddingVertical: 12, alignItems: 'center' }}
        >
          <Text style={{ color: '#000', fontWeight: '900' }}>
            {mustLogin ? 'Continue To Login / Access Check' : 'Open Destination'}
          </Text>
        </Pressable>

        {!landing.productionReady ? (
          <Text style={{ color: '#ffb020', fontSize: 11 }}>
            Draft destination gate: connect this to real auth, payment, verification, visibility, and content-lock services later.
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
}
