import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { BackendPluginRegistrySummary, type PublicPlugin } from '../../api/pluginsApi';
import { useBackendPluginRegistrySummary } from './useBackendPluginRegistrySummary';
import {
  PLUGIN_CATEGORY_PAGES,
  PLUGIN_MANIFEST_REQUIREMENTS,
  PLUGIN_OPERATION_FLOWS,
  PLUGIN_RELOAD_EVENTS,
  getPluginOperationStatusLabel,
  type PluginCategoryPage,
  type PluginManifestRequirement,
  type PluginOperationFlow,
  type PluginReloadEvent,
} from './pluginOperationsModel';

type PluginOperationsPanelProps = {
  plugins: PublicPlugin[];
  visiblePluginCount: number;
};

function panelStyle(borderColor = '#222') {
  return {
    backgroundColor: '#101014',
    borderColor,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  } as const;
}

function smallText(color = '#aaa') {
  return { color, fontSize: 11, lineHeight: 16 } as const;
}

function formatList(items: string[], limit = 5) {
  if (!items.length) return 'none';
  if (items.length <= limit) return items.join(', ');
  return `${items.slice(0, limit).join(', ')} +${items.length - limit}`;
}

function StatusPill({ label, tone }: { label: string; tone: string }) {
  return (
    <View style={{ backgroundColor: `${tone}22`, borderColor: tone, borderWidth: 1, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8 }}>
      <Text style={{ color: tone, fontSize: 10, fontWeight: '900' }}>{label.toUpperCase()}</Text>
    </View>
  );
}

function BulletList({ items, tone }: { items: string[]; tone: string }) {
  return (
    <View style={{ gap: 5 }}>
      {items.map((item) => (
        <View key={item} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 7 }}>
          <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: tone, marginTop: 5 }} />
          <Text style={{ ...smallText('#ddd'), flex: 1 }}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function MetricCard({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: string }) {
  return (
    <View style={{ ...panelStyle(`${tone}66`), flex: 1, minWidth: 150, gap: 5 }}>
      <Text style={smallText('#aaa')}>{label}</Text>
      <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900' }}>{value}</Text>
      <Text style={{ ...smallText(tone), fontWeight: '800' }}>{detail}</Text>
    </View>
  );
}

function BackendContractCard({ summary, error, loading, onRefresh }: { summary?: BackendPluginRegistrySummary | null; error?: string | null; loading?: boolean; onRefresh: () => void }) {
  const tone = summary ? '#1D9E75' : '#d4af37';

  return (
    <View style={{ ...panelStyle(tone), gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, minWidth: 220 }}>
          <Text style={{ color: tone, fontSize: 11, fontWeight: '900' }}>SERVICE CONTRACT</Text>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 3 }}>Registry queues and jobs</Text>
          <Text style={{ ...smallText('#aaa'), marginTop: 3 }}>
            Marketplace operations can cross-check the service job/queue map exposed from the registry summary route.
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <StatusPill label={summary ? 'connected' : loading ? 'loading' : 'pending'} tone={tone} />
          <Pressable disabled={loading} onPress={onRefresh} style={{ borderColor: tone, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, opacity: loading ? 0.6 : 1 }}>
            <Text style={{ color: tone, fontSize: 10, fontWeight: '900' }}>{loading ? 'Loading' : 'Refresh'}</Text>
          </Pressable>
        </View>
      </View>
      {summary ? (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <MetricCard label="Backend plugins" value={String(summary.summary.totalPlugins)} detail="Contract mapped" tone="#1D9E75" />
            <MetricCard label="Queues" value={String(summary.summary.queueCount)} detail="Background channels" tone="#60a5fa" />
            <MetricCard label="Jobs" value={String(summary.summary.jobCount)} detail="Worker actions" tone="#f97316" />
            <MetricCard label="Audit" value={String(summary.summary.auditRequiredCount)} detail="Require audit log" tone="#d4af37" />
          </View>
          <Text style={smallText('#777')}>Queues: {formatList(summary.queueNames)}</Text>
          <Text style={smallText('#777')}>Jobs: {formatList(summary.jobNames)}</Text>
        </>
      ) : (
        <Text style={smallText('#d4af37')}>{error || (loading ? 'Loading summary...' : 'Summary unavailable')}</Text>
      )}
    </View>
  );
}

function OperationCard({ operation, active, onSelect }: { operation: PluginOperationFlow; active: boolean; onSelect: () => void }) {
  return (
    <Pressable onPress={onSelect} style={{ ...panelStyle(active ? operation.tone : '#2a2a33'), flexGrow: 1, flexBasis: 190, maxWidth: 330, gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: operation.tone, fontSize: 11, fontWeight: '900' }}>{operation.badge}</Text>
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '900', marginTop: 3 }}>{operation.title}</Text>
        </View>
        <StatusPill label={getPluginOperationStatusLabel(operation.status)} tone={operation.tone} />
      </View>
      <Text style={smallText('#ddd')}>{operation.description}</Text>
    </Pressable>
  );
}

