import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  dispatchHostedQuizOverlaySnapshot,
  loadGameHubSummary,
  loadHostedQuizAdminDiagnostics,
  type HostedQuizAdminDiagnosticsResponse,
  type HostedQuizDiagnosticsFilterInput,
} from '../../api/gameHubApi';
import { subscribeHostedQuizOverlay, subscribeReactionRoomOverlay, type HostedQuizOverlaySocketStatus } from '../../api/gameHubSocket';
import { mxTheme } from '../../theme/mxTheme';
import {
  buildHostedQuizDiagnosticsPresentation,
  formatGameHubSmokeTargetEvidence,
  formatHostedQuizEntryLabel,
  hostedQuizDiagnosticsActionLabel,
  overlayDispatchActionLabel,
} from './gameHubDashboardPresentation';
import {
  EMOJI_REACTION_MODES,
  GAME_HISTORY_EVENTS,
  GAME_HUB_BROWSER_SMOKE_TARGETS,
  GAME_HUB_METRICS,
  GAME_HUB_PLANS,
  GAME_HUB_TABS,
  GAME_IMPORT_ADAPTERS,
  HOSTED_QUIZ_STAGES,
  LIVE_GAME_OVERLAYS,
  type EmojiReactionMode,
  type GameHistoryEvent,
  type GameHubBrowserSmokeTarget,
  type GameHubHostedQuizRecord,
  type GameHubReactionRoundSnapshot,
  type GameHubReactionRoomRecord,
  type GameHubSummary,
  type GameHubPlan,
  type GameHubQuizImportRecord,
  type GameHubTab,
  type GameImportAdapter,
  type HostedQuizStage,
  type HostedQuizOverlaySnapshot,
  type LiveGameOverlayPlan,
} from './gameHubModel';

type OverlaySocketState = {
  status: HostedQuizOverlaySocketStatus;
  roomId?: string;
  detail: string;
  lastEventAt?: string;
};

const HOSTED_QUIZ_DIAGNOSTICS_FILTERS: Array<{ label: string; filters: HostedQuizDiagnosticsFilterInput }> = [
  { label: 'All receipts', filters: {} },
  { label: 'Live-room', filters: { eventName: 'room:game_overlay_snapshot', receiptLimit: 25 } },
  { label: 'Broadcast', filters: { channel: 'broadcast', receiptLimit: 25 } },
  { label: 'Client', filters: { channel: 'client', receiptLimit: 25 } },
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

function entryFeeLabel(entryFeeCredits?: number) {
  const amount = Number(entryFeeCredits || 0);
  return amount > 0 ? `${amount.toFixed(2)} credits entry` : 'free entry';
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

function SmokeTargetRow({ target }: { target: GameHubBrowserSmokeTarget }) {
  return (
    <View style={{ borderTopColor: '#24242c', borderTopWidth: 1, paddingTop: 10, gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 210 }}>
          <Text style={{ color: target.tone, fontSize: 11, fontWeight: '900' }}>{target.route}</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 16, fontWeight: '900', marginTop: 2 }}>{target.title}</Text>
        </View>
        <StatusPill label={target.status} tone={target.tone} />
      </View>
      <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>{target.checkpoint}</Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11, lineHeight: 16 }}>{formatGameHubSmokeTargetEvidence(target)}</Text>
    </View>
  );
}

function upsertOverlaySnapshot(list: HostedQuizOverlaySnapshot[], snapshot: HostedQuizOverlaySnapshot) {
  const exists = list.some((item) => item.id === snapshot.id);
  if (!exists) return [snapshot, ...list];
  return list.map((item) => (item.id === snapshot.id ? snapshot : item));
}

function upsertReactionSnapshot(list: GameHubReactionRoundSnapshot[], snapshot: GameHubReactionRoundSnapshot) {
  const exists = list.some((item) => item.id === snapshot.id);
  if (!exists) return [snapshot, ...list].slice(0, 6);
  return list.map((item) => (item.id === snapshot.id ? snapshot : item));
}

function reactionOverlayRoomId(roomId: string | undefined) {
  return roomId ? `reaction-room:${roomId}` : undefined;
}

function formatSocketTimestamp(value?: string) {
  if (!value) return 'waiting';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleTimeString();
}

function GamePlanCard({
  plan,
  active,
  onSelect,
}: {
  plan: GameHubPlan;
  active: boolean;
  onSelect: (plan: GameHubPlan) => void;
}) {
  return (
    <Pressable onPress={() => onSelect(plan)} style={{ ...panelStyle(active ? plan.tone : '#2a2a33'), flexGrow: 1, flexBasis: 250, maxWidth: 430, gap: 9 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: plan.tone, fontSize: 11, fontWeight: '900' }}>{plan.badge}</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', marginTop: 3 }}>{plan.title}</Text>
        </View>
        <StatusPill label={plan.status} tone={plan.tone} />
      </View>
      <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>{plan.summary}</Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Audience: {plan.audience}</Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Timing: {plan.timing}</Text>
    </Pressable>
  );
}

