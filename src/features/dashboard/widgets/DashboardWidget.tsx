import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { mxTheme } from '../../../theme/mxTheme';
import type { DashboardWidgetSize } from './dashboardWidgetRegistry';

export type DashboardWidgetProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: string;
  size?: DashboardWidgetSize;
  sourceLabel?: string;
  accentColor?: string;
  locked?: boolean;
  editMode?: boolean;
  layoutLocked?: boolean;
  onPress?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onHide?: () => void;
  onRemove?: () => void;
  onResize?: () => void;
};

const gateReportPalette = {
  gold: '#d4af37',
  goldLight: '#f9d976',
  goldDark: '#6f4c16',
  panel: '#080806',
  card: '#101010',
  border: '#2a2208',
  green: '#1D9E75',
  blue: '#60a5fa',
  pink: '#ff4d8d',
  purple: '#c084fc',
  muted: '#9a927f',
};

const GATE_REPORT_ROWS = [
  { label: 'Core gates', value: 86, detail: 'Dashboard register, magnetic connector, quick check and role homes', color: gateReportPalette.gold },
  { label: 'Money gates', value: 72, detail: 'Wallet, earnings vault, keeper, records, gifts and subscriptions', color: gateReportPalette.green },
  { label: 'Audience gates', value: 68, detail: 'Live, chat, bookings, content library, games, stickers and Rolodex', color: gateReportPalette.blue },
  { label: 'Marketplace gates', value: 74, detail: 'Styling Engine, inventory worlds, orders, bundles and gift packs', color: gateReportPalette.pink },
  { label: 'Profile gates', value: 58, detail: 'Inventory, showcase, analytics and user-facing progress surfaces', color: gateReportPalette.purple },
];

const SVG_CSS_PIPELINE = [
  'SVG import',
  'SVGO cleanup',
  'CSS variables',
  'Tailwind tokens',
  'React components',
  'PNG/WebP preview',
  'Marketplace card',
];

function sizeLabel(size: DashboardWidgetSize) {
  if (size === 'compact') return 'Compact';
  if (size === 'wide') return 'Wide';
  return 'Standard';
}

