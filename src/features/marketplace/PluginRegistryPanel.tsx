import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { enabledMistressXPlugins, type MistressXPluginDefinition } from '../../plugins';

type AreaFilter = 'ALL' | 'HEADMISTRESS' | 'MISTRESS' | 'SUB' | 'SHARED' | 'SITE';

const ROLE_TO_AREA: Record<string, AreaFilter> = {
  headmistress: 'HEADMISTRESS',
  mistress: 'MISTRESS',
  sub: 'SUB',
  guest: 'SHARED',
};

function panelStyle(borderColor = '#222') {
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

function label(value: string) {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function borderFor(plugin: MistressXPluginDefinition) {
  if (plugin.status === 'active') return '#1D9E75';
  if (plugin.status === 'scaffolded') return '#d4af37';
  if (plugin.status === 'locked') return '#ff0055';
  return '#333';
}

function matchesArea(plugin: MistressXPluginDefinition, areaFilter: AreaFilter) {
  if (areaFilter === 'ALL') return true;
  return plugin.roles.some((role) => ROLE_TO_AREA[role] === areaFilter);
}

function RegistryCard({ plugin }: { plugin: MistressXPluginDefinition }) {
  return (
    <View style={panelStyle(borderFor(plugin))}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '900' }}>{plugin.name}</Text>
          <Text style={{ color: '#ff9abf', marginTop: 4 }}>{label(plugin.category)} / {label(plugin.status)}</Text>
        </View>
        <Text style={{ color: borderFor(plugin), fontSize: 11, fontWeight: '900' }}>{plugin.key}</Text>
      </View>
      <Text style={{ color: '#ddd', marginTop: 8 }}>{plugin.description}</Text>
      <Text style={smallText('#d4af37')}>Roles: {plugin.roles.map(label).join(' / ')}</Text>
      <Text style={smallText('#aaa')}>Capabilities: {plugin.capabilities.map(label).join(', ')}</Text>
      {plugin.routes?.length ? <Text style={smallText('#777')}>Routes: {plugin.routes.map((route) => route.label).join(', ')}</Text> : null}
      {plugin.dependencies?.length ? <Text style={smallText('#777')}>Libraries: {plugin.dependencies.join(', ')}</Text> : null}
    </View>
  );
}

export function PluginRegistryPanel({ areaFilter }: { areaFilter: AreaFilter }) {
  const registryPlugins = useMemo(
    () => enabledMistressXPlugins.filter((plugin) => matchesArea(plugin, areaFilter)),
    [areaFilter],
  );
  const summary = useMemo(() => ({
    total: registryPlugins.length,
    active: registryPlugins.filter((plugin) => plugin.status === 'active').length,
    capabilities: new Set(registryPlugins.flatMap((plugin) => plugin.capabilities)).size,
    routes: registryPlugins.reduce((sum, plugin) => sum + (plugin.routes?.length || 0), 0),
  }), [registryPlugins]);

  return (
    <View>
      <View style={panelStyle('#ff0055')}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Registry Source of Truth</Text>
        <Text style={smallText('#aaa')}>
          These cards come from frontend/src/plugins/pluginRegistry.ts so app surfaces can share one central plugin list.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
          <View style={{ ...panelStyle(), width: '48%', marginRight: '2%' }}>
            <Text style={smallText('#aaa')}>Registry plugins</Text>
            <Text style={{ color: '#ff9abf', fontSize: 22, fontWeight: '900' }}>{summary.total}</Text>
          </View>
          <View style={{ ...panelStyle(), width: '48%' }}>
            <Text style={smallText('#aaa')}>Active</Text>
            <Text style={{ color: '#1D9E75', fontSize: 22, fontWeight: '900' }}>{summary.active}</Text>
          </View>
          <View style={{ ...panelStyle(), width: '48%', marginRight: '2%' }}>
            <Text style={smallText('#aaa')}>Capabilities</Text>
            <Text style={{ color: '#d4af37', fontSize: 22, fontWeight: '900' }}>{summary.capabilities}</Text>
          </View>
          <View style={{ ...panelStyle(), width: '48%' }}>
            <Text style={smallText('#aaa')}>Screen routes</Text>
            <Text style={{ color: '#ff9abf', fontSize: 22, fontWeight: '900' }}>{summary.routes}</Text>
          </View>
        </View>
      </View>

      {registryPlugins.map((plugin) => (
        <RegistryCard key={plugin.key} plugin={plugin} />
      ))}
      {registryPlugins.length === 0 ? (
        <Text style={{ color: '#777', marginBottom: 12 }}>No registry plugins match this area filter.</Text>
      ) : null}
    </View>
  );
}
