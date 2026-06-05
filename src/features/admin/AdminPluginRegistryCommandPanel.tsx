import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { enabledMistressXPlugins } from '../../plugins';
import type { MistressXPluginDefinition } from '../../plugins';
import type { AdminPlugin } from '../../api/adminCommandApi';
import { useBackendPluginRegistrySummary } from '../marketplace/useBackendPluginRegistrySummary';

function panelStyle(borderColor = '#333') {
  return {
    backgroundColor: '#111',
    borderColor,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  } as const;
}

function smallText(color = '#aaa') {
  return { color, fontSize: 11, marginTop: 4 } as const;
}

function findAdminPlugin(registryPlugin: MistressXPluginDefinition, adminPlugins: AdminPlugin[]) {
  const key = registryPlugin.key.toLowerCase();
  const name = registryPlugin.name.toLowerCase();

  return adminPlugins.find((plugin) => {
    const pluginId = plugin.id.toLowerCase();
    const pluginName = plugin.name.toLowerCase();
    return pluginId === key || pluginName === name || pluginId.includes(key) || pluginName.includes(name);
  }) || null;
}

function formatList(items: string[], limit = 3) {
  if (items.length <= limit) return items.join(', ');
  return `${items.slice(0, limit).join(', ')} +${items.length - limit}`;
}

export function AdminPluginRegistryCommandPanel({ plugins }: { plugins: AdminPlugin[] }) {
  const { backendSummary, backendSummaryError, backendSummaryLoading, refreshSummary } = useBackendPluginRegistrySummary();

  const rows = useMemo(() => enabledMistressXPlugins.map((registryPlugin) => ({
    registryPlugin,
    adminPlugin: findAdminPlugin(registryPlugin, plugins),
    backendPlugin: backendSummary?.plugins.find((plugin) => plugin.key === registryPlugin.key) || null,
  })), [plugins, backendSummary]);

  const summary = useMemo(() => {
    const represented = rows.filter((row) => row.adminPlugin).length;
    return {
      registryTotal: rows.length,
      represented,
      registryOnly: rows.length - represented,
      activeAdmin: plugins.filter((plugin) => String(plugin.status).toUpperCase() === 'ACTIVE').length,
      backendTotal: backendSummary?.summary.totalPlugins || 0,
      backendQueues: backendSummary?.summary.queueCount || 0,
      backendJobs: backendSummary?.summary.jobCount || 0,
      backendAuditRequired: backendSummary?.summary.auditRequiredCount || 0,
    };
  }, [plugins, rows, backendSummary]);

  return (
    <View style={panelStyle('#ff0055')}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Registry Reference</Text>
      <Text style={{ color: '#aaa', marginTop: 6 }}>
        Cross-checks the frontend registry, admin list, and service job map so operators can see what is live, mapped, or registry-only.
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
        <View style={{ width: '48%', marginRight: '2%', marginBottom: 8 }}>
          <Text style={smallText('#aaa')}>Registry systems</Text>
          <Text style={{ color: '#ff9abf', fontSize: 20, fontWeight: '900' }}>{summary.registryTotal}</Text>
        </View>
        <View style={{ width: '48%', marginBottom: 8 }}>
          <Text style={smallText('#aaa')}>Admin represented</Text>
          <Text style={{ color: '#1D9E75', fontSize: 20, fontWeight: '900' }}>{summary.represented}</Text>
        </View>
        <View style={{ width: '48%', marginRight: '2%', marginBottom: 8 }}>
          <Text style={smallText('#aaa')}>Registry only</Text>
          <Text style={{ color: '#d4af37', fontSize: 20, fontWeight: '900' }}>{summary.registryOnly}</Text>
        </View>
        <View style={{ width: '48%', marginBottom: 8 }}>
          <Text style={smallText('#aaa')}>Active admin plugins</Text>
          <Text style={{ color: '#ff9abf', fontSize: 20, fontWeight: '900' }}>{summary.activeAdmin}</Text>
        </View>
      </View>

      <View style={panelStyle(backendSummary ? '#1D9E75' : '#d4af37')}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <Text style={{ color: '#fff', fontWeight: '900', flex: 1 }}>Service Summary</Text>
          <Pressable disabled={backendSummaryLoading} onPress={refreshSummary} style={{ borderColor: backendSummary ? '#1D9E75' : '#d4af37', borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, opacity: backendSummaryLoading ? 0.6 : 1 }}>
            <Text style={{ color: backendSummary ? '#1D9E75' : '#d4af37', fontSize: 10, fontWeight: '900' }}>{backendSummaryLoading ? 'Loading' : 'Refresh'}</Text>
          </Pressable>
        </View>
        {backendSummary ? (
          <>
            <Text style={smallText('#1D9E75')}>Mapped services: {summary.backendTotal}</Text>
            <Text style={smallText('#aaa')}>Queues: {summary.backendQueues} · Jobs: {summary.backendJobs} · Audit-required: {summary.backendAuditRequired}</Text>
            <Text style={smallText('#777')}>Queue names: {formatList(backendSummary.queueNames, 5)}</Text>
            <Text style={smallText('#777')}>Job names: {formatList(backendSummary.jobNames, 5)}</Text>
          </>
        ) : (
          <Text style={smallText('#d4af37')}>{backendSummaryError || (backendSummaryLoading ? 'Loading summary...' : 'Summary unavailable')}</Text>
        )}
      </View>

      {rows.map(({ registryPlugin, adminPlugin, backendPlugin }) => {
        const borderColor = adminPlugin ? '#1D9E75' : backendPlugin ? '#d4af37' : '#555';
        return (
          <View key={registryPlugin.key} style={panelStyle(borderColor)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontWeight: '900' }}>{registryPlugin.name}</Text>
                <Text style={{ color: '#ff9abf', marginTop: 4 }}>{registryPlugin.category}</Text>
              </View>
              <Text style={{ color: borderColor, fontSize: 11, fontWeight: '900' }}>
                {adminPlugin ? String(adminPlugin.status).toUpperCase() : backendPlugin ? 'BACKEND' : 'REGISTRY ONLY'}
              </Text>
            </View>
            <Text style={smallText('#aaa')}>Key: {registryPlugin.key}</Text>
            <Text style={smallText('#aaa')}>Roles: {formatList(registryPlugin.roles)}</Text>
            <Text style={smallText('#777')}>Capabilities: {formatList(registryPlugin.capabilities, 5)}</Text>
            {backendPlugin ? <Text style={smallText('#d4af37')}>Queues: {formatList(backendPlugin.queueNames, 4)} · Jobs: {formatList(backendPlugin.jobNames, 4)}</Text> : null}
            {adminPlugin ? <Text style={smallText('#1D9E75')}>Admin ID: {adminPlugin.id} · Entitlements: {adminPlugin.entitlements.length}</Text> : null}
          </View>
        );
      })}
    </View>
  );
}
