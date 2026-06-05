import React from 'react';
import { Text, View } from 'react-native';

export function MxLoading({ label = 'Loading...' }: { label?: string }) {
  return (
    <View style={{ padding: 20, alignItems: 'center' }}>
      <Text style={{ color: '#aaa' }}>{label}</Text>
    </View>
  );
}
