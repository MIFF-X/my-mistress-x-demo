import type { AssetPackManifest } from './assetPackTypes';
import { getMagneticAdapterById, MX_MAGNETIC_ADAPTER_REGISTRY } from './magneticAdapterRegistry';
import type { MXGeneratedAdapterBundleSummary, MXMagneticAdapterRegistryEntry } from './mxMagneticAdapterTypes';

function safeSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'mistress-x-pack';
}

function buildBasePath(pack: Pick<AssetPackManifest, 'id' | 'name'>) {
  return `styling-engine/${safeSlug(pack.id || pack.name)}`;
}

export function chooseBestMagneticAdapter(pack: AssetPackManifest): MXMagneticAdapterRegistryEntry {
  if (pack.category === 'icons') return getMagneticAdapterById('mx-icons-on-demand-adapter') ?? MX_MAGNETIC_ADAPTER_REGISTRY[0];
  if (pack.category === 'fonts') return getMagneticAdapterById('mx-font-icon-export-adapter') ?? MX_MAGNETIC_ADAPTER_REGISTRY[0];
  if (pack.category === 'themes') return getMagneticAdapterById('mx-css-tailwind-token-adapter') ?? MX_MAGNETIC_ADAPTER_REGISTRY[0];
  if (pack.category === 'flyer-cards' || pack.category === 'digital-gifts') return getMagneticAdapterById('mx-marketplace-card-adapter') ?? MX_MAGNETIC_ADAPTER_REGISTRY[0];
  return getMagneticAdapterById('mx-marketplace-card-adapter') ?? MX_MAGNETIC_ADAPTER_REGISTRY[0];
}

export function buildMagneticAdapterBundleSummary(pack: AssetPackManifest): MXGeneratedAdapterBundleSummary {
  const adapter = chooseBestMagneticAdapter(pack);
  const basePath = buildBasePath(pack);

  return {
    packId: pack.id,
    packName: pack.name,
    adapterContractId: adapter.id,
    autoImportRegistryPath: adapter.supportsAutoImport ? `${basePath}/generated/auto-import-registry.ts` : undefined,
    svgSpritePath: adapter.outputFormats.includes('svg-sprite') ? `${basePath}/svg/${safeSlug(pack.name)}.sprite.svg` : undefined,
    reactComponentPath: adapter.outputFormats.includes('react-component') ? `${basePath}/react/index.tsx` : undefined,
    reactNativeComponentPath: adapter.outputFormats.includes('react-native-component') ? `${basePath}/react-native/index.tsx` : undefined,
    cssTokenPath: adapter.outputFormats.includes('css-variable-file') ? `${basePath}/tokens/mx-theme.css` : undefined,
    tailwindTokenPath: adapter.outputFormats.includes('tailwind-token-file') ? `${basePath}/tokens/tailwind.tokens.ts` : undefined,
    frontCardPath: adapter.outputFormats.includes('marketplace-pack-card') ? `${basePath}/marketplace/front-card.json` : undefined,
    expandedInfoCardPath: adapter.outputFormats.includes('expanded-info-card') ? `${basePath}/marketplace/expanded-info-card.json` : undefined,
    downloadManifestPath: adapter.outputFormats.includes('download-bundle') ? `${basePath}/manifest/download-bundle.json` : undefined,
  };
}

export function formatMagneticAdapterBundleSummary(summary: MXGeneratedAdapterBundleSummary) {
  const rows = [
    `Pack: ${summary.packName}`,
    `Pack ID: ${summary.packId}`,
    `Adapter contract: ${summary.adapterContractId}`,
    summary.autoImportRegistryPath ? `Auto import registry: ${summary.autoImportRegistryPath}` : null,
    summary.svgSpritePath ? `SVG sprite: ${summary.svgSpritePath}` : null,
    summary.reactComponentPath ? `React components: ${summary.reactComponentPath}` : null,
    summary.reactNativeComponentPath ? `React Native components: ${summary.reactNativeComponentPath}` : null,
    summary.cssTokenPath ? `CSS tokens: ${summary.cssTokenPath}` : null,
    summary.tailwindTokenPath ? `Tailwind tokens: ${summary.tailwindTokenPath}` : null,
    summary.frontCardPath ? `Front-facing card: ${summary.frontCardPath}` : null,
    summary.expandedInfoCardPath ? `Expanded info card: ${summary.expandedInfoCardPath}` : null,
    summary.downloadManifestPath ? `Download bundle manifest: ${summary.downloadManifestPath}` : null,
  ].filter(Boolean);

  return rows.join('\n');
}

export function buildMagneticAdapterNotice(pack: AssetPackManifest) {
  const adapter = chooseBestMagneticAdapter(pack);
  return `${pack.name} is mapped to ${adapter.name} at ${adapter.progress}% readiness. ${adapter.nextStep}`;
}
