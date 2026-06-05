import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { listGiftInventory, listStickerInventory, InventoryGift, InventorySticker } from '../../api/inventoryApi';
import { StickerCollectionGrid } from './StickerCollectionGrid';

export function InventoryScreen() {
  const [gifts, setGifts] = useState<InventoryGift[]>([]);
  const [stickers, setStickers] = useState<InventorySticker[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInventory();
  }, []);

  async function loadInventory() {
    try {
      setError(null);
      const [giftItems, stickerItems] = await Promise.all([
        listGiftInventory(),
        listStickerInventory(),
      ]);
      setGifts(giftItems);
      setStickers(stickerItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inventory failed to load');
    }
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#000' }}>
      <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 10 }}>
        Inventory
      </Text>

      {error ? <Text style={{ color: '#ff6b6b', marginBottom: 10 }}>{error}</Text> : null}

      <Text style={{ color: '#fff', fontSize: 18, marginBottom: 8 }}>Gifts</Text>

      {gifts.map((item) => (
        <View
          key={item.id}
          style={{
            backgroundColor: '#111',
            padding: 10,
            borderRadius: 10,
            marginBottom: 6,
          }}
        >
          <Text style={{ color: '#fff' }}>
            {item.gift?.emoji || '🎁'} {item.gift?.name || 'Gift'}
          </Text>
          <Text style={{ color: '#ff9abf' }}>x{item.quantity}</Text>
        </View>
      ))}

      <StickerCollectionGrid stickers={stickers} totalSlots={24} />
    </ScrollView>
  );
}