function AdapterCard({
  adapter,
  active,
  onSelect,
}: {
  adapter: GameImportAdapter;
  active: boolean;
  onSelect: (adapter: GameImportAdapter) => void;
}) {
  return (
    <Pressable onPress={() => onSelect(adapter)} style={{ ...panelStyle(active ? adapter.tone : '#2a2a33'), flexGrow: 1, flexBasis: 230, maxWidth: 390, gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: adapter.tone, fontSize: 11, fontWeight: '900' }}>{adapter.provider}</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 17, fontWeight: '900', marginTop: 3 }}>{adapter.title}</Text>
        </View>
        <StatusPill label={adapter.status} tone={adapter.tone} />
      </View>
      <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>{adapter.inputRule}</Text>
    </Pressable>
  );
}

function HostedQuizStageCard({ stage }: { stage: HostedQuizStage }) {
  return (
    <View style={{ ...panelStyle(stage.tone), flexGrow: 1, flexBasis: 200, maxWidth: 340, gap: 7 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <Text style={{ color: mxTheme.colors.text, fontSize: 17, fontWeight: '900', flex: 1 }}>{stage.label}</Text>
        <StatusPill label={stage.owner} tone={stage.tone} />
      </View>
      <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>{stage.detail}</Text>
    </View>
  );
}

function ReactionModeCard({ mode }: { mode: EmojiReactionMode }) {
  return (
    <View style={{ ...panelStyle(mode.tone), flexGrow: 1, flexBasis: 240, maxWidth: 420, gap: 8 }}>
      <Text style={{ color: mode.tone, fontSize: 11, fontWeight: '900' }}>REACTION MODE</Text>
      <Text style={{ color: mxTheme.colors.text, fontSize: 17, fontWeight: '900' }}>{mode.title}</Text>
      <Text style={{ color: '#ddd', fontSize: 12, lineHeight: 18 }}>Room: {mode.roomRule}</Text>
      <Text style={{ color: '#ddd', fontSize: 12, lineHeight: 18 }}>Score: {mode.scoring}</Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11, lineHeight: 16 }}>{mode.timing}</Text>
      <Text style={{ color: mode.tone, fontSize: 11, fontWeight: '900' }}>{mode.accessibility}</Text>
    </View>
  );
}

