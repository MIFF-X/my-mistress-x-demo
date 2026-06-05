import {
  MarketplaceProduct,
  MarketplaceProductMediaMetadata,
  MarketplaceProductMetadata,
} from '../../api/marketplaceApi';

type MediaDraft = {
  coverImageUrl: string;
  galleryImageUrlsText: string;
  previewUrl: string;
  altText: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function cleanStringList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanString(item)).filter(Boolean);
  }
  if (typeof value === 'string') return parseMediaList(value);
  return [];
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

export function parseMediaList(value: string) {
  return unique(value.split(/[\n,]+/g));
}

export function metadataRecord(metadata: unknown): MarketplaceProductMetadata {
  return isRecord(metadata) ? { ...metadata } as MarketplaceProductMetadata : {};
}

export function productMedia(product: MarketplaceProduct): MarketplaceProductMediaMetadata {
  const metadata = metadataRecord(product.metadata);
  const media = isRecord(metadata.media) ? metadata.media : {};
  const galleryImageUrls = unique([
    ...cleanStringList(media.galleryImageUrls),
    ...cleanStringList(metadata.galleryImageUrls),
  ]);

  return {
    coverImageUrl: cleanString(media.coverImageUrl) || cleanString(metadata.coverImageUrl) || cleanString(metadata.imageUrl) || undefined,
    galleryImageUrls,
    previewUrl: cleanString(media.previewUrl) || cleanString(metadata.previewUrl) || cleanString(metadata.mediaPreviewUrl) || undefined,
    altText: cleanString(media.altText) || cleanString(metadata.altText) || cleanString(metadata.mediaAltText) || undefined,
  };
}

export function mediaDraftFromProduct(product: MarketplaceProduct): MediaDraft {
  const media = productMedia(product);

  return {
    coverImageUrl: media.coverImageUrl || '',
    galleryImageUrlsText: (media.galleryImageUrls || []).join('\n'),
    previewUrl: media.previewUrl || '',
    altText: media.altText || '',
  };
}

export function buildMetadataWithMedia(
  currentMetadata: unknown,
  draft: MediaDraft,
): MarketplaceProductMetadata {
  const metadata = metadataRecord(currentMetadata);
  const galleryImageUrls = parseMediaList(draft.galleryImageUrlsText);
  const media: MarketplaceProductMediaMetadata = {
    coverImageUrl: cleanString(draft.coverImageUrl) || undefined,
    galleryImageUrls,
    previewUrl: cleanString(draft.previewUrl) || undefined,
    altText: cleanString(draft.altText) || undefined,
  };
  const hasMedia = Boolean(media.coverImageUrl || media.previewUrl || media.altText || galleryImageUrls.length > 0);

  if (hasMedia) {
    return { ...metadata, media };
  }

  const next = { ...metadata };
  delete next.media;
  return next;
}

export function mediaCountLabel(product: MarketplaceProduct) {
  const media = productMedia(product);
  const count = (media.coverImageUrl ? 1 : 0) + (media.galleryImageUrls?.length || 0) + (media.previewUrl ? 1 : 0);
  return count > 0 ? `${count} media` : 'no media';
}
