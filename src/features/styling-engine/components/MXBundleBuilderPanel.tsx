import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import type { StylingEngineDraftQueueItem } from './MXGeneratedDraftQueuePanel';

export type StylingEngineBundleMode = 'single-icon-set' | 'family-pack' | 'seasonal-pack' | 'premium-bundle';

const palette = {
  panel: '#0b0906',
  card: '#080806',
  border: '#2a2208',
  gold: '#d4af37',
  goldLight: '#f9d976',
  goldDark: '#6f4c16',
  muted: '#9a927f',
};

const BUNDLE_MODES: { id: StylingEngineBundleMode; label: string; detail: string }[] = [
  { id: 'single-icon-set', label: 'Single Icon Set', detail: 'Bundle one-off generated icons into a named set.' },
  { id: 'family-pack', label: 'Family Pack', detail: 'Group matching assets into a full marketplace family pack.' },
  { id: 'seasonal-pack', label: 'Seasonal Pack', detail: 'Build Christmas, holiday, poison/potion or event collections.' },
  { id: 'premium-bundle', label: 'Premium Bundle', detail: 'Create a high-value bundle made from multiple generated packs.' },
];

function ModeButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={{ borderColor: active ? palette.gold : palette.goldDark, borderWidth: 1, borderRadius: 999, backgroundColor: active ? '#181207' : '#0d0d0d', paddingHorizontal: 10, paddingVertical: 6 }}>
      <Text style={{ color: active ? palette.goldLight : palette.muted, fontSize: 9, fontWeight: '900', textTransform: 'uppercase' }}>{label}</Text>
    </Pressable>
  );
}

export function MXBundleBuilderPanel({
  drafts,
  selectedDraftIds,
  bundleName,
  bundleMode,
  onChangeBundleName,
  onChangeBundleMode,
  onToggleDraft,
  onBuildBundle,
  onClearSelection,
}: {
  drafts: StylingEngineDraftQueueItem[];
  selectedDraftIds: string[];
  bundleName: string;
  bundleMode: StylingEngineBundleMode;
  onChangeBundleName: (value: string) => void;
  onChangeBundleMode: (value: StylingEngineBundleMode) => void;
  onToggleDraft: (draftId: string) => void;
  onBuildBundle: () => void;
  onClearSelection: () => void;
}) {
  const selectedDrafts = drafts.filter((draft) => selectedDraftIds.includes(draft.id));
  const totalSelected = selectedDrafts.length;
  const categories = Array.from(new Set(selectedDrafts.map((draft) => draft.category)));

  if (!drafts.length) return null;

  return (
    <View style={{ borderColor: palette.goldDark, borderWidth: 1, borderRadius: 22, backgroundColor: palette.panel, padding: 16, gap: 12 }}>
      <View style={{ gap: 3 }}>
        <Text style={{ color: palette.gold, fontSize: 11, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>Bundle Builder</Text>
        <Text style={{ color: palette.goldLight, fontSize: 20, fontWeight: '900' }}>Group Drafts Into Sets / Packs</Text>
        <Text style={{ color: palette.muted, fontSize: 12, lineHeight: 17 }}>
          Select generated single icons or drafts, name the collection, then prepare it as a marketplace-ready set, family pack or premium bundle.
        </Text>
      </View>

      <TextInput
        value={bundleName}
        onChangeText={onChangeBundleName}
        placeholder="Luxury Locks Set"
        placeholderTextColor="#6f6240"
        style={{ borderColor: palette.border, borderWidth: 1, borderRadius: 12, backgroundColor: palette.card, color: palette.goldLight, padding: 12, fontSize: 13 }}
      />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {BUNDLE_MODES.map((mode) => (
          <ModeButton key={mode.id} label={mode.label} active={bundleMode === mode.id} onPress={() => onChangeBundleMode(mode.id)} />
        ))}
      </View>

      <View style={{ borderColor: palette.border, borderWidth: 1, borderRadius: 12, backgroundColor: palette.card, padding: 10, gap: 6 }}>
        <Text style={{ color: palette.gold, fontSize: 11, fontWeight: '900' }}>Selected Bundle Summary</Text>
        <Text style={{ color: palette.muted, fontSize: 10 }}>Items selected: {totalSelected}</Text>
        <Text style={{ color: palette.muted, fontSize: 10 }}>Families: {categories.length ? categories.join(', ') : 'none yet'}</Text>
      </View>

      <View style={{ gap: 8 }}>
        {drafts.slice(0, 10).map((draft) => {
          const selected = selectedDraftIds.includes(draft.id);
          return (
            <Pressable key={draft.id} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={() => onToggleDraft(draft.id)} style={{ borderColor: selected ? palette.gold : palette.border, borderWidth: 1, borderRadius: 12, backgroundColor: selected ? '#181207' : palette.card, padding: 10, gap: 3 }}>
              <Text style={{ color: selected ? palette.goldLight : palette.gold, fontSize: 12, fontWeight: '900' }}>{selected ? '✓ ' : '+ '}{draft.title}</Text>
              <Text style={{ color: palette.muted, fontSize: 9 }}>{draft.category} · {draft.source} · {draft.status}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={onBuildBundle} style={{ flexGrow: 1, flexBasis: 190, backgroundColor: palette.gold, borderRadius: 12, paddingVertical: 12 }}>
          <Text style={{ color: '#050505', textAlign: 'center', fontWeight: '900', letterSpacing: 1.2 }}>Build Bundle Pack</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onClearSelection} style={{ flexGrow: 1, flexBasis: 140, borderColor: palette.goldDark, borderWidth: 1, borderRadius: 12, paddingVertical: 12 }}>
          <Text style={{ color: palette.goldLight, textAlign: 'center', fontWeight: '900', letterSpacing: 1.2 }}>Clear Selection</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default MXBundleBuilderPanel;
