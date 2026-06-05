import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ensureChatRoom, submitUnlock } from './chatActions';
import { MessageTypeCard } from './MessageTypeCard';

export type LockedMessageCardProps = {
  targetUserId: string;
  roomId?: string;
  onRoomReady?: (roomId: string) => void;
  cost: number;
  previewText?: string;
  unlockedMessage: string;
};

export function LockedMessageCard({
  targetUserId,
  roomId,
  onRoomReady,
  cost,
  previewText = 'Locked message preview',
  unlockedMessage,
}: LockedMessageCardProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUnlock() {
    setIsLoading(true);
    setError(null);

    try {
      const activeRoomId = await ensureChatRoom(roomId);
      onRoomReady?.(activeRoomId);
      await submitUnlock(targetUserId, cost, activeRoomId);
      setIsUnlocked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unlock failed');
    } finally {
      setIsLoading(false);
    }
  }

  if (isUnlocked) {
    return (
      <MessageTypeCard
        type="CHAT_UNLOCK"
        message={unlockedMessage}
        cost={cost}
      />
    );
  }

  return (
    <View
      style={{
        backgroundColor: '#171717',
        borderColor: '#444',
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
      }}
    >
      <Text style={{ color: '#ffffff', fontWeight: '700', marginBottom: 6 }}>
        Locked Message
      </Text>

      <Text style={{ color: '#777777', marginBottom: 10 }}>
        {previewText}
      </Text>

      <Pressable
        onPress={handleUnlock}
        disabled={isLoading}
        style={{
          backgroundColor: '#1D9E75',
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 8,
          alignSelf: 'flex-start',
        }}
      >
        <Text style={{ color: '#ffffff', fontWeight: '700' }}>
          {isLoading ? 'Unlocking...' : `Unlock (${cost} credits)`}
        </Text>
      </Pressable>

      {error ? (
        <Text style={{ color: '#ff6b6b', marginTop: 8 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
