import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { InventorySticker } from '../../api/inventoryApi';

type StickerCollectionGridProps = {
  stickers: InventorySticker[];
  totalSlots?: number;
};

function getRarity(index: number) {
  if (index % 12 === 0) return { label: 'Legendary', color: '#f5c542' };
  if (index % 5 === 0) return { label: 'Rare', color: '#8b5cf6' };
  return { label: 'Common', color: '#777' };
}

export function StickerCollectionGrid({ stickers, totalSlots = 24 }: StickerCollectionGridProps) {
  const slots = useMemo(() => {
    const filled = stickers.slice(0, totalSlots).map((sticker, index) => ({
      type: 'filled' as const,
      sticker,
      rarity: getRarity(index),
    }));

    const emptyCount = Math.max(0, totalSlots - filled.length);
    const empty = Array.from({ length: emptyCount }).map((_, index) => ({
      type: 'empty' as const,
      key: `empty-${index}`,
    }));

    return [...filled, ...empty];
  }, [stickers, totalSlots]);

  const progress = Math.round((stickers.length / totalSlots) * 100);

  return (
    <View style={{ marginTop: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Sticker Collection</Text>
        <Text style={{ color: '#ff9abf', fontWeight: '700' }}>{stickers.length}/{totalSlots}</Text>
      </View>

      <View style={{ height: 10, backgroundColor: '#222', borderRadius: 99, overflow: 'hidden', marginBottom: 12 }}>
        <View style={{ width: `${Math.min(100, progress)}%`, height: '100%', backgroundColor: '#ff0055' }} />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {slots.map((slot, index) => {
          if (slot.type === 'empty') {
            return (
              <View
                key={slot.key}
                style={{
                  width: '30%',
                  minHeight: 110,
                  backgroundColor: '#0d0d0d',
                  borderColor: '#222',
                  borderWidth: 1,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: '#333', fontSize: 24 }}>?</Text>
                <Text style={{ color: '#333', fontSize: 11 }}>Missing</Text>
              </View>
            );
          }

          return (
            <View
              key={slot.sticker.id}
              style={{
                width: '30%',
                minHeight: 110,
                backgroundColor: '#111',
                borderColor: slot.rarity.color,
                borderWidth: 1,
                borderRadius: 12,
                padding: 8,
                marginBottom: 8,
              }}
            >
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>
                  {slot.sticker.sticker?.title || 'Sticker'}
                </Text>
                <Text style={{ color: '#ff9abf', marginTop: 4 }}>x{slot.sticker.quantity}</Text>
              </View>

              <Text style={{ color: slot.rarity.color, fontSize: 10, fontWeight: '700', textAlign: 'center' }}>
                {slot.rarity.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
