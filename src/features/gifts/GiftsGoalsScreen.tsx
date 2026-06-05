import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { GiftItem, listGifts, sendGift } from '../../api/giftsApi';
import {
  activateGoalFund,
  archiveGoalFund,
  contributeGoalFund,
  createGoalFund,
  GoalContributionReceipt,
  GoalFund,
  listGoalFundReceipts,
  listMyGoalFunds,
  listPublicGoalFunds,
  pauseGoalFund,
} from '../../api/goalsApi';
import { getCurrentUser } from '../../state/authStore';
import { ActionPillButton } from '../buttons/ActionPillButton';
import { getGiftButtonGlyph, getGiftButtonLabel } from './GiftButtonPack';
import { createGiftEffectFromGift, getGiftEffectAccentColor } from './GiftEffectPresets';
import { GiftEffect, GiftEffectOverlay } from './GiftEffectOverlay';
import { GoalContributionHistoryPanel } from './GoalContributionHistoryPanel';

const inputStyle = {
  backgroundColor: '#1b1b1b',
  borderRadius: 10,
  color: '#fff',
  padding: 10,
  marginBottom: 8,
} as const;

function panelStyle() {
  return { backgroundColor: '#111', padding: 12, borderRadius: 14, marginBottom: 10 } as const;
}

function smallText(color = '#aaa') {
  return { color, fontSize: 11, marginTop: 4 } as const;
}

function money(value: number | string | null | undefined) {
  return Number(value || 0).toFixed(2);
}

function userLabel(user?: { username?: string | null; displayName?: string | null; id?: string | null } | null) {
  if (!user) return 'Unknown Mistress';
  return user.displayName || user.username || user.id || 'Unknown Mistress';
}

function progressPercent(fund: GoalFund) {
  if (typeof fund.progressPercent === 'number') return fund.progressPercent;
  const target = Number(fund.targetAmount || 0);
  if (target <= 0) return 0;
  return Math.min(100, Math.round((Number(fund.currentAmount || 0) / target) * 100));
}

function canManageGoalFunds(role?: string | null) {
  return role === 'MISTRESS' || role === 'HEADMISTRESS' || role === 'ADMIN';
}

