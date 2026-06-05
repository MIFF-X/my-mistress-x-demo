import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

const HANDOFF_TARGETS = {
  ios: 'iOS',
  android: 'Android',
} as const;

type HandoffPlatform = keyof typeof HANDOFF_TARGETS;

export function MobileHandoffCard() {
  const [platform, setPlatform] = useState<HandoffPlatform>('ios');

  return (
    <View style={{ backgroundColor: '#0f0f0f', borderRadius: 22, borderWidth: 1, borderColor: '#222', padding: 18, gap: 14 }}>
      <View>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Mobile handoff</Text>
        <Text style={{ color: '#999', fontSize: 13, marginTop: 6 }}>
          Quick mobile setup surface for MX Stream Deck, creator links, and onboarding flows.
        </Text>
      </View>

      <View style={{ backgroundColor: '#111', borderColor: '#242424', borderWidth: 1, borderRadius: 20, padding: 14, gap: 16 }}>
        <View style={{ flexDirection: 'row', backgroundColor: '#171717', borderRadius: 14, padding: 5 }}>
          {(Object.keys(HANDOFF_TARGETS) as HandoffPlatform[]).map((key) => {
            const active = key === platform;
            return (
              <Pressable
                key={key}
                onPress={() => setPlatform(key)}
                style={{ flex: 1, borderRadius: 11, backgroundColor: active ? '#272727' : 'transparent', paddingVertical: 10, alignItems: 'center' }}
              >
                <Text style={{ color: active ? '#fff' : '#888', fontWeight: '900' }}>{HANDOFF_TARGETS[key]}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ alignItems: 'center', gap: 12 }}>
          <View style={{ width: 216, minHeight: 216, backgroundColor: '#050505', borderRadius: 28, borderWidth: 1, borderColor: '#1c1c1c', justifyContent: 'center', alignItems: 'center', padding: 18 }}>
            <Text style={{ color: '#d4af37', fontSize: 28, fontWeight: '900' }}>{HANDOFF_TARGETS[platform]}</Text>
            <Text style={{ color: '#aaa', fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 10 }}>
              Place signed mobile handoff payload here when the mobile deep link is final.
            </Text>
          </View>
          <Text style={{ color: '#777', fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
            The handoff area is ready for the final mobile connection payload.
          </Text>
        </View>
      </View>
    </View>
  );
}
