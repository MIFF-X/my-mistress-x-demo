export function createMysteryBox(input = {}) {
  return {
    id: input.id || `mystery-box-${Date.now()}`,
    title: input.title || 'Mystery Box',
    price: Number(input.price || 0),
    status: input.status || 'draft',
    prizes: Array.isArray(input.prizes) ? [...input.prizes] : [],
  };
}

export function openMysteryBox(box, random = Math.random) {
  if (!box.prizes.length) {
    return {
      boxId: box.id,
      prize: null,
      status: 'empty',
    };
  }

  const totalWeight = box.prizes.reduce((sum, prize) => sum + Number(prize.weight || 1), 0);
  let cursor = random() * totalWeight;

  for (const prize of box.prizes) {
    cursor -= Number(prize.weight || 1);
    if (cursor <= 0) {
      return {
        boxId: box.id,
        prize,
        status: 'opened',
      };
    }
  }

  return {
    boxId: box.id,
    prize: box.prizes[box.prizes.length - 1],
    status: 'opened',
  };
}
