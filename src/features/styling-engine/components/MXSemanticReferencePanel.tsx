import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { parseSemanticIconReference } from '../semanticIconBridge';

const colors = {
  panel: '#0b0906',
  border: '#6f4c16',
  gold: '#d4af37',
  goldLight: '#f9d976',
  muted: '#9a927f',
  text: '#f1dfad',
  dark: '#050505',
  danger: '#b85b5b',
};

type MXSemanticReferencePanelProps = {
  value: string;
  busy?: boolean;
  onChangeText: (value: string) => void;
  onGenerate: () => void;
};

export function MXSemanticReferencePanel({ value, busy = false, onChangeText, onGenerate }: MXSemanticReferencePanelProps) {
  const parsed = parseSemanticIconReference(value);

  return (
    <View style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 22, backgroundColor: colors.panel, padding: 16, gap: 10 }}>
      <Text style={{ color: colors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>Semantic Icon Reference</Text>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '900' }}>Generate a Mistress-X themed version</Text>
      <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>
        Type a reference such as mdi:lock, lucide:crown, tabler:bell, or material-symbols:favorite. The engine uses this as the meaning point and creates a first-party Mistress-X asset.
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="mdi:lock"
        placeholderTextColor="#7a6230"
        autoCapitalize="none"
        style={{ borderColor: parsed ? colors.border : '#3a1f1f', borderWidth: 1, borderRadius: 12, color: colors.goldLight, padding: 12, backgroundColor: colors.dark, fontWeight: '800' }}
      />
      <View style={{ borderColor: '#2a2208', borderWidth: 1, borderRadius: 10, padding: 10, backgroundColor: '#080806' }}>
        <Text style={{ color: parsed ? colors.goldLight : colors.danger, fontSize: 11, fontWeight: '900' }}>{parsed ? `Ready: ${parsed.semanticName}` : 'Enter a prefix:name reference to generate from.'}</Text>
      </View>
      <Pressable disabled={!parsed || busy} onPress={onGenerate} style={{ backgroundColor: parsed && !busy ? colors.gold : '#2a2208', borderRadius: 10, padding: 12, opacity: busy ? 0.65 : 1 }}>
        <Text style={{ color: parsed && !busy ? colors.dark : colors.muted, textAlign: 'center', fontWeight: '900' }}>{busy ? 'Generating...' : 'Generate Mistress-X Version'}</Text>
      </Pressable>
    </View>
  );
}

export default MXSemanticReferencePanel;
