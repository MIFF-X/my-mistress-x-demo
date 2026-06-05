import React, { useState } from 'react';
import { Image, Text, TextInput, View } from 'react-native';
import { MarketplaceProduct, updateMarketplaceProduct } from '../../api/marketplaceApi';
import { ActionPillButton } from '../buttons/ActionPillButton';
import {
  buildMetadataWithMedia,
  mediaCountLabel,
  mediaDraftFromProduct,
  productMedia,
} from './marketplaceProductMedia';

type ProductDraft = {
  title: string;
  description: string;
  price: string;
  stock: string;
  coverImageUrl: string;
  galleryImageUrlsText: string;
  previewUrl: string;
  altText: string;
};

type MarketplaceInventoryProductCardProps = {
  product: MarketplaceProduct;
  onUpdated: (product: MarketplaceProduct) => void;
};

function priceLabel(price: number | string) {
  const value = Number(price);
  if (!Number.isFinite(value)) return `${price} credits`;
  return `${value.toFixed(2)} credits`;
}

function toDraft(product: MarketplaceProduct): ProductDraft {
  const mediaDraft = mediaDraftFromProduct(product);

  return {
    title: product.title,
    description: product.description || '',
    price: String(product.price),
    stock: String(product.stock),
    ...mediaDraft,
  };
}

