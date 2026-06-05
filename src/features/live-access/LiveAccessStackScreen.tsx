import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View, type DimensionValue } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';
import {
  GAME_OVERLAY_QUEUE,
  LIVE_ACCESS_METRICS,
  LIVE_ROOM_PIPELINE,
  LIVE_ROOM_PLANS,
  LIVE_SHOW_SIDEBAR_MODULES,
  PAID_CALL_READY_ITEMS,
  SCREEN_SHARE_GUARDRAILS,
  WATCH_SESSION_PLANS,
  type Guardrail,
  type LiveAccessModule,
  type LiveAccessRoomPlan,
  type WatchSessionPlan,
} from './liveAccessModel';

type LiveAccessTab = 'rooms' | 'bookings' | 'show' | 'watch' | 'guardrails';

const LIVE_ACCESS_TABS: Array<{ id: LiveAccessTab; label: string }> = [
  { id: 'rooms', label: 'Rooms' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'show', label: 'Live Sidebar' },
  { id: 'watch', label: 'Watch Sessions' },
  { id: 'guardrails', label: 'Safety Gates' },
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
    <View style={{ backgroundColor: `${tone}1f`, borderColor: tone, borderWidth: 1, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8 }}>
      <Text style={{ color: tone, fontSize: 10, fontWeight: '900' }}>{label.toUpperCase()}</Text>
    </View>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ color: mxTheme.colors.text, fontSize: 22, fontWeight: '900' }}>{title}</Text>
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

function ActionButton({ label, tone, onPress }: { label: string; tone: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ backgroundColor: tone, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 }}>
      <Text style={{ color: '#050505', fontSize: 12, fontWeight: '900', textAlign: 'center' }}>{label}</Text>
    </Pressable>
  );
}

function ProgressBar({ value, tone }: { value: number; tone: string }) {
  const width = `${Math.max(5, Math.min(100, value))}%` as DimensionValue;

  return (
    <View style={{ height: 8, backgroundColor: '#1b1b24', borderRadius: 999, overflow: 'hidden' }}>
      <View style={{ width, height: 8, backgroundColor: tone, borderRadius: 999 }} />
    </View>
  );
}

function MetricCard({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: string }) {
  return (
    <View style={{ ...panelStyle(`${tone}66`), flex: 1, minWidth: 180, gap: 6 }}>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>{label}</Text>
      <Text style={{ color: mxTheme.colors.text, fontSize: 25, fontWeight: '900' }}>{value}</Text>
      <Text style={{ color: tone, fontSize: 12, fontWeight: '800' }}>{detail}</Text>
    </View>
  );
}

function RoomPlanCard({
  plan,
  active,
  onSelect,
}: {
  plan: LiveAccessRoomPlan;
  active: boolean;
  onSelect: (plan: LiveAccessRoomPlan) => void;
}) {
  return (
    <Pressable
      onPress={() => onSelect(plan)}
      style={{ ...panelStyle(active ? plan.tone : '#2a2a33'), flexGrow: 1, flexBasis: 230, maxWidth: 390, gap: 10 }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: plan.tone, fontSize: 12, fontWeight: '900' }}>{plan.badge}</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', marginTop: 4 }}>{plan.title}</Text>
        </View>
        <StatusPill label={plan.readiness.replace('-', ' ')} tone={plan.tone} />
      </View>
      <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>{plan.description}</Text>
      <View style={{ gap: 5 }}>
        <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Access: {plan.accessRule}</Text>
        <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Pricing: {plan.priceRule}</Text>
        <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Audience: {plan.audience}</Text>
      </View>
    </Pressable>
  );
}

function ModuleCard({ module, onPress }: { module: LiveAccessModule; onPress: (title: string) => void }) {
  return (
    <View style={{ ...panelStyle(module.tone), flexGrow: 1, flexBasis: 230, maxWidth: 380, gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: module.tone, fontSize: 12, fontWeight: '900' }}>{module.label}</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', marginTop: 4 }}>{module.title}</Text>
        </View>
        <StatusPill label={module.state} tone={module.tone} />
      </View>
      <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>{module.description}</Text>
      <BulletList items={module.checklist} tone={module.tone} />
      <ActionButton label="Mark for Provider Wiring" tone={module.tone} onPress={() => onPress(module.title)} />
    </View>
  );
}

