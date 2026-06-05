import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';
import type { UiLayoutAudience, UiLayoutPresetId } from './layoutPresets';
import {
  getUiLayoutStylePacksForPreset,
  UI_LAYOUT_STYLE_PACKS,
  type UiLayoutStylePack,
  type UiLayoutStylePackTier,
} from './uiLayoutStylePacks';
import {
  canApplyUiLayoutStylePack,
  loadUiLayoutStylePackPreference,
  saveUiLayoutStylePackPreference,
} from './uiLayoutStylePackStore';
import {
  trackUiLayoutEvent,
  trackUiLayoutStylePackApplied,
} from './uiLayoutAnalytics';

type StylePackFilter = 'all' | UiLayoutStylePackTier;

type UiLayoutStylePackCardsProps = {
  presetId?: UiLayoutPresetId;
  userId?: string;
  audience?: UiLayoutAudience;
  onRequestCustom?: (pack: UiLayoutStylePack) => void;
  onApplied?: (pack: UiLayoutStylePack) => void;
};

function getStatusLabel(pack: UiLayoutStylePack, isApplied: boolean) {
  if (isApplied) return 'Applied';
  if (pack.status === 'installed') return 'Installed';
  if (pack.status === 'available') return 'Available';
  if (pack.status === 'request-only') return 'Request';
  return 'Locked';
}

function StylePackFilterButton({
  label,
  value,
  activeValue,
  accentColor,
  onPress,
}: {
  label: string;
  value: StylePackFilter;
  activeValue: StylePackFilter;
  accentColor: string;
  onPress: (value: StylePackFilter) => void;
}) {
  const isActive = value === activeValue;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      onPress={() => onPress(value)}
      style={{
        borderWidth: 1,
        borderColor: isActive ? accentColor : mxTheme.colors.border,
        borderRadius: 999,
        backgroundColor: isActive ? '#171717' : '#0d0d0d',
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}
    >
      <Text style={{ color: isActive ? accentColor : mxTheme.colors.muted, fontSize: 12, fontWeight: '900' }}>
        {label}
      </Text>
    </Pressable>
  );
}

