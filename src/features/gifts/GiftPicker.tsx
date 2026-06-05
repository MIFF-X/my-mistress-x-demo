import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  GiftItem,
  GiftReviewStatus,
  listGifts,
  requestGiftReview,
  sendGift,
  SendGiftResponse,
} from '../../api/giftsApi';
import { ExpressionTray } from '../chat-expression/ExpressionTray';
import type { ExpressionAsset } from '../chat-expression/expressionCatalog';
import { getGiftButtonGlyph, getGiftButtonLabel } from './GiftButtonPack';
import { getGiftEffectAccentColor } from './GiftEffectPresets';

type GiftPickerProps = {
  targetUserId: string;
  onGiftSent?: (gift: GiftItem) => void;
};

function expressionTypeLabel(type: ExpressionAsset['type']) {
  return type.replace(/_/g, ' ');
}

export function GiftPicker({ targetUserId, onGiftSent }: GiftPickerProps) {
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [lastReceipt, setLastReceipt] = useState<SendGiftResponse | null>(null);
  const [lastExpression, setLastExpression] = useState<ExpressionAsset | null>(null);
  const [expressionStatus, setExpressionStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingGiftId, setSendingGiftId] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listGifts()
      .then(setGifts)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load gifts'))
      .finally(() => setLoading(false));
  }, []);

  function handleExpressionSelected(asset: ExpressionAsset) {
    setLastExpression(asset);
    setExpressionStatus(`${asset.glyph} ${asset.label} ready from ${asset.packName}.`);
  }

  async function handleSend(gift: GiftItem) {
    try {
      setSendingGiftId(gift.id);
      setError(null);
      setActionStatus(null);
      const receipt = await sendGift(targetUserId, gift.id);
      setLastReceipt(receipt);
      onGiftSent?.(gift);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gift failed to send');
    } finally {
      setSendingGiftId(null);
    }
  }

  async function handleRequestReview(status: GiftReviewStatus) {
    if (!lastReceipt) return;

    try {
      setError(null);
      setActionStatus('Submitting review...');
      const review = await requestGiftReview(lastReceipt.id, status, 'Requested from gift receipt panel');
      setLastReceipt((current) => current ? {
        ...current,
        reviewStatus: review.reviewStatus,
        reviewReason: review.reviewReason,
        reviewedAt: review.createdAt,
      } : current);
      setActionStatus(review.reviewStatus === 'DISPUTED' ? 'Dispute review queued' : 'Refund review queued');
    } catch (err) {
      setActionStatus('Review failed');
      setError(err instanceof Error ? err.message : 'Gift review request failed');
    }
  }

  return (
    <View style={{ backgroundColor: '#111', padding: 10, borderRadius: 12 }}>
      <ExpressionTray compact disabled={!targetUserId} onSelectExpression={handleExpressionSelected} />

      {lastExpression ? (
        <View style={{ backgroundColor: '#050505', borderColor: '#ff9abf', borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 10 }}>
          <Text style={{ color: '#fff', fontWeight: '900' }}>
            Expression ready: {lastExpression.glyph} {lastExpression.label}
          </Text>
          <Text style={{ color: '#aaa', fontSize: 11, marginTop: 4 }}>
            {expressionStatus} Type: {expressionTypeLabel(lastExpression.type)}.
          </Text>
        </View>
      ) : null}

      <Text style={{ color: '#fff', fontWeight: '700', marginBottom: 8 }}>
        Send Gift
      </Text>

      {loading ? <Text style={{ color: '#999' }}>Loading gifts...</Text> : null}
      {error ? <Text style={{ color: '#ff6b6b', marginBottom: 8 }}>{error}</Text> : null}

      {!loading && !error ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {gifts.map((gift) => {
            const sending = sendingGiftId === gift.id;
            const accentColor = getGiftEffectAccentColor(gift);
            const glyph = getGiftButtonGlyph(gift);
            const label = getGiftButtonLabel(gift);
            return (
              <Pressable
                key={gift.id}
                onPress={() => handleSend(gift)}
                disabled={sending}
                style={{
                  backgroundColor: sending ? '#2a2011' : '#1b1b1b',
                  borderColor: accentColor,
                  borderWidth: 1,
                  padding: 10,
                  borderRadius: 10,
                  marginRight: 8,
                  alignItems: 'center',
                  minWidth: 70,
                }}
              >
                <Text style={{ color: accentColor, fontSize: 20, fontWeight: '900' }}>{glyph}</Text>
                <Text style={{ color: '#fff', fontSize: 12 }}>{label}</Text>
                <Text style={{ color: accentColor, fontSize: 11 }}>{sending ? 'Sending...' : gift.price}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {lastReceipt ? (
        <View style={{ backgroundColor: '#050505', padding: 10, borderRadius: 8, marginTop: 10 }}>
          <Text style={{ color: '#fff', fontWeight: '800' }}>
            Sent {lastReceipt.giftName} / {lastReceipt.grossAmount} credits
          </Text>
          <Text style={{ color: '#aaa', fontSize: 11, marginTop: 4 }}>
            Creator {lastReceipt.mistressAmount ?? 0} / Platform {lastReceipt.platformAmount ?? 0}
          </Text>
          {lastReceipt.reviewStatus || actionStatus ? (
            <Text style={{ color: '#ffcc66', fontSize: 11, marginTop: 6 }}>
              {actionStatus || (lastReceipt.reviewStatus === 'DISPUTED' ? 'Dispute review queued' : 'Refund review queued')}
            </Text>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
              <Pressable
                onPress={() => handleRequestReview('REFUND_REQUESTED')}
                style={{ backgroundColor: '#222', paddingVertical: 7, paddingHorizontal: 9, borderRadius: 8, marginRight: 8, marginBottom: 6 }}
              >
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>Refund</Text>
              </Pressable>
              <Pressable
                onPress={() => handleRequestReview('DISPUTED')}
                style={{ backgroundColor: '#2b1420', paddingVertical: 7, paddingHorizontal: 9, borderRadius: 8, marginBottom: 6 }}
              >
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>Dispute</Text>
              </Pressable>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}
