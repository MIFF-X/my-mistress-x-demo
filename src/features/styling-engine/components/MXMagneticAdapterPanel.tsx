import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  getMagneticAdapterProgress,
  MX_MAGNETIC_ADAPTER_REGISTRY,
  MX_MAGNETIC_EXPORT_FORMATS,
  MX_MAGNETIC_IMPORT_FORMATS,
  MX_MAGNETIC_TARGET_RUNTIMES,
} from '../magneticAdapterRegistry';
import type { MXMagneticAdapterRegistryEntry } from '../mxMagneticAdapterTypes';

type AdapterStatusFilter = 'all' | MXMagneticAdapterRegistryEntry['status'];

type MXMagneticAdapterPanelProps = {
  onSelectAdapter?: (adapter: MXMagneticAdapterRegistryEntry) => void;
};

type ReviewQueueBucket = {
  id: 'blocked' | 'review' | 'ready';
  label: string;
  count: number;
  helper: string;
  color: string;
};

const colors = {
  background: '#050505',
  panel: '#0b0906',
  panelSoft: '#101014',
  gold: '#d4af37',
  goldLight: '#f9d976',
  goldDark: '#6f4c16',
  cyan: '#00e5ff',
  green: '#4ade80',
  red: '#ef4444',
  muted: '#9a927f',
  text: '#f1dfad',
  border: '#2a2208',
};

const STATUS_FILTERS: { id: AdapterStatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'planned', label: 'Planned' },
  { id: 'scaffolded', label: 'Scaffolded' },
  { id: 'wired', label: 'Wired' },
  { id: 'live', label: 'Live' },
];

function getStatusColor(status: MXMagneticAdapterRegistryEntry['status']) {
  if (status === 'live') return colors.green;
  if (status === 'wired') return colors.cyan;
  if (status === 'scaffolded') return colors.gold;
  return colors.muted;
}

function getAdapterQueueLane(adapter: MXMagneticAdapterRegistryEntry): ReviewQueueBucket['id'] {
  if (adapter.progress >= 86 && adapter.status !== 'planned') return 'ready';
  if (adapter.progress >= 60) return 'review';
  return 'blocked';
}

function buildReviewQueueBuckets(adapters: MXMagneticAdapterRegistryEntry[]): ReviewQueueBucket[] {
  const blocked = adapters.filter((adapter) => getAdapterQueueLane(adapter) === 'blocked').length;
  const review = adapters.filter((adapter) => getAdapterQueueLane(adapter) === 'review').length;
  const ready = adapters.filter((adapter) => getAdapterQueueLane(adapter) === 'ready').length;

  return [
    {
      id: 'blocked',
      label: 'Blocked',
      count: blocked,
      helper: 'Missing key outputs or still too early to publish.',
      color: colors.red,
    },
    {
      id: 'review',
      label: 'In Review',
      count: review,
      helper: 'Scaffolded/wired adapters that need Headmistress QA before marketplace publishing.',
      color: colors.gold,
    },
    {
      id: 'ready',
      label: 'Publish Ready',
      count: ready,
      helper: 'Adapters ready to feed Marketplace Review once pack outputs are generated.',
      color: colors.green,
    },
  ];
}

function Chip({ label, tone = 'gold' }: { label: string; tone?: 'gold' | 'cyan' | 'muted' | 'green' }) {
  const color = tone === 'cyan' ? colors.cyan : tone === 'green' ? colors.green : tone === 'muted' ? colors.muted : colors.gold;
  return (
    <View style={{ borderColor: color, borderWidth: 1, borderRadius: 999, backgroundColor: '#080806', paddingHorizontal: 9, paddingVertical: 5 }}>
      <Text style={{ color, fontSize: 9, fontWeight: '900', textTransform: 'uppercase' }}>{label}</Text>
    </View>
  );
}

function ProgressBar({ value, color = colors.gold }: { value: number; color?: string }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <View style={{ height: 9, backgroundColor: '#090909', borderRadius: 999, overflow: 'hidden', borderColor: colors.border, borderWidth: 1 }}>
      <View style={{ width: `${width}%`, height: '100%', backgroundColor: color, borderRadius: 999 }} />
    </View>
  );
}

