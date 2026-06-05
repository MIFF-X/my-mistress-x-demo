import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { FloatingProfileCard, type FloatingProfileCardIcon } from './FloatingProfileCard';

type ProfileCardRecommendation = {
  id: string;
  displayName: string;
  subtitle?: string;
  metaLabel?: string;
  statusLabel?: string;
  rarityLabel?: string;
  tags?: string[];
  icons?: FloatingProfileCardIcon[];
  accentColor?: string;
};

type ProfileCardRecommendationRailProps = {
  title?: string;
  subtitle?: string;
  cards?: ProfileCardRecommendation[];
};

const demoCards: ProfileCardRecommendation[] = [
  {
    id: 'featured-mistress',
    displayName: 'Featured Mistress',
    subtitle: 'Watch ready profile',
    metaLabel: 'Live room / chat / gifts enabled',
    statusLabel: 'LIVE',
    rarityLabel: 'Profile Card',
    tags: ['Watch', 'Live', 'Gifts'],
    accentColor: '#f5c542',
    icons: [
      { key: 'watch', label: 'WATCH', state: 'highlighted' },
      { key: 'live', label: 'LIVE', state: 'verified' },
      { key: 'gift', label: 'GIFT', state: 'highlighted' },
      { key: 'book', label: 'BOOK', state: 'greyed' },
    ],
  },
  {
    id: 'collector-sub',
    displayName: 'Collector Sub',
    subtitle: 'Sticker album active',
    metaLabel: '12 collected / 3 missing',
    statusLabel: 'COLLECT',
    rarityLabel: 'Sub Card',
    tags: ['Stickers', 'Tasks', 'Chat'],
    accentColor: '#ff9abf',
    icons: [
      { key: 'sticker', label: 'STICKER', state: 'highlighted' },
      { key: 'task', label: 'TASK', state: 'verified' },
      { key: 'chat', label: 'CHAT', state: 'highlighted' },
      { key: 'vault', label: 'VAULT', state: 'locked' },
    ],
  },
];

export function ProfileCardRecommendationRail({
  title = 'Recommended Cards',
  subtitle = 'White outlined profile-card options for discovery, Rolodex, and featured users.',
  cards = demoCards,
}: ProfileCardRecommendationRailProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 4 }}>{title}</Text>
      <Text style={{ color: '#999', fontSize: 12, marginBottom: 10 }}>{subtitle}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {cards.map((card) => (
          <View key={card.id} style={{ width: 250 }}>
            <FloatingProfileCard
              displayName={card.displayName}
              subtitle={card.subtitle}
              metaLabel={card.metaLabel}
              statusLabel={card.statusLabel}
              rarityLabel={card.rarityLabel}
              tags={card.tags}
              icons={card.icons}
              accentColor={card.accentColor}
              compact
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
