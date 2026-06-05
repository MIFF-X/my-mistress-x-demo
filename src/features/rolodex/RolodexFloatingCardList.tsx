import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { RolodexCard } from '../../api/rolodexApi';
import { RolodexFloatingCardPreview } from './RolodexFloatingCardPreview';

type RolodexFloatingCardListProps = {
  cards: RolodexCard[];
  onEditCard?: (card: RolodexCard) => void;
  onDeleteCard?: (cardId: string) => void;
  onSaveSharedCard?: (cardId: string) => void;
};

export function RolodexFloatingCardList({
  cards,
  onEditCard,
  onDeleteCard,
  onSaveSharedCard,
}: RolodexFloatingCardListProps) {
  if (cards.length === 0) {
    return <Text style={{ color: '#777' }}>No Rolodex cards yet.</Text>;
  }

  return (
    <View>
      {cards.map((card) => (
        <View key={card.id}>
          <RolodexFloatingCardPreview card={card} onSave={() => onSaveSharedCard?.(card.id)} />
          <View style={{ flexDirection: 'row', marginTop: -6, marginBottom: 16 }}>
            {onEditCard ? (
              <Pressable onPress={() => onEditCard(card)} style={{ backgroundColor: '#222', padding: 10, borderRadius: 10, flex: 1, marginRight: 8 }}>
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '800' }}>Edit Card</Text>
              </Pressable>
            ) : null}
            {onDeleteCard ? (
              <Pressable onPress={() => onDeleteCard(card.id)} style={{ backgroundColor: '#330011', padding: 10, borderRadius: 10, flex: 1 }}>
                <Text style={{ color: '#ff9abf', textAlign: 'center', fontWeight: '800' }}>Delete Card</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}
