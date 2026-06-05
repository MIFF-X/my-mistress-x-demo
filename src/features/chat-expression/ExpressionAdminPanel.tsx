import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

const PACK_TYPES = ['Emoji Pack', 'Reaction Pack', 'Sticker Pack', 'GIF Pack', 'Effect Pack'];
const SECTIONS = ['Chat Expression Assets', 'Emoji Packs', 'Sticker Packs', 'Effect Packs', 'GIF Packs'];

export function ExpressionAdminPanel() {
  const [packType, setPackType] = useState(PACK_TYPES[0]);
  const [packName, setPackName] = useState('MX Starter Pack');
  const [notice, setNotice] = useState('');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 6 }}>MX Expression Admin</Text>
      <Text style={{ color: '#aaa', marginBottom: 14 }}>Create chat expression packs for the asset marketplace.</Text>
      {notice ? <Text style={{ color: '#1D9E75', marginBottom: 10 }}>{notice}</Text> : null}

      <View style={{ backgroundColor: '#111', borderColor: '#d4af37', borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12 }}>
        <Text style={{ color: '#d4af37', fontSize: 12, fontWeight: '900' }}>EXPRESSION SUITE</Text>
        <Text style={{ color: '#fff', fontSize: 19, fontWeight: '900', marginTop: 4 }}>Pack builder</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
        {PACK_TYPES.map((item) => (
          <Pressable key={item} onPress={() => setPackType(item)} style={{ backgroundColor: packType === item ? '#ff0055' : '#222', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10, marginRight: 7, marginBottom: 7 }}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ backgroundColor: '#111', borderColor: '#333', borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 10 }}>{packType}</Text>
        <TextInput value={packName} onChangeText={setPackName} placeholder="Pack name" placeholderTextColor="#777" style={{ backgroundColor: '#050505', color: '#fff', borderColor: '#333', borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 8 }} />
        <Pressable onPress={() => setNotice(`${packName} queued for review.`)} style={{ backgroundColor: '#ff0055', padding: 12, borderRadius: 12 }}>
          <Text style={{ color: '#fff', fontWeight: '900', textAlign: 'center' }}>Queue Pack</Text>
        </Pressable>
      </View>

      <View style={{ backgroundColor: '#111', borderColor: '#60a5fa', borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Preview</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {['❤️', '😂', '✨', '🔥', '💬'].map((item) => (
            <View key={item} style={{ backgroundColor: '#050505', borderColor: '#333', borderWidth: 1, borderRadius: 12, padding: 12, minWidth: 58, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900' }}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ backgroundColor: '#111', borderColor: '#1D9E75', borderWidth: 1, borderRadius: 16, padding: 14 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Marketplace sections</Text>
        {SECTIONS.map((item) => (
          <Text key={item} style={{ color: '#1D9E75', marginTop: 8, fontWeight: '900' }}>{item}</Text>
        ))}
      </View>
    </ScrollView>
  );
}
