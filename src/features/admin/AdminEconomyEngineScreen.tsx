import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

const metricCards = [
  { label: 'Money Loop', value: 'Wallet', note: 'Spend, split, ledger, payout' },
  { label: 'Collection Loop', value: 'Stickers', note: 'Buy, collect, rarity, showcase' },
  { label: 'Status Loop', value: 'Ranks', note: 'Leaderboards, badges, rewards' },
  { label: 'Control Loop', value: 'Tasks', note: 'Punishments, missions, events' },
];

const economyTabs = [
  'Overview',
  'Live Money',
  'Sticker Economy',
  'Leaderboards',
  'Punishments',
  'Live Events',
] as const;

type EconomyTab = typeof economyTabs[number];

const panelCopy: Record<EconomyTab, string[]> = {
  Overview: [
    'Action → Wallet → Ledger → SystemEvent → Notification → Leaderboard → Analytics.',
    'This screen is the React Native control layer for the platform economy engine.',
    'Backend wiring remains deferred to the later database/integration pass.',
  ],
  'Live Money': [
    'Show live wallet events and +amount pulses.',
    'Later: connect to wallet/SystemEvent WebSocket broadcasts.',
    'Later: display platform cut, Mistress share, and feature source.',
  ],
  'Sticker Economy': [
    'Purchased items can create matching digital stickers.',
    'Later: add rarity, ownership transfer, packs, and listing moderation.',
    'Later: connect to StickerDefinition, UserSticker, and StickerListing tables.',
  ],
  Leaderboards: [
    'Rank top spenders, top earners, collectors, and challenge winners.',
    'Later: create cached leaderboard snapshots and reset windows.',
    'Later: attach badge and prize-pool rules.',
  ],
  Punishments: [
    'Assign timed tasks, completion proof, rewards, and penalties.',
    'Later: connect to PunishmentTask and PunishmentAssignment tables.',
    'Later: connect completion to XP, wallet, notifications, and audit logs.',
  ],
  'Live Events': [
    'Trigger double XP, flash sales, bonus rewards, and leaderboard rushes.',
    'Later: create active event state and expiry timers.',
    'Later: broadcast event start/end through WebSockets.',
  ],
};

function panelStyle() {
  return {
    backgroundColor: '#111',
    borderColor: '#2a1d2f',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  } as const;
}

export function AdminEconomyEngineScreen() {
  const [activeTab, setActiveTab] = useState<EconomyTab>('Overview');

  const activeRows = useMemo(() => panelCopy[activeTab], [activeTab]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
      <Text style={{ color: '#d4af37', fontSize: 12, fontWeight: '900', letterSpacing: 1 }}>
        HEADMISTRESS ECONOMY
      </Text>
      <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 6 }}>
        Economy Engine
      </Text>
      <Text style={{ color: '#aaa', marginTop: 6, marginBottom: 16 }}>
        Native control screen for money, collections, ranks, punishments, live events, and future SystemEvent wiring.
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14 }}>
        {metricCards.map((card) => (
          <View key={card.label} style={{ ...panelStyle(), width: '48%', marginRight: '2%' }}>
            <Text style={{ color: '#aaa', fontSize: 11 }}>{card.label}</Text>
            <Text style={{ color: '#ff9abf', fontSize: 20, fontWeight: '900', marginTop: 4 }}>
              {card.value}
            </Text>
            <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>{card.note}</Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
        {economyTabs.map((tab) => {
          const active = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                backgroundColor: active ? '#ff0055' : '#111',
                paddingVertical: 9,
                paddingHorizontal: 11,
                borderRadius: 999,
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>{tab}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={panelStyle()}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 8 }}>
          {activeTab}
        </Text>
        {activeRows.map((row) => (
          <Text key={row} style={{ color: '#ddd', marginBottom: 8, lineHeight: 20 }}>
            • {row}
          </Text>
        ))}
      </View>

      <View style={{ ...panelStyle(), borderColor: '#d4af37' }}>
        <Text style={{ color: '#d4af37', fontWeight: '900', marginBottom: 6 }}>
          Backend later
        </Text>
        <Text style={{ color: '#aaa', lineHeight: 20 }}>
          Implement SystemEvent, wallet broadcasts, sticker marketplace, punishment/task tables, live event state, XP/missions/streaks, and leaderboard cache from the universal workload list.
        </Text>
      </View>
    </ScrollView>
  );
}
