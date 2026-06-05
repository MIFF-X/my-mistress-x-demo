import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';
import {
  getUiLayoutPreset,
  getUiLayoutPresetsForAudience,
  type UiLayoutAudience,
  type UiLayoutPreset,
  type UiLayoutPresetId,
} from './layoutPresets';
import { describeLayoutForShell, getResponsiveDashboardShell } from './responsiveDashboardShell';
import { UI_LAYOUT_SELECTOR_COPY, UI_LAYOUT_SELECTOR_PROGRESS } from './layoutSelectorCopy';
import { UiLayoutAppliedThemeCard } from './UiLayoutAppliedThemeCard';
import { UiLayoutThemeTokenCard } from './UiLayoutThemeTokenCard';
import { UiLayoutDashboardStyleAdapterCard } from './UiLayoutDashboardStyleAdapterCard';
import { UiLayoutPreviewCards } from './UiLayoutPreviewCards';
import { UiLayoutStylePackCards } from './UiLayoutStylePackCards';
import { UiLayoutCustomRequestPanel } from './UiLayoutCustomRequestPanel';
import { UiLayoutAnalyticsPanel } from './UiLayoutAnalyticsPanel';
import { UiLayoutAdminAnalyticsSummaryCard } from './UiLayoutAdminAnalyticsSummaryCard';
import type { UiLayoutStylePack } from './uiLayoutStylePacks';
import { UI_LAYOUT_STYLE_PACKS } from './uiLayoutStylePacks';
import {
  clearUiLayoutPreference,
  loadUiLayoutPreference,
  saveUiLayoutPreference,
} from './uiLayoutStore';
import {
  trackUiLayoutEvent,
  trackUiLayoutLockToggled,
  trackUiLayoutPresetSaved,
  trackUiLayoutPresetSelected,
} from './uiLayoutAnalytics';

type UiLayoutSelectorScreenProps = {
  userId: string;
  audience: UiLayoutAudience;
  width?: number;
  onSaved?: (presetId: UiLayoutPresetId) => void;
};

