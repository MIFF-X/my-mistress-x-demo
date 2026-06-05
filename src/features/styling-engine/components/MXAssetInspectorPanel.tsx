import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { AssetPackManifest } from '../assetPackTypes';
import { buildAstroIconUsage, buildMarketplaceAssetSummary, resolvePackManifest } from '../assetManifestResolver';
import { createAstroReference, createDownloadBundleMetadata, createPackExportSummary, formatAstroReferenceForDisplay, formatExportSummaryForDisplay } from '../exportHelpers';
import { buildMagneticAdapterBundleSummary, buildMagneticAdapterNotice, formatMagneticAdapterBundleSummary } from '../magneticAdapterBundleBuilder';
import { formatMagneticReviewRecord, type MXMagneticReviewRecord } from '../magneticReviewQueueModel';
import { submitPreparedMagneticReviewRecord } from '../magneticReviewQueueApi';
import { MXGeneratedBundleOutputPanel } from './MXGeneratedBundleOutputPanel';

const palette = {
  background: '#080806',
  panel: '#111008',
  cell: '#0e0c07',
  border: '#2a2208',
  borderStrong: '#3a2f10',
  gold: '#c8a84b',
  goldLight: '#f0d060',
  goldDark: '#7a6230',
  cyan: '#00e5ff',
  green: '#4ade80',
  text: '#f1dfad',
  muted: '#6a5820',
};

type MXAssetInspectorPanelProps = {
  manifest?: AssetPackManifest | null;
  onExportBundle?: (packId: string) => void;
  onCopyAstroName?: (astroIconName: string) => void;
  onSaveAstroReference?: (referenceText: string) => void;
  onPrepareDownloadBundle?: (bundleText: string) => void;
  onSubmitReviewRecord?: (record: MXMagneticReviewRecord) => void | Promise<void>;
};

