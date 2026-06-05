import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { DailyServiceDashboardWidgetStack } from './DailyServiceDashboardWidgetStack';
import { DailyServiceFeatureIndex } from './DailyServiceFeatureIndex';

export function DailyServiceDashboardPreviewStack() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Daily Service Dashboard Preview Stack</Text>
        <Text style={{ color: '#999', marginTop: 4 }}>
          Dashboard-ready preview that shows the compact widget stack first, then the full Daily Service feature index.
        </Text>
      </View>

      <DailyServiceDashboardWidgetStack />
      <DailyServiceFeatureIndex />
    </ScrollView>
  );
}
