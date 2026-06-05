import type { AssetPackFormat, AssetPackItem, AssetPackManifest } from './assetPackTypes';

export type ResolvedStylingEngineAsset = AssetPackItem & {
  marketplaceAssetPath?: string;
  astroIconName?: string;
  webIconPath?: string;
  preferredFormat: AssetPackFormat;
  displayName: string;
  packId: string;
  packName: string;
};

export type ResolvedStylingEnginePack = AssetPackManifest & {
  resolvedAssets: ResolvedStylingEngineAsset[];
  iconConvention: {
    astroRoot: string;
    astroPackFolder: string;
    astroIconPrefix: string;
    marketplaceOutputFolder: string;
  };
};

const DEFAULT_ASTRO_ROOT = 'src/icons';
const DEFAULT_MARKETPLACE_ROOT = 'tools/asset-generator/output';

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function extensionFor(format: AssetPackFormat) {
  if (format === 'jsx' || format === 'tsx') return format;
  return format;
}

export function getPreferredAssetFormat(asset: AssetPackItem): AssetPackFormat {
  if (asset.formats.includes('svg')) return 'svg';
  if (asset.formats.includes('webp')) return 'webp';
  if (asset.formats.includes('png')) return 'png';
  if (asset.formats.includes('jsx')) return 'jsx';
  if (asset.formats.includes('tsx')) return 'tsx';
  return asset.formats[0] || 'json';
}

export function resolveAssetPaths(manifest: AssetPackManifest, asset: AssetPackItem): ResolvedStylingEngineAsset {
  const packId = slugify(manifest.id);
  const assetId = slugify(asset.id);
  const preferredFormat = getPreferredAssetFormat(asset);
  const extension = extensionFor(preferredFormat);
  const marketplaceAssetPath = asset.previewPath || asset.svgPath || asset.pngPath || `${DEFAULT_MARKETPLACE_ROOT}/${packId}/${preferredFormat}/${assetId}.${extension}`;
  const webIconPath = asset.svgPath || `src/icons/mistress-x/${packId}/${assetId}.svg`;
  const astroIconName = `mistress-x/${packId}/${assetId}`;

  return {
    ...asset,
    marketplaceAssetPath,
    astroIconName,
    webIconPath,
    preferredFormat,
    displayName: asset.name,
    packId,
    packName: manifest.name,
  };
}

export function resolvePackManifest(manifest: AssetPackManifest): ResolvedStylingEnginePack {
  const packId = slugify(manifest.id);

  return {
    ...manifest,
    resolvedAssets: manifest.items.map((asset) => resolveAssetPaths(manifest, asset)),
    iconConvention: {
      astroRoot: DEFAULT_ASTRO_ROOT,
      astroPackFolder: `${DEFAULT_ASTRO_ROOT}/mistress-x/${packId}`,
      astroIconPrefix: `mistress-x/${packId}`,
      marketplaceOutputFolder: `${DEFAULT_MARKETPLACE_ROOT}/${packId}`,
    },
  };
}

export function resolvePackCollection(manifests: AssetPackManifest[]) {
  return manifests.map(resolvePackManifest);
}

export function findResolvedAsset(manifest: AssetPackManifest, assetId: string) {
  const resolved = resolvePackManifest(manifest);
  return resolved.resolvedAssets.find((asset) => asset.id === assetId || slugify(asset.id) === slugify(assetId));
}

export function buildAstroIconUsage(asset: ResolvedStylingEngineAsset) {
  return `<Icon name="${asset.astroIconName}" />`;
}

export function buildMarketplaceAssetSummary(manifest: AssetPackManifest) {
  const resolved = resolvePackManifest(manifest);
  return {
    packId: resolved.id,
    packName: resolved.name,
    assetCount: resolved.resolvedAssets.length,
    iconConvention: resolved.iconConvention,
    assets: resolved.resolvedAssets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      category: asset.category,
      preferredFormat: asset.preferredFormat,
      marketplaceAssetPath: asset.marketplaceAssetPath,
      astroIconName: asset.astroIconName,
      webIconPath: asset.webIconPath,
    })),
  };
}
