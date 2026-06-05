import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { mxDemoIconCollections, mxIconForgeActions, mxIconForgePipelineNotes } from './iconForgeConfig';
import type { MxIconCollection, MxIconForgeAction } from './iconForgeTypes';

const colors = {
  background: '#050505',
  panel: '#11100d',
  panelSoft: '#17130d',
  gold: '#d4af37',
  goldLight: '#f9d976',
  goldDark: '#6f4c16',
  text: '#f1dfad',
  muted: '#9a927f',
  border: '#39270c',
  green: '#2FAE77',
  purple: '#9F7AEA',
};

function IconForgeActionRow({ action, onPress }: { action: MxIconForgeAction; onPress?: (action: MxIconForgeAction) => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress?.(action)}
      style={{ borderBottomColor: '#221908', borderBottomWidth: 1, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', gap: 12 }}
    >
      <View style={{ width: 28, height: 28, borderRadius: 9, borderColor: colors.green, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.green, fontSize: 17, fontWeight: '900' }}>{action.icon}</Text>
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: '900' }}>{action.title}</Text>
        <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 16 }}>{action.description}</Text>
      </View>
      <Text style={{ color: colors.goldLight, fontSize: 28, fontWeight: '300' }}>+</Text>
    </Pressable>
  );
}

function IconCollectionCard({ collection }: { collection: MxIconCollection }) {
  return (
    <View style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 18, backgroundColor: colors.panelSoft, padding: 14, gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1, gap: 5 }}>
          <Text style={{ color: colors.goldLight, fontSize: 16, fontWeight: '900' }}>{collection.name}</Text>
          <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 16 }}>{collection.description}</Text>
        </View>
        <View style={{ borderColor: colors.goldDark, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, height: 32 }}>
          <Text style={{ color: colors.gold, fontSize: 10, fontWeight: '900' }}>{collection.iconCount} ICONS</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
        {collection.exportFormats.map((format) => (
          <View key={format} style={{ borderRadius: 999, backgroundColor: '#080706', borderColor: '#2b210d', borderWidth: 1, paddingHorizontal: 9, paddingVertical: 5 }}>
            <Text style={{ color: colors.text, fontSize: 10, fontWeight: '800' }}>{format}</Text>
          </View>
        ))}
      </View>
      <Text style={{ color: colors.muted, fontSize: 10 }}>Targets: {collection.installTargets.join(' • ')}</Text>
    </View>
  );
}

export function IconForgeScreen({ showDemoCollections = false, onActionPress }: { showDemoCollections?: boolean; onActionPress?: (action: MxIconForgeAction) => void }) {
  const [showCollections, setShowCollections] = useState(showDemoCollections);
  const collections = useMemo(() => (showCollections ? mxDemoIconCollections : []), [showCollections]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 18, gap: 16 }}>
      <View style={{ borderColor: colors.goldDark, borderWidth: 1, borderRadius: 26, backgroundColor: colors.panel, padding: 18, gap: 18 }}>
        <View style={{ alignItems: 'center', gap: 8, paddingVertical: 12 }}>
          <View style={{ width: 126, height: 92, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'absolute', width: 96, height: 72, borderWidth: 2, borderColor: '#7b7ff7', borderStyle: 'dashed', borderRadius: 10, transform: [{ rotate: '-8deg' }] }} />
            <View style={{ position: 'absolute', width: 70, height: 56, borderWidth: 3, borderColor: '#7b7ff7', borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#7b7ff7', fontSize: 26 }}>▧</Text>
            </View>
            <Text style={{ position: 'absolute', right: 4, top: 3, color: '#9FD8FF', fontSize: 20 }}>×</Text>
            <Text style={{ position: 'absolute', left: 4, bottom: 13, color: '#9FD8FF', fontSize: 20 }}>＋</Text>
          </View>
          <Text style={{ color: colors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 3, textTransform: 'uppercase' }}>MX Icon Forge</Text>
          <Text style={{ color: colors.text, fontSize: 26, textAlign: 'center', fontWeight: '900' }}>
            {collections.length ? 'Your icon collections' : 'You have no collections yet'}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 13, textAlign: 'center' }}>
            {collections.length ? 'Manage collections, exports, app market installs and plugin targets here.' : 'All collections will display here once Headmistress creates or imports them.'}
          </Text>
        </View>

        {collections.length ? (
          <View style={{ gap: 12 }}>
            {collections.map((collection) => (
              <IconCollectionCard key={collection.id} collection={collection} />
            ))}
          </View>
        ) : (
          <View style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 20, backgroundColor: '#080706', padding: 16, gap: 5 }}>
            <Text style={{ color: colors.text, fontSize: 19, fontWeight: '900', textAlign: 'center', marginBottom: 8 }}>What can I do with my collections?</Text>
            {mxIconForgeActions.map((action) => (
              <IconForgeActionRow key={action.id} action={action} onPress={onActionPress} />
            ))}
          </View>
        )}

        <View style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 18, backgroundColor: colors.panelSoft, padding: 14, gap: 10 }}>
          <Text style={{ color: colors.gold, fontSize: 12, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>Pipeline notes</Text>
          {Object.entries(mxIconForgePipelineNotes).map(([key, value]) => (
            <Text key={key} style={{ color: colors.muted, fontSize: 11, lineHeight: 16 }}>✦ {key}: {value}</Text>
          ))}
        </View>

        <Pressable accessibilityRole="button" onPress={() => setShowCollections((value) => !value)} style={{ borderRadius: 16, backgroundColor: colors.gold, paddingVertical: 13, alignItems: 'center' }}>
          <Text style={{ color: '#050505', fontSize: 13, fontWeight: '900' }}>{collections.length ? 'Show Empty State' : 'Preview Demo Collections'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
