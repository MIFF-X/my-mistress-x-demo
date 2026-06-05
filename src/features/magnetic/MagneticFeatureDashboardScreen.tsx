import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { listMagneticFeatures } from './magnetic-feature-api';
import type { MagneticFeatureContract } from './magnetic-feature-types';

const STATUS_LABELS: Record<MagneticFeatureContract['status'], string> = {
  planned: 'Planned',
  scaffolded: 'Scaffolded',
  integrating: 'Integrating',
  tested: 'Tested',
  'deploy-ready': 'Deploy Ready',
};

const STATUS_COLORS: Record<MagneticFeatureContract['status'], string> = {
  planned: '#777',
  scaffolded: '#60a5fa',
  integrating: '#d4af37',
  tested: '#1D9E75',
  'deploy-ready': '#2dd4bf',
};

function magneticCardStyle(accentColor = '#d4af37') {
  return {
    backgroundColor: '#111',
    borderColor: accentColor,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  } as const;
}

function magneticPillStyle(accentColor = '#333') {
  return {
    borderColor: accentColor,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: '#0b0b0b',
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginRight: 7,
    marginBottom: 7,
  } as const;
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ marginTop: 14, marginBottom: 8 }}>
      <Text style={{ color: '#d4af37', fontSize: 12, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }}>
        {title}
      </Text>
      {subtitle ? <Text style={{ color: '#777', fontSize: 12, marginTop: 3 }}>{subtitle}</Text> : null}
    </View>
  );
}

function Pill({ label, tone = '#333' }: { label: string; tone?: string }) {
  return (
    <View style={magneticPillStyle(tone)}>
      <Text style={{ color: '#ddd', fontSize: 11, fontWeight: '800' }}>{label}</Text>
    </View>
  );
}

function EmptyLine({ label }: { label: string }) {
  return <Text style={{ color: '#666', fontSize: 12, fontStyle: 'italic' }}>{label}</Text>;
}

function FeatureDetail({ feature }: { feature: MagneticFeatureContract }) {
  const statusColor = STATUS_COLORS[feature.status];
  const routeCount = feature.frontendRoutes.length;
  const endpointCount = feature.endpoints.length;
  const moneyCount = feature.walletEvents.length;
  const realtimeCount = feature.realtimeEvents.length;

  return (
    <View style={magneticCardStyle(statusColor)}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 19, fontWeight: '900' }}>{feature.displayName}</Text>
          <Text style={{ color: '#999', fontSize: 12, marginTop: 5, lineHeight: 17 }}>{feature.description}</Text>
        </View>
        <View style={{ borderColor: statusColor, borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: statusColor, fontSize: 10, fontWeight: '900' }}>{STATUS_LABELS[feature.status]}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        <View style={{ flex: 1, minWidth: 118, backgroundColor: '#0b0b0b', borderRadius: 12, padding: 10 }}>
          <Text style={{ color: '#d4af37', fontSize: 18, fontWeight: '900' }}>{endpointCount}</Text>
          <Text style={{ color: '#888', fontSize: 11, marginTop: 2 }}>Endpoints</Text>
        </View>
        <View style={{ flex: 1, minWidth: 118, backgroundColor: '#0b0b0b', borderRadius: 12, padding: 10 }}>
          <Text style={{ color: '#60a5fa', fontSize: 18, fontWeight: '900' }}>{routeCount}</Text>
          <Text style={{ color: '#888', fontSize: 11, marginTop: 2 }}>Frontend routes</Text>
        </View>
        <View style={{ flex: 1, minWidth: 118, backgroundColor: '#0b0b0b', borderRadius: 12, padding: 10 }}>
          <Text style={{ color: '#1D9E75', fontSize: 18, fontWeight: '900' }}>{moneyCount}</Text>
          <Text style={{ color: '#888', fontSize: 11, marginTop: 2 }}>Money touchpoints</Text>
        </View>
        <View style={{ flex: 1, minWidth: 118, backgroundColor: '#0b0b0b', borderRadius: 12, padding: 10 }}>
          <Text style={{ color: '#ff9abf', fontSize: 18, fontWeight: '900' }}>{realtimeCount}</Text>
          <Text style={{ color: '#888', fontSize: 11, marginTop: 2 }}>Realtime events</Text>
        </View>
      </View>

      <SectionTitle title="Roles" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {feature.roles.length ? feature.roles.map((role) => <Pill key={`${feature.featureKey}-${role}`} label={role} tone="#d4af37" />) : <EmptyLine label="No roles declared." />}
      </View>

      <SectionTitle title="Endpoints" subtitle="The backend routes this feature expects." />
      {feature.endpoints.length ? (
        feature.endpoints.map((endpoint) => (
          <View key={`${feature.featureKey}-${endpoint.key}`} style={{ borderTopColor: '#262626', borderTopWidth: 1, paddingTop: 9, paddingBottom: 9 }}>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '900' }}>
              {endpoint.method} {endpoint.path}
            </Text>
            <Text style={{ color: '#888', fontSize: 11, marginTop: 3 }}>{endpoint.description}</Text>
            <Text style={{ color: endpoint.requiresAuth ? '#d4af37' : '#777', fontSize: 10, fontWeight: '900', marginTop: 4 }}>
              {endpoint.requiresAuth ? 'AUTH REQUIRED' : 'PUBLIC'} · {endpoint.roles.join(', ')}
            </Text>
          </View>
        ))
      ) : (
        <EmptyLine label="No endpoints declared." />
      )}

      <SectionTitle title="Frontend routes" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {feature.frontendRoutes.length ? feature.frontendRoutes.map((route) => <Pill key={`${feature.featureKey}-${route}`} label={route} tone="#60a5fa" />) : <EmptyLine label="No frontend routes declared." />}
      </View>

      <SectionTitle title="Database models" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {feature.databaseModels.length ? feature.databaseModels.map((model) => <Pill key={`${feature.featureKey}-${model}`} label={model} tone="#2dd4bf" />) : <EmptyLine label="No models declared." />}
      </View>

      <SectionTitle title="Money touchpoints" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {feature.walletEvents.length ? feature.walletEvents.map((event) => <Pill key={`${feature.featureKey}-${event}`} label={event} tone="#1D9E75" />) : <EmptyLine label="This feature does not touch money." />}
      </View>

      <SectionTitle title="Realtime events" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {feature.realtimeEvents.length ? feature.realtimeEvents.map((event) => <Pill key={`${feature.featureKey}-${event}`} label={event} tone="#ff9abf" />) : <EmptyLine label="No realtime events declared." />}
      </View>
    </View>
  );
}

