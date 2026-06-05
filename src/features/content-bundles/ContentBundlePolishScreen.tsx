import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ContentBundlePolishPanel } from './ContentBundlePolishPanel';

export function ContentBundlePolishScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 6 }}>Content Bundle Polish</Text>
      <Text style={{ color: '#aaa', marginBottom: 14 }}>
        Preview grouped content, access states, bundle value, item cards, and readiness checks.
      </Text>
      <ContentBundlePolishPanel />
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}
