import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';
import {
  COLLECTOR_ECONOMY_PIPELINE,
  COLLECTOR_ORDER_STATES,
  COLLECTOR_RISK_RULES,
  COLLECTOR_UNLOCK_RULES,
  COLLECTOR_WORLD_PLANS,
  type CollectorOrderState,
  type CollectorRiskRule,
  type CollectorUnlockRule,
  type CollectorWorldPlan,
} from './collectorEconomyModel';

type CollectorEconomyTab = 'worlds' | 'orders' | 'unlocks' | 'risk';

const COLLECTOR_TABS: Array<{ id: CollectorEconomyTab; label: string }> = [
  { id: 'worlds', label: 'Worlds' },
  { id: 'orders', label: 'Order States' },
  { id: 'unlocks', label: 'Sticker Unlocks' },
  { id: 'risk', label: 'Safety' },
];

function panelStyle(borderColor = mxTheme.colors.border) {
  return {
    backgroundColor: '#0f0f14',
    borderColor,
    borderWidth: 1,
    borderRadius: mxTheme.radius.lg,
    padding: mxTheme.spacing.md,
  };
}

function StatusPill({ label, tone }: { label: string; tone: string }) {
  return (
    <View style={{ backgroundColor: `${tone}22`, borderColor: tone, borderWidth: 1, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8 }}>
      <Text style={{ color: tone, fontSize: 10, fontWeight: '900' }}>{label.toUpperCase()}</Text>
    </View>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ color: mxTheme.colors.text, fontSize: 21, fontWeight: '900' }}>{title}</Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 13, lineHeight: 18 }}>{subtitle}</Text>
    </View>
  );
}

