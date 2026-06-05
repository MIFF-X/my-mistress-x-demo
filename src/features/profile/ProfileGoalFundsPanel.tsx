import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { GiftItem, listGifts, sendGift } from '../../api/giftsApi';
import { contributeGoalFund, GoalFund, listPublicGoalFunds } from '../../api/goalsApi';
import { ActionPillButton } from '../buttons/ActionPillButton';

type ProfileGoalFundsPanelProps = {
  mistressUserId?: string | null;
  enableActions?: boolean;
  maxItems?: number;
};

const inputStyle = {
  backgroundColor: '#1b1b1b',
  borderRadius: 9,
  color: '#fff',
  fontSize: 12,
  paddingHorizontal: 9,
  paddingVertical: 8,
  marginTop: 8,
} as const;

function money(value: number | string | null | undefined) {
  return Number(value || 0).toFixed(2);
}

function progressPercent(fund: GoalFund) {
  if (typeof fund.progressPercent === 'number') return fund.progressPercent;
  const target = Number(fund.targetAmount || 0);
  if (target <= 0) return 0;
  return Math.min(100, Math.round((Number(fund.currentAmount || 0) / target) * 100));
}

function categoryLabel(category: string) {
  return category.replace(/_/g, ' ').toLowerCase();
}

export function ProfileGoalFundsPanel({
  mistressUserId,
  enableActions = true,
  maxItems = 3,
}: ProfileGoalFundsPanelProps) {
  const [funds, setFunds] = useState<GoalFund[]>([]);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);
  const [contributionAmounts, setContributionAmounts] = useState<Record<string, string>>({});
  const [contributionMessages, setContributionMessages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const selectedGift = useMemo(
    () => gifts.find((gift) => gift.id === selectedGiftId) || gifts[0],
    [gifts, selectedGiftId],
  );

  useEffect(() => {
    let active = true;

    async function loadPanelData() {
      try {
        setLoading(true);
        setError(null);
        const [fundRows, giftRows] = await Promise.all([
          listPublicGoalFunds(),
          enableActions ? listGifts() : Promise.resolve([]),
        ]);
        if (!active) return;
        setFunds(fundRows);
        setGifts(giftRows);
        setSelectedGiftId((current) => current || giftRows[0]?.id || null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Goal funds failed to load');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPanelData();

    return () => {
      active = false;
    };
  }, [enableActions]);

  const visibleFunds = useMemo(() => {
    const scoped = mistressUserId ? funds.filter((fund) => fund.mistressUserId === mistressUserId) : funds;
    return scoped.slice(0, maxItems);
  }, [funds, maxItems, mistressUserId]);

  async function reloadFunds() {
    const fundRows = await listPublicGoalFunds();
    setFunds(fundRows);
  }

  async function handleContribute(fund: GoalFund) {
    const amount = Number(contributionAmounts[fund.id] || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Contribution amount must be greater than zero.');
      return;
    }

    try {
      setBusyId(`contribute-${fund.id}`);
      setError(null);
      setActionMessage(null);
      const result = await contributeGoalFund(fund.id, amount, contributionMessages[fund.id]?.trim());
      setContributionAmounts((current) => ({ ...current, [fund.id]: '' }));
      setContributionMessages((current) => ({ ...current, [fund.id]: '' }));
      setActionMessage(`Receipt ${result.receipt.receiptNumber} created.`);
      await reloadFunds();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Goal contribution failed');
    } finally {
      setBusyId(null);
    }
  }

  async function handleSendGift(fund: GoalFund) {
    if (!selectedGift) {
      setError('Select a gift first.');
      return;
    }

    try {
      setBusyId(`gift-${fund.id}`);
      setError(null);
      setActionMessage(null);
      await sendGift(fund.mistressUserId, selectedGift.id);
      setActionMessage(`${selectedGift.name} sent.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gift send failed');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Goal Funds</Text>

      {loading ? <Text style={{ color: '#777' }}>Loading public funds...</Text> : null}
      {error ? <Text style={{ color: '#ff6b6b' }}>{error}</Text> : null}
      {actionMessage ? <Text style={{ color: '#1D9E75', marginBottom: 8 }}>{actionMessage}</Text> : null}

      {enableActions && gifts.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          {gifts.map((gift) => {
            const selected = selectedGift?.id === gift.id;
            return (
              <Pressable
                key={gift.id}
                onPress={() => setSelectedGiftId(gift.id)}
                style={{
                  backgroundColor: selected ? '#d4af37' : '#1b1b1b',
                  borderRadius: 10,
                  marginRight: 8,
                  minWidth: 84,
                  padding: 8,
                }}
              >
                <Text style={{ color: selected ? '#000' : '#fff', fontWeight: '900' }}>{gift.emoji || 'gift'}</Text>
                <Text style={{ color: selected ? '#000' : '#fff', fontSize: 11, fontWeight: '800', marginTop: 3 }}>{gift.name}</Text>
                <Text style={{ color: selected ? '#000' : '#ff9abf', fontSize: 10 }}>{money(gift.price)} credits</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {!loading && !error && visibleFunds.length === 0 ? (
        <Text style={{ color: '#666' }}>No public goal funds yet.</Text>
      ) : null}

      {visibleFunds.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {visibleFunds.map((fund) => {
            const progress = progressPercent(fund);
            return (
              <View
                key={fund.id}
                style={{
                  backgroundColor: '#111',
                  padding: 12,
                  borderRadius: 12,
                  minWidth: 260,
                  marginRight: 10,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '800' }}>{fund.title}</Text>
                <Text style={{ color: '#ff9abf', fontSize: 11, marginTop: 4 }}>{categoryLabel(fund.category)}</Text>
                <View style={{ backgroundColor: '#242424', borderRadius: 999, height: 9, marginTop: 10, overflow: 'hidden' }}>
                  <View style={{ backgroundColor: '#1D9E75', height: 9, width: `${progress}%` }} />
                </View>
                <Text style={{ color: '#aaa', fontSize: 11, marginTop: 6 }}>
                  {money(fund.currentAmount)} / {money(fund.targetAmount)} credits | {progress}% funded
                </Text>
                <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>
                  Mistress {money(fund.estimatedMistressNet)} | Platform {money(fund.estimatedPlatformShare)}
                </Text>
                <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>
                  {fund._count?.contributions ?? 0} contribution receipts
                </Text>

                {enableActions ? (
                  <>
                    <TextInput
                      value={contributionAmounts[fund.id] || ''}
                      onChangeText={(value) => setContributionAmounts((current) => ({ ...current, [fund.id]: value }))}
                      placeholder="Contribution credits"
                      placeholderTextColor="#777"
                      keyboardType="decimal-pad"
                      style={inputStyle}
                    />
                    <TextInput
                      value={contributionMessages[fund.id] || ''}
                      onChangeText={(value) => setContributionMessages((current) => ({ ...current, [fund.id]: value }))}
                      placeholder="Optional note"
                      placeholderTextColor="#777"
                      style={inputStyle}
                    />
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 9 }}>
                      <ActionPillButton
                        actionKey="contribute"
                        onPress={() => handleContribute(fund)}
                        disabled={busyId === `contribute-${fund.id}`}
                      />
                      <ActionPillButton
                        actionKey="sendGift"
                        onPress={() => handleSendGift(fund)}
                        disabled={!selectedGift || busyId === `gift-${fund.id}`}
                      />
                    </View>
                  </>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}