function ReactionRoomBacklogRow({ room }: { room: GameHubReactionRoomRecord }) {
  return (
    <View style={{ borderTopColor: '#24242c', borderTopWidth: 1, paddingTop: 11, gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <View style={{ flex: 1, minWidth: 190 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 16, fontWeight: '900' }}>{room.title}</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, marginTop: 2 }}>Room {room.roomCode} / target {room.targetReaction}</Text>
        </View>
        <StatusPill label={room.status} tone="#f472b6" />
      </View>
      <Text style={{ color: '#f472b6', fontSize: 12, fontWeight: '900' }}>
        {room.participantCount} players / {room.scoreCount} scores
      </Text>
      <Text style={{ color: room.entryFeeCredits > 0 ? '#d4af37' : mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>
        {entryFeeLabel(room.entryFeeCredits)} / entitlement checked on join
      </Text>
      <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>
        {room.prompt || 'Reaction round ready'} / {room.roundDurationSeconds}s window
      </Text>
    </View>
  );
}

function OverlayCard({ overlay }: { overlay: LiveGameOverlayPlan }) {
  return (
    <View style={{ ...panelStyle(overlay.tone), flexGrow: 1, flexBasis: 225, maxWidth: 380, gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <Text style={{ color: mxTheme.colors.text, fontSize: 17, fontWeight: '900', flex: 1 }}>{overlay.title}</Text>
        <StatusPill label={overlay.state} tone={overlay.tone} />
      </View>
      <Text style={{ color: '#ddd', fontSize: 12, lineHeight: 18 }}>Route: {overlay.route}</Text>
      <Text style={{ color: '#ddd', fontSize: 12, lineHeight: 18 }}>Trigger: {overlay.trigger}</Text>
      <Text style={{ color: overlay.tone, fontSize: 11, fontWeight: '900' }}>{overlay.payoutOrResult}</Text>
    </View>
  );
}

function OverlaySocketStatusPanel({
  state,
  title = 'OVERLAY SOCKET',
  emptyLabel = 'No hosted quiz room',
}: {
  state: OverlaySocketState;
  title?: string;
  emptyLabel?: string;
}) {
  const tone = state.status === 'connected' ? '#1D9E75' : state.status === 'error' ? '#ef4444' : '#60a5fa';

  return (
    <View style={{ ...panelStyle(tone), gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 210 }}>
          <Text style={{ color: tone, fontSize: 11, fontWeight: '900' }}>{title}</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 17, fontWeight: '900', marginTop: 3 }}>{state.roomId || emptyLabel}</Text>
        </View>
        <StatusPill label={state.status} tone={tone} />
      </View>
      <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>{state.detail}</Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Last event: {formatSocketTimestamp(state.lastEventAt)}</Text>
    </View>
  );
}

function OverlayDiagnosticsPanel({
  diagnostics,
  receipts = [],
}: {
  diagnostics?: GameHubSummary['overlayDeliveryDiagnostics'];
  receipts?: GameHubSummary['overlaySocketReceipts'];
}) {
  if (!diagnostics && receipts.length === 0) return null;
  const latest = receipts[0];
  const tone = diagnostics?.failedCount ? '#f97316' : '#1D9E75';

  return (
    <View style={{ ...panelStyle(tone), gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 210 }}>
          <Text style={{ color: tone, fontSize: 11, fontWeight: '900' }}>DELIVERY RECEIPTS</Text>
          <Text style={{ color: mxTheme.colors.text, fontSize: 17, fontWeight: '900', marginTop: 3 }}>
            {diagnostics?.totalReceipts || 0} recent receipts
          </Text>
        </View>
        <StatusPill label={diagnostics?.latestStatus || 'waiting'} tone={tone} />
      </View>
      <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>
        {diagnostics?.emittedCount || 0} emitted / {diagnostics?.joinedCount || 0} joined / {diagnostics?.failedCount || 0} failed
      </Text>
      {latest ? (
        <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>
          Latest {latest.eventName} from {latest.source} at {formatSocketTimestamp(latest.createdAt)}
        </Text>
      ) : null}
    </View>
  );
}

function OverlaySnapshotRow({
  snapshot,
  live,
  dispatching,
  onDispatch,
}: {
  snapshot: HostedQuizOverlaySnapshot;
  live: boolean;
  dispatching: boolean;
  onDispatch: (snapshot: HostedQuizOverlaySnapshot) => void;
}) {
  const leaderLabel = snapshot.leader ? `${snapshot.leader.playerId} / ${snapshot.leader.score} pts` : 'No scores yet';

  return (
    <View style={{ borderTopColor: '#24242c', borderTopWidth: 1, paddingTop: 11, gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <View style={{ flex: 1, minWidth: 190 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 16, fontWeight: '900' }}>{snapshot.quizTitle}</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, marginTop: 2 }}>Topic {snapshot.liveRoomEvent.topic}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <StatusPill label={live ? 'live socket' : snapshot.status} tone={live ? '#1D9E75' : '#60a5fa'} />
          <Pressable
            disabled={dispatching}
            onPress={() => onDispatch(snapshot)}
            style={{
              backgroundColor: dispatching ? '#60a5fa22' : '#60a5fa',
              borderColor: '#60a5fa',
              borderWidth: 1,
              borderRadius: mxTheme.radius.sm,
              paddingHorizontal: 10,
              paddingVertical: 6,
              minWidth: 96,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: dispatching ? '#60a5fa' : '#081018', fontSize: 11, fontWeight: '900' }}>{overlayDispatchActionLabel(dispatching)}</Text>
          </Pressable>
        </View>
      </View>
      <Text style={{ color: '#60a5fa', fontSize: 12, fontWeight: '900' }}>{leaderLabel}</Text>
      <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>
        {snapshot.playerCount} players / {snapshot.answerCount} answers / play code {snapshot.playCode}
      </Text>
      {snapshot.currentQuestion ? (
        <Text style={{ color: mxTheme.colors.muted, fontSize: 11, lineHeight: 16 }}>
          Current: {snapshot.currentQuestion.prompt} ({snapshot.currentQuestion.answeredCount} answered)
        </Text>
      ) : null}
    </View>
  );
}

function ReactionSnapshotRow({
  snapshot,
  live,
}: {
  snapshot: GameHubReactionRoundSnapshot;
  live: boolean;
}) {
  const leaderLabel = snapshot.leader
    ? `${snapshot.leader.playerId} / ${snapshot.leader.score} pts / ${snapshot.leader.correct} correct`
    : 'No reactions scored yet';

  return (
    <View style={{ borderTopColor: '#24242c', borderTopWidth: 1, paddingTop: 11, gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <View style={{ flex: 1, minWidth: 190 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 16, fontWeight: '900' }}>Reaction room {snapshot.roomCode}</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, marginTop: 2 }}>Topic {snapshot.liveRoomEvent.topic}</Text>
        </View>
        <StatusPill label={live ? 'live socket' : snapshot.status} tone={live ? '#1D9E75' : '#f472b6'} />
      </View>
      <Text style={{ color: '#f472b6', fontSize: 12, fontWeight: '900' }}>{leaderLabel}</Text>
      <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>
        {snapshot.participantCount} players / {snapshot.scoreCount} scores / target {snapshot.targetReaction}
      </Text>
      {snapshot.prompt ? (
        <Text style={{ color: mxTheme.colors.muted, fontSize: 11, lineHeight: 16 }}>Prompt: {snapshot.prompt}</Text>
      ) : null}
    </View>
  );
}

function HistoryRow({ event }: { event: GameHistoryEvent }) {
  return (
    <View style={{ borderTopColor: '#24242c', borderTopWidth: 1, paddingTop: 11, gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <View style={{ flex: 1, minWidth: 190 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 16, fontWeight: '900' }}>{event.title}</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, marginTop: 2 }}>{event.actor}</Text>
        </View>
        <StatusPill label={event.status} tone={event.tone} />
      </View>
      <Text style={{ color: event.tone, fontSize: 12, fontWeight: '900' }}>{event.result}</Text>
      <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>{event.detail}</Text>
    </View>
  );
}

function HostedQuizDiagnosticsPanel({
  diagnostics,
  filtering,
  onApplyFilter,
}: {
  diagnostics: HostedQuizAdminDiagnosticsResponse;
  filtering: boolean;
  onApplyFilter: (filters: HostedQuizDiagnosticsFilterInput) => void;
}) {
  const presentation = buildHostedQuizDiagnosticsPresentation(diagnostics);

  return (
    <View style={{ borderTopColor: '#3a2b4e', borderTopWidth: 1, paddingTop: 9, gap: 9 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <View style={{ flex: 1, minWidth: 150 }}>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 10, fontWeight: '900' }}>ENTRIES</Text>
          <Text style={{ color: '#c084fc', fontSize: 15, fontWeight: '900', marginTop: 2 }}>{presentation.entriesSummary}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 150 }}>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 10, fontWeight: '900' }}>RECEIPTS</Text>
          <Text style={{ color: '#60a5fa', fontSize: 15, fontWeight: '900', marginTop: 2 }}>{presentation.receiptsSummary}</Text>
        </View>
      </View>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11, lineHeight: 16 }}>{presentation.filterSummary}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
        {HOSTED_QUIZ_DIAGNOSTICS_FILTERS.map((filter) => (
          <Pressable
            key={filter.label}
            disabled={filtering}
            onPress={() => onApplyFilter(filter.filters)}
            style={{
              backgroundColor: filtering ? '#2a2035' : '#18151f',
              borderColor: '#3a2b4e',
              borderWidth: 1,
              borderRadius: mxTheme.radius.sm,
              paddingHorizontal: 9,
              paddingVertical: 6,
            }}
          >
            <Text style={{ color: filtering ? mxTheme.colors.muted : '#c084fc', fontSize: 10, fontWeight: '900' }}>{filter.label}</Text>
          </Pressable>
        ))}
      </View>
      {presentation.entryRows.length > 0 ? (
        <View style={{ gap: 5 }}>
          {presentation.entryRows.map((entryRow) => (
            <Text key={entryRow} style={{ color: '#d7d7de', fontSize: 11, lineHeight: 16 }}>
              {entryRow}
            </Text>
          ))}
        </View>
      ) : (
        <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>{presentation.emptyEntryText}</Text>
      )}
      {presentation.receiptRows.length > 0 ? (
        <View style={{ gap: 5 }}>
          {presentation.receiptRows.map((receiptRow) => (
            <Text key={receiptRow} style={{ color: '#d7d7de', fontSize: 11, lineHeight: 16 }}>
              {receiptRow}
            </Text>
          ))}
        </View>
      ) : (
        <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>{presentation.emptyReceiptText}</Text>
      )}
    </View>
  );
}

