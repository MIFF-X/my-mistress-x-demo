import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';
import type { AssetPackCategory, AssetPackManifest, StylingEngineCartAction } from './assetPackTypes';
import { MXAssetInspectorPanel } from './components/MXAssetInspectorPanel';
import { MXBundleBuilderPanel, type StylingEngineBundleMode } from './components/MXBundleBuilderPanel';
import { MXGeneratedDraftQueuePanel, type StylingEngineDraftQueueItem } from './components/MXGeneratedDraftQueuePanel';
import { MXGeneralIconsCard } from './components/MXGeneralIconsCard';
import { MXMarketplaceGrid } from './components/MXMarketplaceGrid';
import { MXPackCardGeneratorPanel, type StylingEnginePackCardDraft, type StylingEnginePackCardVariant } from './components/MXPackCardGeneratorPanel';
import { PackPreviewScreen } from './packPreviewScreen';
import { STYLING_ENGINE_MARKETPLACE_MANIFESTS } from './packManifest';
import { createIconifyComponentUsage, createMistressXAssetPrompt, createMistressXPackName, parseSemanticIconReference } from './semanticIconBridge';
import { stylingEngineApi } from './stylingEngineApi';
import { getCurrentUser } from '../../state/authStore';

type TierFilter = 'all' | 'free' | 'paid' | 'premium' | 'custom';
type FamilyFilter = 'all' | AssetPackCategory;
type GeneratorAction = 'generate-pack' | 'upload-style-guide' | 'create-digital-gift' | 'create-certificate' | 'create-font-preview' | 'export-bundle';
type SemanticUseCase = 'ui-actions' | 'dashboard' | 'creator-tools' | 'commerce' | 'social' | 'emotes' | 'logos';
type SemanticRotation = '0deg' | '90deg' | '180deg' | '270deg';
type SemanticFlip = 'none' | 'horizontal' | 'vertical' | 'both';

type SemanticBridgeSettings = {
  reference: string;
  useCase: SemanticUseCase;
  rotation: SemanticRotation;
  flip: SemanticFlip;
  inline: boolean;
  prompt?: string | null;
  componentUsage?: { webComponent: string; react: string; svelte: string } | null;
};

type PackMarketplaceScreenProps = {
  manifests?: AssetPackManifest[];
  onCartAction?: (action: StylingEngineCartAction) => void;
};

const STORAGE_KEYS = {
  savedReferences: 'mx.stylingEngine.savedAstroReferences',
  preparedBundle: 'mx.stylingEngine.preparedBundleSummary',
  semanticBridgeSettings: 'mx.stylingEngine.semanticBridgeSettings',
  generatedDraftQueue: 'mx.stylingEngine.generatedDraftQueue',
  packCardDraft: 'mx.stylingEngine.packCardDraft',
  packCardVariant: 'mx.stylingEngine.packCardVariant',
};

const TIER_FILTERS: { id: TierFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'free', label: 'Free' },
  { id: 'paid', label: 'Paid' },
  { id: 'premium', label: 'Premium' },
  { id: 'custom', label: 'Custom' },
];

const FAMILY_FILTERS: { id: FamilyFilter; label: string }[] = [
  { id: 'all', label: 'All Families' },
  { id: 'icons', label: 'Icons' },
  { id: 'seals', label: 'Seals' },
  { id: 'awards', label: 'Awards' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'contracts', label: 'Contracts' },
  { id: 'fonts', label: 'Fonts' },
  { id: 'digital-gifts', label: 'Digital Gifts' },
  { id: 'themes', label: 'Style Guides' },
];

const GENERATOR_ACTIONS: { id: GeneratorAction; label: string; detail: string; family: FamilyFilter }[] = [
  { id: 'generate-pack', label: 'Generate Pack', detail: 'Create a fresh pack from the active style guide.', family: 'all' },
  { id: 'upload-style-guide', label: 'Upload Style Guide', detail: 'Prepare brand guide intake for generator variation runs.', family: 'themes' },
  { id: 'create-digital-gift', label: 'Create Digital Gift', detail: 'Generate a gift-ready SVG base and chat preview output.', family: 'digital-gifts' },
  { id: 'create-certificate', label: 'Create Certificate', detail: 'Open certificate pack templates for proof and milestone cards.', family: 'certificates' },
  { id: 'create-font-preview', label: 'Create Font Preview', detail: 'Generate typography sample cards and font pairing sheets.', family: 'fonts' },
  { id: 'export-bundle', label: 'Export Bundle', detail: 'Prepare manifest, SVG source and preview exports for download.', family: 'all' },
];

const SEMANTIC_USE_CASES: SemanticUseCase[] = ['ui-actions', 'dashboard', 'creator-tools', 'commerce', 'social', 'emotes', 'logos'];
const SEMANTIC_ROTATIONS: SemanticRotation[] = ['0deg', '90deg', '180deg', '270deg'];
const SEMANTIC_FLIPS: SemanticFlip[] = ['none', 'horizontal', 'vertical', 'both'];

const DEFAULT_SEMANTIC_SETTINGS: SemanticBridgeSettings = {
  reference: 'mdi:lock',
  useCase: 'ui-actions',
  rotation: '0deg',
  flip: 'none',
  inline: false,
  prompt: null,
  componentUsage: null,
};

const DEFAULT_PACK_CARD_DRAFT: StylingEnginePackCardDraft = {
  packName: 'Luxury Locks Set',
  packSubtitle: 'Single Icons • Bundle Pack',
  packTheme: 'Gold UI Essentials',
  assetTotal: '12+',
  price: '$49.99',
  contents: '6 premium icons\n3 seals\n2 badges\n1 front-facing menu card',
  description: 'A premium Mistress-X digital asset pack with a front-facing box/menu-card preview and an expanded information card for marketplace listing, licensing, contents and checkout copy.',
};

const engineColors = {
  background: '#050505',
  panel: '#101014',
  gold: '#d4af37',
  goldLight: '#f9d976',
  goldDark: '#6f4c16',
  muted: '#9a927f',
  text: '#f1dfad',
  border: '#2a2208',
};

function isSemanticRotation(value: unknown): value is SemanticRotation { return SEMANTIC_ROTATIONS.includes(value as SemanticRotation); }
function isSemanticFlip(value: unknown): value is SemanticFlip { return SEMANTIC_FLIPS.includes(value as SemanticFlip); }
function isSemanticUseCase(value: unknown): value is SemanticUseCase { return SEMANTIC_USE_CASES.includes(value as SemanticUseCase); }
function isPackCardVariant(value: unknown): value is StylingEnginePackCardVariant { return value === 'front-facing-card' || value === 'expanded-info-card'; }

