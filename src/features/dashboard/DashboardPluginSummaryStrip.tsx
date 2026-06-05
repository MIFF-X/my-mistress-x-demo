import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { enabledMistressXPlugins, getPluginsForRole } from '../../plugins';
import { mxTheme } from '../../theme/mxTheme';

function normalizeRegistryRole(role?: string) {
  const normalized = String(role || 'sub').toLowerCase();
  if (normalized === 'admin') return 'headmistress';
  return normalized;
}

export function DashboardPluginSummaryStrip({ role, onOpenMarketplace }: { role?: string; onOpenMarketplace: () => void }) {
  const summary = useMemo(() => {
    const roleKey = normalizeRegistryRole(role);
    const rolePlugins = getPluginsForRole(roleKey);
    const categories = new Set(enabledMistressXPlugins.map((plugin) => plugin.category));
    const roleCapabilities = new Set(rolePlugins.flatMap((plugin) => plugin.capabilities));

    return {
      roleKey,
      total: enabledMistressXPlugins.length,
      roleTotal: rolePlugins.length,
      categories: categories.size,
      capabilities: roleCapabilities.size,
      preview: rolePlugins.slice(0, 3).map((plugin) => plugin.name),
    };
  }, [role]);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onOpenMarketplace}
      style={{
        borderColor: '#ff0055',
        borderWidth: 1,
        borderRadius: 16,
        backgroundColor: '#111',
        padding: 13,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#ff9abf', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }}>
            Plugin Registry
          </Text>
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '900', marginTop: 4 }}>
            {summary.roleTotal} role-ready systems
          </Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 12, marginTop: 5 }}>
            {summary.preview.length ? summary.preview.join(' · ') : 'No role-specific plugins mapped yet'}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: '#d4af37', fontSize: 20, fontWeight: '900' }}>{summary.total}</Text>
          <Text style={{ color: '#777', fontSize: 10, fontWeight: '900' }}>TOTAL</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
        <View style={{ borderColor: '#2c2c2c', borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: '#aaa', fontSize: 11, fontWeight: '800' }}>Role: {summary.roleKey}</Text>
        </View>
        <View style={{ borderColor: '#2c2c2c', borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: '#aaa', fontSize: 11, fontWeight: '800' }}>Categories: {summary.categories}</Text>
        </View>
        <View style={{ borderColor: '#2c2c2c', borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: '#aaa', fontSize: 11, fontWeight: '800' }}>Capabilities: {summary.capabilities}</Text>
        </View>
        <View style={{ borderColor: '#ff0055', borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, backgroundColor: '#1b0710' }}>
          <Text style={{ color: '#ff9abf', fontSize: 11, fontWeight: '900' }}>Open Marketplace</Text>
        </View>
      </View>
    </Pressable>
  );
}
