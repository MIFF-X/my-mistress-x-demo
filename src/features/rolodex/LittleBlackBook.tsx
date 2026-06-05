import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';

interface MistressCard {
  name: string;
  group: string;
  borderColor: string;
  note?: string;
}

export default function LittleBlackBook({ cards }: { cards: MistressCard[] }) {
  const [cardList, setCardList] = useState<MistressCard[]>(cards);

  const addNote = (index: number, note: string) => {
    const updated = [...cardList];
    updated[index].note = note;
    setCardList(updated);
  };

  const addToGroup = (index: number, group: string) => {
    const updated = [...cardList];
    updated[index].group = group;
    setCardList(updated);
  };

  const deleteCard = (index: number) => {
    const updated = [...cardList];
    updated.splice(index, 1);
    setCardList(updated);
  };

  return (
    <ScrollView style={styles.container} horizontal>
      {cardList.map((card, index) => (
        <View key={index} style={[styles.card, { borderColor: card.borderColor }]}>
          <Text style={styles.name}>{card.name}</Text>
          <Text style={styles.group}>{card.group}</Text>
          {card.note && <Text style={styles.note}>{card.note}</Text>}
          <View style={styles.actions}>
            <Pressable onPress={() => addNote(index, 'New Note')} style={styles.actionButton}>
              <Text>+ Note</Text>
            </Pressable>
            <Pressable onPress={() => addToGroup(index, 'New Group')} style={styles.actionButton}>
              <Text>+ Group</Text>
            </Pressable>
            <Pressable onPress={() => deleteCard(index)} style={styles.actionButton}>
              <Text>Delete</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8 },
  card: { borderWidth: 1, borderRadius: 8, padding: 12, marginRight: 8, backgroundColor: '#111' },
  name: { fontSize: 16, fontWeight: '700', color: '#FFD700' },
  group: { fontSize: 14, color: '#ccc' },
  note: { fontSize: 12, color: '#aaa', marginTop: 4 },
  actions: { flexDirection: 'row', marginTop: 8, justifyContent: 'space-between' },
  actionButton: { padding: 4, backgroundColor: '#222', borderRadius: 4 }
});