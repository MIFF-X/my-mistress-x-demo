import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { DigitalGiftUploadStorePanel } from './DigitalGiftUploadStorePanel';

export function DigitalGiftUploadStoreScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 6 }}>Digital Gift Store</Text>
      <Text style={{ color: '#aaa', marginBottom: 14 }}>
        Upload, preview, price, and stage digital gifts or bundle manifests for the platform store.
      </Text>
      <DigitalGiftUploadStorePanel />
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}
