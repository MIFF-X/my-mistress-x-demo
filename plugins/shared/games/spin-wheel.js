export function createSpinWheel(input = {}) {
  const segments = Array.isArray(input.segments) ? input.segments : [];

  return {
    id: input.id || `spin-wheel-${Date.now()}`,
    title: input.title || 'Spin Wheel',
    status: input.status || 'ready',
    segments: segments.map((segment, index) => ({
      id: segment.id || `segment-${index + 1}`,
      label: segment.label || String(segment),
      weight: Number(segment.weight || 1),
      prize: segment.prize || null,
    })),
  };
}

export function spinWheel(wheel, random = Math.random) {
  if (!wheel.segments.length) {
    return null;
  }

  const totalWeight = wheel.segments.reduce((sum, segment) => sum + segment.weight, 0);
  let cursor = random() * totalWeight;

  for (const segment of wheel.segments) {
    cursor -= segment.weight;
    if (cursor <= 0) {
      return segment;
    }
  }

  return wheel.segments[wheel.segments.length - 1];
}
