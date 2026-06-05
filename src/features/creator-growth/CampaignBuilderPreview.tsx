import React, { useMemo, useState } from 'react';
import { Pressable, Share, Text, TextInput, View } from 'react-native';
import {
  createCreatorGrowthCampaign,
  CreatorGrowthCampaign,
  CreatorGrowthCampaignDestinationType,
  CreatorGrowthCampaignPolicy,
} from '../../api/creatorGrowthApi';

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'campaign';
}

function previewPath(campaignName: string, destinationType?: CreatorGrowthCampaignDestinationType) {
  return `/g/${slugify(destinationType || 'creator-profile')}/${slugify(campaignName)}`;
}

export function CampaignBuilderPreview({
  selectedPolicy,
  onCreated,
}: {
  selectedPolicy?: CreatorGrowthCampaignPolicy;
  onCreated?: (campaign: CreatorGrowthCampaign) => void;
}) {
  const [campaignName, setCampaignName] = useState('New Growth Campaign');
  const [trafficSource, setTrafficSource] = useState('social');
  const [customCta, setCustomCta] = useState(selectedPolicy?.suggestedCta || 'View');
  const [qrEnabled, setQrEnabled] = useState(true);
  const [expiryEnabled, setExpiryEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCampaign, setCreatedCampaign] = useState<CreatorGrowthCampaign | null>(null);
  const [helperNotice, setHelperNotice] = useState<string | null>(null);

  const linkPreview = useMemo(
    () => previewPath(campaignName, selectedPolicy?.type),
    [campaignName, selectedPolicy?.type],
  );

  const publicLink = createdCampaign?.publicUrl || linkPreview;
  const qrPayload = createdCampaign?.qrPayload || publicLink;

  function markCopyReady(label: string) {
    setHelperNotice(`${label} is ready to copy/share from this panel.`);
  }

  async function shareValue(label: string, value: string) {
    try {
      setSharing(true);
      setError(null);
      setHelperNotice(null);
      await Share.share({
        title: label,
        message: value,
      });
      setHelperNotice(`${label} opened in the native share sheet.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : `${label} could not be shared.`);
    } finally {
      setSharing(false);
    }
  }

  async function saveCampaign() {
    if (!selectedPolicy) {
      setError('Select a campaign destination first.');
      return;
    }

    const safeName = campaignName.trim();
    if (!safeName) {
      setError('Campaign name is required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setHelperNotice(null);
      const campaign = await createCreatorGrowthCampaign({
        name: safeName,
        destinationType: selectedPolicy.type,
        trafficSource: trafficSource.trim() || 'direct',
        ctaText: customCta.trim() || selectedPolicy.suggestedCta,
        qrEnabled: qrEnabled && selectedPolicy.supportsQrCode,
        expiryEnabled: expiryEnabled && selectedPolicy.supportsExpiry,
        metadata: {
          source: 'campaign-builder-preview',
          publicSafeLandingRequired: selectedPolicy.publicSafeLandingRequired,
          trackingEvents: selectedPolicy.trackingEvents,
        },
      });
      setCreatedCampaign(campaign);
      onCreated?.(campaign);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Campaign failed to save.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={{ backgroundColor: '#0f0f0f', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#222', gap: 12 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Campaign Builder Preview</Text>
      <Text style={{ color: '#888', fontSize: 12 }}>
        First UI layer for trackable public links. Saved campaigns are draft scaffold records until database persistence is added.
      </Text>

      <TextInput
        value={campaignName}
        onChangeText={setCampaignName}
        placeholder="Campaign name"
        placeholderTextColor="#666"
        style={{ backgroundColor: '#1b1b1b', color: '#fff', padding: 10, borderRadius: 12 }}
      />
      <TextInput
        value={trafficSource}
        onChangeText={setTrafficSource}
        placeholder="Traffic source"
        placeholderTextColor="#666"
        autoCapitalize="none"
        style={{ backgroundColor: '#1b1b1b', color: '#fff', padding: 10, borderRadius: 12 }}
      />
      <TextInput
        value={customCta}
        onChangeText={setCustomCta}
        placeholder="CTA text"
        placeholderTextColor="#666"
        style={{ backgroundColor: '#1b1b1b', color: '#fff', padding: 10, borderRadius: 12 }}
      />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Pressable
          onPress={() => setQrEnabled((value) => !value)}
          disabled={!selectedPolicy?.supportsQrCode}
          style={{ backgroundColor: qrEnabled ? '#16251f' : '#222', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 999 }}
        >
          <Text style={{ color: selectedPolicy?.supportsQrCode ? '#1D9E75' : '#666', fontWeight: '900' }}>QR: {qrEnabled ? 'On' : 'Off'}</Text>
        </Pressable>
        <Pressable
          onPress={() => setExpiryEnabled((value) => !value)}
          disabled={!selectedPolicy?.supportsExpiry}
          style={{ backgroundColor: expiryEnabled ? '#19130a' : '#222', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 999 }}
        >
          <Text style={{ color: selectedPolicy?.supportsExpiry ? '#d4af37' : '#666', fontWeight: '900' }}>Expiry: {expiryEnabled ? 'On' : 'Off'}</Text>
        </Pressable>
      </View>

      <View style={{ backgroundColor: '#080808', borderRadius: 12, padding: 10, gap: 5 }}>
        <Text style={{ color: '#d4af37', fontWeight: '900' }}>Public-safe link preview</Text>
        <Text style={{ color: '#fff', fontSize: 12 }}>{publicLink}</Text>
        <Text style={{ color: '#888', fontSize: 12 }}>Source: {trafficSource || 'not set'} · CTA: {customCta || selectedPolicy?.suggestedCta || 'View'}</Text>
        {createdCampaign?.qrPayload ? <Text style={{ color: '#888', fontSize: 12 }}>QR payload: {qrPayload}</Text> : null}
      </View>

      {createdCampaign ? (
        <View style={{ backgroundColor: '#111', borderRadius: 12, padding: 10, gap: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '900' }}>Share helper</Text>
          <Text style={{ color: '#aaa', fontSize: 12 }}>Use these values for bio links, campaign posts, QR cards, and promo tracking.</Text>
          <Pressable onPress={() => shareValue('Public URL', publicLink)} disabled={sharing} style={{ backgroundColor: '#d4af37', borderRadius: 999, paddingVertical: 9, alignItems: 'center' }}>
            <Text style={{ color: '#000', fontWeight: '900' }}>{sharing ? 'Opening Share...' : 'Share Public URL'}</Text>
          </Pressable>
          <Pressable onPress={() => shareValue('QR payload', qrPayload)} disabled={sharing} style={{ backgroundColor: '#252525', borderRadius: 999, paddingVertical: 9, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '900' }}>{sharing ? 'Opening Share...' : 'Share QR Payload'}</Text>
          </Pressable>
          <Pressable onPress={() => markCopyReady('Public URL')} style={{ backgroundColor: '#252525', borderRadius: 999, paddingVertical: 9, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '900' }}>Mark Public URL Copy-Ready</Text>
          </Pressable>
        </View>
      ) : null}

      {error ? <Text style={{ color: '#ff6b6b' }}>{error}</Text> : null}
      {helperNotice ? <Text style={{ color: '#d4af37' }}>{helperNotice}</Text> : null}
      {createdCampaign ? <Text style={{ color: '#1D9E75' }}>Draft campaign saved: {createdCampaign.name}</Text> : null}

      <Pressable
        onPress={saveCampaign}
        disabled={saving || !selectedPolicy}
        style={{ backgroundColor: saving || !selectedPolicy ? '#333' : '#d4af37', borderRadius: 999, paddingVertical: 11, alignItems: 'center' }}
      >
        <Text style={{ color: saving || !selectedPolicy ? '#777' : '#000', fontWeight: '900' }}>
          {saving ? 'Saving Campaign...' : 'Save Draft Campaign'}
        </Text>
      </Pressable>
    </View>
  );
}