function WatchSessionCard({
  session,
  active,
  onSelect,
}: {
  session: WatchSessionPlan;
  active: boolean;
  onSelect: (session: WatchSessionPlan) => void;
}) {
  return (
    <Pressable
      onPress={() => onSelect(session)}
      style={{ ...panelStyle(active ? session.tone : '#2a2a33'), flexGrow: 1, flexBasis: 250, maxWidth: 420, gap: 10 }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', flex: 1 }}>{session.title}</Text>
        <StatusPill label="watch" tone={session.tone} />
      </View>
      <Text style={{ color: '#d7d7de', fontSize: 12 }}>Access: {session.access}</Text>
      <Text style={{ color: '#d7d7de', fontSize: 12 }}>Schedule: {session.schedule}</Text>
      <Text style={{ color: '#d7d7de', fontSize: 12 }}>Replay: {session.replay}</Text>
      <BulletList items={session.features} tone={session.tone} />
    </Pressable>
  );
}

function GuardrailCard({ guardrail }: { guardrail: Guardrail }) {
  return (
    <View style={{ ...panelStyle(guardrail.tone), flexGrow: 1, flexBasis: 250, maxWidth: 440, gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <Text style={{ color: mxTheme.colors.text, fontSize: 17, fontWeight: '900', flex: 1 }}>{guardrail.title}</Text>
        <StatusPill label={guardrail.status} tone={guardrail.tone} />
      </View>
      <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>{guardrail.description}</Text>
    </View>
  );
}

export function LiveAccessStackScreen() {
  const [activeTab, setActiveTab] = useState<LiveAccessTab>('rooms');
  const [selectedRoomId, setSelectedRoomId] = useState(LIVE_ROOM_PLANS[0].id);
  const [selectedWatchId, setSelectedWatchId] = useState(WATCH_SESSION_PLANS[0].id);
  const [notice, setNotice] = useState('Live access stack scaffold is ready for provider and backend routing.');

  const selectedRoom = useMemo(
    () => LIVE_ROOM_PLANS.find((plan) => plan.id === selectedRoomId) || LIVE_ROOM_PLANS[0],
    [selectedRoomId],
  );
  const selectedWatch = useMemo(
    () => WATCH_SESSION_PLANS.find((session) => session.id === selectedWatchId) || WATCH_SESSION_PLANS[0],
    [selectedWatchId],
  );

  function renderRooms() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Room Modes"
          subtitle="Public, ticketed, subscription, invite-code and private rooms now have a shared planning surface before provider wiring."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {LIVE_ROOM_PLANS.map((plan) => (
            <RoomPlanCard
              key={plan.id}
              plan={plan}
              active={plan.id === selectedRoom.id}
              onSelect={(nextPlan) => {
                setSelectedRoomId(nextPlan.id);
                setNotice(`${nextPlan.title} selected for access-gate planning.`);
              }}
            />
          ))}
        </View>
        <View style={{ ...panelStyle(selectedRoom.tone), gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <View style={{ flex: 1, minWidth: 220 }}>
              <Text style={{ color: selectedRoom.tone, fontSize: 12, fontWeight: '900' }}>{selectedRoom.badge} ROOM DETAIL</Text>
              <Text style={{ color: mxTheme.colors.text, fontSize: 22, fontWeight: '900', marginTop: 4 }}>{selectedRoom.title}</Text>
              <Text style={{ color: '#d7d7de', fontSize: 13, lineHeight: 19, marginTop: 6 }}>{selectedRoom.description}</Text>
            </View>
            <View style={{ minWidth: 190, gap: 6 }}>
              <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Capacity</Text>
              <Text style={{ color: mxTheme.colors.text, fontSize: 16, fontWeight: '900' }}>{selectedRoom.capacity}</Text>
              <Text style={{ color: mxTheme.colors.muted, fontSize: 11, marginTop: 4 }}>Access Rule</Text>
              <Text style={{ color: selectedRoom.tone, fontSize: 13, fontWeight: '900' }}>{selectedRoom.accessRule}</Text>
            </View>
          </View>
          <BulletList items={selectedRoom.checklist} tone={selectedRoom.tone} />
          <ActionButton label="Queue Access Gate Wiring" tone={selectedRoom.tone} onPress={() => setNotice(`${selectedRoom.title} is queued for backend access-gate wiring.`)} />
        </View>
      </View>
    );
  }

  function renderBookings() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Paid Call Booking Readiness"
          subtitle="The existing bookings screen remains the transaction surface; this layer tracks timers, reminders, extensions and pre-authorized access."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {PAID_CALL_READY_ITEMS.map((item) => (
            <ModuleCard key={item.id} module={item} onPress={(title) => setNotice(`${title} added to the paid-call provider handoff.`)} />
          ))}
        </View>
        <View style={{ ...panelStyle('#22c55e'), gap: 10 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Session Meter</Text>
          <ProgressBar value={66} tone="#22c55e" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {['Pre-authorize wallet', 'Start timer', 'Offer extension', 'Settle receipt', 'Release unused hold'].map((step) => (
              <View key={step} style={{ backgroundColor: '#141a16', borderColor: '#22c55e55', borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 9 }}>
                <Text style={{ color: '#d7fbe6', fontSize: 11, fontWeight: '800' }}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  function renderLiveShowSidebar() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Live Show Sidebar"
          subtitle="Paid chat, micro-gifts, requests, goal bars, supporter boards, moderation and replay unlocks are grouped for the host live-room cockpit."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {LIVE_SHOW_SIDEBAR_MODULES.map((module) => (
            <ModuleCard key={module.id} module={module} onPress={(title) => setNotice(`${title} is marked as a live-sidebar production hook.`)} />
          ))}
        </View>
        <View style={{ ...panelStyle('#d4af37'), gap: 10 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Supporter Board Prototype</Text>
          {['Top supporter', 'Fastest micro-gift', 'Goal closer'].map((label, index) => (
            <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <Text style={{ color: '#ddd', fontSize: 12 }}>{label}</Text>
              <Text style={{ color: '#d4af37', fontSize: 12, fontWeight: '900' }}>Rank {index + 1}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  function renderWatchSessions() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Watch With Mistress"
          subtitle="Synchronized viewing, commentary, paid access, reactions, replay rules and live game overlays are shaped here before media-provider integration."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {WATCH_SESSION_PLANS.map((session) => (
            <WatchSessionCard
              key={session.id}
              session={session}
              active={session.id === selectedWatch.id}
              onSelect={(nextSession) => {
                setSelectedWatchId(nextSession.id);
                setNotice(`${nextSession.title} selected for watch-session routing.`);
              }}
            />
          ))}
        </View>
        <View style={{ ...panelStyle(selectedWatch.tone), gap: 10 }}>
          <Text style={{ color: selectedWatch.tone, fontSize: 12, fontWeight: '900' }}>SELECTED WATCH SESSION</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 20, fontWeight: '900' }}>{selectedWatch.title}</Text>
          <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>{selectedWatch.access}</Text>
          <ProgressBar value={48} tone={selectedWatch.tone} />
          <Text style={{ color: mxTheme.colors.muted, fontSize: 12 }}>Next production step: bind synchronized media state to chat, reactions and replay entitlement checks.</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {GAME_OVERLAY_QUEUE.map((game) => (
            <View key={game.id} style={{ ...panelStyle(game.tone), flexGrow: 1, flexBasis: 210, maxWidth: 360, gap: 7 }}>
              <Text style={{ color: game.tone, fontSize: 12, fontWeight: '900' }}>{game.source}</Text>
              <Text style={{ color: mxTheme.colors.text, fontSize: 17, fontWeight: '900' }}>{game.title}</Text>
              <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>{game.liveUse}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  function renderGuardrails() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Consent and Screen-share Guardrails"
          subtitle="Screen-share watch sessions stay framed as opt-in, revocable, policy-reviewed experiences with no credential or payment-data sharing."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {SCREEN_SHARE_GUARDRAILS.map((guardrail) => (
            <GuardrailCard key={guardrail.id} guardrail={guardrail} />
          ))}
        </View>
        <View style={{ ...panelStyle('#f5c542'), gap: 10 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Live Room Pipeline</Text>
          <BulletList items={LIVE_ROOM_PIPELINE} tone="#f5c542" />
          <ActionButton label="Send Pipeline to Production Backlog" tone="#f5c542" onPress={() => setNotice('Live room pipeline is noted for backend, websocket, replay and audit implementation.')} />
        </View>
      </View>
    );
  }

  function renderActiveTab() {
    if (activeTab === 'bookings') return renderBookings();
    if (activeTab === 'show') return renderLiveShowSidebar();
    if (activeTab === 'watch') return renderWatchSessions();
    if (activeTab === 'guardrails') return renderGuardrails();
    return renderRooms();
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: mxTheme.colors.background }} contentContainerStyle={{ padding: mxTheme.spacing.lg, gap: mxTheme.spacing.lg }}>
      <View style={{ ...panelStyle('#ef4444'), gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, minWidth: 260, gap: 6 }}>
            <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '900' }}>LIVE ACCESS STACK</Text>
            <Text style={{ color: mxTheme.colors.text, fontSize: 30, fontWeight: '900' }}>Rooms, paid calls and watch sessions</Text>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 14, lineHeight: 21 }}>
              Coordinate live rooms, paid bookings, chat monetisation, synchronized watch sessions, replay rules and consent gates from one operational surface.
            </Text>
          </View>
          <View style={{ minWidth: 210, gap: 8 }}>
            <StatusPill label="scaffold" tone="#ef4444" />
            <StatusPill label="wallet preauth planned" tone="#22c55e" />
            <StatusPill label="policy gates visible" tone="#f5c542" />
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {LIVE_ACCESS_METRICS.map((metric) => (
            <MetricCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} tone={metric.tone} />
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {LIVE_ACCESS_TABS.map((tab) => {
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
