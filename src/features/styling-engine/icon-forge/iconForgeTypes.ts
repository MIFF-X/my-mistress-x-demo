export type MxIconForgeActionId =
  | 'add-icons'
  | 'organize'
  | 'edit'
  | 'download'
  | 'share-save'
  | 'publish-market'
  | 'assign-plugin'
  | 'apply-theme';

export type MxIconExportFormat =
  | 'svg'
  | 'svg-sprite'
  | 'icon-font'
  | 'png'
  | 'favicon'
  | 'react'
  | 'vue'
  | 'web-component'
  | 'flutter'
  | 'json';

export type MxIconSourceType = 'local-svg' | 'iconify-json' | 'generated-original' | 'licensed-reference';

export type MxIconForgeAction = {
  id: MxIconForgeActionId;
  title: string;
  description: string;
  icon: string;
};

export type MxIconCollection = {
  id: string;
  name: string;
  description: string;
  sourceTypes: MxIconSourceType[];
  exportFormats: MxIconExportFormat[];
  iconCount: number;
  tags: string[];
  installTargets: string[];
  updatedAt: string;
};
