import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

export type LiveReactionEvent = {
  id: string;
  label: string;
  createdAt: number;
};

type LiveReactionOverlayProps = {
  reactions: LiveReactionEvent[];
};

export function LiveReactionOverlay({ reactions }: LiveReactionOverlayProps) {
  const [visible, setVisible] = useState<LiveReactionEvent[]>([]);

  useEffect(() => {
    setVisible(reactions.slice(-6));
  }, [reactions]);

  if (visible.length === 0) return null;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        right: 16,
        bottom: 90,
        alignItems: 'flex-end',
      }}
    >
      {visible.map((reaction, index) => (
        <View
          key={reaction.id}
          style={{
            backgroundColor: 'rgba(255, 0, 85, 0.16)',
            borderColor: 'rgba(255, 0, 85, 0.55)',
            borderWidth: 1,
            borderRadius: 999,
            paddingVertical: 6,
            paddingHorizontal: 10,
            marginBottom: 6,
            opacity: 1 - index * 0.08,
          }}
        >
          <Text style={{ color: '#ffffff', fontWeight: '700' }}>{reaction.label}</Text>
        </View>
      ))}
    </View>
  );
}