function PresetCard({
  preset,
  selected,
  locked,
  onPress,
}: {
  preset: UiLayoutPreset;
  selected: boolean;
  locked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: locked }}
      disabled={locked}
      onPress={onPress}
      style={{
        borderWidth: 1,
        borderColor: selected ? preset.accent : mxTheme.colors.border,
        borderRadius: mxTheme.radius.lg,
        backgroundColor: selected ? '#151019' : mxTheme.colors.surface,
        padding: mxTheme.spacing.lg,
        marginBottom: mxTheme.spacing.md,
        opacity: locked && !selected ? 0.55 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Text style={{ fontSize: 24 }}>{preset.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 17, fontWeight: '900' }}>{preset.title}</Text>
          <Text style={{ color: mxTheme.colors.muted, marginTop: 4, fontSize: 12, lineHeight: 17 }}>
            {preset.subtitle}
          </Text>
        </View>
        <Text style={{ color: selected ? preset.accent : mxTheme.colors.muted, fontWeight: '900', fontSize: 11 }}>
          {selected ? 'ACTIVE' : locked ? 'LOCKED' : 'CHOOSE'}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 13 }}>
        {preset.primaryModules.slice(0, 6).map((module) => (
          <View
            key={`${preset.id}-${module}`}
            style={{
              borderWidth: 1,
              borderColor: `${preset.accent}66`,
              borderRadius: 999,
              paddingHorizontal: 9,
              paddingVertical: 5,
              backgroundColor: '#090909',
            }}
          >
            <Text style={{ color: preset.accent, fontSize: 10, fontWeight: '800' }}>{module}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

export function UiLayoutSelectorScreen({ userId, audience, width = 390, onSaved }: UiLayoutSelectorScreenProps) {
  const [preference, setPreference] = useState(() => loadUiLayoutPreference(userId, audience));
  const [customRequestNotice, setCustomRequestNotice] = useState('');
  const [stylePackNotice, setStylePackNotice] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showThemeTokens, setShowThemeTokens] = useState(false);
  const [showDashboardStyle, setShowDashboardStyle] = useState(false);
  const [customRequestPack, setCustomRequestPack] = useState<UiLayoutStylePack | null>(() =>
    UI_LAYOUT_STYLE_PACKS.find((pack) => pack.id === 'custom-tech-slave-build') || null,
  );
  const shell = useMemo(() => getResponsiveDashboardShell(width), [width]);
  const presets = useMemo(() => getUiLayoutPresetsForAudience(audience), [audience]);
  const selectedPreset = getUiLayoutPreset(preference.presetId) || presets[0];
  const shellDescription = selectedPreset ? describeLayoutForShell(selectedPreset, shell) : null;

  function selectPreset(presetId: UiLayoutPresetId) {
    if (preference.locked) return;
    setPreference((current) => ({ ...current, presetId }));
    setCustomRequestNotice('');
    setStylePackNotice('');
    trackUiLayoutPresetSelected({ userId, audience, presetId });
  }

  function saveSelectedLayout() {
    const saved = saveUiLayoutPreference(userId, audience, {
      presetId: preference.presetId,
      locked: preference.locked,
    });
    setPreference(saved);
    setStylePackNotice(`Layout saved as ${saved.presetId.replace(/-/g, ' ')}.`);
    trackUiLayoutPresetSaved({ userId, audience, presetId: saved.presetId, locked: saved.locked });
    onSaved?.(saved.presetId);
  }

  function toggleLock() {
    setPreference((current) => {
      const nextLocked = !current.locked;
      trackUiLayoutLockToggled({ userId, audience, presetId: current.presetId, locked: nextLocked });
      return { ...current, locked: nextLocked };
    });
  }

  function resetLayout() {
    clearUiLayoutPreference(userId, audience);
    setPreference(loadUiLayoutPreference(userId, audience));
    setCustomRequestNotice('');
    setStylePackNotice('');
    trackUiLayoutEvent({
      type: 'layout_reset',
      userId,
      audience,
      presetId: preference.presetId,
    });
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: mxTheme.colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: 34 }}>
      <View style={{ marginBottom: mxTheme.spacing.lg }}>
        <Text style={{ color: mxTheme.colors.text, fontSize: 24, fontWeight: '900' }}>
          {UI_LAYOUT_SELECTOR_COPY.title}
        </Text>
        <Text style={{ color: mxTheme.colors.muted, marginTop: 7, lineHeight: 20 }}>
          {UI_LAYOUT_SELECTOR_COPY.subtitle}
        </Text>
      </View>

      <UiLayoutAppliedThemeCard userId={userId} audience={audience} />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: mxTheme.spacing.md }}>
        <Pressable
          onPress={() => setShowThemeTokens((current) => !current)}
          style={{
            borderRadius: 999,
            borderWidth: 1,
            borderColor: mxTheme.colors.warning,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <Text style={{ color: mxTheme.colors.warning, fontWeight: '900' }}>
            {showThemeTokens ? 'Hide Theme Tokens' : 'Show Theme Tokens'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setShowDashboardStyle((current) => !current)}
          style={{
            borderRadius: 999,
            borderWidth: 1,
            borderColor: mxTheme.colors.warning,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <Text style={{ color: mxTheme.colors.warning, fontWeight: '900' }}>
            {showDashboardStyle ? 'Hide Dashboard Style' : 'Show Dashboard Style'}
          </Text>
        </Pressable>
      </View>

      {showThemeTokens ? <UiLayoutThemeTokenCard userId={userId} audience={audience} /> : null}
      {showDashboardStyle ? <UiLayoutDashboardStyleAdapterCard userId={userId} audience={audience} /> : null}

      {shellDescription ? (
        <View
          style={{
            borderWidth: 1,
            borderColor: selectedPreset.accent,
            borderRadius: mxTheme.radius.lg,
            backgroundColor: '#101010',
            padding: mxTheme.spacing.lg,
            marginBottom: mxTheme.spacing.lg,
          }}
        >
          <Text style={{ color: selectedPreset.accent, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' }}>
            Live shell preview
          </Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', marginTop: 7 }}>
            {shellDescription.title} on {shellDescription.breakpoint}
          </Text>
          <Text style={{ color: mxTheme.colors.muted, marginTop: 7, lineHeight: 19 }}>
            {shellDescription.pattern}
          </Text>
          <Text style={{ color: selectedPreset.accent, marginTop: 9, fontSize: 12, fontWeight: '800' }}>
            {shellDescription.navigation} | {shellDescription.columns} column(s) | {shellDescription.cardFlow} | {shellDescription.showRightRail ? 'right rail on' : 'right rail off'}
          </Text>
        </View>
      ) : null}

      {selectedPreset ? <UiLayoutPreviewCards preset={selectedPreset} /> : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: mxTheme.spacing.lg, marginTop: mxTheme.spacing.md }}>
        <Pressable
          onPress={saveSelectedLayout}
          style={{
            borderRadius: 999,
            backgroundColor: selectedPreset?.accent || mxTheme.colors.accent,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <Text style={{ color: '#000', fontWeight: '900' }}>Save Layout</Text>
        </Pressable>
        <Pressable
          onPress={toggleLock}
          style={{
            borderRadius: 999,
            borderWidth: 1,
            borderColor: selectedPreset?.accent || mxTheme.colors.accent,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <Text style={{ color: selectedPreset?.accent || mxTheme.colors.accent, fontWeight: '900' }}>
            {preference.locked ? 'Unlock' : 'Lock'}
          </Text>
        </Pressable>
        <Pressable
          onPress={resetLayout}
          style={{
            borderRadius: 999,
            borderWidth: 1,
            borderColor: mxTheme.colors.border,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <Text style={{ color: mxTheme.colors.muted, fontWeight: '900' }}>Reset</Text>
        </Pressable>
        <Pressable
          onPress={() => setShowAnalytics((current) => !current)}
          style={{
            borderRadius: 999,
            borderWidth: 1,
            borderColor: mxTheme.colors.warning,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <Text style={{ color: mxTheme.colors.warning, fontWeight: '900' }}>
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </Text>
        </Pressable>
      </View>

      {stylePackNotice ? (
        <View
          style={{
            borderWidth: 1,
            borderColor: mxTheme.colors.success,
            borderRadius: mxTheme.radius.md,
            backgroundColor: '#0b1712',
            padding: mxTheme.spacing.md,
            marginBottom: mxTheme.spacing.md,
          }}
        >
          <Text style={{ color: mxTheme.colors.success, fontWeight: '900' }}>{stylePackNotice}</Text>
        </View>
      ) : null}

      <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', marginBottom: 10 }}>
        Available layouts
      </Text>
      {presets.map((preset) => (
        <PresetCard
          key={preset.id}
          preset={preset}
          selected={preference.presetId === preset.id}
          locked={preference.locked}
          onPress={() => selectPreset(preset.id)}
        />
      ))}

      {selectedPreset ? (
        <UiLayoutStylePackCards
          presetId={selectedPreset.id}
          userId={userId}
          audience={audience}
          onApplied={(pack) => setStylePackNotice(`${pack.title} style pack applied.`)}
          onRequestCustom={(pack) => {
            setCustomRequestPack(pack);
            setCustomRequestNotice(`${pack.title} selected. Draft a request below for the future Style Marketplace flow.`);
          }}
        />
      ) : null}

      {customRequestNotice ? (
        <View
          style={{
            borderWidth: 1,
            borderColor: mxTheme.colors.warning,
            borderRadius: mxTheme.radius.md,
            backgroundColor: '#15110a',
            padding: mxTheme.spacing.md,
            marginTop: mxTheme.spacing.md,
          }}
        >
          <Text style={{ color: mxTheme.colors.warning, fontWeight: '900' }}>{customRequestNotice}</Text>
        </View>
      ) : null}

      {selectedPreset ? (
        <UiLayoutCustomRequestPanel
          userId={userId}
          audience={audience}
          presetId={selectedPreset.id}
          selectedPack={customRequestPack}
        />
      ) : null}

      {showAnalytics ? (
        <>
          <UiLayoutAdminAnalyticsSummaryCard />
          <UiLayoutAnalyticsPanel />
        </>
      ) : null}

      <View style={{ marginTop: mxTheme.spacing.lg, borderTopWidth: 1, borderTopColor: mxTheme.colors.border, paddingTop: mxTheme.spacing.lg }}>
        <Text style={{ color: mxTheme.colors.text, fontWeight: '900', marginBottom: 8 }}>Build status</Text>
        <Text style={{ color: mxTheme.colors.muted, lineHeight: 19 }}>
          Presets captured: {UI_LAYOUT_SELECTOR_PROGRESS.presetsCaptured}. Stage: {UI_LAYOUT_SELECTOR_PROGRESS.currentBuildStage}. Next: {UI_LAYOUT_SELECTOR_PROGRESS.nextIntegrationTarget}
        </Text>
        <Text style={{ color: mxTheme.colors.warning, lineHeight: 19, marginTop: 10 }}>
          {UI_LAYOUT_SELECTOR_COPY.lockedRule}
        </Text>
      </View>
    </ScrollView>
  );
}