function normalizeSemanticSettings(value: unknown): SemanticBridgeSettings {
  const input = value && typeof value === 'object' ? (value as Partial<SemanticBridgeSettings>) : {};
  return {
    reference: typeof input.reference === 'string' && input.reference.trim() ? input.reference : DEFAULT_SEMANTIC_SETTINGS.reference,
    useCase: isSemanticUseCase(input.useCase) ? input.useCase : DEFAULT_SEMANTIC_SETTINGS.useCase,
    rotation: isSemanticRotation(input.rotation) ? input.rotation : DEFAULT_SEMANTIC_SETTINGS.rotation,
    flip: isSemanticFlip(input.flip) ? input.flip : DEFAULT_SEMANTIC_SETTINGS.flip,
    inline: typeof input.inline === 'boolean' ? input.inline : DEFAULT_SEMANTIC_SETTINGS.inline,
    prompt: typeof input.prompt === 'string' ? input.prompt : null,
    componentUsage: input.componentUsage && typeof input.componentUsage === 'object' ? input.componentUsage : null,
  };
}

function normalizeDraftQueue(value: unknown): StylingEngineDraftQueueItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is StylingEngineDraftQueueItem => Boolean(item && typeof item === 'object' && typeof item.id === 'string' && typeof item.title === 'string'))
    .slice(0, 20);
}

function normalizePackCardDraft(value: unknown): StylingEnginePackCardDraft {
  const input = value && typeof value === 'object' ? (value as Partial<StylingEnginePackCardDraft>) : {};
  return {
    packName: typeof input.packName === 'string' ? input.packName : DEFAULT_PACK_CARD_DRAFT.packName,
    packSubtitle: typeof input.packSubtitle === 'string' ? input.packSubtitle : DEFAULT_PACK_CARD_DRAFT.packSubtitle,
    packTheme: typeof input.packTheme === 'string' ? input.packTheme : DEFAULT_PACK_CARD_DRAFT.packTheme,
    assetTotal: typeof input.assetTotal === 'string' ? input.assetTotal : DEFAULT_PACK_CARD_DRAFT.assetTotal,
    price: typeof input.price === 'string' ? input.price : DEFAULT_PACK_CARD_DRAFT.price,
    contents: typeof input.contents === 'string' ? input.contents : DEFAULT_PACK_CARD_DRAFT.contents,
    description: typeof input.description === 'string' ? input.description : DEFAULT_PACK_CARD_DRAFT.description,
  };
}