function numericOrZero(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function MarketplaceInventoryProductCard({ product, onUpdated }: MarketplaceInventoryProductCardProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<ProductDraft>(() => toDraft(product));
  const [error, setError] = useState<string | null>(null);

  function patchDraft(patch: Partial<ProductDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  async function save(nextDraft: ProductDraft = draft) {
    const title = nextDraft.title.trim();
    const description = nextDraft.description.trim();
    const price = numericOrZero(nextDraft.price);
    const stock = Math.floor(numericOrZero(nextDraft.stock));

    if (!title) {
      setError('Product title is required.');
      return;
    }
    if (price <= 0) {
      setError('Product price must be greater than zero.');
      return;
    }
    if (stock < 0) {
      setError('Stock must be zero or greater.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const updated = await updateMarketplaceProduct(product.id, {
        title,
        description: description || undefined,
        price,
        stock,
        metadata: buildMetadataWithMedia(product.metadata, nextDraft),
      });
      setDraft(toDraft(updated));
      setEditing(false);
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Product update failed.');
    } finally {
      setSaving(false);
    }
  }

  async function addStock(amount: number) {
    const nextDraft = { ...draft, stock: String(product.stock + amount) };
    setDraft(nextDraft);
    await save(nextDraft);
  }

  function cancel() {
    setDraft(toDraft(product));
    setEditing(false);
    setError(null);
  }

  const media = productMedia(product);
  const activeCoverImageUrl = editing ? draft.coverImageUrl.trim() : media.coverImageUrl;
  const activeAltText = editing ? draft.altText.trim() : media.altText;

  return (
    <View style={{ backgroundColor: '#171717', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#282828', gap: 10 }}>
      {activeCoverImageUrl ? (
        <Image
          source={{ uri: activeCoverImageUrl }}
          accessibilityLabel={activeAltText || product.title}
          resizeMode="cover"
          style={{ width: '100%', height: 150, borderRadius: 12, backgroundColor: '#050505' }}
        />
      ) : null}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 180 }}>
          {editing ? (
            <TextInput
              value={draft.title}
              onChangeText={(value) => patchDraft({ title: value })}
              placeholder="Item title"
              placeholderTextColor="#666"
              style={{ backgroundColor: '#222', color: '#fff', padding: 9, borderRadius: 10, fontWeight: '900' }}
            />
          ) : (
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>{product.title}</Text>
          )}

          {editing ? (
            <TextInput
              value={draft.description}
              onChangeText={(value) => patchDraft({ description: value })}
              placeholder="Description"
              placeholderTextColor="#666"
              multiline
              style={{ backgroundColor: '#222', color: '#fff', padding: 9, borderRadius: 10, minHeight: 58, marginTop: 8 }}
            />
          ) : product.description ? (
            <Text style={{ color: '#aaa', marginTop: 4, fontSize: 12 }}>{product.description}</Text>
          ) : null}
        </View>

        {editing ? (
          <TextInput
            value={draft.price}
            onChangeText={(value) => patchDraft({ price: value })}
            placeholder="Price"
            placeholderTextColor="#666"
            keyboardType="numeric"
            style={{ minWidth: 100, backgroundColor: '#222', color: '#d4af37', padding: 9, borderRadius: 10, fontWeight: '900' }}
          />
        ) : (
          <Text style={{ color: '#d4af37', fontWeight: '900' }}>{priceLabel(product.price)}</Text>
        )}
      </View>

      {editing ? (
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Text style={{ color: '#999', fontSize: 12 }}>Stock</Text>
          <TextInput
            value={draft.stock}
            onChangeText={(value) => patchDraft({ stock: value })}
            placeholder="Stock"
            placeholderTextColor="#666"
            keyboardType="numeric"
            style={{ minWidth: 92, backgroundColor: '#222', color: '#fff', padding: 9, borderRadius: 10 }}
          />
        </View>
      ) : null}

      {editing ? (
        <View style={{ backgroundColor: '#111', borderColor: '#2a2a2a', borderWidth: 1, borderRadius: 12, padding: 10, gap: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '900' }}>Media</Text>
          <TextInput
            value={draft.coverImageUrl}
            onChangeText={(value) => patchDraft({ coverImageUrl: value })}
            placeholder="Cover image URL"
            placeholderTextColor="#666"
            autoCapitalize="none"
            style={{ backgroundColor: '#222', color: '#fff', padding: 9, borderRadius: 10 }}
          />
          <TextInput
            value={draft.galleryImageUrlsText}
            onChangeText={(value) => patchDraft({ galleryImageUrlsText: value })}
            placeholder="Gallery image URLs, one per line"
            placeholderTextColor="#666"
            autoCapitalize="none"
            multiline
            style={{ backgroundColor: '#222', color: '#fff', padding: 9, borderRadius: 10, minHeight: 66 }}
          />
          <TextInput
            value={draft.previewUrl}
            onChangeText={(value) => patchDraft({ previewUrl: value })}
            placeholder="Preview media URL"
            placeholderTextColor="#666"
            autoCapitalize="none"
            style={{ backgroundColor: '#222', color: '#fff', padding: 9, borderRadius: 10 }}
          />
          <TextInput
            value={draft.altText}
            onChangeText={(value) => patchDraft({ altText: value })}
            placeholder="Media alt text"
            placeholderTextColor="#666"
            style={{ backgroundColor: '#222', color: '#fff', padding: 9, borderRadius: 10 }}
          />
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        <Text style={{ color: '#aaa', backgroundColor: '#222', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, fontSize: 11 }}>
          stock {product.stock}
        </Text>
        <Text style={{ color: '#aaa', backgroundColor: '#222', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, fontSize: 11 }}>
          {product.visibility}
        </Text>
        <Text style={{ color: '#aaa', backgroundColor: '#222', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, fontSize: 11 }}>
          {product.revealMode}
        </Text>
        <Text style={{ color: '#aaa', backgroundColor: '#222', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, fontSize: 11 }}>
          {mediaCountLabel(product)}
        </Text>
        {product.requiresApproval ? (
          <Text style={{ color: '#d4af37', backgroundColor: '#2b2208', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, fontSize: 11 }}>
            approval
          </Text>
        ) : null}
      </View>

      {error ? <Text style={{ color: '#ff6b6b' }}>{error}</Text> : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <ActionPillButton actionKey="addStock" disabled={saving} label="+1 Stock" onPress={() => addStock(1)} />
        <ActionPillButton actionKey="addStock" disabled={saving} label="+5 Stock" onPress={() => addStock(5)} />

        {editing ? (
          <>
            <ActionPillButton actionKey="saveAction" disabled={saving} label={saving ? 'Saving...' : undefined} onPress={() => save()} />
            <ActionPillButton actionKey="cancelAction" disabled={saving} onPress={cancel} />
          </>
        ) : (
          <ActionPillButton actionKey="editAction" disabled={saving} label={saving ? 'Updating...' : undefined} onPress={() => setEditing(true)} />
        )}
      </View>
    </View>
  );
}
