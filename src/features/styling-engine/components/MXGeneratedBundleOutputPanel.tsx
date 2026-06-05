import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { MXGeneratedAdapterBundleSummary } from '../mxMagneticAdapterTypes';
import { createMagneticReviewRecord, formatMagneticReviewRecord, type MXMagneticReviewRecord } from '../magneticReviewQueueModel';

export function formatGeneratedBundleOutput(summary: MXGeneratedAdapterBundleSummary) {
  return [
    `Generated Bundle Output: ${summary.packName}`,
    `Pack ID: ${summary.packId}`,
    `Adapter contract: ${summary.adapterContractId}`,
    summary.downloadManifestPath ? `Manifest: ${summary.downloadManifestPath}` : null,
    summary.autoImportRegistryPath ? `Auto import registry: ${summary.autoImportRegistryPath}` : null,
    summary.svgSpritePath ? `SVG sprite: ${summary.svgSpritePath}` : null,
    summary.reactComponentPath ? `React components: ${summary.reactComponentPath}` : null,
    summary.reactNativeComponentPath ? `React Native components: ${summary.reactNativeComponentPath}` : null,
    summary.cssTokenPath ? `CSS tokens: ${summary.cssTokenPath}` : null,
    summary.tailwindTokenPath ? `Tailwind tokens: ${summary.tailwindTokenPath}` : null,
    summary.frontCardPath ? `Front-facing card: ${summary.frontCardPath}` : null,
    summary.expandedInfoCardPath ? `Expanded info card: ${summary.expandedInfoCardPath}` : null,
  ].filter(Boolean).join('\n');
}

type MXGeneratedBundleOutputPanelProps = {
  summary: MXGeneratedAdapterBundleSummary;
  onSaveOutput?: (outputText: string) => void;
  onSubmitReviewRecord?: (record: MXMagneticReviewRecord) => void | Promise<void>;
};

type PublishReadiness = {
  label: 'Draft' | 'Almost Ready' | 'Publish Ready';
  tone: 'draft' | 'almost' | 'ready';
  helper: string;
};

type PublishGateState = {
  label: 'Blocked' | 'Needs Review' | 'Ready for Marketplace';
  helper: string;
  tone: 'blocked' | 'review' | 'ready';
  actionLabel: string;
};

const colors = {
  panel: '#080806',
  card: '#0e0c07',
  border: '#2a2208',
  gold: '#d4af37',
  goldLight: '#f9d976',
  goldDark: '#7a6230',
  cyan: '#00e5ff',
  green: '#4ade80',
  red: '#ef4444',
  muted: '#9a927f',
};

function resolvePublishReadiness(readiness: number, readyCount: number, totalCount: number): PublishReadiness {
  if (readiness >= 86 && readyCount >= totalCount - 1) {
    return {
      label: 'Publish Ready',
      tone: 'ready',
      helper: 'This pack has the core download, card, component/token and listing outputs mapped. Final admin review can publish it.',
    };
  }

  if (readiness >= 60) {
    return {
      label: 'Almost Ready',
      tone: 'almost',
      helper: 'Most outputs are mapped. Complete the remaining missing paths before publishing this pack to customers.',
    };
  }

  return {
    label: 'Draft',
    tone: 'draft',
    helper: 'This pack still needs key generated outputs before it should be listed or sold.',
  };
}

function resolvePublishGate(readiness: number, readyCount: number, totalCount: number): PublishGateState {
  if (readiness >= 86 && readyCount >= totalCount - 1) {
    return {
      label: 'Ready for Marketplace',
      tone: 'ready',
      helper: 'The pack has enough mapped outputs to move into the Headmistress marketplace publishing queue.',
      actionLabel: 'Queue for Marketplace Review',
    };
  }

  if (readiness >= 60) {
    return {
      label: 'Needs Review',
      tone: 'review',
      helper: 'The pack can be reviewed internally, but missing outputs should be completed before public sale.',
      actionLabel: 'Send to Review Queue',
    };
  }

  return {
    label: 'Blocked',
    tone: 'blocked',
    helper: 'Publishing is blocked until the required manifest, card, and output files are mapped.',
    actionLabel: 'Resolve Missing Outputs',
  };
}

