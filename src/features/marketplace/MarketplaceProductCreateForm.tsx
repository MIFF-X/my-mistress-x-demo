import React, { useState } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import {
  createMarketplaceProduct,
  MarketplaceProduct,
  MarketplaceWorld,
  MarketplaceWorldPolicy,
} from '../../api/marketplaceApi';
import { buildMetadataWithMedia } from './marketplaceProductMedia';
import { MarketplaceWorldSelector } from './MarketplaceWorldSelector';

type MarketplaceProductCreateFormProps = {
  onCreated?: (product: MarketplaceProduct) => void;
  includeLegacyRestrictedListing?: boolean;
};

function numericOrZero(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function MarketplaceProductCreateForm({
  onCreated,
  includeLegacyRestrictedListing = false,
}: MarketplaceProductCreateFormProps) {
  const [selectedPolicy, setSelectedPolicy] = useState<MarketplaceWorldPolicy | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('10');
  const [stock, setStock] = useState('1');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [galleryImageUrlsText, setGalleryImageUrlsText] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<MarketplaceProduct | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const world: MarketplaceWorld = selectedPolicy?.world || 'STANDARD';
    const amount = numericOrZero(price);
    const stockCount = Math.floor(numericOrZero(stock));

    if (!cleanTitle) {
      setError('Product title is required.');
      return;
    }

    if (amount <= 0) {
      setError('Product price must be greater than zero.');
      return;
    }

    if (stockCount < 0) {
      setError('Stock must be zero or greater.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const metadata = buildMetadataWithMedia(
        {
          source: 'marketplace-product-create-form',
          world,
          policyLabel: selectedPolicy?.label || 'Standard Marketplace',
        },
        {
          coverImageUrl,
          galleryImageUrlsText,
          previewUrl,
          altText,
        },
      );

      const product = await createMarketplaceProduct({
        title: cleanTitle,
        description: cleanDescription || undefined,
        price: amount,
        stock: stockCount,
        world,
        visibility: selectedPolicy?.defaultVisibility,
        revealMode: selectedPolicy?.defaultRevealMode,
        requiresApproval: selectedPolicy?.requiresApproval,
        metadata,
      });

      setCreatedProduct(product);
      setTitle('');
      setDescription('');
      setPrice('10');
      setStock('1');
      setCoverImageUrl('');
      setGalleryImageUrlsText('');
      setPreviewUrl('');
      setAltText('');
      onCreated?.(product);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Product creation failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={{ backgroundColor: '#0f0f0f', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#222', gap: 12 }}>
      <View>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>Create Inventory Item</Text>
        <Text style={{ color: '#999', marginTop: 4, fontSize: 12 }}>
          Create a creator marketplace item for standard listings, vending drops, hamper stock, mystery bundles, or seller-managed restricted listings.
        </Text>
      </View>

      <MarketplaceWorldSelector
        selectedWorld={selectedPolicy?.world}
        onSelect={setSelectedPolicy}
        includeLegacyRestrictedListing={includeLegacyRestrictedListing}
      />

      {selectedPolicy ? (
        <View style={{ backgroundColor: '#171717', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#292929' }}>
          <Text style={{ color: '#d4af37', fontWeight: '900' }}>{selectedPolicy.label}</Text>
          <Text style={{ color: '#aaa', marginTop: 4, fontSize: 12 }}>{selectedPolicy.description}</Text>
          <Text style={{ color: '#777', marginTop: 6, fontSize: 11 }}>
            Defaults: {selectedPolicy.defaultVisibility} · {selectedPolicy.defaultRevealMode}
            {selectedPolicy.requiresApproval ? ' · approval required' : ''}
          </Text>
        </View>
      ) : null}

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Item title"
        placeholderTextColor="#666"
        style={{ backgroundColor: '#1b1b1b', color: '#fff', padding: 11, borderRadius: 10 }}
      />

      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Description / fulfilment notes"
        placeholderTextColor="#666"
        multiline
        style={{ backgroundColor: '#1b1b1b', color: '#fff', padding: 11, borderRadius: 10, minHeight: 76 }}
      />

      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <TextInput
          value={price}
          onChangeText={setPrice}
          placeholder="Price"
          placeholderTextColor="#666"
          keyboardType="numeric"
          style={{ flex: 1, minWidth: 120, backgroundColor: '#1b1b1b', color: '#fff', padding: 11, borderRadius: 10 }}
        />
        <TextInput
          value={stock}
          onChangeText={setStock}
          placeholder="Stock"
          placeholderTextColor="#666"
          keyboardType="numeric"
          style={{ flex: 1, minWidth: 120, backgroundColor: '#1b1b1b', color: '#fff', padding: 11, borderRadius: 10 }}
        />
      </View>

      <View style={{ backgroundColor: '#141414', borderColor: '#292929', borderWidth: 1, borderRadius: 12, padding: 10, gap: 8 }}>
        <Text style={{ color: '#fff', fontWeight: '900' }}>Media</Text>
        {coverImageUrl.trim() ? (
          <Image
            source={{ uri: coverImageUrl.trim() }}
            accessibilityLabel={altText.trim() || title.trim() || 'Marketplace item media'}
            resizeMode="cover"
            style={{ width: '100%', height: 160, borderRadius: 10, backgroundColor: '#050505' }}
          />
        ) : null}
        <TextInput
          value={coverImageUrl}
          onChangeText={setCoverImageUrl}
          placeholder="Cover image URL"
          placeholderTextColor="#666"
          autoCapitalize="none"
          style={{ backgroundColor: '#1b1b1b', color: '#fff', padding: 11, borderRadius: 10 }}
        />
        <TextInput
          value={galleryImageUrlsText}
          onChangeText={setGalleryImageUrlsText}
          placeholder="Gallery image URLs, one per line"
          placeholderTextColor="#666"
          autoCapitalize="none"
          multiline
          style={{ backgroundColor: '#1b1b1b', color: '#fff', padding: 11, borderRadius: 10, minHeight: 68 }}
        />
        <TextInput
          value={previewUrl}
          onChangeText={setPreviewUrl}
          placeholder="Preview media URL"
          placeholderTextColor="#666"
          autoCapitalize="none"
          style={{ backgroundColor: '#1b1b1b', color: '#fff', padding: 11, borderRadius: 10 }}
        />
        <TextInput
          value={altText}
          onChangeText={setAltText}
          placeholder="Media alt text"
          placeholderTextColor="#666"
          style={{ backgroundColor: '#1b1b1b', color: '#fff', padding: 11, borderRadius: 10 }}
        />
      </View>

      {error ? <Text style={{ color: '#ff6b6b' }}>{error}</Text> : null}
      {createdProduct ? (
        <Text style={{ color: '#1D9E75' }}>
          Created: {createdProduct.title} · {createdProduct.world}
        </Text>
      ) : null}

      <Pressable
        onPress={handleCreate}
        disabled={submitting}
        style={{ backgroundColor: submitting ? '#333' : '#d4af37', padding: 12, borderRadius: 12 }}
      >
        <Text style={{ color: submitting ? '#777' : '#000', textAlign: 'center', fontWeight: '900' }}>
          {submitting ? 'Creating...' : 'Create Inventory Item'}
        </Text>
      </Pressable>
    </View>
  );
}
