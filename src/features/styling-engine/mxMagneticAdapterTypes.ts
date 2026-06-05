import type { AssetPackCategory, AssetPackTier } from './assetPackTypes';

export type MXImportFormat =
  | 'svg-image'
  | 'svg-font'
  | 'ico'
  | 'woff'
  | 'woff2'
  | 'ttf'
  | 'otf'
  | 'json-manifest'
  | 'style-guide';

export type MXExportFormat =
  | 'svg-image'
  | 'svg-sprite'
  | 'symbol-defs'
  | 'icon-font'
  | 'web-component'
  | 'react-component'
  | 'react-native-component'
  | 'vue-component'
  | 'elm-component'
  | 'flutter-reference'
  | 'png-24'
  | 'indexed-png'
  | 'favicon-ico'
  | 'photoshop-csh'
  | 'tailwind-token-file'
  | 'css-variable-file'
  | 'marketplace-pack-card'
  | 'expanded-info-card'
  | 'download-bundle';

export type MXTargetRuntime =
  | 'vite'
  | 'rollup'
  | 'webpack'
  | 'esbuild'
  | 'rspack'
  | 'react-web'
  | 'react-native'
  | 'expo'
  | 'vue'
  | 'web-component'
  | 'tailwind-css'
  | 'plain-svg';

export type MXMagneticAdapterFamily = AssetPackCategory | 'ui-components';

export type MXMagneticAdapterCapability =
  | 'on-demand-icons'
  | 'auto-import-registry'
  | 'component-registry'
  | 'svg-sprite-build'
  | 'svgo-cleanup'
  | 'css-token-export'
  | 'tailwind-token-export'
  | 'marketplace-front-card'
  | 'marketplace-expanded-card'
  | 'download-bundle-manifest'
  | 'web-component-output'
  | 'react-output'
  | 'react-native-output'
  | 'vue-output'
  | 'raster-preview-output';

export type MXMagneticAdapterContract = {
  id: string;
  name: string;
  summary: string;
  family: MXMagneticAdapterFamily;
  tier: AssetPackTier | 'generated';
  inputFormats: MXImportFormat[];
  outputFormats: MXExportFormat[];
  targetRuntimes: MXTargetRuntime[];
  capabilities: MXMagneticAdapterCapability[];
  generatedBy: 'mistress-x-styling-engine';
  magneticVersion: string;
  supportsAutoImport: boolean;
  supportsOnDemandIcons: boolean;
  supportsTailwindTokens: boolean;
  supportsSvgoCleanup: boolean;
  supportsMarketplaceCard: boolean;
  supportsExpandedInfoCard: boolean;
};

export type MXMagneticAdapterRegistryEntry = MXMagneticAdapterContract & {
  status: 'planned' | 'scaffolded' | 'wired' | 'live';
  progress: number;
  nextStep: string;
};

export type MXGeneratedAdapterBundleSummary = {
  packId: string;
  packName: string;
  adapterContractId: string;
  autoImportRegistryPath?: string;
  svgSpritePath?: string;
  reactComponentPath?: string;
  reactNativeComponentPath?: string;
  cssTokenPath?: string;
  tailwindTokenPath?: string;
  frontCardPath?: string;
  expandedInfoCardPath?: string;
  downloadManifestPath?: string;
};
