import React, { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { starterGiftBundleDraft, starterGiftDraftAssets } from './giftBundleMockData';
import type { GiftBundleCardTheme, GiftBundleDraft, GiftBundleDraftAsset, GiftBundlePreview } from './giftBundleTypes';

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

function formatCredits(value?: number) {
  return value && value > 0 ? `${value} credits` : 'Free / included';
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'gift-bundle';
}

function kindSummary(assetKinds: GiftBundlePreview['assetKinds']) {
  return Object.entries(assetKinds)
    .filter(([, count]) => count > 0)
    .map(([kind, count]) => `${count} ${kind}`)
    .join(' / ') || 'No assets selected';
}

function parseCredits(value: string, fallback?: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

type BundleTemplatePreset = {
  id: string;
  label: string;
  name: string;
  subtitle: string;
  description: string;
  theme: GiftBundleCardTheme;
  price: string;
  selectedAssetIds: string[];
};

const BUNDLE_TEMPLATE_PRESETS: BundleTemplatePreset[] = [
  {
    id: 'starter',
    label: 'Starter',
    name: starterGiftBundleDraft.name,
    subtitle: starterGiftBundleDraft.subtitle,
    description: starterGiftBundleDraft.description,
    theme: starterGiftBundleDraft.theme,
    price: String(starterGiftBundleDraft.priceCredits || ''),
    selectedAssetIds: starterGiftBundleDraft.selectedAssetIds,
  },
  {
    id: 'luxury-locks',
    label: 'Luxury Locks Set',
    name: 'Luxury Locks Set',
    subtitle: 'Premium lock, key and collector-card assets for luxury UI drops.',
    description: 'A high-value lock-themed bundle for premium interface drops, loyalty rewards and collector gift sets.',
    theme: 'dark-luxury',
    price: '129',
    selectedAssetIds: ['gold-lock-icon', 'luxury-key-sticker', 'collector-card-cover', 'gold-ui-card'],
  },
  {
    id: 'gold-ui-essentials',
    label: 'Gold UI Essentials',
    name: 'Gold UI Essentials',
    subtitle: 'Golden utility icons, card art and sticker elements for polished platform packs.',
    description: 'A clean gold essentials bundle for icons, interface accents, sticker drops and premium UI presentation cards.',
    theme: 'gold-essentials',
    price: '99',
    selectedAssetIds: ['gold-lock-icon', 'gold-ui-card', 'collector-card-cover'],
  },
  {
    id: 'christmas-icon-pack',
    label: 'Christmas Icon Pack',
    name: 'Christmas Icon Pack',
    subtitle: 'Seasonal digital gifts and festive collectible assets for holiday drops.',
    description: 'A holiday-ready bundle preset for Christmas releases, festive gift packs and limited-time collector drops.',
    theme: 'holiday',
    price: '79',
    selectedAssetIds: ['velvet-bow-gift', 'collector-card-cover', 'luxury-key-sticker'],
  },
];

function buildBundlePreview(bundle: GiftBundleDraft, assets: GiftBundleDraftAsset[], selectedAssetIds: string[]): GiftBundlePreview {
  const selectedAssets = assets.filter((asset) => selectedAssetIds.includes(asset.id));
  const assetKinds = selectedAssets.reduce<GiftBundlePreview['assetKinds']>((counts, asset) => {
    counts[asset.kind] = (counts[asset.kind] || 0) + 1;
    return counts;
  }, {
    sticker: 0,
    'digital-gift': 0,
    icon: 0,
    card: 0,
    'pack-cover': 0,
  });
  const bundlePrice = bundle.priceCredits ?? selectedAssets.reduce((sum, asset) => sum + Number(asset.priceCredits || 0), 0);

  return {
    id: bundle.id,
    name: bundle.name,
    subtitle: bundle.subtitle,
    description: bundle.description,
    theme: bundle.theme,
    itemCount: selectedAssets.length,
    assetKinds,
    priceLabel: formatCredits(bundlePrice),
    contentsLabel: selectedAssets.length ? selectedAssets.map((asset) => asset.name).join(', ') : 'No assets selected yet',
    uploadManifest: selectedAssets.map((asset) => ({
      assetId: asset.id,
      name: asset.name,
      kind: asset.kind,
      quantity: 1,
    })),
  };
}

function AssetDraftCard({ asset, selected, onToggle }: { asset: GiftBundleDraftAsset; selected: boolean; onToggle: () => void }) {
  return (
    <Pressable onPress={onToggle} style={{ ...panelStyle(selected ? '#d4af37' : '#333'), flexGrow: 1, flexBasis: 150, maxWidth: 240 }}>
      <Text style={{ fontSize: 26 }}>{asset.previewLabel}</Text>
      <Text style={{ color: '#fff', fontWeight: '900', marginTop: 6 }}>{asset.name}</Text>
      <Text style={smallText(selected ? '#d4af37' : '#777')}>{selected ? 'Selected for bundle' : 'Tap to add'}</Text>
      <Text style={smallText('#aaa')}>{asset.kind} / {asset.rarity || 'common'}</Text>
      <Text style={smallText('#ff9abf')}>{formatCredits(asset.priceCredits)}</Text>
    </Pressable>
  );
}

function FieldLabel({ label }: { label: string }) {
  return <Text style={{ color: '#aaa', fontSize: 11, fontWeight: '800', marginTop: 10 }}>{label}</Text>;
}

function BundleTemplatePicker({ activeTemplateId, onApplyTemplate }: { activeTemplateId: string; onApplyTemplate: (template: BundleTemplatePreset) => void }) {
  return (
    <View style={panelStyle('#d4af37')}>
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>Bundle templates</Text>
      <Text style={smallText('#aaa')}>Start from a named set, then edit the details and selected assets.</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
        {BUNDLE_TEMPLATE_PRESETS.map((template) => {
          const active = activeTemplateId === template.id;
          return (
            <Pressable key={template.id} onPress={() => onApplyTemplate(template)} style={{ backgroundColor: active ? '#ff0055' : '#222', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10, marginRight: 7, marginBottom: 7 }}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>{template.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function BundleDetailsEditor({
  name,
  subtitle,
  description,
  theme,
  price,
  onNameChange,
  onSubtitleChange,
  onDescriptionChange,
  onThemeChange,
  onPriceChange,
}: {
  name: string;
  subtitle: string;
  description: string;
  theme: GiftBundleCardTheme;
  price: string;
  onNameChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onThemeChange: (value: GiftBundleCardTheme) => void;
  onPriceChange: (value: string) => void;
}) {
  const themes: GiftBundleCardTheme[] = ['dark-luxury', 'gold-essentials', 'holiday', 'collector-card', 'minimal'];

  return (
    <View style={panelStyle('#333')}>
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>Bundle details</Text>
      <Text style={smallText('#aaa')}>Edit the bundle details and the card/manifest will update live.</Text>
      <FieldLabel label="Bundle name" />
      <TextInput value={name} onChangeText={onNameChange} style={inputStyle()} placeholder="Luxury Locks Set" placeholderTextColor="#777" />
      <FieldLabel label="Subtitle" />
      <TextInput value={subtitle} onChangeText={onSubtitleChange} style={inputStyle()} placeholder="Short front-card subtitle" placeholderTextColor="#777" />
      <FieldLabel label="Description" />
      <TextInput value={description} onChangeText={onDescriptionChange} multiline style={{ ...inputStyle(), minHeight: 72 }} placeholder="Expanded card description" placeholderTextColor="#777" />
      <FieldLabel label="Theme" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
        {themes.map((themeOption) => {
          const active = theme === themeOption;
          return (
            <Pressable key={themeOption} onPress={() => onThemeChange(themeOption)} style={{ backgroundColor: active ? '#ff0055' : '#222', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10, marginRight: 7, marginBottom: 7 }}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>{themeOption}</Text>
            </Pressable>
          );
        })}
      </View>
      <FieldLabel label="Bundle price credits" />
      <TextInput value={price} onChangeText={onPriceChange} keyboardType="numeric" style={inputStyle()} placeholder="99" placeholderTextColor="#777" />
    </View>
  );
}

function FrontFacingBundleCard({ preview }: { preview: GiftBundlePreview }) {
  return (
    <View style={{ ...panelStyle('#d4af37'), backgroundColor: '#160f05' }}>
      <Text style={{ color: '#d4af37', fontSize: 11, fontWeight: '900' }}>FRONT CARD PREVIEW</Text>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 6 }}>{preview.name}</Text>
      <Text style={{ color: '#ff9abf', marginTop: 4 }}>{preview.subtitle}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
        <Text style={{ color: '#fff', marginRight: 12, fontWeight: '900' }}>{preview.itemCount} items</Text>
        <Text style={{ color: '#d4af37', marginRight: 12, fontWeight: '900' }}>{preview.priceLabel}</Text>
        <Text style={{ color: '#aaa' }}>{preview.theme}</Text>
      </View>
      <Text style={smallText('#aaa')}>Contents: {preview.contentsLabel}</Text>
    </View>
  );
}

function ExpandedInfoCard({ preview }: { preview: GiftBundlePreview }) {
  return (
    <View style={panelStyle('#ff9abf')}>
      <Text style={{ color: '#ff9abf', fontSize: 11, fontWeight: '900' }}>EXPANDED INFO CARD</Text>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 6 }}>{preview.name}</Text>
      <Text style={{ color: '#ddd', marginTop: 6 }}>{preview.description}</Text>
      <Text style={smallText('#d4af37')}>Summary: {kindSummary(preview.assetKinds)}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
        {Object.entries(preview.assetKinds).map(([kind, count]) => (
          <View key={kind} style={{ borderColor: count ? '#d4af37' : '#333', borderWidth: 1, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 9 }}>
            <Text style={{ color: count ? '#d4af37' : '#777', fontSize: 11, fontWeight: '900' }}>{kind}: {count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ExportWorkflowPanel({ copied, exportReady, onCopy, onMarkReady, onReset }: { copied: boolean; exportReady: boolean; onCopy: () => void; onMarkReady: () => void; onReset: () => void }) {
  return (
    <View style={panelStyle(exportReady ? '#1D9E75' : copied ? '#d4af37' : '#333')}>
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>Export workflow</Text>
      <Text style={smallText('#aaa')}>Use these controls to track the creator-side upload handoff before backend persistence is wired.</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
        <Pressable onPress={onCopy} style={{ backgroundColor: copied ? '#d4af37' : '#222', borderRadius: 10, paddingVertical: 9, paddingHorizontal: 11 }}>
          <Text style={{ color: copied ? '#000' : '#fff', fontWeight: '900', fontSize: 11 }}>{copied ? 'Manifest Copied' : 'Copy Manifest'}</Text>
        </Pressable>
        <Pressable onPress={onMarkReady} style={{ backgroundColor: exportReady ? '#1D9E75' : '#222', borderRadius: 10, paddingVertical: 9, paddingHorizontal: 11 }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 11 }}>{exportReady ? 'Export Ready' : 'Mark Export Ready'}</Text>
        </Pressable>
        <Pressable onPress={onReset} style={{ backgroundColor: '#441122', borderRadius: 10, paddingVertical: 9, paddingHorizontal: 11 }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 11 }}>Reset Export State</Text>
        </Pressable>
      </View>
      <Text style={smallText(exportReady ? '#1D9E75' : copied ? '#d4af37' : '#777')}>
        Status: {exportReady ? 'Ready for upload handoff' : copied ? 'Manifest copied, awaiting final ready mark' : 'Drafting bundle manifest'}
      </Text>
    </View>
  );
}

function UploadManifestPreview({ preview, copied, exportReady }: { preview: GiftBundlePreview; copied: boolean; exportReady: boolean }) {
  const slug = slugify(preview.name);
  const fileName = `${slug}.bundle.json`;
  const readyChecks = [
    { label: 'At least 2 assets selected', ready: preview.itemCount >= 2 },
    { label: 'Has a cover/card asset', ready: preview.assetKinds['pack-cover'] > 0 || preview.assetKinds.card > 0 },
    { label: 'Has priced or included value', ready: Boolean(preview.priceLabel) },
    { label: 'Manifest has item rows', ready: preview.uploadManifest.length > 0 },
    { label: 'Manifest copy step complete', ready: copied },
    { label: 'Creator marked export ready', ready: exportReady },
  ];
  const isReady = readyChecks.every((check) => check.ready);
  const manifestJson = JSON.stringify({
    bundleId: preview.id,
    slug,
    uploadFileName: fileName,
    name: preview.name,
    theme: preview.theme,
    summary: kindSummary(preview.assetKinds),
    itemCount: preview.itemCount,
    copiedForUpload: copied,
    exportReady,
    readyToUpload: isReady,
    items: preview.uploadManifest,
  }, null, 2);

  return (
    <View style={panelStyle(isReady ? '#1D9E75' : '#d4af37')}>
      <Text style={{ color: isReady ? '#1D9E75' : '#d4af37', fontSize: 11, fontWeight: '900' }}>UPLOAD MANIFEST PREVIEW</Text>
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 4 }}>{fileName}</Text>
      <Text style={smallText('#aaa')}>Pack summary: {kindSummary(preview.assetKinds)}</Text>
      {preview.uploadManifest.length ? preview.uploadManifest.map((item) => (
        <Text key={item.assetId} style={smallText('#ddd')}>• {item.quantity}x {item.name} / {item.kind}</Text>
      )) : <Text style={smallText('#777')}>Select assets to generate the manifest.</Text>}

      <View style={{ backgroundColor: '#050505', borderColor: isReady ? '#1D9E75' : '#42340c', borderWidth: 1, borderRadius: 12, padding: 10, marginTop: 10 }}>
        <Text style={{ color: isReady ? '#1D9E75' : '#d4af37', fontSize: 11, fontWeight: '900' }}>{isReady ? 'READY TO UPLOAD' : 'NEEDS REVIEW'}</Text>
        {readyChecks.map((check) => (
          <Text key={check.label} style={smallText(check.ready ? '#1D9E75' : '#d4af37')}>{check.ready ? '✓' : '•'} {check.label}</Text>
        ))}
      </View>

      <View style={{ backgroundColor: '#050505', borderColor: '#243f34', borderWidth: 1, borderRadius: 12, padding: 10, marginTop: 10 }}>
        <Text style={{ color: '#1D9E75', fontSize: 11, fontWeight: '900' }}>COPY-READY MANIFEST</Text>
        <Text style={{ color: '#ddd', fontSize: 10, marginTop: 6 }}>{manifestJson}</Text>
      </View>
    </View>
  );
}

export function GiftBundleBuilderPanel() {
  const [activeTemplateId, setActiveTemplateId] = useState(BUNDLE_TEMPLATE_PRESETS[0].id);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>(starterGiftBundleDraft.selectedAssetIds);
  const [bundleName, setBundleName] = useState(starterGiftBundleDraft.name);
  const [bundleSubtitle, setBundleSubtitle] = useState(starterGiftBundleDraft.subtitle);
  const [bundleDescription, setBundleDescription] = useState(starterGiftBundleDraft.description);
  const [bundleTheme, setBundleTheme] = useState<GiftBundleCardTheme>(starterGiftBundleDraft.theme);
  const [bundlePrice, setBundlePrice] = useState(String(starterGiftBundleDraft.priceCredits || ''));
  const [manifestCopied, setManifestCopied] = useState(false);
  const [exportReady, setExportReady] = useState(false);
  const editableBundle = useMemo<GiftBundleDraft>(() => ({
    ...starterGiftBundleDraft,
    name: bundleName.trim() || starterGiftBundleDraft.name,
    subtitle: bundleSubtitle.trim() || starterGiftBundleDraft.subtitle,
    description: bundleDescription.trim() || starterGiftBundleDraft.description,
    theme: bundleTheme,
    priceCredits: parseCredits(bundlePrice, starterGiftBundleDraft.priceCredits),
    updatedAt: new Date().toISOString(),
  }), [bundleDescription, bundleName, bundlePrice, bundleSubtitle, bundleTheme]);
  const preview = useMemo(() => buildBundlePreview(editableBundle, starterGiftDraftAssets, selectedAssetIds), [editableBundle, selectedAssetIds]);
  const selectedIds = new Set(selectedAssetIds);

  function touchDraft() {
    setActiveTemplateId('custom');
    setManifestCopied(false);
    setExportReady(false);
  }

  function toggleAsset(assetId: string) {
    setSelectedAssetIds((current) => (
      current.includes(assetId)
        ? current.filter((id) => id !== assetId)
        : [...current, assetId]
    ));
    touchDraft();
  }

  function applyTemplate(template: BundleTemplatePreset) {
    setActiveTemplateId(template.id);
    setBundleName(template.name);
    setBundleSubtitle(template.subtitle);
    setBundleDescription(template.description);
    setBundleTheme(template.theme);
    setBundlePrice(template.price);
    setSelectedAssetIds(template.selectedAssetIds);
    setManifestCopied(false);
    setExportReady(false);
  }

  return (
    <View style={panelStyle('#ff0055')}>
      <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900' }}>Sticker / Digital Gift Bundle Builder</Text>
      <Text style={{ color: '#aaa', marginTop: 6 }}>
        Tap draft assets to group them into a named pack with a live front card, expanded info card, and upload-ready manifest.
      </Text>
      <Text style={smallText('#d4af37')}>Selected: {selectedAssetIds.length} / {starterGiftDraftAssets.length}</Text>

      <BundleTemplatePicker activeTemplateId={activeTemplateId} onApplyTemplate={applyTemplate} />

      <BundleDetailsEditor
        name={bundleName}
        subtitle={bundleSubtitle}
        description={bundleDescription}
        theme={bundleTheme}
        price={bundlePrice}
        onNameChange={(value) => { setBundleName(value); touchDraft(); }}
        onSubtitleChange={(value) => { setBundleSubtitle(value); touchDraft(); }}
        onDescriptionChange={(value) => { setBundleDescription(value); touchDraft(); }}
        onThemeChange={(value) => { setBundleTheme(value); touchDraft(); }}
        onPriceChange={(value) => { setBundlePrice(value); touchDraft(); }}
      />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        {starterGiftDraftAssets.map((asset) => (
          <AssetDraftCard key={asset.id} asset={asset} selected={selectedIds.has(asset.id)} onToggle={() => toggleAsset(asset.id)} />
        ))}
      </View>

      <FrontFacingBundleCard preview={preview} />
      <ExpandedInfoCard preview={preview} />
      <ExportWorkflowPanel copied={manifestCopied} exportReady={exportReady} onCopy={() => setManifestCopied(true)} onMarkReady={() => setExportReady(true)} onReset={() => { setManifestCopied(false); setExportReady(false); }} />
      <UploadManifestPreview preview={preview} copied={manifestCopied} exportReady={exportReady} />
    </View>
  );
}
