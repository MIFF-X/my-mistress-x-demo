export function createScratchCard(input = {}) {
  return {
    id: input.id || `scratch-card-${Date.now()}`,
    title: input.title || 'Scratch Card',
    price: Number(input.price || 0),
    status: input.status || 'ready',
    prize: input.prize || null,
    revealed: Boolean(input.revealed),
  };
}

export function revealScratchCard(card) {
  return {
    ...card,
    revealed: true,
    status: card.prize ? 'winner' : 'played',
  };
}