function HostedQuizBacklogRow({
  quiz,
  diagnostics,
  diagnosticsLoading,
  onLoadDiagnostics,
}: {
  quiz: GameHubHostedQuizRecord;
  diagnostics?: HostedQuizAdminDiagnosticsResponse;
  diagnosticsLoading: boolean;
  onLoadDiagnostics: (quiz: GameHubHostedQuizRecord, filters?: HostedQuizDiagnosticsFilterInput) => void;
}) {
  const tone = quiz.status === 'published' ? '#1D9E75' : '#c084fc';

  return (
    <View style={{ borderTopColor: '#24242c', borderTopWidth: 1, paddingTop: 11, gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <View style={{ flex: 1, minWidth: 190 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 16, fontWeight: '900' }}>{quiz.title}</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, marginTop: 2 }}>Play code {quiz.playCode || 'pending'}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <StatusPill label={quiz.status} tone={tone} />
          <Pressable
            disabled={diagnosticsLoading}
            onPress={() => onLoadDiagnostics(quiz)}
            style={{
              backgroundColor: diagnosticsLoading ? '#c084fc22' : '#c084fc',
              borderColor: '#c084fc',
              borderWidth: 1,
              borderRadius: mxTheme.radius.sm,
              paddingHorizontal: 10,
              paddingVertical: 6,
              minWidth: 104,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: diagnosticsLoading ? '#c084fc' : '#100818', fontSize: 11, fontWeight: '900' }}>
              {hostedQuizDiagnosticsActionLabel({ loading: diagnosticsLoading, hasDiagnostics: Boolean(diagnostics) })}
            </Text>
          </Pressable>
        </View>
      </View>
      <Text style={{ color: tone, fontSize: 12, fontWeight: '900' }}>
        {formatHostedQuizEntryLabel(quiz)}
      </Text>
      <Text style={{ color: quiz.entryFeeCredits > 0 ? '#d4af37' : mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>
        {entryFeeLabel(quiz.entryFeeCredits)} / entitlement checked on first answer
      </Text>
      <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>
        Source {quiz.sourceImportId ? `import ${quiz.sourceImportId}` : 'manual builder'} / updated {new Date(quiz.updatedAt).toLocaleString()}
      </Text>
      {diagnostics ? (
        <HostedQuizDiagnosticsPanel
          diagnostics={diagnostics}
          filtering={diagnosticsLoading}
          onApplyFilter={(filters) => onLoadDiagnostics(quiz, filters)}
        />
      ) : null}
    </View>
  );
}

function ImportBacklogRow({ importDraft }: { importDraft: GameHubQuizImportRecord }) {
  const createdAt = new Date(importDraft.createdAt);
  const createdLabel = Number.isNaN(createdAt.getTime()) ? importDraft.createdAt : createdAt.toLocaleString();

  return (
    <View style={{ borderTopColor: '#24242c', borderTopWidth: 1, paddingTop: 10, gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
        <View style={{ flex: 1, minWidth: 190 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 15, fontWeight: '900' }}>{importDraft.title}</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, marginTop: 2 }}>{importDraft.provider} - {createdLabel}</Text>
        </View>
        <StatusPill label={importDraft.status.replace(/_/g, ' ')} tone="#60a5fa" />
      </View>
      <Text style={{ color: '#60a5fa', fontSize: 12, fontWeight: '900' }}>{importDraft.questionCount} questions - {importDraft.internalQuizId}</Text>
      <Text style={{ color: '#d7d7de', fontSize: 12, lineHeight: 18 }}>{importDraft.debugTrail.slice(0, 3).join(' / ')}</Text>
    </View>
  );
}

export function GameHubScreen() {
  const [activeTab, setActiveTab] = useState<GameHubTab>('available');
  const [selectedGameId, setSelectedGameId] = useState(GAME_HUB_PLANS[0].id);
  const [selectedAdapterId, setSelectedAdapterId] = useState(GAME_IMPORT_ADAPTERS[0].id);
  const [notice, setNotice] = useState('Game hub scaffold links quiz import, hosted quizzes, reaction rooms, live overlays and history logs.');
  const [summary, setSummary] = useState<GameHubSummary | null>(null);
  const [syncState, setSyncState] = useState<'loading' | 'live' | 'fallback'>('loading');
  const [liveOverlaySnapshots, setLiveOverlaySnapshots] = useState<HostedQuizOverlaySnapshot[]>([]);
  const [liveReactionSnapshots, setLiveReactionSnapshots] = useState<GameHubReactionRoundSnapshot[]>([]);
  const [overlaySocketState, setOverlaySocketState] = useState<OverlaySocketState>({
    status: 'idle',
    detail: 'Waiting for a published hosted quiz overlay.',
  });
  const [reactionSocketState, setReactionSocketState] = useState<OverlaySocketState>({
    status: 'idle',
    detail: 'Waiting for a reaction room score feed.',
  });
  const [dispatchingOverlayId, setDispatchingOverlayId] = useState<string | null>(null);
  const [hostedQuizDiagnostics, setHostedQuizDiagnostics] = useState<Record<string, HostedQuizAdminDiagnosticsResponse>>({});
  const [diagnosticsLoadingQuizId, setDiagnosticsLoadingQuizId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    loadGameHubSummary()
      .then((nextSummary) => {
        if (!mounted) return;
        setSummary(nextSummary);
        setSyncState('live');
        setNotice(`Backend Game Hub summary synced ${new Date(nextSummary.generatedAt).toLocaleString()}.`);
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        setSyncState('fallback');
        const message = error instanceof Error ? error.message : 'API unavailable';
        setNotice(`Static fallback active until the Game Hub API is reachable. ${message}`);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const plans = summary?.plans?.length ? summary.plans : GAME_HUB_PLANS;
  const metrics = summary?.metrics?.length ? summary.metrics : GAME_HUB_METRICS;
  const adapters = summary?.importAdapters?.length ? summary.importAdapters : GAME_IMPORT_ADAPTERS;
  const stages = summary?.hostedQuizStages?.length ? summary.hostedQuizStages : HOSTED_QUIZ_STAGES;
  const reactionModes = summary?.reactionModes?.length ? summary.reactionModes : EMOJI_REACTION_MODES;
  const overlays = summary?.liveOverlays?.length ? summary.liveOverlays : LIVE_GAME_OVERLAYS;
  const historyEvents = summary?.historyEvents?.length ? summary.historyEvents : GAME_HISTORY_EVENTS;
  const favouriteSource = summary?.favourites?.length ? summary.favourites : plans.filter((plan) => plan.favorite);
  const hostedQuizBacklog = summary?.hostedQuizBacklog?.length ? summary.hostedQuizBacklog : [];
  const summaryOverlayScoreSnapshots = summary?.overlayScoreSnapshots?.length ? summary.overlayScoreSnapshots : [];
  const overlayScoreSnapshots = liveOverlaySnapshots.length ? liveOverlaySnapshots : summaryOverlayScoreSnapshots;
  const primaryOverlayRoomId = overlayScoreSnapshots[0]?.overlayId;
  const reactionRoomBacklog = summary?.reactionRoomBacklog?.length ? summary.reactionRoomBacklog : [];
  const primaryReactionOverlayRoomId = reactionOverlayRoomId(reactionRoomBacklog[0]?.id);
  const quizImportBacklog = summary?.quizImportBacklog || [];
  const smokeTargets = summary?.browserSmokeTargets?.length ? summary.browserSmokeTargets : GAME_HUB_BROWSER_SMOKE_TARGETS;

  const selectedGame = useMemo(
    () => plans.find((plan) => plan.id === selectedGameId) || plans[0] || GAME_HUB_PLANS[0],
    [plans, selectedGameId],
  );
  const selectedAdapter = useMemo(
    () => adapters.find((adapter) => adapter.id === selectedAdapterId) || adapters[0] || GAME_IMPORT_ADAPTERS[0],
    [adapters, selectedAdapterId],
  );

  useEffect(() => {
    if (!plans.some((plan) => plan.id === selectedGameId)) {
      setSelectedGameId(plans[0]?.id || GAME_HUB_PLANS[0].id);
    }
  }, [plans, selectedGameId]);

  useEffect(() => {
    if (!adapters.some((adapter) => adapter.id === selectedAdapterId)) {
      setSelectedAdapterId(adapters[0]?.id || GAME_IMPORT_ADAPTERS[0].id);
    }
  }, [adapters, selectedAdapterId]);

  useEffect(() => {
    setLiveOverlaySnapshots(summaryOverlayScoreSnapshots);
  }, [summary?.generatedAt]);

  useEffect(() => {
    if (!primaryOverlayRoomId) {
      setOverlaySocketState({
        status: 'idle',
        detail: 'Waiting for a published hosted quiz overlay.',
      });
      return undefined;
    }

    setOverlaySocketState({
      status: 'connecting',
      roomId: primaryOverlayRoomId,
      detail: 'Joining hosted quiz overlay room.',
    });

    const subscription = subscribeHostedQuizOverlay({
      roomId: primaryOverlayRoomId,
      onStatus: (status, detail) => {
        setOverlaySocketState((current) => ({
          ...current,
          status,
          roomId: primaryOverlayRoomId,
          detail: detail || current.detail,
        }));
      },
      onSnapshot: (event) => {
        setLiveOverlaySnapshots((current) => upsertOverlaySnapshot(current, event.snapshot));
        setOverlaySocketState({
          status: 'connected',
          roomId: event.roomId,
          detail: `Snapshot received for ${event.snapshot.quizTitle}.`,
          lastEventAt: event.emittedAt,
        });
        setNotice(`Hosted quiz overlay updated from socket ${formatSocketTimestamp(event.emittedAt)}.`);
      },
    });

    return () => subscription.close();
  }, [primaryOverlayRoomId]);

  useEffect(() => {
    if (!primaryReactionOverlayRoomId) {
      setLiveReactionSnapshots([]);
      setReactionSocketState({
        status: 'idle',
        detail: 'Waiting for a reaction room score feed.',
      });
      return undefined;
    }

    setReactionSocketState({
      status: 'connecting',
      roomId: primaryReactionOverlayRoomId,
      detail: 'Joining reaction-room overlay room.',
    });

    const subscription = subscribeReactionRoomOverlay({
      roomId: primaryReactionOverlayRoomId,
      onStatus: (status, detail) => {
        setReactionSocketState((current) => ({
          ...current,
          status,
          roomId: primaryReactionOverlayRoomId,
          detail: detail || current.detail,
        }));
      },
      onSnapshot: (event) => {
        setLiveReactionSnapshots((current) => upsertReactionSnapshot(current, event.snapshot));
        setReactionSocketState({
          status: 'connected',
          roomId: event.roomId,
          detail: `Reaction score received for ${event.snapshot.roomCode}.`,
          lastEventAt: event.emittedAt,
        });
        setNotice(`Reaction-room overlay updated from socket ${formatSocketTimestamp(event.emittedAt)}.`);
      },
    });

    return () => subscription.close();
  }, [primaryReactionOverlayRoomId]);

  async function handleDispatchOverlaySnapshot(snapshot: HostedQuizOverlaySnapshot) {
    setDispatchingOverlayId(snapshot.id);
    try {
      const response = await dispatchHostedQuizOverlaySnapshot(snapshot.quizId, snapshot.overlayId);
      setLiveOverlaySnapshots((current) => upsertOverlaySnapshot(current, response.snapshot));
      setOverlaySocketState((current) => ({
        ...current,
        roomId: response.roomId,
        detail: response.dispatched ? `Snapshot dispatched to ${response.roomId}.` : 'Snapshot refreshed; socket gateway did not report a dispatch.',
        lastEventAt: response.socketEvent?.emittedAt || current.lastEventAt,
      }));
      setNotice(`Hosted quiz overlay dispatched to ${response.roomId}.`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Overlay dispatch failed';
      setNotice(`Hosted quiz overlay dispatch failed. ${message}`);
    } finally {
      setDispatchingOverlayId(null);
    }
  }

  async function handleLoadHostedQuizDiagnostics(
    quiz: GameHubHostedQuizRecord,
    filters: HostedQuizDiagnosticsFilterInput = {},
  ) {
    setDiagnosticsLoadingQuizId(quiz.id);
    try {
      const diagnostics = await loadHostedQuizAdminDiagnostics(quiz.id, filters);
      setHostedQuizDiagnostics((current) => ({
        ...current,
        [quiz.id]: diagnostics,
      }));
      setNotice(`Hosted quiz diagnostics refreshed for ${diagnostics.title}.`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Diagnostics unavailable';
      setNotice(`Hosted quiz diagnostics failed for ${quiz.title}. ${message}`);
    } finally {
      setDiagnosticsLoadingQuizId(null);
    }
  }

  function renderAvailable() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Available Games"
          subtitle="Imported quizzes, hosted quiz nights, reaction rooms, live overlays and history lanes are grouped into one launch surface."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {plans.map((plan) => (
            <GamePlanCard
              key={plan.id}
              plan={plan}
              active={plan.id === selectedGame.id}
              onSelect={(nextPlan) => {
                setSelectedGameId(nextPlan.id);
                setNotice(`${nextPlan.title} selected for production wiring.`);
              }}
            />
          ))}
        </View>
        <View style={{ ...panelStyle(selectedGame.tone), gap: 11 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <View style={{ flex: 1, minWidth: 220 }}>
              <Text style={{ color: selectedGame.tone, fontSize: 11, fontWeight: '900' }}>{selectedGame.badge} PRODUCTION PATH</Text>
              <Text style={{ color: mxTheme.colors.text, fontSize: 22, fontWeight: '900', marginTop: 4 }}>{selectedGame.title}</Text>
              <Text style={{ color: '#d7d7de', fontSize: 13, lineHeight: 19, marginTop: 5 }}>{selectedGame.summary}</Text>
            </View>
            <View style={{ minWidth: 220, gap: 6 }}>
              <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>Source</Text>
              <Text style={{ color: selectedGame.tone, fontSize: 13, fontWeight: '900' }}>{selectedGame.source}</Text>
            </View>
          </View>
          <BulletList items={selectedGame.launchChecklist} tone={selectedGame.tone} />
          <View style={{ borderTopColor: '#24242c', borderTopWidth: 1, paddingTop: 10 }}>
            <Text style={{ color: mxTheme.colors.text, fontSize: 15, fontWeight: '900', marginBottom: 8 }}>Backend hooks</Text>
            <BulletList items={selectedGame.productionHooks} tone={selectedGame.tone} />
          </View>
        </View>
      </View>
    );
  }

  function renderFavorites() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader
          title="Favourite Game Queue"
          subtitle="Pinned game systems sit together for creator launch planning and Sub-facing discovery order."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {favouriteSource.map((plan) => (
            <GamePlanCard
              key={plan.id}
              plan={plan}
              active={plan.id === selectedGame.id}
              onSelect={(nextPlan) => {
                setSelectedGameId(nextPlan.id);
                setNotice(`${nextPlan.title} pinned for game hub priority.`);
              }}
            />
          ))}
        </View>
        <SectionHeader title="Import Adapters" subtitle="Provider-specific import adapters preserve debug evidence before a quiz becomes an internal game." />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {adapters.map((adapter) => (
            <AdapterCard
              key={adapter.id}
              adapter={adapter}
              active={adapter.id === selectedAdapter.id}
              onSelect={(nextAdapter) => {
                setSelectedAdapterId(nextAdapter.id);
                setNotice(`${nextAdapter.title} adapter selected.`);
              }}
            />
          ))}
        </View>
        <View style={{ ...panelStyle(selectedAdapter.tone), gap: 10 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>{selectedAdapter.title} Debug Trail</Text>
          <BulletList items={selectedAdapter.debugTrail} tone={selectedAdapter.tone} />
          <Text style={{ color: mxTheme.colors.text, fontSize: 15, fontWeight: '900' }}>Safety checks</Text>
          <BulletList items={selectedAdapter.safety} tone={selectedAdapter.tone} />
        </View>
        {quizImportBacklog.length > 0 ? (
          <View style={{ ...panelStyle('#60a5fa'), gap: 10 }}>
            <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Persisted Import Drafts</Text>
            {quizImportBacklog.map((importDraft) => (
              <ImportBacklogRow key={importDraft.id} importDraft={importDraft} />
            ))}
          </View>
        ) : null}
      </View>
    );
  }

  function renderHistory() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader title="Game History" subtitle="Recent launches, scores, import notes and overlay results share the same review lane." />
        <View style={{ ...panelStyle('#1D9E75'), gap: 12 }}>
          {historyEvents.map((event) => (
            <HistoryRow key={event.id} event={event} />
          ))}
        </View>
        <SectionHeader title="Hosted Quiz Flow" subtitle="The quiz scaffold keeps admin setup, login, public play, scoring and editing as separate states." />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {stages.map((stage) => (
            <HostedQuizStageCard key={stage.id} stage={stage} />
          ))}
        </View>
        {hostedQuizBacklog.length > 0 ? (
          <>
            <SectionHeader title="Hosted Quiz Backlog" subtitle="Drafts and published quiz nights now come from the hosted quiz API contract." />
            <View style={{ ...panelStyle('#c084fc'), gap: 12 }}>
              {hostedQuizBacklog.map((quiz) => (
                <HostedQuizBacklogRow
                  key={quiz.id}
                  quiz={quiz}
                  diagnostics={hostedQuizDiagnostics[quiz.id]}
                  diagnosticsLoading={diagnosticsLoadingQuizId === quiz.id}
                  onLoadDiagnostics={handleLoadHostedQuizDiagnostics}
                />
              ))}
            </View>
          </>
        ) : null}
      </View>
    );
  }

  function renderOverlays() {
    return (
      <View style={{ gap: 14 }}>
        <SectionHeader title="Live Room Game Overlays" subtitle="Live and watch rooms can launch trivia, draw, casino, bingo, dice, card and word-game panels from a shared overlay model." />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {overlays.map((overlay) => (
            <OverlayCard key={overlay.id} overlay={overlay} />
          ))}
        </View>
        {overlayScoreSnapshots.length > 0 ? (
          <>
            <SectionHeader title="Hosted Quiz Overlay Feed" subtitle="Published quiz score snapshots refresh from room-scoped Game Hub and live-room socket events." />
            <OverlaySocketStatusPanel state={overlaySocketState} />
            <OverlayDiagnosticsPanel diagnostics={summary?.overlayDeliveryDiagnostics} receipts={summary?.overlaySocketReceipts || []} />
            <View style={{ ...panelStyle('#60a5fa'), gap: 12 }}>
              {overlayScoreSnapshots.map((snapshot) => (
                <OverlaySnapshotRow
                  key={snapshot.id}
                  snapshot={snapshot}
                  live={overlaySocketState.status === 'connected' && overlaySocketState.roomId === snapshot.overlayId}
                  dispatching={dispatchingOverlayId === snapshot.id}
                  onDispatch={handleDispatchOverlaySnapshot}
                />
              ))}
            </View>
          </>
        ) : null}
        <SectionHeader title="Emoji Reaction Rooms" subtitle="Reaction modes separate solo practice, multiplayer lobby play and live audience rounds." />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {reactionModes.map((mode) => (
            <ReactionModeCard key={mode.id} mode={mode} />
          ))}
        </View>
        {reactionRoomBacklog.length > 0 ? (
          <View style={{ ...panelStyle('#f472b6'), gap: 12 }}>
            <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Reaction Room Score Feed</Text>
            <OverlaySocketStatusPanel state={reactionSocketState} title="REACTION SOCKET" emptyLabel="No reaction room" />
            {liveReactionSnapshots.map((snapshot) => (
              <ReactionSnapshotRow
                key={snapshot.id}
                snapshot={snapshot}
                live={reactionSocketState.status === 'connected' && reactionSocketState.roomId === snapshot.overlayId}
              />
            ))}
            {reactionRoomBacklog.map((room) => (
              <ReactionRoomBacklogRow key={room.id} room={room} />
            ))}
          </View>
        ) : null}
      </View>
    );
  }

  function renderActiveTab() {
    if (activeTab === 'favorites') return renderFavorites();
    if (activeTab === 'history') return renderHistory();
    if (activeTab === 'overlays') return renderOverlays();
    return renderAvailable();
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: mxTheme.colors.background }} contentContainerStyle={{ padding: mxTheme.spacing.lg, gap: mxTheme.spacing.lg }}>
      <View style={{ ...panelStyle('#60a5fa'), gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <View style={{ flex: 1, minWidth: 260, gap: 6 }}>
            <Text style={{ color: '#60a5fa', fontSize: 12, fontWeight: '900' }}>GAME HUB</Text>
            <Text style={{ color: mxTheme.colors.text, fontSize: 30, fontWeight: '900' }}>Quizzes, reactions and live game overlays</Text>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 14, lineHeight: 21 }}>
              Coordinate external quiz imports, hosted quiz nights, reaction rooms, favourites, history logs and live-room game overlays from one dashboard module.
            </Text>
          </View>
          <View style={{ minWidth: 220, gap: 8 }}>
            <StatusPill label={syncState === 'live' ? 'backend summary synced' : syncState === 'loading' ? 'syncing api' : 'static fallback'} tone={syncState === 'live' ? '#1D9E75' : '#d4af37'} />
            <StatusPill label="quiz import scaffolded" tone="#60a5fa" />
            <StatusPill label="reaction rooms mapped" tone="#f472b6" />
            <StatusPill label="overlay sockets ready" tone="#d4af37" />
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {metrics.map((metric) => (
            <MetricCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} tone={metric.tone} />
          ))}
        </View>
      </View>

      <View style={{ ...panelStyle(), gap: 10 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {GAME_HUB_TABS.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={{
                  borderColor: active ? '#60a5fa' : mxTheme.colors.border,
                  backgroundColor: active ? '#60a5fa22' : '#15151c',
                  borderWidth: 1,
                  borderRadius: 999,
                  paddingVertical: 9,
                  paddingHorizontal: 13,
                }}
              >
                <Text style={{ color: active ? '#60a5fa' : mxTheme.colors.muted, fontWeight: '900', fontSize: 12 }}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={{ backgroundColor: '#15151c', borderColor: '#2f2f3a', borderWidth: 1, borderRadius: mxTheme.radius.md, padding: 10 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 12, fontWeight: '800' }}>{notice}</Text>
        </View>
      </View>

      {smokeTargets.length > 0 ? (
        <View style={{ ...panelStyle('#38bdf8'), gap: 10 }}>
          <SectionHeader
            title="Browser Smoke Targets"
            subtitle="Staging validation checks the hosted quiz diagnostics filters, overlay dispatch refresh and reaction-room live overlay fanout."
          />
          {smokeTargets.map((target) => (
            <SmokeTargetRow key={target.id} target={target} />
          ))}
        </View>
      ) : null}

      {renderActiveTab()}
    </ScrollView>
  );
}
