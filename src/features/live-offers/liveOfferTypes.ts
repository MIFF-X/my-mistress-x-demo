export type LiveAfterShowOfferKind = 'private-message' | 'voice-call' | 'video-call' | 'custom-request';

export type LiveAfterShowOfferStatus = 'available' | 'limited' | 'sold-out' | 'paused' | 'draft';

export type LiveAfterShowOfferAccess = 'all-viewers' | 'subscribers-only' | 'vip-only' | 'show-buyers-only' | 'invite-only';

export type LiveAfterShowOffer = {
  id: string;
  title: string;
  subtitle: string;
  kind: LiveAfterShowOfferKind;
  status: LiveAfterShowOfferStatus;
  access: LiveAfterShowOfferAccess;
  priceCredits: number;
  totalSpots: number;
  bookedSpots: number;
  durationMinutes?: number;
  description: string;
  badge?: string;
};

export type LiveAfterShowOfferDraft = {
  id: string;
  sectionTitle: string;
  sectionSubtitle: string;
  expandedByDefault: boolean;
  offers: LiveAfterShowOffer[];
};

export type LiveAfterShowOfferSummary = {
  totalOffers: number;
  availableOffers: number;
  soldOutOffers: number;
  totalSpots: number;
  bookedSpots: number;
  remainingSpots: number;
  totalPotentialCredits: number;
};