export function MagneticFeatureDashboardScreen() {
  const [features, setFeatures] = useState<MagneticFeatureContract[]>([]);
  const [selectedFeatureKey, setSelectedFeatureKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setError(null);

    listMagneticFeatures().then((response) => {
      if (!isMounted) return;

      if (response.error) {
        setError(response.error);
        setFeatures([]);
        setSelectedFeatureKey(null);
      } else {
        const nextFeatures = response.data || [];
        setFeatures(nextFeatures);
        setSelectedFeatureKey((current) => current || nextFeatures[0]?.featureKey || null);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedFeature = useMemo(
    () => features.find((feature) => feature.featureKey === selectedFeatureKey) || features[0],
    [features, selectedFeatureKey],
  );

  const deployReadyCount = features.filter((feature) => feature.status === 'deploy-ready').length;
  const testedCount = features.filter((feature) => feature.status === 'tested').length;
  const moneyFeatureCount = features.filter((feature) => feature.walletEvents.length > 0).length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={{ marginBottom: 14 }}>
        <Text style={{ color: '#d4af37', fontSize: 12, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }}>
          Magnetic Integration Layer
        </Text>
        <Text style={{ color: '#fff', fontSize: 25, fontWeight: '900', marginTop: 5 }}>Feature Dashboard</Text>
        <Text style={{ color: '#aaa', fontSize: 13, lineHeight: 18, marginTop: 6 }}>
          Frontend-to-backend contracts, role access, money touchpoints and deploy readiness in one command view.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        <View style={{ flex: 1, minWidth: 130, backgroundColor: '#111', borderRadius: 14, padding: 12, borderColor: '#333', borderWidth: 1 }}>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900' }}>{features.length}</Text>
          <Text style={{ color: '#888', fontSize: 11, marginTop: 3 }}>Registered features</Text>
        </View>
        <View style={{ flex: 1, minWidth: 130, backgroundColor: '#111', borderRadius: 14, padding: 12, borderColor: '#333', borderWidth: 1 }}>
          <Text style={{ color: '#1D9E75', fontSize: 22, fontWeight: '900' }}>{testedCount + deployReadyCount}</Text>
          <Text style={{ color: '#888', fontSize: 11, marginTop: 3 }}>Tested / ready</Text>
        </View>
        <View style={{ flex: 1, minWidth: 130, backgroundColor: '#111', borderRadius: 14, padding: 12, borderColor: '#333', borderWidth: 1 }}>
          <Text style={{ color: '#d4af37', fontSize: 22, fontWeight: '900' }}>{moneyFeatureCount}</Text>
          <Text style={{ color: '#888', fontSize: 11, marginTop: 3 }}>Money-linked</Text>
        </View>
      </View>

      {isLoading ? <Text style={{ color: '#aaa' }}>Loading magnetic features...</Text> : null}
      {error ? (
        <View style={magneticCardStyle('#ff6b6b')}>
          <Text style={{ color: '#ff6b6b', fontSize: 16, fontWeight: '900' }}>Could not load magnetic features.</Text>
          <Text style={{ color: '#aaa', marginTop: 6 }}>{error}</Text>
          <Text style={{ color: '#777', fontSize: 12, marginTop: 8 }}>
            Check that the backend is running and that /magnetic/features is available.
          </Text>
        </View>
      ) : null}

      {!isLoading && !error && features.length === 0 ? (
        <View style={magneticCardStyle('#777')}>
          <Text style={{ color: '#aaa' }}>No magnetic feature contracts are registered yet.</Text>
        </View>
      ) : null}

      {features.length > 0 ? (
        <>
          <SectionTitle title="Feature registry" subtitle="Tap a feature to inspect its magnetic contract." />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 10 }}>
            {features.map((feature) => {
              const isActive = selectedFeature?.featureKey === feature.featureKey;
              const statusColor = STATUS_COLORS[feature.status];

              return (
                <Pressable
                  key={feature.featureKey}
                  onPress={() => setSelectedFeatureKey(feature.featureKey)}
                  style={{
                    minWidth: 190,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: isActive ? statusColor : '#333',
                    backgroundColor: isActive ? '#171717' : '#101010',
                    padding: 12,
                  }}
                >
                  <Text style={{ color: isActive ? statusColor : '#fff', fontSize: 13, fontWeight: '900' }}>{feature.displayName}</Text>
                  <Text style={{ color: '#777', fontSize: 10, marginTop: 4 }}>{feature.featureKey}</Text>
                  <Text style={{ color: statusColor, fontSize: 10, fontWeight: '900', marginTop: 8 }}>
                    {STATUS_LABELS[feature.status]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {selectedFeature ? <FeatureDetail feature={selectedFeature} /> : null}
        </>
      ) : null}
    </ScrollView>
  );
}
