export const chatGiftCatalog = [
  {
    id: "rose",
    label: "Rose",
    emoji: "🌹",
    price: 5,
    animation: "float-up",
    type: "still",
  },
  {
    id: "crown",
    label: "Crown Tribute",
    emoji: "👑",
    price: 25,
    animation: "pulse-gold",
    type: "animated",
  },
  {
    id: "heels",
    label: "Heel Worship",
    emoji: "👠",
    price: 15,
    animation: "bounce-soft",
    type: "still",
  },
  {
    id: "diamond",
    label: "Diamond Gift",
    emoji: "💎",
    price: 50,
    animation: "sparkle-pop",
    type: "animated",
  },
];

export function getGiftById(giftId) {
  return chatGiftCatalog.find((gift) => gift.id === giftId) || null;
}