function getReadinessColor(readiness: PublishReadiness) {
  if (readiness.tone === 'ready') return colors.green;
  if (readiness.tone === 'almost') return colors.gold;
  return colors.red;
}

function getGateColor(gate: PublishGateState) {
  if (gate.tone === 'ready') return colors.green;
  if (gate.tone === 'review') return colors.gold;
  return colors.red;
}

function getRecordColor(record: MXMagneticReviewRecord) {
  if (record.lane === 'marketplace-review') return colors.green;
  if (record.lane === 'internal-review') return colors.gold;
  return colors.red;
}

function OutputTile({ label, value, tone = 'gold' }: { label: string; value?: string; tone?: 'gold' | 'cyan' | 'green' | 'muted' }) {
  const accent = tone === 'cyan' ? colors.cyan : tone === 'green' ? colors.green : tone === 'muted' ? colors.muted : colors.gold;
  const ready = Boolean(value);

  return (
    <View style={{ flexGrow: 1, flexBasis: 190, borderColor: ready ? accent : colors.border, borderWidth: 1, borderRadius: 12, backgroundColor: colors.card, padding: 10, gap: 6, opacity: ready ? 1 : 0.62 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
        <Text style={{ color: accent, fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }}>{label}</Text>
        <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: ready ? accent : colors.muted }} />
      </View>
      <Text numberOfLines={2} style={{ color: ready ? colors.goldLight : colors.muted, fontSize: 9, lineHeight: 13 }}>{value || 'Not included in this adapter output'}</Text>
    </View>
  );
}

function ChecklistRow({ label, ready, next }: { label: string; ready: boolean; next: string }) {
  return (
    <View style={{ borderColor: ready ? colors.green : colors.goldDark, borderWidth: 1, borderRadius: 10, backgroundColor: colors.card, padding: 9, gap: 4, flexGrow: 1, flexBasis: 180 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
        <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: ready ? colors.green : colors.goldDark }} />
        <Text style={{ color: ready ? colors.green : colors.gold, fontSize: 9, fontWeight: '900', textTransform: 'uppercase' }}>{ready ? 'Ready' : 'Next'}</Text>
      </View>
      <Text style={{ color: colors.goldLight, fontSize: 11, fontWeight: '900' }}>{label}</Text>
      <Text style={{ color: colors.muted, fontSize: 9, lineHeight: 13 }}>{next}</Text>
    </View>
  );
}

