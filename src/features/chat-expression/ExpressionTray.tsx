import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  CHAT_EXPRESSION_TABS,
  ExpressionAsset,
  ExpressionTrayTabKey,
  getExpressionAssetsForTab,
} from './expressionCatalog';

type ExpressionTrayProps = {
  onSelectExpression?: (asset: ExpressionAsset) => void;
  compact?: boolean;
  disabled?: boolean;
};

function expressionAssetTone(asset: ExpressionAsset) {
  if (asset.type === 'digital_gift') return '#d4af37';
  if (asset.type === 'send_effect') return '#ff9abf';
  if (asset.type === 'marketplace_pack') return '#1D9E75';
  if (asset.type === 'gif' || asset.type === 'animated_sticker') return '#60a5fa';
  return '#ff0055';
}

function expressionTypeLabel(type: ExpressionAsset['type']) {
  return type.replace(/_/g, ' ').toUpperCase();
}

export function ExpressionTray({ onSelectExpression, compact = false, disabled = false }: ExpressionTrayProps) {
  const [activeTab, setActiveTab] = useState<ExpressionTrayTabKey>('favorites');
  const [selectedAsset, setSelectedAsset] = useState<ExpressionAsset | null>(null);
  const activeTabDefinition = CHAT_EXPRESSION_TABS.find((tab) => tab.key === activeTab) || CHAT_EXPRESSION_TABS[0];
  const assets = useMemo(() => getExpressionAssetsForTab(activeTab), [activeTab]);

  function handleSelectAsset(asset: ExpressionAsset) {
    if (disabled) return;
    setSelectedAsset(asset);
    onSelectExpression?.(asset);
  }

  return (
    <View
      style={{
        backgroundColor: '#080808',
        borderColor: '#2b1820',
        borderWidth: 1,
        borderRadius: 16,
        padding: compact ? 9 : 12,
        marginBottom: 10,
        opacity: disabled ? 0.65 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: compact ? 15 : 17, fontWeight: '900' }}>MX Expression Tray</Text>
          <Text style={{ color: '#aaa', fontSize: 11, marginTop: 4 }}>
            Emojis, reactions, stickers, GIFs, send effects, gifts, and shop packs for this chat.
          </Text>
        </View>
        {selectedAsset ? (
          <View style={{ backgroundColor: '#171717', borderColor: expressionAssetTone(selectedAsset), borderWidth: 1, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 9 }}>
            <Text style={{ color: expressionAssetTone(selectedAsset), fontSize: 11, fontWeight: '900' }}>
              {selectedAsset.glyph} {selectedAsset.label}
            </Text>
          </View>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingTop: 10, paddingBottom: 2 }}>
        {CHAT_EXPRESSION_TABS.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={{
                backgroundColor: active ? '#ff0055' : '#151515',
                borderColor: active ? '#ff9abf' : '#2c2c2c',
                borderWidth: 1,
                borderRadius: 999,
                paddingVertical: 8,
                paddingHorizontal: 10,
                marginRight: 7,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: tab.key === 'gifs' ? 10 : 13 }}>{tab.glyph}</Text>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 11 }}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ backgroundColor: '#111', borderColor: '#222', borderWidth: 1, borderRadius: 14, padding: 10, marginTop: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '900' }}>{activeTabDefinition.glyph} {activeTabDefinition.label}</Text>
            <Text style={{ color: '#777', fontSize: 11, marginTop: 3 }}>{activeTabDefinition.description}</Text>
          </View>
          <Text style={{ color: '#777', fontSize: 11, fontWeight: '800' }}>{assets.length} items</Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {assets.map((asset) => {
            const tone = expressionAssetTone(asset);
            return (
              <Pressable
                key={asset.id}
                onPress={() => handleSelectAsset(asset)}
                disabled={disabled}
                accessibilityRole="button"
                style={{
                  backgroundColor: '#050505',
                  borderColor: tone,
                  borderWidth: 1,
                  borderRadius: 13,
                  padding: 10,
                  flexGrow: 1,
                  flexBasis: compact ? 92 : 118,
                  minHeight: 88,
                }}
              >
                <Text style={{ color: tone, fontSize: asset.type === 'marketplace_pack' ? 22 : 26, fontWeight: '900' }}>{asset.glyph}</Text>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900', marginTop: 6 }} numberOfLines={1}>{asset.label}</Text>
                <Text style={{ color: '#777', fontSize: 9, fontWeight: '800', marginTop: 3 }}>{expressionTypeLabel(asset.type)}</Text>
                {asset.priceCredits !== undefined ? (
                  <Text style={{ color: tone, fontSize: 10, fontWeight: '900', marginTop: 3 }}>{asset.priceCredits} credits</Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
