import React from 'react';
import { Pressable, Text, View } from 'react-native';

type ProofType = 'text' | 'photo' | 'voice' | 'mixed' | 'none';

type DailyServiceProofUploadCardProps = {
  title?: string;
  subtitle?: string;
  proofType?: ProofType;
  statusLabel?: string;
  privacyLabel?: string;
  onAddTextPress?: () => void;
  onAddPhotoPress?: () => void;
  onAddVoicePress?: () => void;
  onSubmitPress?: () => void;
};

function proofAccent(proofType: ProofType) {
  if (proofType === 'photo') return '#ff3f8e';
  if (proofType === 'voice') return '#a855f7';
  if (proofType === 'mixed') return '#d4af37';
  if (proofType === 'text') return '#1D9E75';
  return '#777';
}

export function DailyServiceProofUploadCard({
  title = 'Task Proof',
  subtitle = 'Attach the required note, image, or voice proof before submitting the daily task.',
  proofType = 'mixed',
  statusLabel = 'Proof optional',
  privacyLabel = 'Shared only with permitted viewers',
  onAddTextPress,
  onAddPhotoPress,
  onAddVoicePress,
  onSubmitPress,
}: DailyServiceProofUploadCardProps) {
  const accent = proofAccent(proofType);

  return (
    <View
      style={{
        backgroundColor: '#101010',
        borderColor: accent,
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 16,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{title}</Text>
          <Text style={{ color: '#999', fontSize: 12, lineHeight: 18, marginTop: 5 }}>{subtitle}</Text>
        </View>
        <View style={{ backgroundColor: '#050505', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: accent, fontSize: 10, fontWeight: '900' }}>{statusLabel}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        <Pressable onPress={onAddTextPress} style={{ flexGrow: 1, backgroundColor: '#050505', borderColor: '#1D9E75', borderWidth: 1, borderRadius: 14, padding: 10 }}>
          <Text style={{ color: '#1D9E75', fontWeight: '900', fontSize: 12 }}>Add Text</Text>
          <Text style={{ color: '#777', fontSize: 10, marginTop: 3 }}>Short note</Text>
        </Pressable>
        <Pressable onPress={onAddPhotoPress} style={{ flexGrow: 1, backgroundColor: '#050505', borderColor: '#ff3f8e', borderWidth: 1, borderRadius: 14, padding: 10 }}>
          <Text style={{ color: '#ff9abf', fontWeight: '900', fontSize: 12 }}>Add Photo</Text>
          <Text style={{ color: '#777', fontSize: 10, marginTop: 3 }}>Image proof</Text>
        </Pressable>
        <Pressable onPress={onAddVoicePress} style={{ flexGrow: 1, backgroundColor: '#050505', borderColor: '#a855f7', borderWidth: 1, borderRadius: 14, padding: 10 }}>
          <Text style={{ color: '#d8b4fe', fontWeight: '900', fontSize: 12 }}>Add Voice</Text>
          <Text style={{ color: '#777', fontSize: 10, marginTop: 3 }}>Audio note</Text>
        </Pressable>
      </View>

      <Text style={{ color: '#aaa', fontSize: 11, marginTop: 10 }}>{privacyLabel}</Text>

      <Pressable onPress={onSubmitPress} style={{ backgroundColor: accent, borderRadius: 999, paddingVertical: 11, alignItems: 'center', marginTop: 12 }}>
        <Text style={{ color: '#080808', fontWeight: '900' }}>Submit Proof</Text>
      </Pressable>
    </View>
  );
}