function tierMatches(manifest: AssetPackManifest, tier: TierFilter) { return tier === 'all' || manifest.tier === tier; }
function familyMatches(manifest: AssetPackManifest, family: FamilyFilter) { return family === 'all' || manifest.category === family || manifest.items.some((item) => item.category === family); }
function familyToGeneratedPackName(family: FamilyFilter) { return family === 'all' ? 'Generated Styling Engine Pack' : `Generated ${family.replace('-', ' ')} pack`; }
function buildDraftId(source: string) { return `${source}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }

function FamilySummary({ manifests }: { manifests: AssetPackManifest[] }) {
  const summary = useMemo(() => {
    const familyMap = new Map<AssetPackCategory, number>();
    manifests.forEach((manifest) => familyMap.set(manifest.category, (familyMap.get(manifest.category) || 0) + 1));
    return Array.from(familyMap.entries());
  }, [manifests]);
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {summary.map(([family, count]) => (
        <View key={family} style={{ borderColor: '#2a2634', borderWidth: 1, borderRadius: 999, backgroundColor: '#0d0d0d', paddingHorizontal: 10, paddingVertical: 6 }}>
          <Text style={{ color: engineColors.muted, fontSize: 10, fontWeight: '900' }}>{family.replace('-', ' ')} · {count}</Text>
        </View>
      ))}
    </View>
  );
}

function FilterRow<T extends string>({ label, filters, activeFilter, onChange }: { label: string; filters: { id: T; label: string }[]; activeFilter: T; onChange: (filter: T) => void }) {
  return (
    <View style={{ gap: 7 }}>
      <Text style={{ color: engineColors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
        {filters.map((filter) => {
          const active = activeFilter === filter.id;
          return (
            <Pressable key={filter.id} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => onChange(filter.id)} style={{ borderColor: active ? engineColors.gold : '#2a2634', borderWidth: 1, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8, backgroundColor: active ? '#181207' : '#0d0d0d' }}>
              <Text style={{ color: active ? engineColors.goldLight : engineColors.muted, fontSize: 12, fontWeight: '900' }}>{filter.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function ChoiceRow<T extends string>({ label, choices, value, onChange }: { label: string; choices: T[]; value: T; onChange: (value: T) => void }) {
  return (
    <View style={{ gap: 7 }}>
      <Text style={{ color: engineColors.gold, fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {choices.map((choice) => {
          const active = value === choice;
          return (
            <Pressable key={choice} onPress={() => onChange(choice)} style={{ borderColor: active ? engineColors.gold : '#2a2634', borderWidth: 1, borderRadius: 999, backgroundColor: active ? '#181207' : '#0d0d0d', paddingHorizontal: 12, paddingVertical: 7 }}>
              <Text style={{ color: active ? engineColors.goldLight : engineColors.muted, fontSize: 11, fontWeight: '900' }}>{choice}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function GeneratorControlPanel({ busyAction, onAction }: { busyAction?: GeneratorAction | null; onAction: (action: GeneratorAction, family: FamilyFilter) => void }) {
  return (
    <View style={{ borderColor: engineColors.goldDark, borderWidth: 1, borderRadius: 22, backgroundColor: '#0b0906', padding: 16, gap: 14 }}>
      <View style={{ gap: 4 }}>
        <Text style={{ color: engineColors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>Headmistress Generator Controls</Text>
        <Text style={{ color: engineColors.text, fontSize: 20, fontWeight: '900' }}>Generator Command Panel</Text>
        <Text style={{ color: engineColors.muted, fontSize: 12, lineHeight: 18 }}>Connected through the Magnetic Connector to backend list, create, preview and export endpoints. File storage and signed bundle downloads are still the next layer.</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {GENERATOR_ACTIONS.map((action) => {
          const busy = busyAction === action.id;
          return (
            <Pressable key={action.id} accessibilityRole="button" disabled={Boolean(busyAction)} onPress={() => onAction(action.id, action.family)} style={{ flexGrow: 1, flexBasis: 190, borderColor: busy ? engineColors.gold : engineColors.goldDark, borderWidth: 1, borderRadius: 15, backgroundColor: busy ? '#1d1608' : '#11100d', opacity: busyAction && !busy ? 0.56 : 1, padding: 12, gap: 6 }}>
              <Text style={{ color: engineColors.goldLight, fontSize: 14, fontWeight: '900' }}>{busy ? 'Working...' : action.label}</Text>
              <Text style={{ color: engineColors.muted, fontSize: 11, lineHeight: 16 }}>{action.detail}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function SemanticReferencePanel({ value, useCase, rotation, flip, inline, prompt, componentUsage, onChangeValue, onChangeUseCase, onChangeRotation, onChangeFlip, onToggleInline, onGenerate, onReset }: {
  value: string;
  useCase: SemanticUseCase;
  rotation: SemanticRotation;
  flip: SemanticFlip;
  inline: boolean;
  prompt?: string | null;
  componentUsage?: { webComponent: string; react: string; svelte: string } | null;
  onChangeValue: (value: string) => void;
  onChangeUseCase: (value: SemanticUseCase) => void;
  onChangeRotation: (value: SemanticRotation) => void;
  onChangeFlip: (value: SemanticFlip) => void;
  onToggleInline: () => void;
  onGenerate: () => void;
  onReset: () => void;
}) {
  return (
    <View style={{ borderColor: engineColors.goldDark, borderWidth: 1, borderRadius: 22, backgroundColor: '#0b0906', padding: 16, gap: 12 }}>
      <View style={{ gap: 4 }}>
        <Text style={{ color: engineColors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>Semantic Icon Reference Bridge</Text>
        <Text style={{ color: engineColors.text, fontSize: 20, fontWeight: '900' }}>Generate a Mistress-X Original</Text>
        <Text style={{ color: engineColors.muted, fontSize: 12, lineHeight: 18 }}>Enter a reference name like mdi:lock, lucide:crown, tabler:bell or material-symbols:upload. Rotation, flip and inline settings become composition hints for an original Mistress-X themed SVG.</Text>
      </View>
      <TextInput value={value} onChangeText={onChangeValue} placeholder="mdi:lock" placeholderTextColor="#6f6240" autoCapitalize="none" autoCorrect={false} style={{ borderColor: engineColors.border, borderWidth: 1, borderRadius: 12, backgroundColor: '#080806', color: engineColors.goldLight, padding: 12, fontSize: 13 }} />
      <ChoiceRow label="Use case" choices={SEMANTIC_USE_CASES} value={useCase} onChange={onChangeUseCase} />
      <ChoiceRow label="Rotation" choices={SEMANTIC_ROTATIONS} value={rotation} onChange={onChangeRotation} />
      <ChoiceRow label="Flip" choices={SEMANTIC_FLIPS} value={flip} onChange={onChangeFlip} />
      <Pressable accessibilityRole="switch" accessibilityState={{ checked: inline }} onPress={onToggleInline} style={{ borderColor: inline ? engineColors.gold : '#2a2634', borderWidth: 1, borderRadius: 12, backgroundColor: inline ? '#181207' : '#0d0d0d', padding: 11 }}>
        <Text style={{ color: inline ? engineColors.goldLight : engineColors.muted, fontSize: 12, fontWeight: '900', textAlign: 'center' }}>{inline ? 'Inline text alignment: ON' : 'Inline text alignment: OFF'}</Text>
      </Pressable>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={onGenerate} style={{ flexGrow: 1, flexBasis: 180, backgroundColor: engineColors.gold, borderRadius: 12, paddingVertical: 12 }}>
          <Text style={{ color: '#050505', textAlign: 'center', fontWeight: '900', letterSpacing: 1.5 }}>Generate Mistress-X Version</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onReset} style={{ flexGrow: 1, flexBasis: 140, borderColor: engineColors.goldDark, borderWidth: 1, borderRadius: 12, paddingVertical: 12 }}>
          <Text style={{ color: engineColors.goldLight, textAlign: 'center', fontWeight: '900', letterSpacing: 1.2 }}>Reset Bridge</Text>
        </Pressable>
      </View>
      {componentUsage ? (
        <View style={{ borderColor: engineColors.border, borderWidth: 1, borderRadius: 12, backgroundColor: '#080806', padding: 12, gap: 5 }}>
          <Text style={{ color: engineColors.gold, fontSize: 11, fontWeight: '900' }}>Iconify Reference Usage</Text>
          <Text style={{ color: engineColors.muted, fontSize: 10 }}>Web: {componentUsage.webComponent}</Text>
          <Text style={{ color: engineColors.muted, fontSize: 10 }}>React: {componentUsage.react}</Text>
          <Text style={{ color: engineColors.muted, fontSize: 10 }}>Svelte: {componentUsage.svelte}</Text>
        </View>
      ) : null}
      {prompt ? (
        <View style={{ borderColor: engineColors.border, borderWidth: 1, borderRadius: 12, backgroundColor: '#080806', padding: 12 }}>
          <Text style={{ color: engineColors.gold, fontSize: 11, fontWeight: '900', marginBottom: 6 }}>Generated Prompt</Text>
          <Text style={{ color: engineColors.muted, fontSize: 11, lineHeight: 17 }}>{prompt}</Text>
        </View>
      ) : null}
    </View>
  );
}

function SavedReferencePanel({ savedReferences, preparedBundle, onClearReferences, onClearBundle, onClearAll }: { savedReferences: string[]; preparedBundle?: string | null; onClearReferences: () => void; onClearBundle: () => void; onClearAll: () => void }) {
  if (!savedReferences.length && !preparedBundle) return null;
  return (
    <View style={{ borderColor: engineColors.border, borderWidth: 1, borderRadius: 16, backgroundColor: '#0e0c07', padding: 14, gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Text style={{ color: engineColors.goldLight, fontSize: 16, fontWeight: '900' }}>Saved Export Helper Output</Text>
        <Pressable accessibilityRole="button" onPress={onClearAll} style={{ borderColor: engineColors.goldDark, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
          <Text style={{ color: engineColors.gold, fontSize: 9, fontWeight: '900' }}>Clear All</Text>
        </Pressable>
      </View>
      {preparedBundle ? (
        <View style={{ borderColor: engineColors.border, borderWidth: 1, borderRadius: 10, padding: 10, backgroundColor: '#080806', gap: 7 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
            <Text style={{ color: engineColors.gold, fontSize: 11, fontWeight: '900' }}>Prepared Bundle Summary</Text>
            <Pressable accessibilityRole="button" onPress={onClearBundle} style={{ borderColor: engineColors.goldDark, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 }}>
              <Text style={{ color: engineColors.gold, fontSize: 8, fontWeight: '900' }}>Clear</Text>
            </Pressable>
          </View>
          <Text style={{ color: engineColors.muted, fontSize: 10, lineHeight: 15 }}>{preparedBundle}</Text>
        </View>
      ) : null}
      {savedReferences.length ? (
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
            <Text style={{ color: engineColors.gold, fontSize: 11, fontWeight: '900' }}>Saved Astro References</Text>
            <Pressable accessibilityRole="button" onPress={onClearReferences} style={{ borderColor: engineColors.goldDark, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 }}>
              <Text style={{ color: engineColors.gold, fontSize: 8, fontWeight: '900' }}>Clear References</Text>
            </Pressable>
          </View>
          {savedReferences.slice(0, 4).map((reference, index) => (
            <View key={`${reference}-${index}`} style={{ borderColor: engineColors.border, borderWidth: 1, borderRadius: 10, padding: 10, backgroundColor: '#080806' }}>
              <Text style={{ color: engineColors.gold, fontSize: 11, fontWeight: '900', marginBottom: 6 }}>Saved Astro Reference #{index + 1}</Text>
              <Text style={{ color: engineColors.muted, fontSize: 10, lineHeight: 15 }}>{reference}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function PackCardSection({ title, detail, children }: { title: string; detail: string; children: React.ReactNode }) {
  return (
    <View style={{ borderColor: engineColors.goldDark, borderWidth: 1, borderRadius: 24, backgroundColor: '#080806', padding: 12, gap: 10 }}>
      <View style={{ paddingHorizontal: 4, gap: 3 }}>
        <Text style={{ color: engineColors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>{title}</Text>
        <Text style={{ color: engineColors.muted, fontSize: 11, lineHeight: 16 }}>{detail}</Text>
      </View>
      {children}
    </View>
  );
}

export function PackMarketplaceScreen({ manifests = STYLING_ENGINE_MARKETPLACE_MANIFESTS, onCartAction }: PackMarketplaceScreenProps) {
  const [activeTier, setActiveTier] = useState<TierFilter>('all');
  const [activeFamily, setActiveFamily] = useState<FamilyFilter>('all');
  const [selectedPackId, setSelectedPackId] = useState(manifests[0]?.id || '');
  const [busyAction, setBusyAction] = useState<GeneratorAction | null>(null);
  const [savedReferences, setSavedReferences] = useState<string[]>([]);
  const [preparedBundle, setPreparedBundle] = useState<string | null>(null);
  const [draftQueue, setDraftQueue] = useState<StylingEngineDraftQueueItem[]>([]);
  const [bundleName, setBundleName] = useState('Luxury Locks Set');
  const [bundleMode, setBundleMode] = useState<StylingEngineBundleMode>('single-icon-set');
  const [selectedBundleDraftIds, setSelectedBundleDraftIds] = useState<string[]>([]);
  const [packCardDraft, setPackCardDraft] = useState<StylingEnginePackCardDraft>(DEFAULT_PACK_CARD_DRAFT);
  const [packCardVariant, setPackCardVariant] = useState<StylingEnginePackCardVariant>('front-facing-card');
  const [semanticReference, setSemanticReference] = useState(DEFAULT_SEMANTIC_SETTINGS.reference);
  const [semanticUseCase, setSemanticUseCase] = useState<SemanticUseCase>(DEFAULT_SEMANTIC_SETTINGS.useCase);
  const [semanticRotation, setSemanticRotation] = useState<SemanticRotation>(DEFAULT_SEMANTIC_SETTINGS.rotation);
  const [semanticFlip, setSemanticFlip] = useState<SemanticFlip>(DEFAULT_SEMANTIC_SETTINGS.flip);
  const [semanticInline, setSemanticInline] = useState(DEFAULT_SEMANTIC_SETTINGS.inline);
  const [semanticPrompt, setSemanticPrompt] = useState<string | null>(DEFAULT_SEMANTIC_SETTINGS.prompt || null);
  const [semanticComponentUsage, setSemanticComponentUsage] = useState<{ webComponent: string; react: string; svelte: string } | null>(DEFAULT_SEMANTIC_SETTINGS.componentUsage || null);
  const [storageHydrated, setStorageHydrated] = useState(false);
  const [notice, setNotice] = useState('Mistress-X Styling Engine marketplace is connected to the Magnetic Connector scaffold.');
  const [liveBundleCount, setLiveBundleCount] = useState<number | null>(null);

  // Magnetic-backed: pull live published bundles from the asset-bundles backend.
  useEffect(() => {
    let active = true;
    stylingEngineApi
      .listAssetBundles({ status: 'PUBLISHED' })
      .then((bundles) => { if (active) setLiveBundleCount(Array.isArray(bundles) ? bundles.length : 0); })
      .catch(() => { if (active) setLiveBundleCount(null); });
    return () => { active = false; };
  }, []);

  const visibleManifests = useMemo(() => manifests.filter((manifest) => tierMatches(manifest, activeTier) && familyMatches(manifest, activeFamily)), [activeFamily, activeTier, manifests]);
  const selectedManifest = visibleManifests.find((manifest) => manifest.id === selectedPackId) || visibleManifests[0] || manifests.find((manifest) => manifest.id === selectedPackId) || manifests[0];
  const selectedBundleDrafts = useMemo(() => draftQueue.filter((draft) => selectedBundleDraftIds.includes(draft.id)), [draftQueue, selectedBundleDraftIds]);

  useEffect(() => {
    let mounted = true;
    async function hydrateStorage() {
      try {
        const [storedReferences, storedBundle, storedSemanticSettings, storedDraftQueue, storedPackCardDraft, storedPackCardVariant] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.savedReferences),
          AsyncStorage.getItem(STORAGE_KEYS.preparedBundle),
          AsyncStorage.getItem(STORAGE_KEYS.semanticBridgeSettings),
          AsyncStorage.getItem(STORAGE_KEYS.generatedDraftQueue),
          AsyncStorage.getItem(STORAGE_KEYS.packCardDraft),
          AsyncStorage.getItem(STORAGE_KEYS.packCardVariant),
        ]);
        if (!mounted) return;
        if (storedReferences) {
          const parsed = JSON.parse(storedReferences);
          if (Array.isArray(parsed)) setSavedReferences(parsed.filter((item) => typeof item === 'string').slice(0, 10));
        }
        if (storedBundle) setPreparedBundle(storedBundle);
        if (storedSemanticSettings) {
          const semanticSettings = normalizeSemanticSettings(JSON.parse(storedSemanticSettings));
          setSemanticReference(semanticSettings.reference);
          setSemanticUseCase(semanticSettings.useCase);
          setSemanticRotation(semanticSettings.rotation);
          setSemanticFlip(semanticSettings.flip);
          setSemanticInline(semanticSettings.inline);
          setSemanticPrompt(semanticSettings.prompt || null);
          setSemanticComponentUsage(semanticSettings.componentUsage || null);
        }
        if (storedDraftQueue) setDraftQueue(normalizeDraftQueue(JSON.parse(storedDraftQueue)));
        if (storedPackCardDraft) setPackCardDraft(normalizePackCardDraft(JSON.parse(storedPackCardDraft)));
        if (isPackCardVariant(storedPackCardVariant)) setPackCardVariant(storedPackCardVariant);
      } catch (error) {
        if (mounted) setNotice(`Could not restore Styling Engine helper state: ${error instanceof Error ? error.message : 'unknown error'}`);
      } finally {
        if (mounted) setStorageHydrated(true);
      }
    }
    hydrateStorage();
    return () => { mounted = false; };
  }, []);

  useEffect(() => { if (storageHydrated) AsyncStorage.setItem(STORAGE_KEYS.savedReferences, JSON.stringify(savedReferences)).catch((error) => setNotice(`Could not persist Astro references: ${error instanceof Error ? error.message : 'unknown error'}`)); }, [savedReferences, storageHydrated]);
  useEffect(() => { if (storageHydrated) (preparedBundle ? AsyncStorage.setItem(STORAGE_KEYS.preparedBundle, preparedBundle) : AsyncStorage.removeItem(STORAGE_KEYS.preparedBundle)).catch((error) => setNotice(`Could not persist prepared bundle: ${error instanceof Error ? error.message : 'unknown error'}`)); }, [preparedBundle, storageHydrated]);
  useEffect(() => { if (storageHydrated) AsyncStorage.setItem(STORAGE_KEYS.semanticBridgeSettings, JSON.stringify({ reference: semanticReference, useCase: semanticUseCase, rotation: semanticRotation, flip: semanticFlip, inline: semanticInline, prompt: semanticPrompt, componentUsage: semanticComponentUsage })).catch((error) => setNotice(`Could not persist semantic bridge settings: ${error instanceof Error ? error.message : 'unknown error'}`)); }, [semanticReference, semanticUseCase, semanticRotation, semanticFlip, semanticInline, semanticPrompt, semanticComponentUsage, storageHydrated]);
  useEffect(() => { if (storageHydrated) AsyncStorage.setItem(STORAGE_KEYS.generatedDraftQueue, JSON.stringify(draftQueue)).catch((error) => setNotice(`Could not persist generated draft queue: ${error instanceof Error ? error.message : 'unknown error'}`)); }, [draftQueue, storageHydrated]);
  useEffect(() => { if (storageHydrated) AsyncStorage.setItem(STORAGE_KEYS.packCardDraft, JSON.stringify(packCardDraft)).catch((error) => setNotice(`Could not persist pack card draft: ${error instanceof Error ? error.message : 'unknown error'}`)); }, [packCardDraft, storageHydrated]);
  useEffect(() => { if (storageHydrated) AsyncStorage.setItem(STORAGE_KEYS.packCardVariant, packCardVariant).catch((error) => setNotice(`Could not persist pack card variant: ${error instanceof Error ? error.message : 'unknown error'}`)); }, [packCardVariant, storageHydrated]);

  function enqueueDraft(draft: Omit<StylingEngineDraftQueueItem, 'id' | 'createdAt' | 'status'>, status: StylingEngineDraftQueueItem['status'] = 'queued') {
    const id = buildDraftId(draft.source);
    const item: StylingEngineDraftQueueItem = { ...draft, id, status, createdAt: new Date().toISOString() };
    setDraftQueue((current) => [item, ...current].slice(0, 20));
    return id;
  }

  function updateDraftStatus(id: string, status: StylingEngineDraftQueueItem['status']) { setDraftQueue((current) => current.map((draft) => (draft.id === id ? { ...draft, status } : draft))); }
  function updatePackCardDraft(patch: Partial<StylingEnginePackCardDraft>) { setPackCardDraft((current) => ({ ...current, ...patch })); }

  function syncPackCardFromBundle() {
    const selectedDrafts = selectedBundleDrafts;
    const categories = Array.from(new Set(selectedDrafts.map((draft) => draft.category)));
    const contents = selectedDrafts.length
      ? selectedDrafts.map((draft, index) => `${index + 1}. ${draft.title} (${draft.category})`).join('\n')
      : DEFAULT_PACK_CARD_DRAFT.contents;
    const packName = bundleName.trim() || DEFAULT_PACK_CARD_DRAFT.packName;
    setPackCardDraft((current) => ({
      ...current,
      packName,
      packSubtitle: selectedDrafts.length ? `${selectedDrafts.length} selected draft${selectedDrafts.length === 1 ? '' : 's'} • ${bundleMode}` : current.packSubtitle,
      packTheme: categories.length ? categories.join(' + ') : current.packTheme,
      assetTotal: selectedDrafts.length ? `${selectedDrafts.length}+` : current.assetTotal,
      contents,
      description: selectedDrafts.length ? `Generated from the Bundle Builder as a ${bundleMode}. Includes selected single icons, sets, drafts and pack components ready for a premium marketplace front card and expanded details card.` : current.description,
    }));
    setNotice('Pack Card Generator synced from the selected Bundle Builder drafts.');
  }

  async function handleCartAction(action: StylingEngineCartAction) {
    const pack = manifests.find((manifest) => manifest.id === action.packId);
    setNotice(`${pack?.name || action.packId}: ${action.action.replace('-', ' ')} action captured. Checking backend preview route...`);
    try {
      await stylingEngineApi.previewPack(action.packId);
      setNotice(`${pack?.name || action.packId}: backend preview route responded. Cart/checkout wiring is next.`);
    } catch (error) {
      setNotice(`${pack?.name || action.packId}: local action captured. Backend preview failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
    onCartAction?.(action);
  }

  async function handleGeneratorAction(action: GeneratorAction, family: FamilyFilter) {
    if (family !== 'all') setActiveFamily(family);
    const activePack = selectedManifest || manifests[0];
    const targetCategory = family === 'all' ? activePack?.category || 'icons' : family;
    const prompt = action === 'generate-pack' ? `Generate a Mistress-X pack from ${activePack?.name || 'active pack'}.` : `Headmistress command: ${action.replace(/-/g, ' ')} using Mistress-X Styling Engine.`;
    const draftId = enqueueDraft({ title: action === 'generate-pack' ? activePack?.name || 'Generated Pack' : familyToGeneratedPackName(targetCategory), source: action, category: targetCategory as AssetPackCategory, tier: 'custom', prompt });
    setBusyAction(action);
    setNotice(`Running ${action.replace(/-/g, ' ')} through the Magnetic Connector...`);
    try {
      if (action === 'export-bundle' && activePack) {
        const result = await stylingEngineApi.exportPack(activePack.id);
        updateDraftStatus(draftId, 'sent');
        setNotice(`Export requested: ${result.bundleName}. ${result.nextStep}`);
        return;
      }
      const result = action === 'generate-pack' && activePack
        ? await stylingEngineApi.createFromManifest(activePack)
        : await stylingEngineApi.createPack({ name: familyToGeneratedPackName(targetCategory), category: targetCategory === 'all' ? 'icons' : targetCategory as AssetPackCategory, tier: 'custom', prompt, styleGuide: { source: action, activeFamily: targetCategory, magneticConnector: 'mistress-x-styling-engine' } });
      const generatedId = typeof result.id === 'string' ? result.id : 'draft';
      updateDraftStatus(draftId, 'sent');
      setNotice(`${action.replace(/-/g, ' ')} created draft ${generatedId}. Queue card updated.`);
    } catch (error) {
      updateDraftStatus(draftId, 'failed');
      setNotice(`Magnetic connector request failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    } finally {
      setBusyAction(null);
    }
  }

  async function handleGenerateSemanticReference() {
    const parsed = parseSemanticIconReference(semanticReference, semanticUseCase, { rotate: semanticRotation, flip: semanticFlip, inline: semanticInline });
    if (!parsed) { setNotice('Enter a semantic reference using prefix:name, for example mdi:lock or lucide:crown.'); return; }
    const prompt = createMistressXAssetPrompt(parsed);
    const usage = createIconifyComponentUsage(parsed);
    setSemanticPrompt(prompt);
    setSemanticComponentUsage(usage);
    setActiveFamily('icons');
    const draftId = enqueueDraft({ title: createMistressXPackName(parsed), source: parsed.semanticName, category: 'icons', tier: 'custom', prompt });
    setBusyAction('generate-pack');
    setNotice(`Generating original Mistress-X version from ${parsed.semanticName} through the Magnetic Connector...`);
    try {
      const result = await stylingEngineApi.createPack({ name: createMistressXPackName(parsed), category: 'icons', tier: 'custom', prompt, styleGuide: { source: 'semantic-icon-reference', semanticReference: parsed.semanticName, useCase: parsed.useCase, transform: parsed.transform, referenceUsage: usage, rule: 'Reference the semantic idea only; generate an original Mistress-X SVG.', magneticConnector: 'mistress-x-styling-engine' } });
      updateDraftStatus(draftId, 'sent');
      setNotice(`Semantic draft ${typeof result.id === 'string' ? result.id : 'draft'} queued from ${parsed.semanticName}. Draft queue updated.`);
    } catch (error) {
      updateDraftStatus(draftId, 'failed');
      setNotice(`Semantic generator request failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    } finally {
      setBusyAction(null);
    }
  }

  async function retryDraft(draft: StylingEngineDraftQueueItem) {
    updateDraftStatus(draft.id, 'queued');
    setNotice(`Retrying draft: ${draft.title}`);
    try {
      await stylingEngineApi.createPack({ name: draft.title, category: draft.category as AssetPackCategory, tier: 'custom', prompt: draft.prompt, styleGuide: { source: draft.source, retryOf: draft.id, magneticConnector: 'mistress-x-styling-engine' } });
      updateDraftStatus(draft.id, 'sent');
      setNotice(`Draft retried successfully: ${draft.title}`);
    } catch (error) {
      updateDraftStatus(draft.id, 'failed');
      setNotice(`Draft retry failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  function promoteDraft(draft: StylingEngineDraftQueueItem) {
    setActiveFamily(draft.category as FamilyFilter);
    setPreparedBundle(`${draft.title} promoted to marketplace preview\nCategory: ${draft.category}\nSource: ${draft.source}\nPrompt: ${draft.prompt}`);
    setNotice(`Draft promoted into marketplace preview bundle: ${draft.title}`);
  }

  function bundleDraft(draft: StylingEngineDraftQueueItem) {
    setSelectedBundleDraftIds((current) => Array.from(new Set([draft.id, ...current])));
    setBundleName(draft.title.includes('asset') ? `${draft.title.replace(' asset', '')} Set` : `${draft.title} Set`);
    setPreparedBundle(`${draft.title} bundle draft\nSingle-icon or set/pack bundle ready\nCategory: ${draft.category}\nTier: ${draft.tier}\nSource: ${draft.source}\nPrompt: ${draft.prompt}`);
    setPackCardDraft((current) => ({
      ...current,
      packName: draft.title.includes('asset') ? `${draft.title.replace(' asset', '')} Set` : `${draft.title} Set`,
      packSubtitle: 'Single icon bundled as a set/pack',
      packTheme: draft.category.replace('-', ' '),
      assetTotal: '1+',
      contents: `${draft.title} (${draft.category})\nSource: ${draft.source}`,
      description: draft.prompt,
    }));
    setNotice(`Draft added to bundle builder and pack card generator: ${draft.title}`);
  }

  function removeDraft(draft: StylingEngineDraftQueueItem) { setDraftQueue((current) => current.filter((item) => item.id !== draft.id)); setSelectedBundleDraftIds((current) => current.filter((id) => id !== draft.id)); setNotice(`Draft removed: ${draft.title}`); }
  function toggleBundleDraft(draftId: string) { setSelectedBundleDraftIds((current) => current.includes(draftId) ? current.filter((id) => id !== draftId) : [draftId, ...current]); }

  function buildBundlePack() {
    const selectedDrafts = selectedBundleDrafts;
    if (!selectedDrafts.length) { setNotice('Select at least one generated draft before building a bundle pack.'); return; }
    const name = bundleName.trim() || 'Mistress-X Generated Bundle';
    const categories = Array.from(new Set(selectedDrafts.map((draft) => draft.category)));
    const bundleSummary = [`${name} prepared as ${bundleMode}`, `Items: ${selectedDrafts.length}`, `Families: ${categories.join(', ')}`, 'Bundle type: single icons can become sets, sets can become family packs, and family packs can become premium bundles.', 'Contents:', ...selectedDrafts.map((draft, index) => `${index + 1}. ${draft.title} (${draft.category}) — ${draft.source}`)].join('\n');
    setPreparedBundle(bundleSummary);
    setPackCardDraft((current) => ({ ...current, packName: name, packSubtitle: `${bundleMode} • bundle builder`, packTheme: categories.join(' + ') || current.packTheme, assetTotal: `${selectedDrafts.length}+`, contents: selectedDrafts.map((draft, index) => `${index + 1}. ${draft.title} (${draft.category})`).join('\n'), description: bundleSummary }));
    enqueueDraft({ title: name, source: `bundle-builder:${bundleMode}`, category: (categories[0] || 'icons') as AssetPackCategory, tier: 'custom', prompt: bundleSummary }, 'queued');
    setNotice(`${name} built from ${selectedDrafts.length} selected draft${selectedDrafts.length === 1 ? '' : 's'} as a bundle/set pack and synced to the Pack Card Generator.`);
  }

  function generatePackCardDraft(variant: StylingEnginePackCardVariant) {
    setPackCardVariant(variant);
    const isFront = variant === 'front-facing-card';
    const label = isFront ? 'Front-facing pack card' : 'Expanded info card';
    const prompt = [
      `${label}: ${packCardDraft.packName}`,
      `Subtitle: ${packCardDraft.packSubtitle}`,
      `Theme/badge: ${packCardDraft.packTheme}`,
      `Assets: ${packCardDraft.assetTotal}`,
      `Price: ${packCardDraft.price}`,
      isFront ? 'Render as a little premium digital box/menu-card preview with name, pack/set contents and counts.' : 'Render as an expanded information card with detailed pack/set description, contents, licence, quality, download and checkout sections.',
      `Contents:\n${packCardDraft.contents}`,
      `Description:\n${packCardDraft.description}`,
    ].join('\n');
    setPreparedBundle(prompt);
    enqueueDraft({ title: `${packCardDraft.packName} — ${label}`, source: `pack-card-generator:${variant}`, category: 'themes', tier: 'custom', prompt }, 'queued');
    setNotice(`${label} prepared for ${packCardDraft.packName}. Draft added to queue and saved bundle summary updated.`);
  }

  function handleResetSemanticBridge() { setSemanticReference(DEFAULT_SEMANTIC_SETTINGS.reference); setSemanticUseCase(DEFAULT_SEMANTIC_SETTINGS.useCase); setSemanticRotation(DEFAULT_SEMANTIC_SETTINGS.rotation); setSemanticFlip(DEFAULT_SEMANTIC_SETTINGS.flip); setSemanticInline(DEFAULT_SEMANTIC_SETTINGS.inline); setSemanticPrompt(null); setSemanticComponentUsage(null); setNotice('Semantic Icon Reference Bridge reset to the default Mistress-X reference.'); }
  function handleSaveAstroReference(referenceText: string) { setSavedReferences((current) => [referenceText, ...current].slice(0, 10)); setNotice('Astro reference saved and persisted for this Styling Engine session.'); }
  function handlePrepareDownloadBundle(bundleText: string) { setPreparedBundle(bundleText); setNotice('Download bundle metadata prepared and persisted. Backend signed URL generation is the next layer.'); }
  function handleClearSavedReferences() { setSavedReferences([]); setNotice('Saved Astro references cleared from this Styling Engine session.'); }
  function handleClearPreparedBundle() { setPreparedBundle(null); setNotice('Prepared bundle summary cleared from this Styling Engine session.'); }
  function handleClearAllSavedOutput() { setSavedReferences([]); setPreparedBundle(null); setNotice('Saved references and prepared bundle summary cleared.'); }
  function handleClearDraftQueue() { setDraftQueue([]); setSelectedBundleDraftIds([]); setNotice('Generated draft queue cleared.'); }
  function handleSelectDraft(draft: StylingEngineDraftQueueItem) { setNotice(`Draft selected: ${draft.title} · ${draft.status}`); }

  // ── Headmistress-only gate ───────────────────────────────────────────────
  // The MX Asset Generator / Styling Engine is a Headmistress tool. ADMIN is
  // allowed as the platform superuser (matches the app's HEADMISTRESS||ADMIN
  // management pattern). Any other role sees a locked notice.
  const currentRole = getCurrentUser()?.role;
  const canUseEngine = currentRole === 'HEADMISTRESS' || currentRole === 'ADMIN';
  if (!canUseEngine) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: engineColors.background }} contentContainerStyle={{ padding: 16, justifyContent: 'center', flexGrow: 1 }}>
        <View style={{ borderColor: engineColors.goldDark, borderWidth: 1, borderRadius: 22, backgroundColor: engineColors.panel, padding: 24, gap: 12, alignItems: 'center' }}>
          <Text style={{ color: engineColors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>Headmistress Access Only</Text>
          <Text style={{ color: engineColors.goldLight, fontSize: 22, fontWeight: '900', textAlign: 'center' }}>MX Asset Generator is locked</Text>
          <Text style={{ color: engineColors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center' }}>
            The Mistress-X Styling Engine and asset pack generator are reserved for the Headmistress. Your role
            {currentRole ? ` (${currentRole})` : ''} does not have access to this plugin.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: engineColors.background }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={{ borderColor: engineColors.goldDark, borderWidth: 1, borderRadius: 22, backgroundColor: engineColors.panel, padding: 16, gap: 12 }}>
        <Text style={{ color: engineColors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>Plugins / Marketplace</Text>
        <Text style={{ color: engineColors.goldLight, fontSize: 28, fontWeight: '900' }}>Mistress-X Styling Engine</Text>
        <Text style={{ color: engineColors.muted, fontSize: 13, lineHeight: 19 }}>Generate and sell SVG/SVGO icon packs, digital gift packs, theme packs, flyer/menu cards, premium pack previews and downloadable marketplace manifests.</Text>
        <FamilySummary manifests={manifests} />
        <Text style={{ color: notice.includes('failed') || notice.includes('Could not') ? mxTheme.colors.danger : mxTheme.colors.success, fontSize: 12, fontWeight: '800' }}>{notice}</Text>
        <Text style={{ color: liveBundleCount === null ? mxTheme.colors.muted : engineColors.gold, fontSize: 11, fontWeight: '800' }}>
          {liveBundleCount === null ? '○ Asset-bundle backend: offline (showing local manifests)' : `● Magnetic-backed: ${liveBundleCount} published bundle${liveBundleCount === 1 ? '' : 's'} live from /asset-bundles`}
        </Text>
      </View>
      <GeneratorControlPanel busyAction={busyAction} onAction={handleGeneratorAction} />
      <SemanticReferencePanel value={semanticReference} useCase={semanticUseCase} rotation={semanticRotation} flip={semanticFlip} inline={semanticInline} prompt={semanticPrompt} componentUsage={semanticComponentUsage} onChangeValue={setSemanticReference} onChangeUseCase={setSemanticUseCase} onChangeRotation={setSemanticRotation} onChangeFlip={setSemanticFlip} onToggleInline={() => setSemanticInline((current) => !current)} onGenerate={handleGenerateSemanticReference} onReset={handleResetSemanticBridge} />
      <MXGeneratedDraftQueuePanel drafts={draftQueue} onClear={handleClearDraftQueue} onSelectDraft={handleSelectDraft} onRetryDraft={retryDraft} onRemoveDraft={removeDraft} onPromoteDraft={promoteDraft} onBundleDraft={bundleDraft} />
      <MXBundleBuilderPanel drafts={draftQueue} selectedDraftIds={selectedBundleDraftIds} bundleName={bundleName} bundleMode={bundleMode} onChangeBundleName={setBundleName} onChangeBundleMode={setBundleMode} onToggleDraft={toggleBundleDraft} onBuildBundle={buildBundlePack} onClearSelection={() => { setSelectedBundleDraftIds([]); setNotice('Bundle builder selection cleared.'); }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={syncPackCardFromBundle} style={{ flexGrow: 1, flexBasis: 190, borderColor: engineColors.goldDark, borderWidth: 1, borderRadius: 12, backgroundColor: '#0b0906', paddingVertical: 12 }}>
          <Text style={{ color: engineColors.goldLight, textAlign: 'center', fontWeight: '900', letterSpacing: 1.2 }}>Sync Card From Bundle Builder</Text>
        </Pressable>
      </View>
      <PackCardSection title="Front-Facing Pack Card Generator" detail="Creates the little box/menu-card style preview with pack name, badge, contents count, price and fast marketplace presentation.">
        <MXPackCardGeneratorPanel draft={packCardDraft} variant={packCardVariant === 'expanded-info-card' ? 'front-facing-card' : packCardVariant} onChangeDraft={updatePackCardDraft} onChangeVariant={setPackCardVariant} onGenerateFrontCard={() => generatePackCardDraft('front-facing-card')} onGenerateExpandedCard={() => generatePackCardDraft('expanded-info-card')} />
      </PackCardSection>
      <PackCardSection title="Expanded Pack/Set Info Card Generator" detail="Creates the detailed pack/set information card with deeper contents, licence copy, high-quality promise, download notes and checkout-ready description.">
        <MXPackCardGeneratorPanel draft={packCardDraft} variant={packCardVariant === 'front-facing-card' ? 'expanded-info-card' : packCardVariant} onChangeDraft={updatePackCardDraft} onChangeVariant={setPackCardVariant} onGenerateFrontCard={() => generatePackCardDraft('front-facing-card')} onGenerateExpandedCard={() => generatePackCardDraft('expanded-info-card')} />
      </PackCardSection>
      <View style={{ gap: 12 }}><FilterRow label="Family" filters={FAMILY_FILTERS} activeFilter={activeFamily} onChange={setActiveFamily} /><FilterRow label="Tier" filters={TIER_FILTERS} activeFilter={activeTier} onChange={setActiveTier} /></View>
      <Text style={{ color: engineColors.muted, fontSize: 12, fontWeight: '800' }}>Showing {visibleManifests.length} of {manifests.length} Styling Engine packs.</Text>
      {activeFamily === 'icons' || selectedManifest?.id === 'general-icons-free-pack' ? <MXGeneralIconsCard onDownloadFree={() => handleCartAction({ packId: 'general-icons-free-pack', action: 'download-free', requestedAt: new Date().toISOString() })} onAddToCollection={() => handleCartAction({ packId: 'general-icons-free-pack', action: 'add-to-cart', requestedAt: new Date().toISOString() })} /> : null}
      <MXMarketplaceGrid manifests={visibleManifests} selectedPackId={selectedManifest?.id} onSelectPack={setSelectedPackId} onCartAction={handleCartAction} />
      <MXAssetInspectorPanel manifest={selectedManifest} onExportBundle={() => handleGeneratorAction('export-bundle', selectedManifest?.category || 'all')} onCopyAstroName={(astroIconName) => setNotice(`Astro icon reference ready: ${astroIconName}`)} onSaveAstroReference={handleSaveAstroReference} onPrepareDownloadBundle={handlePrepareDownloadBundle} />
      <SavedReferencePanel savedReferences={savedReferences} preparedBundle={preparedBundle} onClearReferences={handleClearSavedReferences} onClearBundle={handleClearPreparedBundle} onClearAll={handleClearAllSavedOutput} />
      {selectedManifest ? <View style={{ borderColor: '#211a0b', borderWidth: 1, borderRadius: 22, overflow: 'hidden' }}><PackPreviewScreen manifest={selectedManifest} onAddToCart={(packId) => handleCartAction({ packId, action: selectedManifest.tier === 'free' ? 'download-free' : 'add-to-cart', requestedAt: new Date().toISOString() })} onBuyNow={(packId) => handleCartAction({ packId, action: 'buy-now', requestedAt: new Date().toISOString() })} /></View> : null}
    </ScrollView>
  );
}

export default PackMarketplaceScreen;