function PublishReadinessBadge({ readiness }: { readiness: PublishReadiness }) {
  const color = getReadinessColor(readiness);
  return (
    <View style={{ borderColor: color, borderWidth: 1, borderRadius: 14, backgroundColor: '#050505', padding: 10, gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <Text style={{ color, fontSize: 11, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' }}>{readiness.label}</Text>
        <View style={{ borderColor: color, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 }}>
          <Text style={{ color, fontSize: 8, fontWeight: '900', textTransform: 'uppercase' }}>Publish status</Text>
        </View>
      </View>
      <Text style={{ color: colors.muted, fontSize: 10, lineHeight: 15 }}>{readiness.helper}</Text>
    </View>
  );
}

function PublishGatePanel({ gate }: { gate: PublishGateState }) {
  const color = getGateColor(gate);
  return (
    <View style={{ borderColor: color, borderWidth: 1, borderRadius: 14, backgroundColor: '#050505', padding: 10, gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <View style={{ gap: 3, flex: 1, minWidth: 180 }}>
          <Text style={{ color, fontSize: 10, fontWeight: '900', letterSpacing: 1.6, textTransform: 'uppercase' }}>Publish Gate</Text>
          <Text style={{ color: colors.goldLight, fontSize: 15, fontWeight: '900' }}>{gate.label}</Text>
        </View>
        <View style={{ borderColor: color, borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color, fontSize: 8, fontWeight: '900', textTransform: 'uppercase' }}>{gate.tone}</Text>
        </View>
      </View>
      <Text style={{ color: colors.muted, fontSize: 10, lineHeight: 15 }}>{gate.helper}</Text>
      <View style={{ borderColor: color, borderWidth: 1, borderRadius: 10, paddingVertical: 9, backgroundColor: gate.tone === 'ready' ? '#062015' : gate.tone === 'review' ? '#181207' : '#1e0707' }}>
        <Text style={{ color, textAlign: 'center', fontSize: 9, fontWeight: '900', letterSpacing: 1.3, textTransform: 'uppercase' }}>{gate.actionLabel}</Text>
      </View>
    </View>
  );
}

function HeadmistressReviewQueueStub({ record }: { record: MXMagneticReviewRecord }) {
  const color = getRecordColor(record);
  const queueLane = record.lane === 'marketplace-review' ? 'Marketplace Review' : record.lane === 'internal-review' ? 'Internal QA Review' : 'Blocked / Missing Outputs';

  return (
    <View style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 14, backgroundColor: '#060606', padding: 10, gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <View style={{ flex: 1, minWidth: 180, gap: 3 }}>
          <Text style={{ color: colors.gold, fontSize: 10, fontWeight: '900', letterSpacing: 1.6, textTransform: 'uppercase' }}>Headmistress Review Queue</Text>
          <Text style={{ color: colors.goldLight, fontSize: 15, fontWeight: '900' }}>{queueLane}</Text>
        </View>
        <View style={{ borderColor: color, borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color, fontSize: 8, fontWeight: '900', textTransform: 'uppercase' }}>{record.readyCount}/{record.totalCount} ready</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
        <OutputTile label="Record" value={record.id} tone="gold" />
        <OutputTile label="Adapter" value={record.adapterContractId} tone="cyan" />
        <OutputTile label="Review owner" value={record.reviewOwner} tone="green" />
        <OutputTile label="Queue lane" value={queueLane} tone={record.lane === 'marketplace-review' ? 'green' : record.lane === 'internal-review' ? 'gold' : 'muted'} />
      </View>
      <Text style={{ color: colors.muted, fontSize: 10, lineHeight: 15 }}>
        Review record prepared locally. Backend approval history, rejection reasons, publish timestamps and marketplace listing IDs are later wiring.
      </Text>
    </View>
  );
}

function buildChecklist(summary: MXGeneratedAdapterBundleSummary) {
  return [
    { label: 'Download manifest', ready: Boolean(summary.downloadManifestPath), next: summary.downloadManifestPath ? 'Package manifest path is mapped.' : 'Add download-bundle output to this adapter.' },
    { label: 'Front-facing card', ready: Boolean(summary.frontCardPath), next: summary.frontCardPath ? 'Little box/menu card is mapped.' : 'Generate the marketplace front card.' },
    { label: 'Expanded info card', ready: Boolean(summary.expandedInfoCardPath), next: summary.expandedInfoCardPath ? 'Detailed product card is mapped.' : 'Generate the expanded pack information card.' },
    { label: 'Component outputs', ready: Boolean(summary.reactComponentPath || summary.reactNativeComponentPath), next: summary.reactComponentPath || summary.reactNativeComponentPath ? 'App/web component paths are mapped.' : 'Add React or React Native component export support.' },
    { label: 'SVG / sprite output', ready: Boolean(summary.svgSpritePath), next: summary.svgSpritePath ? 'Sprite output is mapped.' : 'Add SVG sprite output for this pack type.' },
    { label: 'Style tokens', ready: Boolean(summary.cssTokenPath || summary.tailwindTokenPath), next: summary.cssTokenPath || summary.tailwindTokenPath ? 'CSS/Tailwind token paths are mapped.' : 'Generate CSS variables or Tailwind token output.' },
    { label: 'Auto-import registry', ready: Boolean(summary.autoImportRegistryPath), next: summary.autoImportRegistryPath ? 'Auto-import registry path is mapped.' : 'Optional: add auto-import map for this output.' },
  ];
}

export function MXGeneratedBundleOutputPanel({ summary, onSaveOutput, onSubmitReviewRecord }: MXGeneratedBundleOutputPanelProps) {
  const outputText = formatGeneratedBundleOutput(summary);
  const checklist = buildChecklist(summary);
  const readyCount = checklist.filter((item) => item.ready).length;
  const readiness = Math.round((readyCount / checklist.length) * 100);
  const publishReadiness = resolvePublishReadiness(readiness, readyCount, checklist.length);
  const publishGate = resolvePublishGate(readiness, readyCount, checklist.length);
  const reviewRecord = createMagneticReviewRecord(summary, readyCount, checklist.length);
  const reviewRecordText = formatMagneticReviewRecord(reviewRecord);

  function queueReviewRecord() {
    onSaveOutput?.([outputText, '', 'Magnetic Review Record', '----------------------', reviewRecordText].join('\n'));
    void onSubmitReviewRecord?.(reviewRecord);
  }

  return (
    <View style={{ borderColor: colors.goldDark, borderWidth: 1, borderRadius: 16, backgroundColor: colors.panel, padding: 12, gap: 10 }}>
      <View style={{ gap: 4 }}>
        <Text style={{ color: colors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>Generated Bundle Output</Text>
        <Text style={{ color: colors.goldLight, fontSize: 16, fontWeight: '900' }}>{summary.packName}</Text>
        <Text style={{ color: colors.muted, fontSize: 10, lineHeight: 15 }}>Download package preview generated through the MX Magnetic Adapter contract: {summary.adapterContractId}</Text>
      </View>

      <PublishReadinessBadge readiness={publishReadiness} />
      <PublishGatePanel gate={publishGate} />
      <HeadmistressReviewQueueStub record={reviewRecord} />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <OutputTile label="Manifest" value={summary.downloadManifestPath} tone="green" />
        <OutputTile label="Auto Import" value={summary.autoImportRegistryPath} tone="cyan" />
        <OutputTile label="SVG Sprite" value={summary.svgSpritePath} tone="gold" />
        <OutputTile label="React" value={summary.reactComponentPath} tone="cyan" />
        <OutputTile label="React Native" value={summary.reactNativeComponentPath} tone="cyan" />
        <OutputTile label="CSS Tokens" value={summary.cssTokenPath} tone="green" />
        <OutputTile label="Tailwind Tokens" value={summary.tailwindTokenPath} tone="green" />
        <OutputTile label="Front Card" value={summary.frontCardPath} tone="gold" />
        <OutputTile label="Expanded Card" value={summary.expandedInfoCardPath} tone="gold" />
      </View>

      <View style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 14, backgroundColor: '#060606', padding: 10, gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
          <Text style={{ color: colors.gold, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' }}>Download Package Checklist</Text>
          <Text style={{ color: readiness >= 70 ? colors.green : colors.gold, fontSize: 13, fontWeight: '900' }}>{readyCount}/{checklist.length} ready · {readiness}%</Text>
        </View>
        <View style={{ height: 8, borderRadius: 999, backgroundColor: colors.card, overflow: 'hidden', borderColor: colors.border, borderWidth: 1 }}>
          <View style={{ width: `${readiness}%`, height: '100%', backgroundColor: readiness >= 70 ? colors.green : colors.gold, borderRadius: 999 }} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
          {checklist.map((item) => <ChecklistRow key={item.label} {...item} />)}
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {onSaveOutput ? (
          <Pressable accessibilityRole="button" onPress={() => onSaveOutput([outputText, '', 'Magnetic Review Record', '----------------------', reviewRecordText].join('\n'))} style={{ flexGrow: 1, flexBasis: 180, borderColor: colors.gold, borderWidth: 1, borderRadius: 12, paddingVertical: 11, backgroundColor: '#120d04' }}>
            <Text style={{ color: colors.goldLight, textAlign: 'center', fontSize: 10, fontWeight: '900', letterSpacing: 1.4, textTransform: 'uppercase' }}>Copy / Save Bundle Output</Text>
          </Pressable>
        ) : null}
        <Pressable accessibilityRole="button" onPress={queueReviewRecord} style={{ flexGrow: 1, flexBasis: 180, borderColor: getRecordColor(reviewRecord), borderWidth: 1, borderRadius: 12, paddingVertical: 11, backgroundColor: reviewRecord.lane === 'marketplace-review' ? '#062015' : reviewRecord.lane === 'internal-review' ? '#181207' : '#1e0707' }}>
          <Text style={{ color: getRecordColor(reviewRecord), textAlign: 'center', fontSize: 10, fontWeight: '900', letterSpacing: 1.4, textTransform: 'uppercase' }}>{publishGate.actionLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default MXGeneratedBundleOutputPanel;
