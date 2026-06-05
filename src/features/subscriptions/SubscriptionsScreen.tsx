import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import {
  createSubscriptionPlan,
  CreatorSubscriptionTierSlot,
  listCreatorSubscriptionTierSlots,
  listSubscriptionPlans,
  subscribeToPlan,
  SubscriptionPlan,
  SubscriptionTier,
} from '../../api/subscriptionsApi';
import { getCurrentUser } from '../../state/authStore';

type MembershipTab = 'plans' | 'create';

const FALLBACK_TIERS: SubscriptionTier[] = ['BRONZE', 'SILVER', 'GOLD', 'VIP'];

function canCreatePlans(role?: string) {
  return role === 'MISTRESS' || role === 'HEADMISTRESS' || role === 'ADMIN';
}

function tierColor(tier: SubscriptionTier) {
  if (tier === 'VIP') return '#f5c542';
  if (tier === 'GOLD') return '#d4af37';
  if (tier === 'SILVER') return '#c0c0c0';
  return '#cd7f32';
}

function priceLabel(price?: number | string) {
  const value = Number(price || 0);
  if (!Number.isFinite(value)) return `${price} credits`;
  return `${value.toFixed(2)} credits`;
}

function PlanCard({
  plan,
  tierSlot,
  onSubscribe,
}: {
  plan: SubscriptionPlan;
  tierSlot?: CreatorSubscriptionTierSlot;
  onSubscribe: () => void;
}) {
  const color = tierColor(plan.tier);

  return (
    <View
      style={{
        backgroundColor: '#111',
        borderColor: color,
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        marginTop: 10,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{plan.name}</Text>
          <Text style={{ color, marginTop: 4, fontWeight: '900' }}>
            {tierSlot ? `${tierSlot.stableKey} · ${tierSlot.defaultLabel}` : plan.tier}
          </Text>
        </View>
        <Text style={{ color: '#ff9abf', fontSize: 18, fontWeight: '900' }}>{priceLabel(plan.price)}</Text>
      </View>

      {tierSlot ? <Text style={{ color: '#888', marginTop: 8 }}>{tierSlot.growthUse}</Text> : null}
      <Text style={{ color: '#aaa', marginTop: 8 }}>Billing: {plan.billingCycle}</Text>
      <Text style={{ color: '#aaa', marginTop: 4 }}>Chat included: {plan.chatIncluded ? 'Yes' : 'No'}</Text>
      <Text style={{ color: '#aaa', marginTop: 4 }}>PPV included: {plan.ppvIncluded ? 'Yes' : 'No'}</Text>
      <Text style={{ color: '#aaa', marginTop: 4 }}>PPV discount: {plan.ppvDiscountPercent}%</Text>
      <Text style={{ color: '#aaa', marginTop: 4 }}>Gift discount: {plan.giftDiscountPercent}%</Text>

      <Pressable onPress={onSubscribe} style={{ backgroundColor: '#ff0055', padding: 10, borderRadius: 10, marginTop: 12 }}>
        <Text style={{ color: '#fff', fontWeight: '900', textAlign: 'center' }}>Subscribe</Text>
      </Pressable>
    </View>
  );
}

export function SubscriptionsScreen() {
  const currentUser = getCurrentUser();
  const creatorMode = canCreatePlans(currentUser?.role);
  const [activeTab, setActiveTab] = useState<MembershipTab>('plans');
  const [tierSlots, setTierSlots] = useState<CreatorSubscriptionTierSlot[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [tier, setTier] = useState<SubscriptionTier>('BRONZE');
  const [chatIncluded, setChatIncluded] = useState(false);
  const [ppvIncluded, setPpvIncluded] = useState(false);
  const [ppvDiscountPercent, setPpvDiscountPercent] = useState('0');
  const [giftDiscountPercent, setGiftDiscountPercent] = useState('0');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const normalizedTierSlots = useMemo(() => {
    if (tierSlots.length > 0) return tierSlots;
    return FALLBACK_TIERS.map((key, index) => ({
      slot: (index + 1) as 1 | 2 | 3 | 4,
      key,
      stableKey: `creator_tier_${index + 1}` as CreatorSubscriptionTierSlot['stableKey'],
      defaultLabel: key,
      defaultDescription: 'Creator subscription tier.',
      suggestedMonthlyPrice: 15,
      recommendedPerks: [],
      growthUse: 'Creator recurring support tier.',
    }));
  }, [tierSlots]);

  const currentTierSlot = useMemo(
    () => normalizedTierSlots.find((slot) => slot.key === tier),
    [normalizedTierSlots, tier],
  );

  useEffect(() => {
    loadMemberships();
  }, []);

  async function loadMemberships() {
    try {
      setLoading(true);
      setError(null);
      const [nextSlots, nextPlans] = await Promise.all([
        listCreatorSubscriptionTierSlots(),
        listSubscriptionPlans(),
      ]);
      setTierSlots(nextSlots);
      setPlans(nextPlans);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Memberships failed to load');
    } finally {
      setLoading(false);
    }
  }

  function applyTierDefaults(slot: CreatorSubscriptionTierSlot) {
    setTier(slot.key);
    setName(slot.defaultLabel);
    setPrice(String(slot.suggestedMonthlyPrice));
    setChatIncluded(slot.slot >= 2);
    setPpvIncluded(slot.slot >= 3);
    setPpvDiscountPercent(slot.slot >= 2 ? '10' : '0');
    setGiftDiscountPercent(slot.slot >= 2 ? '5' : '0');
  }

  function startCreateForSlot(slot: CreatorSubscriptionTierSlot) {
    applyTierDefaults(slot);
    setActiveTab('create');
    setSuccess(null);
    setError(null);
  }

  async function handleCreatePlan() {
    const safePrice = Number(price);
    if (!Number.isFinite(safePrice) || safePrice <= 0) {
      setError('A positive plan price is required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await createSubscriptionPlan({
        name: name.trim() || currentTierSlot?.defaultLabel || `${tier} Supporter Plan`,
        price: safePrice,
        tier,
        chatIncluded,
        ppvIncluded,
        ppvDiscountPercent: Number(ppvDiscountPercent || 0),
        giftDiscountPercent: Number(giftDiscountPercent || 0),
        perks: {
          source: 'memberships-screen',
          stableKey: currentTierSlot?.stableKey,
          tier,
          tierLabel: currentTierSlot?.defaultLabel,
          recommendedPerks: currentTierSlot?.recommendedPerks || [],
          chatIncluded,
          ppvIncluded,
        },
      });
      setName('');
      setPrice('');
      setTier('BRONZE');
      setChatIncluded(false);
      setPpvIncluded(false);
      setPpvDiscountPercent('0');
      setGiftDiscountPercent('0');
      setSuccess('Membership plan created.');
      setActiveTab('plans');
      await loadMemberships();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Membership plan failed to create');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubscribe(planId: string) {
    try {
      setError(null);
      setSuccess(null);
      await subscribeToPlan(planId);
      setSuccess('Subscription activated.');
      await loadMemberships();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Subscription failed');
    }
  }

  function renderTab(label: string, tab: MembershipTab) {
    const active = activeTab === tab;
    return (
      <Pressable
        onPress={() => setActiveTab(tab)}
        style={{
          backgroundColor: active ? '#ff0055' : '#111',
          paddingVertical: 9,
          paddingHorizontal: 12,
          borderRadius: 999,
          marginRight: 8,
          marginBottom: 8,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '900' }}>{label}</Text>
      </Pressable>
    );
  }

  function renderToggle(label: string, value: boolean, onPress: () => void) {
    return (
      <Pressable onPress={onPress} style={{ backgroundColor: value ? '#1D9E75' : '#222', padding: 10, borderRadius: 10, marginBottom: 8 }}>
        <Text style={{ color: '#fff', fontWeight: '900', textAlign: 'center' }}>{label}: {value ? 'On' : 'Off'}</Text>
      </Pressable>
    );
  }

  function renderPlans() {
    return (
      <>
        <Pressable onPress={loadMemberships} style={{ backgroundColor: '#222', padding: 10, borderRadius: 10, marginBottom: 12 }}>
          <Text style={{ color: '#fff', fontWeight: '800', textAlign: 'center' }}>Refresh Memberships</Text>
        </Pressable>
        <View style={{ gap: 12 }}>
          {normalizedTierSlots.map((slot) => {
            const slotPlans = plans.filter((plan) => plan.tier === slot.key);
            const color = tierColor(slot.key);
            return (
              <View key={slot.stableKey} style={{ backgroundColor: '#0f0f0f', borderColor: '#222', borderWidth: 1, borderRadius: 18, padding: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>{slot.stableKey} · {slot.defaultLabel}</Text>
                    <Text style={{ color: '#888', marginTop: 4, fontSize: 12 }}>{slot.defaultDescription}</Text>
                    <Text style={{ color: '#aaa', marginTop: 6, fontSize: 12 }}>{slot.growthUse}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color, fontWeight: '900' }}>{slot.key}</Text>
                    <Text style={{ color: slotPlans.length > 0 ? '#1D9E75' : '#ffb020', fontSize: 12, marginTop: 3 }}>
                      {slotPlans.length > 0 ? `${slotPlans.length} active plan${slotPlans.length === 1 ? '' : 's'}` : 'empty slot'}
                    </Text>
                  </View>
                </View>

                {slotPlans.length === 0 ? (
                  <Pressable onPress={() => startCreateForSlot(slot)} style={{ backgroundColor: '#19130a', borderColor: color, borderWidth: 1, padding: 10, borderRadius: 12, marginTop: 12 }}>
                    <Text style={{ color, textAlign: 'center', fontWeight: '900' }}>Create {slot.defaultLabel} Plan</Text>
                  </Pressable>
                ) : null}

                {slotPlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    tierSlot={slot}
                    onSubscribe={() => handleSubscribe(plan.id)}
                  />
                ))}
              </View>
            );
          })}
        </View>
      </>
    );
  }

  function renderTierSlotSelector() {
    return (
      <View style={{ gap: 8, marginBottom: 10 }}>
        {normalizedTierSlots.map((slot) => {
          const active = slot.key === tier;
          const color = tierColor(slot.key);
          return (
            <Pressable
              key={slot.stableKey}
              onPress={() => applyTierDefaults(slot)}
              style={{
                backgroundColor: active ? '#19130a' : '#151515',
                borderColor: active ? color : '#292929',
                borderWidth: 1,
                borderRadius: 14,
                padding: 12,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontWeight: '900' }}>{slot.stableKey} · {slot.defaultLabel}</Text>
                  <Text style={{ color: '#888', marginTop: 4, fontSize: 12 }}>{slot.defaultDescription}</Text>
                </View>
                <Text style={{ color, fontWeight: '900' }}>{priceLabel(slot.suggestedMonthlyPrice)}</Text>
              </View>
              <Text style={{ color: '#aaa', marginTop: 8, fontSize: 12 }}>{slot.growthUse}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  function renderCreate() {
    if (!creatorMode) {
      return (
        <View style={{ backgroundColor: '#111', padding: 14, borderRadius: 16 }}>
          <Text style={{ color: '#ff6b6b', fontWeight: '900' }}>Creator access required.</Text>
          <Text style={{ color: '#aaa', marginTop: 6 }}>Membership plan creation is for creator/admin roles.</Text>
        </View>
      );
    }

    return (
      <View style={{ backgroundColor: '#111', padding: 14, borderRadius: 16 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 6 }}>Create Membership Tier</Text>
        <Text style={{ color: '#888', marginBottom: 12 }}>
          Choose one of the four stable creator tiers, then customise the visible name, price, and perks.
        </Text>

        {renderTierSlotSelector()}

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Visible tier name"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
        />
        <TextInput
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholder="Monthly price in credits"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
        />

        {currentTierSlot?.recommendedPerks?.length ? (
          <View style={{ backgroundColor: '#050505', borderRadius: 12, padding: 10, marginBottom: 8 }}>
            <Text style={{ color: '#d4af37', fontWeight: '900', marginBottom: 6 }}>Recommended perks</Text>
            {currentTierSlot.recommendedPerks.map((perk) => (
              <Text key={perk} style={{ color: '#aaa', marginBottom: 3 }}>• {perk}</Text>
            ))}
          </View>
        ) : null}

        {renderToggle('Chat Included', chatIncluded, () => setChatIncluded((value) => !value))}
        {renderToggle('PPV Included', ppvIncluded, () => setPpvIncluded((value) => !value))}

        <TextInput
          value={ppvDiscountPercent}
          onChangeText={setPpvDiscountPercent}
          keyboardType="numeric"
          placeholder="PPV discount percent"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
        />
        <TextInput
          value={giftDiscountPercent}
          onChangeText={setGiftDiscountPercent}
          keyboardType="numeric"
          placeholder="Gift discount percent"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }}
        />

        <Pressable onPress={handleCreatePlan} disabled={saving} style={{ backgroundColor: saving ? '#555' : '#ff0055', padding: 12, borderRadius: 12 }}>
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '900' }}>{saving ? 'Creating...' : 'Create Membership Tier'}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#000' }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 6 }}>Memberships</Text>
      <Text style={{ color: '#aaa', marginBottom: 14 }}>
        Create, browse, and activate up to four creator subscription tiers.
      </Text>

      {error ? <Text style={{ color: '#ff6b6b', marginBottom: 10 }}>{error}</Text> : null}
      {success ? <Text style={{ color: '#1D9E75', marginBottom: 10 }}>{success}</Text> : null}
      {loading ? <Text style={{ color: '#999', marginBottom: 10 }}>Loading memberships...</Text> : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
        {renderTab('Tier Slots', 'plans')}
        {renderTab('Create Tier', 'create')}
      </View>

      {activeTab === 'plans' ? renderPlans() : null}
      {activeTab === 'create' ? renderCreate() : null}
    </ScrollView>
  );
}