export function GiftsGoalsScreen() {
  const currentUser = getCurrentUser();
  const canManage = canManageGoalFunds(currentUser?.role);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [publicFunds, setPublicFunds] = useState<GoalFund[]>([]);
  const [myFunds, setMyFunds] = useState<GoalFund[]>([]);
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);
  const [contributionAmounts, setContributionAmounts] = useState<Record<string, string>>({});
  const [contributionMessages, setContributionMessages] = useState<Record<string, string>>({});
  const [receiptsByFund, setReceiptsByFund] = useState<Record<string, GoalContributionReceipt[]>>({});
  const [lastReceipt, setLastReceipt] = useState<GoalContributionReceipt | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('personal care fund');
  const [formTarget, setFormTarget] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [giftEffect, setGiftEffect] = useState<GiftEffect | null>(null);

  const selectedGift = useMemo(
    () => gifts.find((gift) => gift.id === selectedGiftId) || gifts[0],
    [gifts, selectedGiftId],
  );

  useEffect(() => {
    loadData();
  }, [canManage]);

  useEffect(() => {
    if (!giftEffect) return undefined;

    const timeout = setTimeout(() => setGiftEffect(null), 3200);
    return () => clearTimeout(timeout);
  }, [giftEffect]);

  function showGiftEffect(effect: Omit<GiftEffect, 'id'>) {
    setGiftEffect({ ...effect, id: Date.now() });
  }

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [giftRows, publicRows, mineRows] = await Promise.all([
        listGifts(),
        listPublicGoalFunds(),
        canManage ? listMyGoalFunds() : Promise.resolve([]),
      ]);
      setGifts(giftRows);
      setPublicFunds(publicRows);
      setMyFunds(mineRows);
      setSelectedGiftId((current) => current || giftRows[0]?.id || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gifts and goals failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateFund() {
    const targetAmount = Number(formTarget);
    if (!formTitle.trim() || !Number.isFinite(targetAmount) || targetAmount <= 0) {
      setError('Fund title and target amount are required.');
      return;
    }

    try {
      setBusyId('create-fund');
      setError(null);
      setActionMessage(null);
      await createGoalFund({
        title: formTitle.trim(),
        category: formCategory.trim() || 'custom Mistress goal',
        targetAmount,
        description: formDescription.trim() || undefined,
        visibility: 'PUBLIC',
        metadata: { source: 'gifts_goals_screen' },
      });
      setFormTitle('');
      setFormTarget('');
      setFormDescription('');
      setActionMessage('Goal fund created as a draft. Activate it when it is ready for Subs.');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Goal fund creation failed');
    } finally {
      setBusyId(null);
    }
  }

  async function handleFundStatus(fundId: string, action: 'activate' | 'pause' | 'archive') {
    try {
      setBusyId(`${action}-${fundId}`);
      setError(null);
      setActionMessage(null);
      if (action === 'activate') await activateGoalFund(fundId);
      if (action === 'pause') await pauseGoalFund(fundId);
      if (action === 'archive') await archiveGoalFund(fundId);
      setActionMessage(`Goal fund ${action}d.`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Goal fund status update failed');
    } finally {
      setBusyId(null);
    }
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
      setLastReceipt(result.contribution);
      setActionMessage(`Contribution receipt ${result.receipt.receiptNumber} created.`);
      showGiftEffect({
        badge: 'Goal tribute',
        title: `${money(amount)} credits added`,
        detail: `${userLabel(fund.mistress)} received support for ${fund.title}.`,
        accentColor: '#1D9E75',
      });
      setContributionAmounts((current) => ({ ...current, [fund.id]: '' }));
      setContributionMessages((current) => ({ ...current, [fund.id]: '' }));
      await loadData();
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
      setActionMessage(`${selectedGift.name} sent to ${userLabel(fund.mistress)}.`);
      showGiftEffect({
        ...createGiftEffectFromGift(selectedGift, {
          recipientLabel: userLabel(fund.mistress),
          detail: `${userLabel(fund.mistress)} has a new virtual gift.`,
        }),
      });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gift send failed');
    } finally {
      setBusyId(null);
    }
  }

  async function handleLoadReceipts(fundId: string) {
    try {
      setBusyId(`receipts-${fundId}`);
      setError(null);
      const receipts = await listGoalFundReceipts(fundId);
      setReceiptsByFund((current) => ({ ...current, [fundId]: receipts }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Receipts failed to load');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#000' }}>
      {giftEffect ? <GiftEffectOverlay key={giftEffect.id} effect={giftEffect} /> : null}
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 6 }}>Gifts & Goals</Text>
      <Text style={{ color: '#aaa', marginBottom: 12 }}>
        Pick a premium gift, contribute to public funds, or manage your own Mistress goals.
      </Text>

      {loading ? <Text style={{ color: '#999', marginBottom: 10 }}>Loading gifts and goals...</Text> : null}
      {error ? <Text style={{ color: '#ff6b6b', marginBottom: 10 }}>{error}</Text> : null}
      {actionMessage ? <Text style={{ color: '#1D9E75', marginBottom: 10 }}>{actionMessage}</Text> : null}

      <View style={panelStyle()}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 8 }}>Premium Gift Rail</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {gifts.map((gift) => {
            const selected = selectedGift?.id === gift.id;
            const accentColor = getGiftEffectAccentColor(gift);
            const glyph = getGiftButtonGlyph(gift);
            const label = getGiftButtonLabel(gift);
            return (
              <Pressable
                key={gift.id}
                onPress={() => setSelectedGiftId(gift.id)}
                style={{
                  backgroundColor: selected ? '#241018' : '#1b1b1b',
                  borderColor: selected ? accentColor : '#2a2a2a',
                  borderWidth: 1,
                  padding: 10,
                  borderRadius: 10,
                  marginRight: 8,
                  minWidth: 110,
                }}
              >
                <Text style={{ color: selected ? accentColor : '#fff', fontWeight: '900' }}>{glyph}</Text>
                <Text style={{ color: selected ? accentColor : '#fff', fontWeight: '800', marginTop: 4 }}>{label}</Text>
                <Text style={{ color: selected ? accentColor : '#ff9abf', fontSize: 11 }}>{money(gift.price)} credits</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {gifts.length === 0 ? <Text style={{ color: '#777' }}>No active gifts found.</Text> : null}
      </View>

      {canManage ? (
        <View style={panelStyle()}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 8 }}>Mistress Goal Manager</Text>
          <TextInput value={formTitle} onChangeText={setFormTitle} placeholder="Goal title" placeholderTextColor="#777" style={inputStyle} />
          <TextInput value={formCategory} onChangeText={setFormCategory} placeholder="car fund, house fund, personal care fund" placeholderTextColor="#777" style={inputStyle} />
          <TextInput value={formTarget} onChangeText={setFormTarget} placeholder="Target credits" placeholderTextColor="#777" keyboardType="decimal-pad" style={inputStyle} />
          <TextInput
            value={formDescription}
            onChangeText={setFormDescription}
            placeholder="Short public note"
            placeholderTextColor="#777"
            multiline
            style={{ ...inputStyle, minHeight: 58 }}
          />
          <ActionPillButton
            actionKey="createDraft"
            onPress={handleCreateFund}
            disabled={busyId === 'create-fund'}
            style={{ justifyContent: 'center', marginBottom: 10, marginRight: 0 }}
            textStyle={{ textAlign: 'center' }}
          />

          {myFunds.map((fund) => (
            <View key={fund.id} style={{ backgroundColor: '#1b1b1b', padding: 10, borderRadius: 10, marginBottom: 8 }}>
              <Text style={{ color: '#fff', fontWeight: '900' }}>{fund.title}</Text>
              <Text style={smallText('#ff9abf')}>{fund.status} | {fund.category} | {progressPercent(fund)}%</Text>
              <Text style={smallText()}>{money(fund.currentAmount)} / {money(fund.targetAmount)} credits | {fund._count?.contributions ?? 0} receipts</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                <ActionPillButton actionKey="activateGoal" onPress={() => handleFundStatus(fund.id, 'activate')} />
                <ActionPillButton actionKey="pauseGoal" onPress={() => handleFundStatus(fund.id, 'pause')} />
                <ActionPillButton actionKey="archiveGoal" onPress={() => handleFundStatus(fund.id, 'archive')} />
              </View>
            </View>
          ))}
          {myFunds.length === 0 ? <Text style={{ color: '#777' }}>No creator funds yet.</Text> : null}
        </View>
      ) : null}

      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 8 }}>Public Goal Funds</Text>
      {publicFunds.map((fund) => {
        const receipts = receiptsByFund[fund.id] || [];
        return (
          <View key={fund.id} style={panelStyle()}>
            <Text style={{ color: '#fff', fontSize: 17, fontWeight: '900' }}>{fund.title}</Text>
            <Text style={{ color: '#ff9abf', marginTop: 4 }}>{userLabel(fund.mistress)} | {fund.category}</Text>
            <View style={{ backgroundColor: '#222', borderRadius: 999, height: 10, marginTop: 10, overflow: 'hidden' }}>
              <View style={{ backgroundColor: '#1D9E75', height: 10, width: `${progressPercent(fund)}%` }} />
            </View>
            <Text style={smallText()}>{money(fund.currentAmount)} / {money(fund.targetAmount)} credits | {progressPercent(fund)}% funded</Text>
            <Text style={smallText('#777')}>Estimated split: Mistress {money(fund.estimatedMistressNet)} | Platform {money(fund.estimatedPlatformShare)}</Text>
            {fund.description ? <Text style={{ color: '#ddd', marginTop: 8 }}>{fund.description}</Text> : null}

            <TextInput
              value={contributionAmounts[fund.id] || ''}
              onChangeText={(value) => setContributionAmounts((current) => ({ ...current, [fund.id]: value }))}
              placeholder="Contribution credits"
              placeholderTextColor="#777"
              keyboardType="decimal-pad"
              style={{ ...inputStyle, marginTop: 10 }}
            />
            <TextInput
              value={contributionMessages[fund.id] || ''}
              onChangeText={(value) => setContributionMessages((current) => ({ ...current, [fund.id]: value }))}
              placeholder="Optional message"
              placeholderTextColor="#777"
              style={inputStyle}
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <ActionPillButton
                actionKey="contribute"
                onPress={() => handleContribute(fund)}
                disabled={busyId === `contribute-${fund.id}`}
              />
              <ActionPillButton
                actionKey="sendGift"
                onPress={() => handleSendGift(fund)}
                disabled={!selectedGift || busyId === `gift-${fund.id}`}
                label="Send Selected Gift"
              />
              <ActionPillButton
                actionKey="receipts"
                onPress={() => handleLoadReceipts(fund.id)}
                disabled={busyId === `receipts-${fund.id}`}
              />
            </View>

            {receipts.map((receipt) => (
              <View key={receipt.id || receipt.receiptNumber} style={{ backgroundColor: '#181818', borderRadius: 9, padding: 9, marginTop: 8 }}>
                <Text style={{ color: '#fff', fontWeight: '900' }}>{receipt.receiptNumber}</Text>
                <Text style={smallText('#1D9E75')}>{money(receipt.amount)} credits | Mistress {money(receipt.mistressAmount)} | Platform {money(receipt.platformAmount)}</Text>
              </View>
            ))}
          </View>
        );
      })}
      {publicFunds.length === 0 ? <Text style={{ color: '#777' }}>No public goal funds are active yet.</Text> : null}

      <GoalContributionHistoryPanel />

      {lastReceipt ? (
        <View style={{ ...panelStyle(), borderColor: '#1D9E75', borderWidth: 1 }}>
          <Text style={{ color: '#1D9E75', fontWeight: '900' }}>Latest Receipt</Text>
          <Text style={{ color: '#fff', marginTop: 4 }}>{lastReceipt.receiptNumber}</Text>
          <Text style={smallText()}>{money(lastReceipt.amount)} credits | Mistress {money(lastReceipt.mistressAmount)} | Platform {money(lastReceipt.platformAmount)}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
