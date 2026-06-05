import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

type LiveRoomGift = {
  id: string;
  name: string;
  emoji: string;
  priceLabel: string;
  rarity?: 'common' | 'premium' | 'vip' | 'event';
  selected?: boolean;
};

type LiveRoomGiftRailProps = {
  title?: string;
  subtitle?: string;
  balanceLabel?: string;
  gifts?: LiveRoomGift[];
  onGiftPress?: (gift: LiveRoomGift) => void;
  onTopUpPress?: () => void;
};

const defaultGifts: LiveRoomGift[] = [
  { id: 'rose', name: 'Rose', emoji: '🌹', priceLabel: 'MX 10', rarity: 'common' },
  { id: 'crown', name: 'Crown', emoji: '👑', priceLabel: 'MX 75', rarity: 'premium', selected: true },
  { id: 'diamond', name: 'Diamond', emoji: '💎', priceLabel: 'MX 150', rarity: 'premium' },
  { id: 'velvet-box', name: 'Velvet Box', emoji: '🎁', priceLabel: 'MX 250', rarity: 'vip' },
  { id: 'watch-flame', name: 'Watch Flame', emoji: '🔥', priceLabel: 'MX 50', rarity: 'event' },
];

function rarityAccent(rarity?: LiveRoomGift['rarity']) {
  if (rarity === 'vip') return '#d4af37';
  if (rarity === 'event') return '#a855f7';
  if (rarity === 'premium') return '#ff3f8e';
  return '#444';
}

export function LiveRoomGiftRail({
  title = 'Gift Rail',
  subtitle = 'Quick gift strip for live shows, Watch With Mistress, and audio rooms.',
  balanceLabel = 'Balance: MX 1,240',
  gifts = defaultGifts,
  onGiftPress,
  onTopUpPress,
}: LiveRoomGiftRailProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{title}</Text>
          <Text style={{ color: '#999', fontSize: 12, marginTop: 3 }}>{subtitle}</Text>
        </View>
        <Pressable onPress={onTopUpPress} style={{ backgroundColor: '#211018', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
          <Text style={{ color: '#d4af37', fontWeight: '900', fontSize: 10 }}>{balanceLabel}</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {gifts.map((gift) => {
          const accent = rarityAccent(gift.rarity);
          return (
            <Pressable
              key={gift.id}
              onPress={() => onGiftPress?.(gift)}
              style={{
                width: 92,
                backgroundColor: gift.selected ? '#1e0d16' : '#101010',
                borderColor: gift.selected ? '#ff9abf' : accent,
                borderWidth: 1,
                borderRadius: 16,
                padding: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 28 }}>{gift.emoji}</Text>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12, marginTop: 6 }} numberOfLines={1}>{gift.name}</Text>
              <Text style={{ color: accent, fontWeight: '900', fontSize: 10, marginTop: 3 }}>{gift.priceLabel}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
