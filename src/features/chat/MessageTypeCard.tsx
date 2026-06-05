import React from 'react';
import { Text, View } from 'react-native';

export type MessageType = 'FREE' | 'PAID_MESSAGE' | 'CHAT_UNLOCK' | 'GIFT' | 'STICKER' | 'SYSTEM';

export type MessageTypeCardProps = {
  type?: MessageType;
  message?: string;
  amount?: number;
  cost?: number;
};

function getLabel(type?: MessageType) {
  if (type === 'PAID_MESSAGE') return 'Priority Message';
  if (type === 'CHAT_UNLOCK') return 'Conversation Unlock';
  if (type === 'GIFT') return 'Gift Sent';
  if (type === 'STICKER') return 'Sticker';
  if (type === 'SYSTEM') return 'System Message';
  return 'Standard Message';
}

function getBorderColor(type?: MessageType) {
  if (type === 'PAID_MESSAGE') return '#ff0055';
  if (type === 'CHAT_UNLOCK') return '#1D9E75';
  if (type === 'GIFT') return '#d4af37';
  if (type === 'STICKER') return '#7c5cff';
  if (type === 'SYSTEM') return '#777777';
  return '#333333';
}

function getAmountText(type?: MessageType, amount?: number, cost?: number) {
  if (type === 'PAID_MESSAGE' && amount) return `${amount} credits`;
  if (type === 'CHAT_UNLOCK' && cost) return `${cost} credits`;
  if (type === 'GIFT' && amount) return `${amount} credits`;
  return null;
}

export function MessageTypeCard({ type, message, amount, cost }: MessageTypeCardProps) {
  const amountText = getAmountText(type, amount, cost);

  return (
    <View
      style={{
        backgroundColor: '#1b1b1b',
        borderColor: getBorderColor(type),
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
      }}
    >
      <Text style={{ color: '#ffffff', fontWeight: '700', marginBottom: 4 }}>
        {getLabel(type)}
      </Text>

      {message ? (
        <Text style={{ color: '#dddddd', marginBottom: amountText ? 6 : 0 }}>
          {message}
        </Text>
      ) : null}

      {amountText ? (
        <Text style={{ color: getBorderColor(type), fontWeight: '700' }}>
          {amountText}
        </Text>
      ) : null}
    </View>
  );
}