function StylePackCard({
  pack,
  isApplied,
  onApply,
  onRequestCustom,
}: {
  pack: UiLayoutStylePack;
  isApplied: boolean;
  onApply?: (pack: UiLayoutStylePack) => void;
  onRequestCustom?: (pack: UiLayoutStylePack) => void;
}) {
  const isLocked = pack.status === 'locked';
  const isRequestOnly = pack.status === 'request-only';
  const canApply = canApplyUiLayoutStylePack(pack);

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: isApplied ? pack.accent : pack.status === 'installed' ? `${pack.accent}88` : mxTheme.colors.border,
        borderRadius: mxTheme.radius.lg,
        backgroundColor: isApplied ? '#15110a' : pack.status === 'installed' ? '#11110d' : mxTheme.colors.surface,
        padding: mxTheme.spacing.lg,
        marginBottom: mxTheme.spacing.md,
        opacity: isLocked ? 0.78 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: pack.accent, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>
            {pack.tier} · {pack.priceLabel}
          </Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 17, fontWeight: '900', marginTop: 6 }}>
            {pack.title}
          </Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 }}>
            {pack.subtitle}
          </Text>
        </View>
        <View
          style={{
            borderWidth: 1,
            borderColor: `${pack.accent}88`,
            borderRadius: 999,
            paddingHorizontal: 9,
            paddingVertical: 6,
            alignSelf: 'flex-start',
            backgroundColor: '#090909',
          }}
        >
          <Text style={{ color: pack.accent, fontSize: 10, fontWeight: '900' }}>{getStatusLabel(pack, isApplied)}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
        {pack.tags.map((tag) => (
          <View
            key={`${pack.id}-${tag}`}
            style={{
              borderWidth: 1,
              borderColor: '#2a2a2a',
              borderRadius: 999,
              backgroundColor: '#080808',
              paddingHorizontal: 8,
              paddingVertical: 5,
            }}
          >
            <Text style={{ color: '#cfcfcf', fontSize: 10, fontWeight: '800' }}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 12, gap: 5 }}>
        {pack.previewNotes.map((note) => (
          <Text key={`${pack.id}-${note}`} style={{ color: mxTheme.colors.muted, fontSize: 11, lineHeight: 16 }}>
            • {note}
          </Text>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
        <Pressable
          accessibilityRole="button"
          disabled={!canApply || isApplied}
          onPress={() => onApply?.(pack)}
          style={{
            borderWidth: 1,
            borderColor: canApply ? pack.accent : '#2a2a2a',
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 9,
            backgroundColor: isApplied ? `${pack.accent}22` : canApply ? '#171717' : '#0b0b0b',
            opacity: canApply ? 1 : 0.65,
          }}
        >
          <Text style={{ color: canApply ? pack.accent : mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>
            {isApplied ? 'Applied' : canApply ? 'Apply pack' : isLocked ? 'Unlock later' : 'Unavailable'}
          </Text>
        </Pressable>

        {isRequestOnly ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => onRequestCustom?.(pack)}
            style={{
              borderWidth: 1,
              borderColor: pack.accent,
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 9,
              backgroundColor: '#171717',
            }}
          >
            <Text style={{ color: pack.accent, fontSize: 11, fontWeight: '900' }}>Start custom request</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function UiLayoutStylePackCards({ presetId, userId = 'anonymous', audience = 'ALL', onRequestCustom, onApplied }: UiLayoutStylePackCardsProps) {
  const [activeFilter, setActiveFilter] = useState<StylePackFilter>('all');
  const [preference, setPreference] = useState(() => loadUiLayoutStylePackPreference(userId, audience));
  const packs = useMemo(() => {
    const source = presetId ? getUiLayoutStylePacksForPreset(presetId) : UI_LAYOUT_STYLE_PACKS;
    if (activeFilter === 'all') return source;
    return source.filter((pack) => pack.tier === activeFilter);
  }, [activeFilter, presetId]);

  function setFilterWithAnalytics(filter: StylePackFilter) {
    setActiveFilter(filter);
    trackUiLayoutEvent({
      type: 'preview_focus_changed',
      userId,
      audience,
      presetId,
      details: { filter: `style-pack-${filter}` },
    });
  }

  function applyPack(pack: UiLayoutStylePack) {
    const saved = saveUiLayoutStylePackPreference(userId, audience, pack.id);
    setPreference(saved);
    trackUiLayoutStylePackApplied({ userId, audience, presetId, pack });
    onApplied?.(pack);
  }

  function requestCustom(pack: UiLayoutStylePack) {
    trackUiLayoutEvent({
      type: 'style_pack_custom_requested',
      userId,
      audience,
      presetId,
      stylePackId: pack.id,
      details: { tier: pack.tier, priceLabel: pack.priceLabel },
    });
    onRequestCustom?.(pack);
  }

  return (
    <View style={{ marginTop: mxTheme.spacing.lg }}>
      <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', marginBottom: 8 }}>
        Layout style packs
      </Text>
      <Text style={{ color: mxTheme.colors.muted, lineHeight: 19, marginBottom: 12 }}>
        Style packs are the free, paid and custom skin layer that can sit on top of the selected layout preset.
      </Text>

      <View
        style={{
          borderWidth: 1,
          borderColor: mxTheme.colors.border,
          borderRadius: mxTheme.radius.md,
          backgroundColor: '#0d0d0d',
          padding: mxTheme.spacing.md,
          marginBottom: mxTheme.spacing.md,
        }}
      >
        <Text style={{ color: mxTheme.colors.warning, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>
          Active style pack
        </Text>
        <Text style={{ color: mxTheme.colors.text, marginTop: 5, fontWeight: '900' }}>{preference.packId}</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: mxTheme.spacing.md }}>
        <StylePackFilterButton label="All" value="all" activeValue={activeFilter} accentColor={mxTheme.colors.warning} onPress={setFilterWithAnalytics} />
        <StylePackFilterButton label="Free" value="free" activeValue={activeFilter} accentColor={mxTheme.colors.success} onPress={setFilterWithAnalytics} />
        <StylePackFilterButton label="Paid" value="paid" activeValue={activeFilter} accentColor={mxTheme.colors.accentSoft} onPress={setFilterWithAnalytics} />
        <StylePackFilterButton label="Custom" value="custom" activeValue={activeFilter} accentColor={mxTheme.colors.warning} onPress={setFilterWithAnalytics} />
      </View>

      {packs.map((pack) => (
        <StylePackCard
          key={pack.id}
          pack={pack}
          isApplied={preference.packId === pack.id}
          onApply={applyPack}
          onRequestCustom={requestCustom}
        />
      ))}
    </View>
  );
}
