import React, { useState } from 'react';
import { CreatorGrowthPublicLanding } from '../../api/creatorGrowthApi';
import { CreatorGrowthDestinationGate } from './CreatorGrowthDestinationGate';
import { PublicLandingPreview } from './PublicLandingPreview';

export function CreatorGrowthPublicLandingRoute({
  destinationSlug,
  campaignSlug,
  onLoginRequired,
  onOpenDestination,
}: {
  destinationSlug: string;
  campaignSlug: string;
  onLoginRequired?: (landing: CreatorGrowthPublicLanding) => void;
  onOpenDestination?: (landing: CreatorGrowthPublicLanding) => void;
}) {
  const [selectedLanding, setSelectedLanding] = useState<CreatorGrowthPublicLanding | null>(null);

  if (selectedLanding) {
    return (
      <CreatorGrowthDestinationGate
        landing={selectedLanding}
        onLoginRequired={onLoginRequired}
        onOpenDestination={onOpenDestination}
      />
    );
  }

  return (
    <PublicLandingPreview
      destinationSlug={destinationSlug}
      campaignSlug={campaignSlug}
      onContinue={setSelectedLanding}
    />
  );
}
