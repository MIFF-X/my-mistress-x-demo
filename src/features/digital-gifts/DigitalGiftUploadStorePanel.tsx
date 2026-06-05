import React, { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { buildDigitalGiftStoreSummary, starterDigitalGiftAssets, starterDigitalGiftUploadDraft } from './digitalGiftMockData';
import type { DigitalGiftAccessRule, DigitalGiftAsset, DigitalGiftKind, DigitalGiftRarity, DigitalGiftUploadChecklistItem, DigitalGiftUploadStatus } from './digitalGiftTypes';

function panelStyle(borderColor = '#333') {
  return {
    backgroundColor: '#111',
    borderColor,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  } as const;
}

function smallText(color = '#aaa') {
  return { color, fontSize: 11, marginTop: 4 } as const;
}

function inputStyle() {
  return {
    backgroundColor: '#050505',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 10,
    color: '#fff',
    padding: 10,
    marginTop: 6,
  } as const;
}

function toneForStatus(status: DigitalGiftUploadStatus) {
  if (status === 'listed') return '#1D9E75';
  if (status === 'ready-to-upload') return '#d4af37';
  if (status === 'sold-out') return '#ff6b6b';
  if (status === 'paused') return '#60a5fa';
  return '#777';
}

function toneForRarity(rarity: DigitalGiftRarity) {
  if (rarity === 'legendary') return '#f59e0b';
  if (rarity === 'limited') return '#d4af37';
  if (rarity === 'premium') return '#ff9abf';
  if (rarity === 'rare') return '#60a5fa';
  return '#777';
}

function accessLabel(accessRule: DigitalGiftAccessRule) {
  return accessRule.replace(/-/g, ' ');
}

function Chip({ label, tone = '#777' }: { label: string; tone?: string }) {
  return (
    <View style={{ borderColor: tone, borderWidth: 1, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 9, backgroundColor: `${tone}18`, marginRight: 6, marginBottom: 6 }}>
      <Text style={{ color: tone, fontSize: 10, fontWeight: '900' }}>{label.toUpperCase()}</Text>
    </View>
  );
}

function SelectChip<T extends string>({ label, value, activeValue, onSelect, tone = '#ff0055' }: { label: string; value: T; activeValue: T; onSelect: (value: T) => void; tone?: string }) {
  const active = value === activeValue;
  return (
    <Pressable onPress={() => onSelect(value)} style={{ backgroundColor: active ? tone : '#222', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10, marginRight: 7, marginBottom: 7 }}>
      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>{label}</Text>
    </Pressable>
  );
}

function FieldLabel({ label }: { label: string }) {
  return <Text style={{ color: '#aaa', fontSize: 11, fontWeight: '800', marginTop: 10 }}>{label}</Text>;
}

function MetricCard({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  return (
    <View style={{ ...panelStyle(`${tone}66`), flexGrow: 1, flexBasis: 140, maxWidth: 240 }}>
      <Text style={smallText('#aaa')}>{label}</Text>
      <Text style={{ color: tone, fontSize: 22, fontWeight: '900', marginTop: 4 }}>{value}</Text>
    </View>
  );
}

function GiftStoreCard({ asset, selected, onSelect }: { asset: DigitalGiftAsset; selected: boolean; onSelect: () => void }) {
  const statusTone = toneForStatus(asset.status);
  const rarityTone = toneForRarity(asset.rarity);
  const remaining = asset.stockLimit ? Math.max(asset.stockLimit - Number(asset.soldCount || 0), 0) : null;

  return (
    <Pressable onPress={onSelect} style={{ ...panelStyle(selected ? '#ff0055' : statusTone), flexGrow: 1, flexBasis: 230, maxWidth: 380 }}>
      <Text style={{ fontSize: 30 }}>{asset.previewLabel}</Text>
      <Text style={{ color: '#fff', fontSize: 17, fontWeight: '900', marginTop: 6 }}>{asset.name}</Text>
      <Text style={{ color: '#aaa', marginTop: 5 }}>{asset.description}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
        <Chip label={asset.status} tone={statusTone} />
        <Chip label={asset.rarity} tone={rarityTone} />
        <Chip label={accessLabel(asset.accessRule)} tone="#60a5fa" />
      </View>
      <Text style={smallText('#d4af37')}>Price: {asset.priceCredits} credits</Text>
      {remaining !== null ? <Text style={smallText('#aaa')}>Stock: {remaining}/{asset.stockLimit} remaining · Sold: {asset.soldCount || 0}</Text> : null}
      {asset.uploadFileName ? <Text style={smallText('#1D9E75')}>Manifest: {asset.uploadFileName}</Text> : null}
    </Pressable>
  );
}

function UploadDraftEditor({
  title,
  subtitle,
  description,
  price,
  rarity,
  accessRule,
  status,
  sourceManifest,
  onTitleChange,
  onSubtitleChange,
  onDescriptionChange,
  onPriceChange,
  onRarityChange,
  onAccessRuleChange,
  onStatusChange,
  onSourceManifestChange,
}: {
  title: string;
  subtitle: string;
  description: string;
  price: string;
  rarity: DigitalGiftRarity;
  accessRule: DigitalGiftAccessRule;
  status: DigitalGiftUploadStatus;
  sourceManifest: string;
  onTitleChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onRarityChange: (value: DigitalGiftRarity) => void;
  onAccessRuleChange: (value: DigitalGiftAccessRule) => void;
  onStatusChange: (value: DigitalGiftUploadStatus) => void;
  onSourceManifestChange: (value: string) => void;
}) {
  const rarities: DigitalGiftRarity[] = ['common', 'rare', 'premium', 'limited', 'legendary'];
  const accessRules: DigitalGiftAccessRule[] = ['public-store', 'subscribers-only', 'vip-only', 'private-link', 'creator-only-preview'];
  const statuses: DigitalGiftUploadStatus[] = ['draft', 'ready-to-upload', 'listed', 'paused', 'sold-out'];

  return (
    <View style={panelStyle('#333')}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Upload draft editor</Text>
      <Text style={smallText('#aaa')}>Edit the upload draft and the store preview updates live.</Text>
      <FieldLabel label="Gift title" />
      <TextInput value={title} onChangeText={onTitleChange} style={inputStyle()} placeholder="Luxury Locks Set" placeholderTextColor="#777" />
      <FieldLabel label="Subtitle" />
      <TextInput value={subtitle} onChangeText={onSubtitleChange} style={inputStyle()} placeholder="Short store subtitle" placeholderTextColor="#777" />
      <FieldLabel label="Description" />
      <TextInput value={description} onChangeText={onDescriptionChange} multiline style={{ ...inputStyle(), minHeight: 74 }} placeholder="Store description" placeholderTextColor="#777" />
      <FieldLabel label="Price credits" />
      <TextInput value={price} onChangeText={onPriceChange} keyboardType="numeric" style={inputStyle()} placeholder="129" placeholderTextColor="#777" />
      <FieldLabel label="Source manifest" />
      <TextInput value={sourceManifest} onChangeText={onSourceManifestChange} style={inputStyle()} placeholder="luxury-locks-set.bundle.json" placeholderTextColor="#777" />
      <FieldLabel label="Rarity" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
        {rarities.map((option) => <SelectChip key={option} label={option} value={option} activeValue={rarity} onSelect={onRarityChange} tone={toneForRarity(option)} />)}
      </View>
      <FieldLabel label="Access rule" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
        {accessRules.map((option) => <SelectChip key={option} label={accessLabel(option)} value={option} activeValue={accessRule} onSelect={onAccessRuleChange} tone="#60a5fa" />)}
      </View>
      <FieldLabel label="Upload status" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
        {statuses.map((option) => <SelectChip key={option} label={option} value={option} activeValue={status} onSelect={onStatusChange} tone={toneForStatus(option)} />)}
      </View>
    </View>
  );
}

function UploadChecklist({ items, onToggle }: { items: DigitalGiftUploadChecklistItem[]; onToggle: (id: string) => void }) {
  const completedCount = items.filter((item) => item.complete).length;
  const totalCount = items.length;

  return (
    <View style={panelStyle(completedCount === totalCount ? '#1D9E75' : '#d4af37')}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Upload checklist</Text>
      <Text style={smallText('#aaa')}>{completedCount}/{totalCount} complete · tap an item to toggle it</Text>
      {items.map((item) => (
        <Pressable key={item.id} onPress={() => onToggle(item.id)}>
          <Text style={smallText(item.complete ? '#1D9E75' : '#d4af37')}>{item.complete ? '✓' : '•'} {item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function StorePreview({ asset }: { asset: DigitalGiftAsset }) {
  return (
    <View style={{ ...panelStyle('#ff9abf'), backgroundColor: '#170b12' }}>
      <Text style={{ color: '#ff9abf', fontSize: 11, fontWeight: '900' }}>STORE CARD PREVIEW</Text>
      <Text style={{ fontSize: 36, marginTop: 8 }}>{asset.previewLabel}</Text>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 4 }}>{asset.name}</Text>
      <Text style={{ color: '#d4af37', fontSize: 18, fontWeight: '900', marginTop: 4 }}>{asset.priceCredits} credits</Text>
      <Text style={{ color: '#ddd', marginTop: 6 }}>{asset.description}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
        <Chip label={asset.kind} tone="#d4af37" />
        <Chip label={asset.rarity} tone={toneForRarity(asset.rarity)} />
        <Chip label={asset.status} tone={toneForStatus(asset.status)} />
        <Chip label={accessLabel(asset.accessRule)} tone="#60a5fa" />
      </View>
      {asset.uploadFileName ? <Text style={smallText('#1D9E75')}>Source manifest: {asset.uploadFileName}</Text> : null}
    </View>
  );
}

export function DigitalGiftUploadStorePanel() {
  const [selectedAssetId, setSelectedAssetId] = useState(starterDigitalGiftAssets[0].id);
  const [draftTitle, setDraftTitle] = useState(starterDigitalGiftUploadDraft.title);
  const [draftSubtitle, setDraftSubtitle] = useState(starterDigitalGiftUploadDraft.subtitle);
  const [draftDescription, setDraftDescription] = useState(starterDigitalGiftUploadDraft.description);
  const [draftPrice, setDraftPrice] = useState(String(starterDigitalGiftUploadDraft.priceCredits));
  const [draftRarity, setDraftRarity] = useState<DigitalGiftRarity>(starterDigitalGiftUploadDraft.rarity);
  const [draftAccessRule, setDraftAccessRule] = useState<DigitalGiftAccessRule>(starterDigitalGiftUploadDraft.accessRule);
  const [draftStatus, setDraftStatus] = useState<DigitalGiftUploadStatus>('ready-to-upload');
  const [sourceManifest, setSourceManifest] = useState(starterDigitalGiftUploadDraft.sourceManifest || '');
  const [checklistItems, setChecklistItems] = useState<DigitalGiftUploadChecklistItem[]>(starterDigitalGiftUploadDraft.uploadChecklist);
  const summary = useMemo(() => buildDigitalGiftStoreSummary(starterDigitalGiftAssets), []);
  const selectedAsset = starterDigitalGiftAssets.find((asset) => asset.id === selectedAssetId) || starterDigitalGiftAssets[0];
  const draftPreviewAsset = useMemo<DigitalGiftAsset>(() => ({
    id: starterDigitalGiftUploadDraft.id,
    name: draftTitle.trim() || starterDigitalGiftUploadDraft.title,
    kind: starterDigitalGiftUploadDraft.kind as DigitalGiftKind,
    rarity: draftRarity,
    status: draftStatus,
    accessRule: draftAccessRule,
    priceCredits: Number(draftPrice) || starterDigitalGiftUploadDraft.priceCredits,
    stockLimit: 100,
    soldCount: 0,
    tags: starterDigitalGiftUploadDraft.tags,
    previewLabel: '🎁',
    description: draftDescription.trim() || starterDigitalGiftUploadDraft.description,
    uploadFileName: sourceManifest.trim() || undefined,
  }), [draftAccessRule, draftDescription, draftPrice, draftRarity, draftStatus, draftTitle, sourceManifest]);

  function toggleChecklistItem(id: string) {
    setChecklistItems((items) => items.map((item) => item.id === id ? { ...item, complete: !item.complete } : item));
  }

  return (
    <View style={panelStyle('#ff0055')}>
      <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900' }}>Digital Gift Upload / Store Polish</Text>
      <Text style={{ color: '#aaa', marginTop: 6 }}>
        Prepare upload-ready gifts, preview store cards, review bundle manifests, and track listing status before backend persistence is wired.
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        <MetricCard label="Total gifts" value={summary.totalAssets} tone="#ff9abf" />
        <MetricCard label="Listed" value={summary.listedAssets} tone="#1D9E75" />
        <MetricCard label="Ready uploads" value={summary.readyToUploadAssets} tone="#d4af37" />
        <MetricCard label="Sold" value={summary.totalSoldCount} tone="#60a5fa" />
      </View>

      <UploadDraftEditor
        title={draftTitle}
        subtitle={draftSubtitle}
        description={draftDescription}
        price={draftPrice}
        rarity={draftRarity}
        accessRule={draftAccessRule}
        status={draftStatus}
        sourceManifest={sourceManifest}
        onTitleChange={setDraftTitle}
        onSubtitleChange={setDraftSubtitle}
        onDescriptionChange={setDraftDescription}
        onPriceChange={setDraftPrice}
        onRarityChange={setDraftRarity}
        onAccessRuleChange={setDraftAccessRule}
        onStatusChange={setDraftStatus}
        onSourceManifestChange={setSourceManifest}
      />

      <UploadChecklist items={checklistItems} onToggle={toggleChecklistItem} />
      <StorePreview asset={draftPreviewAsset} />
      <StorePreview asset={selectedAsset} />

      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 8, marginBottom: 8 }}>Gift store assets</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {starterDigitalGiftAssets.map((asset) => (
          <GiftStoreCard key={asset.id} asset={asset} selected={asset.id === selectedAssetId} onSelect={() => setSelectedAssetId(asset.id)} />
        ))}
      </View>
    </View>
  );
}