function WidgetControlButton({
  label,
  accentColor,
  disabled,
  onPress,
}: {
  label: string;
  accentColor: string;
  disabled?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={{
        backgroundColor: disabled ? '#222' : '#050505',
        borderColor: disabled ? mxTheme.colors.border : accentColor,
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 9,
        paddingVertical: 6,
        marginRight: 6,
        marginTop: 6,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Text style={{ color: disabled ? mxTheme.colors.muted : accentColor, fontSize: 11, fontWeight: '800' }}>{label}</Text>
    </Pressable>
  );
}

function GateProgressMetric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={{ flexGrow: 1, flexBasis: 92, borderColor: gateReportPalette.border, borderWidth: 1, borderRadius: 12, backgroundColor: '#050505', padding: 9 }}>
      <Text style={{ color, fontSize: 19, fontWeight: '900', textAlign: 'center' }}>{value}%</Text>
      <Text style={{ color: gateReportPalette.muted, fontSize: 9, fontWeight: '800', textAlign: 'center', marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function GateProgressBar({ label, value, detail, color }: { label: string; value: number; detail: string; color: string }) {
  return (
    <View style={{ gap: 5 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <Text style={{ color, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>{label}</Text>
        <Text style={{ color: gateReportPalette.goldLight, fontSize: 11, fontWeight: '900' }}>{value}%</Text>
      </View>
      <View style={{ height: 8, borderRadius: 999, backgroundColor: '#050505', borderColor: '#1f1a08', borderWidth: 1, overflow: 'hidden' }}>
        <View style={{ width: `${value}%`, height: '100%', backgroundColor: color, borderRadius: 999 }} />
      </View>
      <Text style={{ color: gateReportPalette.muted, fontSize: 10, lineHeight: 14 }}>{detail}</Text>
    </View>
  );
}

function GateStatusPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ borderColor: color, borderWidth: 1, borderRadius: 999, backgroundColor: '#070707', paddingHorizontal: 9, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: color }} />
      <Text style={{ color: gateReportPalette.goldLight, fontSize: 9, fontWeight: '900' }}>{label}: {value}</Text>
    </View>
  );
}

function SvgCssPipelinePill({ label }: { label: string }) {
  return (
    <View style={{ borderColor: gateReportPalette.goldDark, borderWidth: 1, borderRadius: 999, backgroundColor: '#0d0d0d', paddingHorizontal: 8, paddingVertical: 5 }}>
      <Text style={{ color: gateReportPalette.goldLight, fontSize: 8, fontWeight: '900' }}>{label}</Text>
    </View>
  );
}

function GateProgressReportCard({ accentColor, locked, editMode, onPress }: { accentColor: string; locked: boolean; editMode: boolean; onPress?: () => void }) {
  const average = Math.round(GATE_REPORT_ROWS.reduce((total, row) => total + row.value, 0) / GATE_REPORT_ROWS.length);

  return (
    <Pressable
      onPress={locked || editMode ? undefined : onPress}
      style={{
        backgroundColor: gateReportPalette.panel,
        borderColor: accentColor,
        borderWidth: 1,
        borderRadius: 20,
        padding: 14,
        marginBottom: 12,
        shadowColor: accentColor,
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
        opacity: locked ? 0.55 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, minWidth: 210, gap: 5 }}>
          <Text style={{ color: accentColor, fontSize: 11, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>Gate & Progress Report</Text>
          <Text style={{ color: gateReportPalette.goldLight, fontSize: 20, fontWeight: '900' }}>Gated Sections + Build Readiness</Text>
          <Text style={{ color: gateReportPalette.muted, fontSize: 12, lineHeight: 17 }}>
            Role gates, locked/unlocked modules, magnetic connector coverage and marketplace asset pipeline progress are visible from the dashboard home.
          </Text>
        </View>
        <View style={{ width: 92, height: 92, borderRadius: 46, borderColor: gateReportPalette.gold, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#120d04' }}>
          <Text style={{ color: gateReportPalette.goldLight, fontSize: 24, fontWeight: '900' }}>{average}%</Text>
          <Text style={{ color: gateReportPalette.goldDark, fontSize: 8, fontWeight: '900', letterSpacing: 1 }}>READY</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        <GateProgressMetric label="Unlocked" value={37} color={gateReportPalette.green} />
        <GateProgressMetric label="Scaffolded" value={46} color={gateReportPalette.gold} />
        <GateProgressMetric label="Live" value={18} color={gateReportPalette.blue} />
        <GateProgressMetric label="Locked" value={9} color={gateReportPalette.pink} />
      </View>

      <View style={{ borderColor: gateReportPalette.border, borderWidth: 1, borderRadius: 16, backgroundColor: gateReportPalette.card, padding: 12, gap: 12, marginTop: 12 }}>
        {GATE_REPORT_ROWS.map((row) => <GateProgressBar key={row.label} {...row} />)}
      </View>

      <View style={{ borderColor: gateReportPalette.border, borderWidth: 1, borderRadius: 16, backgroundColor: '#050505', padding: 12, gap: 8, marginTop: 12 }}>
        <Text style={{ color: gateReportPalette.gold, fontSize: 11, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }}>SVG/CSS Asset Pipeline</Text>
        <Text style={{ color: gateReportPalette.muted, fontSize: 10, lineHeight: 15 }}>
          Styling Engine assets stay crisp through SVG/SVGO, then generate CSS/Tailwind tokens, React-safe components, PNG/WebP previews and marketplace cards.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {SVG_CSS_PIPELINE.map((item) => <SvgCssPipelinePill key={item} label={item} />)}
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
        <GateStatusPill label="Register" value="wired" color={gateReportPalette.gold} />
        <GateStatusPill label="Magnetic" value="active" color={gateReportPalette.green} />
        <GateStatusPill label="Asset packs" value="building" color={gateReportPalette.pink} />
        <GateStatusPill label="Entitlements" value="gated" color={gateReportPalette.blue} />
      </View>
    </Pressable>
  );
}

export function DashboardWidget({
  title,
  subtitle,
  badge,
  size = 'standard',
  sourceLabel,
  accentColor,
  locked = false,
  editMode = false,
  layoutLocked = false,
  onPress,
  onMoveUp,
  onMoveDown,
  onHide,
  onRemove,
  onResize,
}: DashboardWidgetProps) {
  const resolvedAccentColor = accentColor || mxTheme.colors.accent;
  const disableEditControls = layoutLocked || locked;
  const isGateReportCard = title === 'Dashboard Module Register';

  if (isGateReportCard && !editMode) {
    return <GateProgressReportCard accentColor={resolvedAccentColor} locked={locked} editMode={editMode} onPress={onPress} />;
  }

  return (
    <Pressable
      onPress={locked || editMode ? undefined : onPress}
      style={{
        backgroundColor: mxTheme.colors.surfaceSoft,
        borderColor: locked ? mxTheme.colors.border : resolvedAccentColor,
        borderWidth: 1,
        borderRadius: mxTheme.radius.md,
        padding: 15,
        marginBottom: 10,
        shadowColor: locked ? 'transparent' : resolvedAccentColor,
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: locked ? 0 : 2,
        opacity: locked ? 0.5 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'stretch' }}>
        <View
          style={{
            width: 4,
            borderRadius: 999,
            backgroundColor: locked ? mxTheme.colors.border : resolvedAccentColor,
          }}
        />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: mxTheme.colors.text, fontSize: 17, fontWeight: '800' }}>
                {title}
              </Text>
              {(sourceLabel || editMode) && (
                <Text style={{ color: mxTheme.colors.muted, marginTop: 4, fontSize: 10, fontWeight: '800' }}>
                  {sourceLabel || 'Core'} | {sizeLabel(size)}
                </Text>
              )}
              {subtitle && (
                <Text style={{ color: mxTheme.colors.muted, marginTop: 5, fontSize: 12, lineHeight: 17 }}>
                  {subtitle}
                </Text>
              )}
            </View>
            {badge && (
              <View
                style={{
                  borderColor: '#2c2c2c',
                  borderWidth: 1,
                  paddingHorizontal: 7,
                  paddingVertical: 3,
                  borderRadius: 999,
                  backgroundColor: '#101010',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <View style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: resolvedAccentColor }} />
                <Text style={{ color: mxTheme.colors.muted, fontSize: 10, fontWeight: '800' }}>{badge}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      {editMode && (
        <View
          style={{
            borderTopColor: '#252525',
            borderTopWidth: 1,
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: 12,
            paddingTop: 8,
          }}
        >
          <WidgetControlButton label="Up" accentColor={resolvedAccentColor} disabled={disableEditControls || !onMoveUp} onPress={onMoveUp} />
          <WidgetControlButton label="Down" accentColor={resolvedAccentColor} disabled={disableEditControls || !onMoveDown} onPress={onMoveDown} />
          <WidgetControlButton label="Size" accentColor={resolvedAccentColor} disabled={disableEditControls || !onResize} onPress={onResize} />
          <WidgetControlButton label="Hide" accentColor={resolvedAccentColor} disabled={disableEditControls || !onHide} onPress={onHide} />
          {onRemove ? (
            <WidgetControlButton label="Remove" accentColor={resolvedAccentColor} disabled={disableEditControls} onPress={onRemove} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}