function ReviewQueueSummary({ adapters }: { adapters: MXMagneticAdapterRegistryEntry[] }) {
  const buckets = buildReviewQueueBuckets(adapters);
  const total = adapters.length || 1;
  return (
    <View style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 16, backgroundColor: '#080806', padding: 12, gap: 10 }}>
      <View style={{ gap: 4 }}>
        <Text style={{ color: colors.gold, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' }}>Review Queue Summary</Text>
        <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 16 }}>
          At-a-glance queue for generated packs/adapters before Headmistress marketplace approval.
        </Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {buckets.map((bucket) => {
          const percent = Math.round((bucket.count / total) * 100);
          return (
            <View key={bucket.id} style={{ flexGrow: 1, flexBasis: 190, borderColor: bucket.color, borderWidth: 1, borderRadius: 12, backgroundColor: colors.panelSoft, padding: 10, gap: 7 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                <Text style={{ color: bucket.color, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>{bucket.label}</Text>
                <Text style={{ color: colors.goldLight, fontSize: 16, fontWeight: '900' }}>{bucket.count}</Text>
              </View>
              <ProgressBar value={percent} color={bucket.color} />
              <Text style={{ color: colors.muted, fontSize: 9, lineHeight: 13 }}>{bucket.helper}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function AdapterCard({ adapter, onSelect }: { adapter: MXMagneticAdapterRegistryEntry; onSelect?: (adapter: MXMagneticAdapterRegistryEntry) => void }) {
  const statusColor = getStatusColor(adapter.status);
  const queueLane = getAdapterQueueLane(adapter);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onSelect?.(adapter)}
      style={{ borderColor: statusColor, borderWidth: 1, borderRadius: 18, backgroundColor: colors.panelSoft, padding: 13, gap: 10, flexGrow: 1, flexBasis: 280 }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ color: colors.goldLight, fontSize: 15, fontWeight: '900' }}>{adapter.name}</Text>
          <Text style={{ color: colors.muted, fontSize: 10, fontWeight: '800' }}>{adapter.id}</Text>
        </View>
        <Chip label={`${adapter.progress}%`} tone={adapter.status === 'live' ? 'green' : adapter.status === 'wired' ? 'cyan' : 'gold'} />
      </View>

      <Text style={{ color: colors.text, fontSize: 11, lineHeight: 16 }}>{adapter.summary}</Text>
      <ProgressBar value={adapter.progress} color={statusColor} />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        <Chip label={adapter.status} tone={adapter.status === 'live' ? 'green' : adapter.status === 'wired' ? 'cyan' : 'muted'} />
        <Chip label={queueLane === 'ready' ? 'marketplace ready' : queueLane === 'review' ? 'needs review' : 'blocked'} tone={queueLane === 'ready' ? 'green' : queueLane === 'review' ? 'gold' : 'muted'} />
        <Chip label={adapter.family} tone="gold" />
        <Chip label={adapter.tier} tone="muted" />
        {adapter.supportsOnDemandIcons ? <Chip label="on demand" tone="cyan" /> : null}
        {adapter.supportsAutoImport ? <Chip label="auto import" tone="cyan" /> : null}
        {adapter.supportsTailwindTokens ? <Chip label="tailwind" tone="green" /> : null}
        {adapter.supportsMarketplaceCard ? <Chip label="pack cards" tone="green" /> : null}
      </View>

      <View style={{ gap: 5 }}>
        <Text style={{ color: colors.gold, fontSize: 10, fontWeight: '900' }}>Next step</Text>
        <Text style={{ color: colors.muted, fontSize: 10, lineHeight: 15 }}>{adapter.nextStep}</Text>
      </View>
    </Pressable>
  );
}

export function MXMagneticAdapterPanel({ onSelectAdapter }: MXMagneticAdapterPanelProps) {
  const [filter, setFilter] = useState<AdapterStatusFilter>('all');
  const overallProgress = getMagneticAdapterProgress();
  const visibleAdapters = useMemo(
    () => MX_MAGNETIC_ADAPTER_REGISTRY.filter((adapter) => filter === 'all' || adapter.status === filter),
    [filter],
  );

  return (
    <View style={{ borderColor: colors.goldDark, borderWidth: 1, borderRadius: 24, backgroundColor: colors.panel, padding: 16, gap: 14 }}>
      <View style={{ gap: 5 }}>
        <Text style={{ color: colors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>MX Magnetic Connector</Text>
        <Text style={{ color: colors.goldLight, fontSize: 22, fontWeight: '900' }}>Adapter Registry + Runtime Coverage</Text>
        <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>
          Tracks the Styling Engine connection layer for Iconify-style on-demand icons, auto-import workflows, SVG/SVGO cleanup, Tailwind tokens, marketplace card output, font exports and cross-runtime bundle targets.
        </Text>
      </View>

      <View style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 16, backgroundColor: '#080806', padding: 12, gap: 9 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: '900' }}>Overall adapter progress</Text>
          <Text style={{ color: colors.goldLight, fontSize: 18, fontWeight: '900' }}>{overallProgress}%</Text>
        </View>
        <ProgressBar value={overallProgress} color={colors.gold} />
      </View>

      <ReviewQueueSummary adapters={MX_MAGNETIC_ADAPTER_REGISTRY} />

      <View style={{ gap: 8 }}>
        <Text style={{ color: colors.gold, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' }}>Status filter</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {STATUS_FILTERS.map((item) => {
            const active = filter === item.id;
            return (
              <Pressable key={item.id} onPress={() => setFilter(item.id)} style={{ borderColor: active ? colors.gold : colors.border, borderWidth: 1, borderRadius: 999, backgroundColor: active ? '#181207' : '#080806', paddingHorizontal: 12, paddingVertical: 8 }}>
                <Text style={{ color: active ? colors.goldLight : colors.muted, fontSize: 11, fontWeight: '900' }}>{item.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {visibleAdapters.map((adapter) => <AdapterCard key={adapter.id} adapter={adapter} onSelect={onSelectAdapter} />)}
      </View>

      <View style={{ gap: 9 }}>
        <Text style={{ color: colors.gold, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' }}>Import formats covered</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {MX_MAGNETIC_IMPORT_FORMATS.map((format) => <Chip key={format} label={format} tone="muted" />)}
        </View>
      </View>

      <View style={{ gap: 9 }}>
        <Text style={{ color: colors.gold, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' }}>Export formats covered</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {MX_MAGNETIC_EXPORT_FORMATS.map((format) => <Chip key={format} label={format} tone="gold" />)}
        </View>
      </View>

      <View style={{ gap: 9 }}>
        <Text style={{ color: colors.gold, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' }}>Runtime targets</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {MX_MAGNETIC_TARGET_RUNTIMES.map((runtime) => <Chip key={runtime} label={runtime} tone="cyan" />)}
        </View>
      </View>
    </View>
  );
}

export default MXMagneticAdapterPanel;
