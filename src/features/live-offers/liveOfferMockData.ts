import type { LiveAfterShowOffer, LiveAfterShowOfferDraft, LiveAfterShowOfferSummary } from './liveOfferTypes';

export const starterAfterShowOffers: LiveAfterShowOffer[] = [
  {
    id: 'after-show-private-message',
    title: 'Private Message After the Show',
    subtitle: 'Stay connected with Mistress after the room closes.',
    kind: 'private-message',
    status: 'limited',
    access: 'show-buyers-only',
    priceCredits: 25,
    totalSpots: 5,
    bookedSpots: 2,
    description: 'A limited private message slot for follow-up attention after the live show.',
    badge: 'Limited Spots',
  },
  {
    id: 'after-show-voice-call',
    title: 'Voice Call Booking',
    subtitle: 'A short voice call slot after the live session.',
    kind: 'voice-call',
    status: 'limited',
    access: 'subscribers-only',
    priceCredits: 75,
    totalSpots: 5,
    bookedSpots: 4,
    durationMinutes: 10,
    description: 'A limited after-show voice call offer with a fixed duration and clear availability counter.',
    badge: 'Almost Gone',
  },
  {
    id: 'after-show-video-call',
    title: 'One-on-One Video Call',
    subtitle: 'Premium video-call access after the show.',
    kind: 'video-call',
    status: 'sold-out',
    access: 'vip-only',
    priceCredits: 150,
    totalSpots: 3,
    bookedSpots: 3,
    durationMinutes: 15,
    description: 'A VIP after-show video booking offer. Sold-out state is shown when all spots are taken.',
    badge: 'Sold Out',
  },
  {
    id: 'after-show-custom-request',
    title: 'Custom After-Show Request',
    subtitle: 'Mistress-approved special request queue.',
    kind: 'custom-request',
    status: 'available',
    access: 'invite-only',
    priceCredits: 100,
    totalSpots: 2,
    bookedSpots: 0,
    description: 'An invite-only request slot that Mistress can approve, price, or pause.',
    badge: 'Invite Only',
  },
];

export const starterAfterShowOfferDraft: LiveAfterShowOfferDraft = {
  id: 'after-show-offers-default',
  sectionTitle: 'Stay Connected With Mistress After the Show',
  sectionSubtitle: 'Limited spots available for private messages, voice calls, video calls, and custom follow-up requests.',
  expandedByDefault: true,
  offers: starterAfterShowOffers,
};

export function buildAfterShowOfferSummary(offers: LiveAfterShowOffer[]): LiveAfterShowOfferSummary {
  const totalSpots = offers.reduce((sum, offer) => sum + offer.totalSpots, 0);
  const bookedSpots = offers.reduce((sum, offer) => sum + offer.bookedSpots, 0);

  return {
    totalOffers: offers.length,
    availableOffers: offers.filter((offer) => offer.status === 'available' || offer.status === 'limited').length,
    soldOutOffers: offers.filter((offer) => offer.status === 'sold-out' || offer.bookedSpots >= offer.totalSpots).length,
    totalSpots,
    bookedSpots,
    remainingSpots: Math.max(totalSpots - bookedSpots, 0),
    totalPotentialCredits: offers.reduce((sum, offer) => sum + (Math.max(offer.totalSpots - offer.bookedSpots, 0) * offer.priceCredits), 0),
  };
}
