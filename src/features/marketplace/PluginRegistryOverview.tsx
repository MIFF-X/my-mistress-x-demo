import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { enabledMistressXPlugins } from '../../plugins';
import type { MistressXPluginDefinition } from '../../plugins';

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

function formatList(items: string[], limit = 4) {
  if (items.length <= limit) return items.join(', ');
  return `${items.slice(0, limit).join(', ')} +${items.length - limit}`;
}

function RegistryPluginCard({ plugin }: { plugin: MistressXPluginDefinition }) {
  const borderColor = plugin.status === 'active' ? '#1D9E75' : plugin.status === 'scaffolded' ? '#d4af37' : '#333';

  return (
    <View style={panelStyle(borderColor)}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>{plugin.name}</Text>
          <Text style={{ color: '#ff9abf', marginTop: 4 }}>{plugin.category}</Text>
        </View>
        <Text style={{ color: borderColor, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>{plugin.status}</Text>
      </View>

      <Text style={{ color: '#ddd', marginTop: 8 }}>{plugin.description}</Text>
      <Text style={smallText('#d4af37')}>Roles: {formatList(plugin.roles)}</Text>
      <Text style={smallText('#aaa')}>Capabilities: {formatList(plugin.capabilities, 5)}</Text>
      {plugin.routes?.length ? <Text style={smallText('#777')}>Screens: {plugin.routes.map((route) => route.screenKey).join(', ')}</Text> : null}
      {plugin.dependencies?.length ? <Text style={smallText('#777')}>Libraries: {formatList(plugin.dependencies, 5)}</Text> : null}
    </View>
  );
}

export function PluginRegistryOverview() {
  const summary = useMemo(() => {
    const categories = new Set(enabledMistressXPlugins.map((plugin) => plugin.category));
    const capabilities = new Set(enabledMistressXPlugins.flatMap((plugin) => plugin.capabilities));
    const active = enabledMistressXPlugins.filter((plugin) => plugin.status === 'active').length;

    return {
      total: enabledMistressXPlugins.length,
      active,
      categories: categories.size,
      capabilities: capabilities.size,
    };
  }, []);

  return (
    <View style={panelStyle('#ff0055')}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Plugin Library Blueprint</Text>
      <Text style={{ color: '#aaa', marginTop: 6 }}>
        Central source of truth from frontend/src/plugins. These are the modular systems the marketplace, dashboards, and admin tools can wire into without duplicating plugin definitions.
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
        <View style={{ width: '48%', marginRight: '2%', marginBottom: 8 }}>
          <Text style={smallText('#aaa')}>Registry plugins</Text>
          <Text style={{ color: '#ff9abf', fontSize: 20, fontWeight: '900' }}>{summary.total}</Text>
        </View>
        <View style={{ width: '48%', marginBottom: 8 }}>
          <Text style={smallText('#aaa')}>Active</Text>
          <Text style={{ color: '#1D9E75', fontSize: 20, fontWeight: '900' }}>{summary.active}</Text>
        </View>
        <View style={{ width: '48%', marginRight: '2%', marginBottom: 8 }}>
          <Text style={smallText('#aaa')}>Categories</Text>
          <Text style={{ color: '#d4af37', fontSize: 20, fontWeight: '900' }}>{summary.categories}</Text>
        </View>
        <View style={{ width: '48%', marginBottom: 8 }}>
          <Text style={smallText('#aaa')}>Capabilities</Text>
          <Text style={{ color: '#ff9abf', fontSize: 20, fontWeight: '900' }}>{summary.capabilities}</Text>
        </View>
      </View>

      {enabledMistressXPlugins.map((plugin) => (
        <RegistryPluginCard key={plugin.key} plugin={plugin} />
      ))}
    </View>
  );
}
