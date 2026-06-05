import React, { useState } from 'react';
import { Text, View } from 'react-native';
import type { StylingEngineCartAction } from './assetPackTypes';
import { MXMagneticAdapterPanel } from './components/MXMagneticAdapterPanel';
import { MXReviewQueueApiPanel } from './components/MXReviewQueueApiPanel';
import type { MXMagneticAdapterRegistryEntry } from './mxMagneticAdapterTypes';
import { PackMarketplaceScreen } from './packMarketplaceScreen';

type MXStylingEngineWithAdaptersScreenProps = {
  onCartAction?: (action: StylingEngineCartAction) => void;
};

const colors = {
  gold: '#d4af37',
  goldLight: '#f9d976',
  muted: '#9a927f',
  border: '#2a2208',
  panel: '#101014',
};

export function MXStylingEngineWithAdaptersScreen({ onCartAction }: MXStylingEngineWithAdaptersScreenProps) {
  const [selectedAdapter, setSelectedAdapter] = useState<MXMagneticAdapterRegistryEntry | null>(null);

  return (
    <View style={{ flex: 1, backgroundColor: '#050505' }}>
      <View style={{ padding: 16, gap: 12 }}>
        <MXMagneticAdapterPanel onSelectAdapter={setSelectedAdapter} />
        <MXReviewQueueApiPanel />
        {selectedAdapter ? (
          <View style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 16, backgroundColor: colors.panel, padding: 12, gap: 5 }}>
            <Text style={{ color: colors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' }}>Selected Magnetic Adapter</Text>
            <Text style={{ color: colors.goldLight, fontSize: 17, fontWeight: '900' }}>{selectedAdapter.name}</Text>
            <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 16 }}>{selectedAdapter.nextStep}</Text>
          </View>
        ) : null}
      </View>
      <PackMarketplaceScreen onCartAction={onCartAction} />
    </View>
  );
}

export default MXStylingEngineWithAdaptersScreen;
