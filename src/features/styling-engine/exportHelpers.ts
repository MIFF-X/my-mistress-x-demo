import type { AssetPackManifest } from './assetPackTypes';
import { buildAstroIconUsage, buildMarketplaceAssetSummary, resolvePackManifest, type ResolvedStylingEngineAsset } from './assetManifestResolver';

export type StylingEngineExportSummary = {
  packId: string;
  packName: string;
  exportedAt: string;
  assetCount: number;
  astroReferences: string[];
  webPaths: string[];
  marketplacePaths: string[];
  bundleMetadata: {
    manifestPath: string;
    svgRoot: string;
    webIconRoot: string;
    suggestedBundleName: string;
  };
};

export type StylingEngineSavedReference = {
  id: string;
  packId: string;
  packName: string;
  assetId: string;
  assetName: string;
  astroIconName?: string;
  astroUsage: string;
  webIconPath?: string;
  marketplaceAssetPath?: string;
  savedAt: string;
};

function nowIso() {
  return new Date().toISOString();
}

export function createAstroReference(asset: ResolvedStylingEngineAsset): StylingEngineSavedReference {
  return {
    id: `${asset.packId}:${asset.id}:${Date.now()}`,
    packId: asset.packId,
    packName: asset.packName,
    assetId: asset.id,
    assetName: asset.name,
    astroIconName: asset.astroIconName,
    astroUsage: buildAstroIconUsage(asset),
    webIconPath: asset.webIconPath,
    marketplaceAssetPath: asset.marketplaceAssetPath,
    savedAt: nowIso(),
  };
}

export function createPackExportSummary(manifest: AssetPackManifest): StylingEngineExportSummary {
  const resolved = resolvePackManifest(manifest);
  const summary = buildMarketplaceAssetSummary(manifest);

  return {
    packId: resolved.id,
    packName: resolved.name,
    exportedAt: nowIso(),
    assetCount: summary.assetCount,
    astroReferences: resolved.resolvedAssets.map((asset) => asset.astroIconName || '').filter(Boolean),
    webPaths: resolved.resolvedAssets.map((asset) => asset.webIconPath || '').filter(Boolean),
    marketplacePaths: resolved.resolvedAssets.map((asset) => asset.marketplaceAssetPath || '').filter(Boolean),
    bundleMetadata: {
      manifestPath: `${resolved.iconConvention.marketplaceOutputFolder}/manifest.json`,
      svgRoot: `${resolved.iconConvention.marketplaceOutputFolder}/svg`,
      webIconRoot: resolved.iconConvention.astroPackFolder,
      suggestedBundleName: `${resolved.id}.zip`,
    },
  };
}

export function createDownloadBundleMetadata(manifest: AssetPackManifest) {
  const exportSummary = createPackExportSummary(manifest);

  return {
    ...exportSummary.bundleMetadata,
    packId: exportSummary.packId,
    packName: exportSummary.packName,
    assetCount: exportSummary.assetCount,
    createdAt: exportSummary.exportedAt,
    readyForDownload: false,
    nextStep: 'Backend must create ZIP, verify entitlement, and issue signed download URL.',
    magneticConnector: {
      featureKey: 'mistress-x-styling-engine',
      event: 'stylingEngine.bundlePrepared',
    },
  };
}

export function formatExportSummaryForDisplay(summary: StylingEngineExportSummary) {
  return [
    `${summary.packName} export summary`,
    `${summary.assetCount} assets`,
    `Manifest: ${summary.bundleMetadata.manifestPath}`,
    `SVG Root: ${summary.bundleMetadata.svgRoot}`,
    `Web Icon Root: ${summary.bundleMetadata.webIconRoot}`,
    `Bundle: ${summary.bundleMetadata.suggestedBundleName}`,
  ].join('\n');
}

export function formatAstroReferenceForDisplay(reference: StylingEngineSavedReference) {
  return [
    `${reference.assetName} (${reference.packName})`,
    `Astro: ${reference.astroIconName || 'not mapped'}`,
    `Usage: ${reference.astroUsage}`,
    `Web: ${reference.webIconPath || 'not mapped'}`,
    `Marketplace: ${reference.marketplaceAssetPath || 'not mapped'}`,
  ].join('\n');
}