function RequirementCard({ requirement }: { requirement: PluginManifestRequirement }) {
  return (
    <View style={{ ...panelStyle(requirement.tone), flexGrow: 1, flexBasis: 170, maxWidth: 310, gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '900', flex: 1 }}>{requirement.label}</Text>
        <StatusPill label={requirement.requiredFor} tone={requirement.tone} />
      </View>
      <Text style={smallText('#ddd')}>{requirement.description}</Text>
    </View>
  );
}

function CategoryCard({ category }: { category: PluginCategoryPage }) {
  return (
    <View style={{ ...panelStyle(category.tone), flexGrow: 1, flexBasis: 220, maxWidth: 360, gap: 8 }}>
      <Text style={{ color: category.tone, fontSize: 11, fontWeight: '900' }}>CATEGORY PAGE</Text>
      <Text style={{ color: '#fff', fontSize: 17, fontWeight: '900' }}>{category.title}</Text>
      <Text style={smallText('#ddd')}>{category.description}</Text>
      <BulletList items={category.examples} tone={category.tone} />
    </View>
  );
}

function ReloadEventRow({ event }: { event: PluginReloadEvent }) {
  return (
    <View style={{ ...panelStyle(event.tone), gap: 5 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <Text style={{ color: '#fff', fontWeight: '900' }}>{event.title}</Text>
        <Text style={{ color: event.tone, fontSize: 11, fontWeight: '900' }}>{event.route}</Text>
      </View>
      <Text style={smallText('#ddd')}>{event.description}</Text>
    </View>
  );
}

export function PluginOperationsPanel({ plugins, visiblePluginCount }: PluginOperationsPanelProps) {
  const [selectedOperationId, setSelectedOperationId] = useState(PLUGIN_OPERATION_FLOWS[0].id);
  const { backendSummary, backendSummaryError, backendSummaryLoading, refreshSummary } = useBackendPluginRegistrySummary();
  const selectedOperation = useMemo(
    () => PLUGIN_OPERATION_FLOWS.find((operation) => operation.id === selectedOperationId) || PLUGIN_OPERATION_FLOWS[0],
    [selectedOperationId],
  );
  const activeCount = useMemo(() => plugins.filter((plugin) => plugin.status === 'ACTIVE' || plugin.enabledForCurrentUser).length, [plugins]);
  const updateCount = useMemo(
    () => plugins.filter((plugin) => String(plugin.status).toUpperCase() === 'SCAFFOLDED' || String(plugin.status).toUpperCase() === 'PLANNED').length,
    [plugins],
  );
  const paidCount = useMemo(
    () => plugins.filter((plugin) => plugin.marketplace.purchaseOptions.canBuyFixedLifetime || plugin.marketplace.purchaseOptions.canSubscribe).length,
    [plugins],
  );

  return (
    <View style={{ ...panelStyle('#d4af37'), marginBottom: 12, gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 240 }}>
          <Text style={{ color: '#d4af37', fontSize: 12, fontWeight: '900' }}>PLUGIN OPERATIONS</Text>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 4 }}>Marketplace command layer</Text>
          <Text style={{ ...smallText('#aaa'), marginTop: 4 }}>
            Create, add, install, update, configure, rate and remove flows now have a visible operations map before production persistence and live reload wiring.
          </Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, flex: 1, minWidth: 240 }}>
          <MetricCard label="Listed" value={String(visiblePluginCount)} detail="Marketplace visible" tone="#d4af37" />
          <MetricCard label="Active" value={String(activeCount)} detail="Enabled or active" tone="#1D9E75" />
          <MetricCard label="Paid" value={String(paidCount)} detail="Purchase options" tone="#f97316" />
          <MetricCard label="Needs Review" value={String(updateCount)} detail="Planned/scaffolded" tone="#60a5fa" />
        </View>
      </View>

      <BackendContractCard summary={backendSummary} error={backendSummaryError} loading={backendSummaryLoading} onRefresh={refreshSummary} />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {PLUGIN_OPERATION_FLOWS.map((operation) => (
          <OperationCard key={operation.id} operation={operation} active={selectedOperation.id === operation.id} onSelect={() => setSelectedOperationId(operation.id)} />
        ))}
      </View>

      <View style={{ ...panelStyle(selectedOperation.tone), gap: 9 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <View style={{ flex: 1, minWidth: 220 }}>
            <Text style={{ color: selectedOperation.tone, fontSize: 11, fontWeight: '900' }}>SELECTED FLOW</Text>
            <Text style={{ color: '#fff', fontSize: 19, fontWeight: '900', marginTop: 3 }}>{selectedOperation.title}</Text>
            <Text style={{ ...smallText('#ddd'), marginTop: 4 }}>{selectedOperation.description}</Text>
          </View>
          <StatusPill label={getPluginOperationStatusLabel(selectedOperation.status)} tone={selectedOperation.tone} />
        </View>
        <BulletList items={selectedOperation.checklist} tone={selectedOperation.tone} />
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Manifest Validation</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {PLUGIN_MANIFEST_REQUIREMENTS.map((requirement) => <RequirementCard key={requirement.id} requirement={requirement} />)}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Category Pages</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {PLUGIN_CATEGORY_PAGES.map((category) => <CategoryCard key={category.id} category={category} />)}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Live Reload Events</Text>
        {PLUGIN_RELOAD_EVENTS.map((event) => <ReloadEventRow key={event.id} event={event} />)}
      </View>
    </View>
  );
}
