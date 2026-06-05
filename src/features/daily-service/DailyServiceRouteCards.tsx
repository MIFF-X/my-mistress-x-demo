import React from 'react';
import { Pressable, Text, View } from 'react-native';

type DailyServiceRoute = {
  id: string;
  label: string;
  helper: string;
  badge?: string;
  tone: 'pink' | 'gold' | 'green' | 'purple';
};

type DailyServiceRouteCardsProps = {
  title?: string;
  subtitle?: string;
  routes?: DailyServiceRoute[];
  onRoutePress?: (route: DailyServiceRoute) => void;
};

const defaultRoutes: DailyServiceRoute[] = [
  { id: 'today', label: 'Today', helper: 'Tasks, journal, mood, rewards', badge: 'NOW', tone: 'pink' },
  { id: 'journal', label: 'Journal', helper: 'Prompts, entries, privacy', badge: 'PRIVATE', tone: 'purple' },
  { id: 'mood', label: 'Mood', helper: 'Check-ins and trends', badge: 'TREND', tone: 'green' },
  { id: 'rewards', label: 'Rewards', helper: 'Badges, points, milestones', badge: 'GAIN', tone: 'gold' },
  { id: 'review', label: 'Review', helper: 'Approvals and returns', badge: 'QUEUE', tone: 'green' },
  { id: 'settings', label: 'Settings', helper: 'Reminders and sharing', badge: 'SET', tone: 'purple' },
];

function routeAccent(tone: DailyServiceRoute['tone']) {
  if (tone === 'gold') return '#d4af37';
  if (tone === 'green') return '#1D9E75';
  if (tone === 'purple') return '#a855f7';
  return '#ff3f8e';
}

export function DailyServiceRouteCards({
  title = 'Daily Service Routes',
  subtitle = 'Quick route cards for today, journal, mood, rewards, review queue, and reminder settings.',
  routes = defaultRoutes,
  onRoutePress,
}: DailyServiceRouteCardsProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 4 }}>{title}</Text>
      <Text style={{ color: '#999', fontSize: 12, lineHeight: 18, marginBottom: 10 }}>{subtitle}</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {routes.map((route) => {
          const accent = routeAccent(route.tone);
          return (
            <Pressable
              key={route.id}
              onPress={() => onRoutePress?.(route)}
              style={{
                flexGrow: 1,
                minWidth: 145,
                backgroundColor: '#101010',
                borderColor: accent,
                borderWidth: 1,
                borderRadius: 16,
                padding: 12,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '900' }}>{route.label}</Text>
                {route.badge ? (
                  <View style={{ backgroundColor: '#050505', borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3 }}>
                    <Text style={{ color: accent, fontSize: 9, fontWeight: '900' }}>{route.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={{ color: '#888', fontSize: 11, lineHeight: 16, marginTop: 7 }}>{route.helper}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
