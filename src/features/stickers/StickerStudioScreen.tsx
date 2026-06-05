import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import {
  addStickerPackItems,
  collectSticker,
  createSticker,
  createStickerPack,
  getStickerPackProgress,
  listMyStickers,
  listStickerPacks,
  listStickers,
  sendStickerToChat,
  StickerDefinition,
  StickerMetadata,
  StickerPack,
  StickerPackProgress,
  UserSticker,
} from '../../api/stickersApi';
import { getCurrentUser } from '../../state/authStore';
import { GiftBundleBuilderPanel } from '../gift-bundles';

type StudioTab = 'market' | 'collection' | 'packs' | 'create' | 'createPack' | 'bundleBuilder';

function canCreateStickers(role?: string) {
  return role === 'MISTRESS' || role === 'HEADMISTRESS' || role === 'ADMIN';
}

function stickerRarity(index: number) {
  if (index % 12 === 0) return { label: 'Legendary', color: '#f5c542' };
  if (index % 5 === 0) return { label: 'Rare', color: '#a855f7' };
  return { label: 'Common', color: '#777' };
}

function packItemRarity(index: number) {
  if (index === 0) return 'RARE';
  if (index > 0 && index % 8 === 0) return 'LEGENDARY';
  if (index > 0 && index % 4 === 0) return 'RARE';
  return 'COMMON';
}

function stickerMetadata(sticker: StickerDefinition): StickerMetadata {
  if (!sticker.metadata || typeof sticker.metadata !== 'object' || Array.isArray(sticker.metadata)) return {};
  return sticker.metadata as StickerMetadata;
}