function BulletList({ items, tone }: { items: string[]; tone: string }) {
  return (
    <View style={{ gap: 6 }}>
      {items.map((item) => (
        <View key={item} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: tone, marginTop: 6 }} />
          <Text style={{ color: '#ddd', fontSize: 12, lineHeight: 17, flex: 1 }}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function MetricCard({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: string }) {
  return (
    <View style={{ ...panelStyle(`${tone}66`), flex: 1, minWidth: 175, gap: 6 }}>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>{label}</Text>
      <Text style={{ color: mxTheme.colors.text, fontSize: 25, fontWeight: '900' }}>{value}</Text>
      <Text style={{ color: tone, fontSize: 12, fontWeight: '800' }}>{detail}</Text>
    </View>
  );
}

function WorldCard({
  world,
  active,
  onSelect,
}: {
  world: CollectorWorldPlan;
  active: boolean;
  onSelect: (world: CollectorWorldPlan) => void;
}) {
  return (
    <Pressable onPress={() => onSelect(world)} style={{ ...panelStyle(active ? world.tone : '#2a2a33'), flexGrow: 1, flexBasis: 240, maxWidth: 410, gap: 9 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: world.tone, fontSize: 11, fontWeight: '900' }}>{world.badge}</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', marginTop: 3 }}>{world.title}</Text>
        </View>
        <StatusPill label={world.stockRule.includes('Digital') ? 'digital' : 'stock'} tone={world.tone} />
      </View>
      <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>{world.description}</Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Buyer: {world.buyerRule}</Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Seller: {world.sellerRule}</Text>
    </Pressable>
  );
}

function OrderStateCard({ state }: { state: CollectorOrderState }) {
  return (
    <View style={{ ...panelStyle(state.tone), flexGrow: 1, flexBasis: 210, maxWidth: 360, gap: 7 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <Text style={{ color: mxTheme.colors.text, fontSize: 17, fontWeight: '900', flex: 1 }}>{state.title}</Text>
        <StatusPill label={state.owner} tone={state.tone} />
      </View>
      <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>{state.description}</Text>
    </View>
  );
}

function UnlockRuleCard({ rule }: { rule: CollectorUnlockRule }) {
  return (
    <View style={{ ...panelStyle(rule.tone), flexGrow: 1, flexBasis: 240, maxWidth: 410, gap: 8 }}>
      <Text style={{ color: rule.tone, fontSize: 11, fontWeight: '900' }}>REWARD RULE</Text>
      <Text style={{ color: mxTheme.colors.text, fontSize: 17, fontWeight: '900' }}>{rule.title}</Text>
      <Text style={{ color: '#ddd', fontSize: 12, lineHeight: 18 }}>Trigger: {rule.trigger}</Text>
      <Text style={{ color: '#ddd', fontSize: 12, lineHeight: 18 }}>Reward: {rule.reward}</Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11, lineHeight: 16 }}>Audit: {rule.audit}</Text>
    </View>
  );
}

function RiskRuleCard({ rule }: { rule: CollectorRiskRule }) {
  return (
    <View style={{ ...panelStyle(rule.tone), flexGrow: 1, flexBasis: 240, maxWidth: 420, gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <Text style={{ color: mxTheme.colors.text, fontSize: 17, fontWeight: '900', flex: 1 }}>{rule.title}</Text>
        <StatusPill label="review" tone={rule.tone} />
      </View>
      <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>{rule.description}</Text>
      <Text style={{ color: rule.tone, fontSize: 11, fontWeight: '900' }}>{rule.route}</Text>
    </View>
  );
}

export function CollectorEconomyScreen() {
  const [activeTab, setActiveTab] = useState<CollectorEconomyTab>('worlds');
  const [selectedWorldId, setSelectedWorldId] = useState(COLLECTOR_WORLD_PLANS[0].id);
  const [notice, setNotice] = useState('Collector economy scaffold links marketplace worlds, seller orders, buyer approvals and sticker rewards.');
  const selectedWorld = useMemo(
    () => COLLECTOR_WORLD_PLANS.find((world) => world.id === selectedWorldId) || COLLECTOR_WORLD_PLANS[0],
    [selectedWorldId],
  );

  function renderWorlds() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Marketplace Worlds"
          subtitle="The economy now has a planning layer for vending, hamper, personal items, PPV/content, style packs, stickers and custom orders."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {COLLECTOR_WORLD_PLANS.map((world) => (
            <WorldCard
              key={world.id}
              world={world}
              active={world.id === selectedWorld.id}
              onSelect={(nextWorld) => {
                setSelectedWorldId(nextWorld.id);
                setNotice(`${nextWorld.title} selected for marketplace-world production wiring.`);
              }}
            />
          ))}
        </View>
        <View style={{ ...panelStyle(selectedWorld.tone), gap: 11 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <View style={{ flex: 1, minWidth: 220 }}>
              <Text style={{ color: selectedWorld.tone, fontSize: 11, fontWeight: '900' }}>{selectedWorld.badge} WORLD DETAIL</Text>
              <Text style={{ color: mxTheme.colors.text, fontSize: 22, fontWeight: '900', marginTop: 4 }}>{selectedWorld.title}</Text>
              <Text style={{ color: '#d7d7de', fontSize: 13, lineHeight: 19, marginTop: 5 }}>{selectedWorld.description}</Text>
            </View>
            <View style={{ minWidth: 220, gap: 6 }}>
              <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Stock rule</Text>
              <Text style={{ color: selectedWorld.tone, fontSize: 13, fontWeight: '900' }}>{selectedWorld.stockRule}</Text>
            </View>
          </View>
          <BulletList items={selectedWorld.checklist} tone={selectedWorld.tone} />
        </View>
      </View>
    );
  }

  function renderOrders() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Order Lifecycle"
          subtitle="Draft, approval, payment, preparation, fulfilment, dispute and refund states are visible as one marketplace order model."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {COLLECTOR_ORDER_STATES.map((state) => (
            <OrderStateCard key={state.id} state={state} />
          ))}
        </View>
        <View style={{ ...panelStyle('#d4af37'), gap: 8 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Buyer/Seller Handoff</Text>
          <BulletList items={COLLECTOR_ECONOMY_PIPELINE} tone="#d4af37" />
        </View>
      </View>
    );
  }

  function renderUnlocks() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Collector Rewards"
          subtitle="Item-matched stickers and collection badges can be attached to completed marketplace purchases and custom order receipts."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {COLLECTOR_UNLOCK_RULES.map((rule) => (
            <UnlockRuleCard key={rule.id} rule={rule} />
          ))}
        </View>
      </View>
    );
  }

  function renderRisk() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Marketplace Guardrails"
          subtitle="Sensitive goods, private fulfilment data, disputes and collector visibility stay explicit before production release."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {COLLECTOR_RISK_RULES.map((rule) => (
            <RiskRuleCard key={rule.id} rule={rule} />
          ))}
        </View>
      </View>
    );
  }

  function renderActiveTab() {
    if (activeTab === 'orders') return renderOrders();
    if (activeTab === 'unlocks') return renderUnlocks();
    if (activeTab === 'risk') return renderRisk();
    return renderWorlds();
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: mxTheme.colors.background }} contentContainerStyle={{ padding: mxTheme.spacing.lg, gap: mxTheme.spacing.lg }}>
      <View style={{ ...panelStyle('#d4af37'), gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <View style={{ flex: 1, minWidth: 260, gap: 6 }}>
            <Text style={{ color: '#d4af37', fontSize: 12, fontWeight: '900' }}>COLLECTOR ECONOMY</Text>
            <Text style={{ color: mxTheme.colors.text, fontSize: 30, fontWeight: '900' }}>Marketplace worlds and order flow</Text>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 14, lineHeight: 21 }}>
              Coordinate buyer approvals, seller inventory, order states, fulfilment, disputes, refunds and item-matched sticker rewards from one marketplace planning surface.
            </Text>
          </View>
          <View style={{ minWidth: 220, gap: 8 }}>
            <StatusPill label="worlds scaffolded" tone="#d4af37" />
            <StatusPill label="order states mapped" tone="#60a5fa" />
            <StatusPill label="reward rules planned" tone="#a3e635" />
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <MetricCard label="World Types" value={String(COLLECTOR_WORLD_PLANS.length)} detail="Products, content and custom orders" tone="#d4af37" />
          <MetricCard label="Order States" value={String(COLLECTOR_ORDER_STATES.length)} detail="Approval to refund lifecycle" tone="#60a5fa" />
          <MetricCard label="Unlock Rules" value={String(COLLECTOR_UNLOCK_RULES.length)} detail="Stickers and collector badges" tone="#a3e635" />
          <MetricCard label="Guardrails" value={String(COLLECTOR_RISK_RULES.length)} detail="Privacy, policy and disputes" tone="#ef4444" />
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {COLLECTOR_TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={{
                backgroundColor: active ? '#8b5cf6' : '#15151d',
                borderColor: active ? '#c084fc' : '#2a2a33',
                borderWidth: 1,
                borderRadius: 999,
                paddingVertical: 8,
                paddingHorizontal: 12,
              }}
            >
              <Text style={{ color: active ? '#fff' : '#d6d6dc', fontSize: 12, fontWeight: '900' }}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ ...panelStyle('#c084fc'), gap: 4 }}>
        <Text style={{ color: '#c084fc', fontSize: 11, fontWeight: '900' }}>CURRENT NOTE</Text>
        <Text style={{ color: '#ededf5', fontSize: 13, lineHeight: 18 }}>{notice}</Text>
      </View>

      {renderActiveTab()}
    </ScrollView>
  );
}