function Badge({ label, tone = 'gold' }: { label: string; tone?: 'gold' | 'cyan' | 'green' | 'muted' }) {
  const color = tone === 'cyan' ? palette.cyan : tone === 'green' ? palette.green : tone === 'muted' ? palette.muted : palette.goldDark;
  return (
    <View style={{ borderColor: color, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#080806' }}>
      <Text style={{ color, fontSize: 8, fontWeight: '900', textTransform: 'uppercase' }}>{label}</Text>
    </View>
  );
}

function PathLine({ label, value }: { label: string; value?: string }) {
  return (
    <View style={{ gap: 2 }}>
      <Text style={{ color: palette.goldDark, fontSize: 8, fontWeight: '900', textTransform: 'uppercase' }}>{label}</Text>
      <Text numberOfLines={1} style={{ color: palette.muted, fontSize: 9 }}>{value || 'Not mapped yet'}</Text>
    </View>
  );
}

function MagneticPathGrid({ rows }: { rows: Array<{ label: string; value?: string; tone?: 'gold' | 'cyan' | 'green' | 'muted' }> }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {rows.map((row) => (
        <View key={row.label} style={{ flexGrow: 1, flexBasis: 190, borderColor: palette.border, borderWidth: 1, borderRadius: 10, backgroundColor: palette.cell, padding: 9, gap: 4 }}>
          <Badge label={row.label} tone={row.tone || (row.value ? 'green' : 'muted')} />
          <Text numberOfLines={2} style={{ color: row.value ? palette.goldLight : palette.muted, fontSize: 9, lineHeight: 13 }}>{row.value || 'Not generated for this adapter'}</Text>
        </View>
      ))}
    </View>
  );
}

export function MXAssetInspectorPanel({ manifest, onExportBundle, onCopyAstroName, onSaveAstroReference, onPrepareDownloadBundle, onSubmitReviewRecord }: MXAssetInspectorPanelProps) {
  const resolved = useMemo(() => manifest ? resolvePackManifest(manifest) : null, [manifest]);
  const summary = useMemo(() => manifest ? buildMarketplaceAssetSummary(manifest) : null, [manifest]);
  const exportSummary = useMemo(() => manifest ? createPackExportSummary(manifest) : null, [manifest]);
  const bundleMetadata = useMemo(() => manifest ? createDownloadBundleMetadata(manifest) : null, [manifest]);
  const magneticSummary = useMemo(() => manifest ? buildMagneticAdapterBundleSummary(manifest) : null, [manifest]);
  const magneticNotice = useMemo(() => manifest ? buildMagneticAdapterNotice(manifest) : null, [manifest]);
  const magneticDisplay = useMemo(() => magneticSummary ? formatMagneticAdapterBundleSummary(magneticSummary) : null, [magneticSummary]);

  if (!manifest || !resolved || !summary || !exportSummary || !bundleMetadata || !magneticSummary || !magneticDisplay) {
    return (
      <View style={{ borderColor: palette.border, borderWidth: 1, borderRadius: 14, backgroundColor: palette.panel, padding: 16 }}>
        <Text style={{ color: palette.goldLight, fontSize: 16, fontWeight: '900' }}>Asset Inspector</Text>
        <Text style={{ color: palette.muted, fontSize: 12, marginTop: 6 }}>Select a Styling Engine pack to inspect its generated asset paths.</Text>
      </View>
    );
  }

  const resolvedId = resolved.id;
  const mergedSummary = [
    formatExportSummaryForDisplay(exportSummary),
    '',
    'MX Magnetic Adapter Bundle Paths',
    '--------------------------------',
    magneticDisplay,
  ].join('\n');

  function exportMagneticBundle() {
    onPrepareDownloadBundle?.(mergedSummary);
    onExportBundle?.(resolvedId);
  }

  function saveGeneratedBundleOutput(outputText: string) {
    onPrepareDownloadBundle?.([outputText, '', 'Full Magnetic Bundle Summary', '----------------------------', mergedSummary].join('\n'));
  }

  async function submitGeneratedReviewRecord(record: MXMagneticReviewRecord) {
    if (onSubmitReviewRecord) {
      await onSubmitReviewRecord(record);
      return;
    }

    try {
      const submitted = await submitPreparedMagneticReviewRecord(record);
      onPrepareDownloadBundle?.([
        'Styling Engine review record submitted to backend.',
        '',
        formatMagneticReviewRecord(submitted),
      ].join('\n'));
    } catch (error) {
      onPrepareDownloadBundle?.([
        'Styling Engine review record prepared locally, but backend submit failed.',
        `Reason: ${error instanceof Error ? error.message : 'unknown error'}`,
        '',
        formatMagneticReviewRecord(record),
      ].join('\n'));
    }
  }

  const magneticRows = [
    { label: 'Adapter', value: magneticSummary.adapterContractId, tone: 'cyan' as const },
    { label: 'Auto import', value: magneticSummary.autoImportRegistryPath },
    { label: 'SVG sprite', value: magneticSummary.svgSpritePath },
    { label: 'React', value: magneticSummary.reactComponentPath },
    { label: 'React Native', value: magneticSummary.reactNativeComponentPath },
    { label: 'CSS tokens', value: magneticSummary.cssTokenPath },
    { label: 'Tailwind', value: magneticSummary.tailwindTokenPath },
    { label: 'Front card', value: magneticSummary.frontCardPath },
    { label: 'Expanded card', value: magneticSummary.expandedInfoCardPath },
    { label: 'Download manifest', value: magneticSummary.downloadManifestPath },
  ];

  return (
    <View style={{ borderColor: palette.borderStrong, borderWidth: 1, borderRadius: 16, backgroundColor: palette.panel, overflow: 'hidden' }}>
      <View style={{ padding: 16, borderBottomColor: palette.border, borderBottomWidth: 1, gap: 8 }}>
        <Text style={{ color: palette.gold, fontSize: 11, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>Pack Detail / Asset Inspector</Text>
        <Text style={{ color: palette.goldLight, fontSize: 22, fontWeight: '900' }}>{resolved.name}</Text>
        <Text style={{ color: palette.muted, fontSize: 12, lineHeight: 18 }}>{resolved.description}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
          <Badge label={`${summary.assetCount} assets`} />
          <Badge label={resolved.category.replace('-', ' ')} />
          <Badge label={resolved.tier} />
          <Badge label={resolved.qualityMode.replace('-', ' ')} />
          <Badge label="magnetic mapped" tone="green" />
        </View>
      </View>

      <View style={{ padding: 14, gap: 10 }}>
        <View style={{ borderColor: palette.border, borderWidth: 1, borderRadius: 12, padding: 12, backgroundColor: palette.background, gap: 6 }}>
          <Text style={{ color: palette.goldLight, fontSize: 12, fontWeight: '900' }}>Folder Convention</Text>
          <PathLine label="Astro root" value={resolved.iconConvention.astroRoot} />
          <PathLine label="Astro pack folder" value={resolved.iconConvention.astroPackFolder} />
          <PathLine label="Astro icon prefix" value={resolved.iconConvention.astroIconPrefix} />
          <PathLine label="Marketplace output" value={resolved.iconConvention.marketplaceOutputFolder} />
        </View>

        <View style={{ borderColor: palette.border, borderWidth: 1, borderRadius: 12, padding: 12, backgroundColor: palette.background, gap: 6 }}>
          <Text style={{ color: palette.goldLight, fontSize: 12, fontWeight: '900' }}>Export Helper Summary</Text>
          <PathLine label="Bundle" value={bundleMetadata.suggestedBundleName} />
          <PathLine label="Manifest" value={bundleMetadata.manifestPath} />
          <PathLine label="Next step" value={bundleMetadata.nextStep} />
        </View>

        <View style={{ borderColor: palette.border, borderWidth: 1, borderRadius: 12, padding: 12, backgroundColor: palette.background, gap: 8 }}>
          <Text style={{ color: palette.goldLight, fontSize: 12, fontWeight: '900' }}>MX Magnetic Adapter Export Map</Text>
          <Text style={{ color: palette.muted, fontSize: 10, lineHeight: 15 }}>{magneticNotice}</Text>
          <MagneticPathGrid rows={magneticRows} />
        </View>

        <MXGeneratedBundleOutputPanel summary={magneticSummary} onSaveOutput={saveGeneratedBundleOutput} onSubmitReviewRecord={submitGeneratedReviewRecord} />

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Pressable accessibilityRole="button" onPress={exportMagneticBundle} style={{ flexGrow: 1, flexBasis: 150, backgroundColor: palette.gold, borderRadius: 10, paddingVertical: 11 }}>
            <Text style={{ color: palette.background, textAlign: 'center', fontWeight: '900', fontSize: 10, letterSpacing: 1.4 }}>Export Magnetic Bundle</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => onPrepareDownloadBundle?.(mergedSummary)} style={{ flexGrow: 1, flexBasis: 150, borderColor: palette.border, borderWidth: 1, borderRadius: 10, paddingVertical: 11 }}>
            <Text style={{ color: palette.gold, textAlign: 'center', fontWeight: '900', fontSize: 10, letterSpacing: 1.4 }}>Prepare Magnetic Summary</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 14, gap: 10 }}>
        {resolved.resolvedAssets.map((asset) => {
          const reference = createAstroReference(asset);
          return (
            <View key={asset.id} style={{ width: 260, borderColor: palette.border, borderWidth: 1, borderRadius: 12, padding: 12, backgroundColor: palette.cell, gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: palette.goldLight, fontSize: 13, fontWeight: '900' }}>{asset.name}</Text>
                  <Text style={{ color: palette.goldDark, fontSize: 9, marginTop: 2 }}>{asset.category.replace('-', ' ')} · {asset.preferredFormat.toUpperCase()}</Text>
                </View>
                <View style={{ borderColor: palette.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 4 }}>
                  <Text style={{ color: palette.goldDark, fontSize: 8, fontWeight: '900' }}>{asset.tier}</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                {asset.formats.map((format) => <Badge key={format} label={format} />)}
              </View>

              <PathLine label="Astro name" value={asset.astroIconName} />
              <PathLine label="Web path" value={asset.webIconPath} />
              <PathLine label="Marketplace path" value={asset.marketplaceAssetPath} />
              <PathLine label="Astro usage" value={buildAstroIconUsage(asset)} />

              <Pressable accessibilityRole="button" onPress={() => onCopyAstroName?.(asset.astroIconName || '')} style={{ borderColor: palette.borderStrong, borderWidth: 1, borderRadius: 8, paddingVertical: 9 }}>
                <Text style={{ color: palette.gold, textAlign: 'center', fontWeight: '900', fontSize: 9 }}>Use Astro Name</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => onSaveAstroReference?.(formatAstroReferenceForDisplay(reference))} style={{ backgroundColor: '#191407', borderRadius: 8, paddingVertical: 9 }}>
                <Text style={{ color: palette.goldLight, textAlign: 'center', fontWeight: '900', fontSize: 9 }}>Save Reference</Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default MXAssetInspectorPanel;