function StickerCard({ sticker, index, ownedQuantity, onCollect, onSend }: {
  sticker: StickerDefinition;
  index: number;
  ownedQuantity?: number;
  onCollect?: () => void;
  onSend?: () => void;
}) {
  const rarity = stickerRarity(index);
  const metadata = stickerMetadata(sticker);
  const hasCutout = Boolean(metadata.cutoutBorder);

  return (
    <View
      style={{
        backgroundColor: '#111',
        borderColor: rarity.color,
        borderWidth: 1,
        borderRadius: 16,
        padding: 12,
        marginBottom: 10,
      }}
    >
      <View
        style={{
          backgroundColor: '#050505',
          minHeight: 120,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10,
          borderColor: hasCutout ? '#fff' : '#222',
          borderWidth: hasCutout ? 3 : 1,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 32, fontWeight: '900' }}>STK</Text>
        <Text style={{ color: '#777', fontSize: 11, textAlign: 'center', marginTop: 4 }}>
          {sticker.imageUrl ? 'image linked' : 'image placeholder'}
        </Text>
        <Text style={{ color: '#777', fontSize: 10, textAlign: 'center', marginTop: 4 }}>
          Crop: {metadata.cropPreview || 'original'} {hasCutout ? '/ white cutout' : ''}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 17, fontWeight: '900', flex: 1 }}>{sticker.title}</Text>
        <Text style={{ color: rarity.color, fontSize: 11, fontWeight: '900' }}>{rarity.label}</Text>
      </View>

      <Text style={{ color: '#ff9abf', marginTop: 5 }}>
        {sticker.price ? `${sticker.price} credits` : 'Free / gifted'}
      </Text>
      <Text style={{ color: '#777', fontSize: 10, marginTop: 4 }}>
        Creator: {sticker.creatorId}
      </Text>

      {ownedQuantity ? (
        <Text style={{ color: '#1D9E75', fontWeight: '800', marginTop: 8 }}>Owned x{ownedQuantity}</Text>
      ) : null}

      {metadata.dropMonth ? <Text style={{ color: '#aaa', fontSize: 11, marginTop: 6 }}>Drop: {metadata.dropMonth}</Text> : null}
      {metadata.matchingCollectibleId ? (
        <Text style={{ color: '#aaa', fontSize: 11, marginTop: 4 }}>Matching collectible: {metadata.matchingCollectibleId}</Text>
      ) : null}

      {onCollect ? (
        <Pressable onPress={onCollect} style={{ backgroundColor: '#ff0055', padding: 10, borderRadius: 10, marginTop: 10 }}>
          <Text style={{ color: '#fff', fontWeight: '900', textAlign: 'center' }}>
            {sticker.price ? 'Collect / Purchase Sticker' : 'Collect Sticker'}
          </Text>
        </Pressable>
      ) : null}

      {onSend ? (
        <Pressable onPress={onSend} style={{ backgroundColor: '#222', padding: 10, borderRadius: 10, marginTop: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '900', textAlign: 'center' }}>Send in Chat</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function PackCard({
  pack,
  progress,
  onProgress,
}: {
  pack: StickerPack;
  progress?: StickerPackProgress;
  onProgress: () => void;
}) {
  const total = progress?.totalCount ?? pack.items.length;
  const collected = progress?.collectedCount ?? 0;
  const percent = total > 0 ? Math.round((collected / total) * 100) : 0;

  return (
    <View style={{ backgroundColor: '#111', borderColor: progress?.completed ? '#d4af37' : '#333', borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Pack: {pack.title}</Text>
          <Text style={{ color: '#ff9abf', marginTop: 5 }}>{pack.theme || 'STANDARD'} - {pack.price ? `${pack.price} credits` : 'Free pack'}</Text>
        </View>
        <Text style={{ color: progress?.completed ? '#d4af37' : '#aaa', fontWeight: '900' }}>{percent}%</Text>
      </View>

      {pack.description ? <Text style={{ color: '#ddd', marginTop: 8 }}>{pack.description}</Text> : null}
      <Text style={{ color: '#aaa', marginTop: 8 }}>Progress: {collected}/{total} stickers</Text>
      <Text style={{ color: '#777', fontSize: 10, marginTop: 4 }}>Creator: {pack.creatorId}</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
        {pack.items.map((item) => {
          const owned = progress?.ownedStickerIds.includes(item.stickerId);
          return (
            <View key={item.id} style={{ backgroundColor: owned ? '#1D9E75' : '#222', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 9, marginRight: 6, marginBottom: 6 }}>
              <Text style={{ color: '#fff', fontSize: 11 }}>{owned ? 'OWNED' : 'OPEN'} {item.rarity}</Text>
            </View>
          );
        })}
      </View>

      <Pressable onPress={onProgress} style={{ backgroundColor: '#222', padding: 10, borderRadius: 10, marginTop: 10 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '800' }}>Check Collection Progress</Text>
      </Pressable>
    </View>
  );
}

function PackStickerPicker({
  stickers,
  selectedIds,
  onToggle,
}: {
  stickers: StickerDefinition[];
  selectedIds: string[];
  onToggle: (stickerId: string) => void;
}) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={{ color: '#aaa', fontSize: 12, marginBottom: 8 }}>Tap stickers to add them to this pack</Text>
      <View style={{ backgroundColor: '#050505', padding: 10, borderRadius: 12, marginBottom: 8 }}>
        <Text style={{ color: '#ff9abf', fontWeight: '900' }}>Selected stickers: {selectedIds.length}</Text>
        <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>
          First selected sticker becomes RARE. Every fourth selected sticker is RARE, every eighth is LEGENDARY.
        </Text>
      </View>

      {stickers.length === 0 ? <Text style={{ color: '#777' }}>Create stickers first, then return here to build a pack.</Text> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {stickers.map((sticker) => {
          const selectedIndex = selectedIds.indexOf(sticker.id);
          const selected = selectedIndex >= 0;
          return (
            <Pressable
              key={sticker.id}
              onPress={() => onToggle(sticker.id)}
              style={{
                backgroundColor: selected ? '#ff0055' : '#222',
                borderColor: selected ? '#ff9abf' : '#333',
                borderWidth: 1,
                borderRadius: 14,
                padding: 10,
                marginRight: 8,
                marginBottom: 8,
                minWidth: '45%',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '900' }}>{selected ? `#${selectedIndex + 1} ` : ''}{sticker.title}</Text>
              <Text style={{ color: selected ? '#ffe2ed' : '#777', fontSize: 10, marginTop: 4 }}>
                {selected ? packItemRarity(selectedIndex) : 'Tap to include'} - {sticker.price ? `${sticker.price} credits` : 'Free'}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function StickerStudioScreen() {
  const currentUser = getCurrentUser();
  const creatorMode = canCreateStickers(currentUser?.role);
  const [activeTab, setActiveTab] = useState<StudioTab>('market');
  const [market, setMarket] = useState<StickerDefinition[]>([]);
  const [collection, setCollection] = useState<UserSticker[]>([]);
  const [packs, setPacks] = useState<StickerPack[]>([]);
  const [packProgress, setPackProgress] = useState<Record<string, StickerPackProgress>>({});
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState('');
  const [cropPreview, setCropPreview] = useState('square-preview');
  const [cutoutBorder, setCutoutBorder] = useState(true);
  const [dropMonth, setDropMonth] = useState('2026-05');
  const [matchingCollectibleId, setMatchingCollectibleId] = useState('');
  const [packTitle, setPackTitle] = useState('');
  const [packDescription, setPackDescription] = useState('');
  const [packTheme, setPackTheme] = useState('Monthly Drop');
  const [packPrice, setPackPrice] = useState('');
  const [selectedPackStickerIds, setSelectedPackStickerIds] = useState<string[]>([]);
  const [chatRoomId, setChatRoomId] = useState('');
  const [chatReceiverUserId, setChatReceiverUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const ownedByStickerId = useMemo(() => {
    const map = new Map<string, number>();
    collection.forEach((item) => map.set(item.stickerId, item.quantity));
    return map;
  }, [collection]);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setLoading(true);
      setError(null);
      const [marketItems, ownedItems, packItems] = await Promise.all([listStickers(), listMyStickers(), listStickerPacks()]);
      setMarket(marketItems);
      setCollection(ownedItems);
      setPacks(packItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sticker Studio failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSticker() {
    if (!title.trim()) {
      setError('Sticker title is required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setNotice(null);
      await createSticker({
        title: title.trim(),
        imageUrl: imageUrl.trim() || undefined,
        price: price.trim() ? Number(price) : undefined,
        metadata: {
          source: 'sticker-studio',
          releaseType: 'single',
          cropPreview,
          cutoutBorder,
          dropMonth: dropMonth.trim() || undefined,
          matchingCollectibleId: matchingCollectibleId.trim() || undefined,
        },
      });
      setTitle('');
      setImageUrl('');
      setPrice('');
      setCropPreview('square-preview');
      setCutoutBorder(true);
      setDropMonth('2026-05');
      setMatchingCollectibleId('');
      setNotice('Sticker drop released and notification hook created.');
      setActiveTab('market');
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sticker failed to create');
    } finally {
      setSaving(false);
    }
  }

  function togglePackSticker(stickerId: string) {
    setSelectedPackStickerIds((current) => (
      current.includes(stickerId)
        ? current.filter((id) => id !== stickerId)
        : [...current, stickerId]
    ));
  }

  async function handleCreatePack() {
    if (!packTitle.trim()) {
      setError('Pack title is required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setNotice(null);
      const pack = await createStickerPack({
        title: packTitle.trim(),
        description: packDescription.trim() || undefined,
        theme: packTheme.trim() || undefined,
        price: packPrice.trim() ? Number(packPrice) : undefined,
        metadata: {
          source: 'sticker-studio',
          releaseType: 'monthly_drop',
          dropMonth: dropMonth.trim() || undefined,
          selectedStickerCount: selectedPackStickerIds.length,
        },
        isActive: true,
      });

      if (selectedPackStickerIds.length > 0) {
        await addStickerPackItems(pack.id, {
          items: selectedPackStickerIds.map((stickerId, index) => ({
            stickerId,
            sortOrder: index,
            rarity: packItemRarity(index),
          })),
        });
      }

      setPackTitle('');
      setPackDescription('');
      setPackTheme('Monthly Drop');
      setPackPrice('');
      setSelectedPackStickerIds([]);
      setNotice('Sticker pack released and notification hook created.');
      setActiveTab('packs');
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sticker pack failed to create');
    } finally {
      setSaving(false);
    }
  }

  async function handleCollectSticker(stickerId: string) {
    try {
      setError(null);
      setNotice(null);
      await collectSticker(stickerId);
      setNotice('Sticker collected into your album.');
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sticker failed to collect');
    }
  }

  async function handleLoadPackProgress(packId: string) {
    try {
      setError(null);
      const progress = await getStickerPackProgress(packId);
      setPackProgress((current) => ({ ...current, [packId]: progress }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pack progress failed to load');
    }
  }

  async function handleSendSticker(stickerId: string) {
    if (!chatRoomId.trim()) {
      setError('Chat room id is required before sending a sticker.');
      return;
    }

    try {
      setError(null);
      setNotice(null);
      await sendStickerToChat({
        stickerId,
        roomId: chatRoomId.trim(),
        receiverUserId: chatReceiverUserId.trim() || undefined,
      });
      setNotice('Sticker sent in chat.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sticker chat send failed');
    }
  }

  function renderTab(label: string, tab: StudioTab) {
    const active = activeTab === tab;
    return (
      <Pressable
        onPress={() => setActiveTab(tab)}
        style={{
          backgroundColor: active ? '#ff0055' : '#111',
          paddingVertical: 9,
          paddingHorizontal: 12,
          borderRadius: 999,
          marginRight: 8,
          marginBottom: 8,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '900' }}>{label}</Text>
      </Pressable>
    );
  }

  function renderMarket() {
    return (
      <>
        <Pressable onPress={loadAll} style={{ backgroundColor: '#222', padding: 10, borderRadius: 10, marginBottom: 12 }}>
          <Text style={{ color: '#fff', fontWeight: '800', textAlign: 'center' }}>Refresh Stickers</Text>
        </Pressable>
        {market.length === 0 ? <Text style={{ color: '#777' }}>No stickers released yet.</Text> : null}
        {market.map((sticker, index) => (
          <StickerCard
            key={sticker.id}
            sticker={sticker}
            index={index}
            ownedQuantity={ownedByStickerId.get(sticker.id)}
            onCollect={() => handleCollectSticker(sticker.id)}
          />
        ))}
      </>
    );
  }

  function renderCollection() {
    return (
      <>
        <View style={{ backgroundColor: '#111', padding: 14, borderRadius: 16, marginBottom: 12 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>My Sticker Album</Text>
          <Text style={{ color: '#ff9abf', marginTop: 4 }}>{collection.length} collected sticker types</Text>
          <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>
            Monthly collection sets and full-set rewards now track through Sticker Packs.
          </Text>
        </View>

        <View style={{ backgroundColor: '#111', padding: 14, borderRadius: 16, marginBottom: 12 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 8 }}>Send sticker in chat</Text>
          <TextInput
            value={chatRoomId}
            onChangeText={setChatRoomId}
            placeholder="Chat room id"
            placeholderTextColor="#777"
            style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
          />
          <TextInput
            value={chatReceiverUserId}
            onChangeText={setChatReceiverUserId}
            placeholder="Receiver user id, optional"
            placeholderTextColor="#777"
            style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10 }}
          />
        </View>

        {collection.length === 0 ? <Text style={{ color: '#777' }}>No stickers collected yet.</Text> : null}
        {collection.map((item, index) => (
          <StickerCard
            key={item.id}
            sticker={item.sticker || {
              id: item.stickerId,
              creatorId: 'unknown',
              title: 'Sticker',
              imageUrl: '',
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
            }}
            index={index}
            ownedQuantity={item.quantity}
            onSend={() => handleSendSticker(item.stickerId)}
          />
        ))}
      </>
    );
  }

  function renderPacks() {
    return (
      <>
        <Pressable onPress={loadAll} style={{ backgroundColor: '#222', padding: 10, borderRadius: 10, marginBottom: 12 }}>
          <Text style={{ color: '#fff', fontWeight: '800', textAlign: 'center' }}>Refresh Packs</Text>
        </Pressable>
        {packs.length === 0 ? <Text style={{ color: '#777' }}>No sticker packs released yet.</Text> : null}
        {packs.map((pack) => (
          <PackCard key={pack.id} pack={pack} progress={packProgress[pack.id]} onProgress={() => handleLoadPackProgress(pack.id)} />
        ))}
      </>
    );
  }

  function renderCreate() {
    if (!creatorMode) {
      return (
        <View style={{ backgroundColor: '#111', padding: 14, borderRadius: 16 }}>
          <Text style={{ color: '#ff6b6b', fontWeight: '900' }}>Creator access required.</Text>
          <Text style={{ color: '#aaa', marginTop: 6 }}>
            Sticker creation is for Mistress, Headmistress, and Admin roles.
          </Text>
        </View>
      );
    }

    return (
      <View style={{ backgroundColor: '#111', padding: 14, borderRadius: 16 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 10 }}>Create Sticker</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Sticker title, e.g. May Hair Colour Drop"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
        />
        <TextInput
          value={imageUrl}
          onChangeText={setImageUrl}
          placeholder="Image URL placeholder"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
        />
        <TextInput
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholder="Price in credits, optional"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
        />
        <View style={{ backgroundColor: '#050505', padding: 10, borderRadius: 12, marginBottom: 8 }}>
          <Text style={{ color: '#ff9abf', fontWeight: '900', marginBottom: 8 }}>Crop preview placeholder</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {['square-preview', 'circle-preview', 'original-preview'].map((option) => {
              const active = cropPreview === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setCropPreview(option)}
                  style={{ backgroundColor: active ? '#ff0055' : '#222', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10, marginRight: 7, marginBottom: 7 }}
                >
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>{option.replace('-preview', '')}</Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable
            onPress={() => setCutoutBorder((current) => !current)}
            style={{ backgroundColor: cutoutBorder ? '#1D9E75' : '#222', borderRadius: 10, padding: 10, marginTop: 2 }}
          >
            <Text style={{ color: '#fff', fontWeight: '900', textAlign: 'center' }}>
              {cutoutBorder ? 'White cutout border on' : 'White cutout border off'}
            </Text>
          </Pressable>
        </View>
        <TextInput
          value={dropMonth}
          onChangeText={setDropMonth}
          placeholder="Drop month, e.g. 2026-05"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
        />
        <TextInput
          value={matchingCollectibleId}
          onChangeText={setMatchingCollectibleId}
          placeholder="Matching collectible/item id, optional"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
        />
        <Pressable
          onPress={handleCreateSticker}
          disabled={saving}
          style={{ backgroundColor: saving ? '#555' : '#ff0055', padding: 12, borderRadius: 12 }}
        >
          <Text style={{ color: '#fff', fontWeight: '900', textAlign: 'center' }}>{saving ? 'Creating...' : 'Release Sticker'}</Text>
        </Pressable>
      </View>
    );
  }

  function renderBundleBuilder() {
    if (!creatorMode) {
      return (
        <View style={{ backgroundColor: '#111', padding: 14, borderRadius: 16 }}>
          <Text style={{ color: '#ff6b6b', fontWeight: '900' }}>Creator access required.</Text>
          <Text style={{ color: '#aaa', marginTop: 6 }}>Bundle building is for Mistress, Headmistress, and Admin roles.</Text>
        </View>
      );
    }

    return <GiftBundleBuilderPanel />;
  }

  function renderCreatePack() {
    if (!creatorMode) {
      return (
        <View style={{ backgroundColor: '#111', padding: 14, borderRadius: 16 }}>
          <Text style={{ color: '#ff6b6b', fontWeight: '900' }}>Creator access required.</Text>
          <Text style={{ color: '#aaa', marginTop: 6 }}>Pack creation is for Mistress, Headmistress, and Admin roles.</Text>
        </View>
      );
    }

    return (
      <View style={{ backgroundColor: '#111', padding: 14, borderRadius: 16 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 10 }}>Create Sticker Pack</Text>
        <TextInput
          value={packTitle}
          onChangeText={setPackTitle}
          placeholder="Pack title, e.g. May Loyalty Collection"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
        />
        <TextInput
          value={packDescription}
          onChangeText={setPackDescription}
          placeholder="Pack description"
          placeholderTextColor="#777"
          multiline
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, minHeight: 84, marginBottom: 8 }}
        />
        <TextInput
          value={packTheme}
          onChangeText={setPackTheme}
          placeholder="Theme"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
        />
        <TextInput
          value={packPrice}
          onChangeText={setPackPrice}
          keyboardType="numeric"
          placeholder="Pack price in credits, optional"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
        />
        <TextInput
          value={dropMonth}
          onChangeText={setDropMonth}
          placeholder="Monthly drop, e.g. 2026-05"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
        />

        <PackStickerPicker
          stickers={market}
          selectedIds={selectedPackStickerIds}
          onToggle={togglePackSticker}
        />

        <Pressable onPress={handleCreatePack} disabled={saving} style={{ backgroundColor: saving ? '#555' : '#ff0055', padding: 12, borderRadius: 12 }}>
          <Text style={{ color: '#fff', fontWeight: '900', textAlign: 'center' }}>{saving ? 'Creating...' : 'Release Sticker Pack'}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#000' }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 6 }}>Sticker Studio</Text>
      <Text style={{ color: '#aaa', marginBottom: 14 }}>
        Create, release, browse, purchase, collect, and complete Mistress sticker drops.
      </Text>

      {error ? <Text style={{ color: '#ff6b6b', marginBottom: 10 }}>{error}</Text> : null}
      {notice ? <Text style={{ color: '#1D9E75', marginBottom: 10 }}>{notice}</Text> : null}
      {loading ? <Text style={{ color: '#999', marginBottom: 10 }}>Loading stickers...</Text> : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
        {renderTab('Market', 'market')}
        {renderTab('My Album', 'collection')}
        {renderTab('Packs', 'packs')}
        {renderTab('Create Sticker', 'create')}
        {renderTab('Create Pack', 'createPack')}
        {renderTab('Bundle Builder', 'bundleBuilder')}
      </View>

      {activeTab === 'market' ? renderMarket() : null}
      {activeTab === 'collection' ? renderCollection() : null}
      {activeTab === 'packs' ? renderPacks() : null}
      {activeTab === 'create' ? renderCreate() : null}
      {activeTab === 'createPack' ? renderCreatePack() : null}
      {activeTab === 'bundleBuilder' ? renderBundleBuilder() : null}
    </ScrollView>
  );
}
