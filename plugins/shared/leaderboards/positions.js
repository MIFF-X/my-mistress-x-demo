export const defaultPositionTracks = [
  { id: 'crown', label: 'Crown Position', metric: 'supportScore' },
  { id: 'shoe', label: 'Shoe Position', metric: 'serviceScore' },
  { id: 'bag', label: 'Bag Position', metric: 'giftScore' },
  { id: 'throne', label: 'Throne Position', metric: 'overallScore' },
];

export function createPositionTracks(overrides = []) {
  const overrideMap = new Map(overrides.map((track) => [track.id, track]));

  return defaultPositionTracks.map((track) => ({
    ...track,
    ...(overrideMap.get(track.id) ?? {}),
  }));
}
