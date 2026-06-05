import React from 'react';
import { Text, View } from 'react-native';

export function MxError({ message }: { message: string }) {
  return (
    <View style={{ padding: 16, backgroundColor: '#1a0005', borderRadius: 10 }}>
      <Text style={{ color: '#ff6b6b', fontWeight: '700' }}>Error</Text>
      <Text style={{ color: '#ffb3b3', marginTop: 4 }}>{message}</Text>
    </View>
  );
}
