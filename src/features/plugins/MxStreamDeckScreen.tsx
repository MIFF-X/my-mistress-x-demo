import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import {
  cleanupMxStreamDeckActionLogs,
  createMxStreamDeckSetupSession,
  expireMxStreamDeckSetupSessions,
  getMxStreamDeckAdminReview,
  queueMxStreamDeckAction,
  saveMxStreamDeckButton,
  type MxStreamDeckActionLog,
  type MxStreamDeckActionRetentionResult,
  type MxStreamDeckAdminReview,
  type MxStreamDeckSetupSession,
} from '../../api/mxStreamDeckApi';

type DeckRole = 'MISTRESS' | 'SUB' | 'HEADMISTRESS';
type DeckTone = 'pink' | 'gold' | 'violet' | 'blue' | 'green' | 'orange' | 'red';

type DeckButton = {
  id: string;
  label: string;
  group: string;
  action: string;
  tone: DeckTone;
};

type QueuedDeckAction = DeckButton & {
  queuedAt: string;
  role: DeckRole;
};

type UseCase = {
  title: string;
  owner: string;
  uses: string[];
};

const DECKS: Record<DeckRole, DeckButton[]> = {
  MISTRESS: [
    { id: 'reply-tease', label: 'Quick Reply', group: 'quick replies', action: 'chat.quickReply', tone: 'pink' },
    { id: 'ask-tribute', label: 'Tribute Ask', group: 'tribute', action: 'wallet.tributePrompt', tone: 'gold' },
    { id: 'ppv-unlock', label: 'PPV Unlock', group: 'ppv', action: 'ppv.offerUnlock', tone: 'violet' },
    { id: 'live-poll', label: 'Live Poll', group: 'live show', action: 'live.togglePoll', tone: 'blue' },
    { id: 'game-dare', label: 'Game Dare', group: 'games', action: 'games.challenge', tone: 'green' },
    { id: 'book-call', label: 'Book Call', group: 'bookings', action: 'booking.offerSlot', tone: 'orange' },
  ],
  SUB: [
    { id: 'yes', label: 'Yes', group: 'quick replies', action: 'chat.quickReply', tone: 'pink' },
    { id: 'check-in', label: 'Check In', group: 'personal', action: 'personal.checkIn', tone: 'green' },
    { id: 'wallet', label: 'Wallet', group: 'personal', action: 'route.wallet', tone: 'gold' },
    { id: 'join-game', label: 'Join Game', group: 'games', action: 'games.join', tone: 'blue' },
    { id: 'booking', label: 'Booking', group: 'bookings', action: 'booking.request', tone: 'orange' },
    { id: 'sticker', label: 'Sticker', group: 'stickers', action: 'stickers.send', tone: 'violet' },
  ],
  HEADMISTRESS: [
    { id: 'admin-alert', label: 'Alert', group: 'admin alerts', action: 'admin.alertQueue', tone: 'red' },
    { id: 'compliance', label: 'Compliance', group: 'compliance', action: 'compliance.openCheck', tone: 'gold' },
    { id: 'smm-blast', label: 'SMM Prep', group: 'smm', action: 'smm.prepareBlast', tone: 'blue' },
    { id: 'provider-check', label: 'Provider', group: 'admin alerts', action: 'provider.readiness', tone: 'green' },
    { id: 'plugin-review', label: 'Plugin Review', group: 'admin alerts', action: 'plugins.review', tone: 'violet' },
    { id: 'risk-note', label: 'Risk Note', group: 'compliance', action: 'audit.riskNote', tone: 'orange' },
  ],
};

const USE_CASES: UseCase[] = [
  { title: 'Quick replies', owner: 'Shared', uses: ['saved chat responses', 'welcome snippets', 'boundary notes'] },
  { title: 'Live show controls', owner: 'Mistress', uses: ['segments', 'polls', 'Q&A', 'viewer-safe tray toggles'] },
  { title: 'Game buttons', owner: 'Shared', uses: ['start round', 'send clue', 'trigger challenge', 'queue reward'] },
  { title: 'Wallet and PPV prompts', owner: 'Mistress', uses: ['tribute asks', 'PPV offers', 'booking prompts'] },
  { title: 'Personal command pad', owner: 'Sub', uses: ['check-ins', 'favourite routes', 'routine reminders'] },
  { title: 'Headmistress operations', owner: 'Headmistress', uses: ['alerts', 'compliance checks', 'SMM prep', 'plugin review'] },
  { title: 'Device handoff', owner: 'Shared', uses: ['scan setup QR', 'pair phone deck', 'continue from trusted device'] },
];

const ROLE_OPTIONS: DeckRole[] = ['MISTRESS', 'SUB', 'HEADMISTRESS'];

const toneColor: Record<DeckTone, string> = {
  pink: '#ff4f8b',
  gold: '#d4af37',
  violet: '#9d7cff',
  blue: '#5bbcff',
  green: '#38d996',
  orange: '#ff9f43',
  red: '#ff5f5f',
};

function roleFromUserRole(role?: string): DeckRole {
  const normalized = String(role || '').toUpperCase();
  if (normalized === 'HEADMISTRESS' || normalized === 'ADMIN') return 'HEADMISTRESS';
  if (normalized === 'SUB') return 'SUB';
  return 'MISTRESS';
}

function panelStyle(borderColor = '#25252d') {
  return {
    backgroundColor: '#101014',
    borderColor,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  } as const;
}

function smallText(color = '#aaa') {
  return { color, fontSize: 11, marginTop: 4 } as const;
}

function buildQrPreviewMatrix(payload: string, size = 17) {
  let hash = 2166136261;
  for (let index = 0; index < payload.length; index += 1) {
    hash ^= payload.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => {
      const inFinder =
        (row < 5 && col < 5) ||
        (row < 5 && col >= size - 5) ||
        (row >= size - 5 && col < 5);
      const finderOn = inFinder && (row % 4 === 0 || col % 4 === 0 || (row > 1 && col > 1 && row < size - 2 && col < size - 2));
      const dataOn = ((hash + row * 31 + col * 17 + row * col) & 3) === 0;
      return inFinder ? finderOn : dataOn;
    }),
  );
}

function QrPayloadPreview({ payload }: { payload: string }) {
  const matrix = useMemo(() => buildQrPreviewMatrix(payload), [payload]);

  return (
    <View style={{ backgroundColor: '#050505', borderColor: '#333', borderWidth: 1, borderRadius: 12, padding: 10, alignSelf: 'flex-start' }}>
      {matrix.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={{ flexDirection: 'row' }}>
          {row.map((on, colIndex) => (
            <View
              key={`${rowIndex}-${colIndex}`}
              style={{
                width: 7,
                height: 7,
                borderRadius: 2,
                margin: 1,
                backgroundColor: on ? '#fff' : '#1c1c1c',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function setupPayload(role: DeckRole) {
  return JSON.stringify({
    version: 'mx-stream-deck/v1',
    route: 'mistressx://plugins/mx-stream-deck/setup',
    webFallbackRoute: '/plugins/mx-stream-deck/setup',
    role,
    deck: 'mx-stream-deck',
    nonce: 'signed-by-backend-next-step',
    expMinutes: 10,
  });
}

function queueLabel(action: QueuedDeckAction) {
  return `${action.role} / ${action.group} / ${action.action}`;
}

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function directHandoffEvidence(log: MxStreamDeckActionLog) {
  const event = objectRecord(log.contractEvent);
  return objectRecord(event?.directHandoff);
}

function retentionDaysFromInput(value: string) {
  const days = Number.parseInt(value, 10);
  return Number.isFinite(days) ? Math.min(Math.max(days, 1), 3650) : 90;
}

function retentionSummary(result: MxStreamDeckActionRetentionResult) {
  const mode = result.dryRun ? 'Dry run matched' : 'Deleted';
  const count = result.dryRun ? result.matchedActionLogs : result.deletedActionLogs;
  return `${mode} ${count} old terminal action log${count === 1 ? '' : 's'}.`;
}

export function MxStreamDeckScreen({ role }: { role?: string }) {
  const [activeRole, setActiveRole] = useState<DeckRole>(() => roleFromUserRole(role));
  const [customLabel, setCustomLabel] = useState('');
  const [customAction, setCustomAction] = useState('');
  const [queuedActions, setQueuedActions] = useState<QueuedDeckAction[]>([]);
  const [setupSession, setSetupSession] = useState<MxStreamDeckSetupSession | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);
  const [adminReview, setAdminReview] = useState<MxStreamDeckAdminReview | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminNotice, setAdminNotice] = useState<string | null>(null);
  const [retentionDays, setRetentionDays] = useState('90');
  const [retentionDryRun, setRetentionDryRun] = useState(true);
  const [retentionResult, setRetentionResult] = useState<MxStreamDeckActionRetentionResult | null>(null);
  const activeSetupSession = setupSession?.role === activeRole ? setupSession : null;
  const payload = useMemo(() => activeSetupSession?.setupUrl ?? setupPayload(activeRole), [activeRole, activeSetupSession]);
  const deck = DECKS[activeRole];
  const canUseAdminDeck = activeRole === 'HEADMISTRESS';
  const directHandoffLogs = useMemo(
    () => (adminReview?.actionLogs ?? []).filter((log) => Boolean(directHandoffEvidence(log))).slice(0, 6),
    [adminReview],
  );

  function queueAction(button: DeckButton) {
    setQueuedActions((current) => [
      { ...button, role: activeRole, queuedAt: new Date().toISOString() },
      ...current,
    ].slice(0, 8));
    setDispatchStatus('Syncing action with backend command audit...');
    void queueMxStreamDeckAction({
      role: activeRole,
      buttonId: button.id,
      label: button.label,
      group: button.group,
      action: button.action,
      })
      .then((result) => {
        setDispatchStatus(result.contractKey
          ? `Backend accepted ${result.contractKey} handoff (${result.executionStatus}).`
          : 'Backend recorded local command.');
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Backend dispatch is offline.';
        setDispatchStatus(`Local queue only: ${message}`);
      });
  }

  async function generateSetupSession() {
    setSetupLoading(true);
    setSetupError(null);
    try {
      const session = await createMxStreamDeckSetupSession({
        role: activeRole,
        deviceLabel: `${activeRole.toLowerCase()} phone deck`,
        platform: 'mobile',
      });
      setSetupSession(session);
      setDispatchStatus('Backend generated a signed setup session and QR image.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create setup session.';
      setSetupError(message);
    } finally {
      setSetupLoading(false);
    }
  }

  async function refreshAdminReview() {
    if (!canUseAdminDeck) return;
    setAdminLoading(true);
    setAdminNotice(null);
    try {
      const review = await getMxStreamDeckAdminReview({ take: 12 });
      setAdminReview(review);
      setAdminNotice('Admin review rows refreshed.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load Stream Deck admin review.';
      setAdminNotice(message);
    } finally {
      setAdminLoading(false);
    }
  }

  async function runSetupRetention() {
    setAdminLoading(true);
    setAdminNotice(null);
    try {
      const result = await expireMxStreamDeckSetupSessions();
      setAdminNotice(`Expired ${result.expiredSetupSessions} setup session${result.expiredSetupSessions === 1 ? '' : 's'}.`);
      await refreshAdminReview();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not expire setup sessions.';
      setAdminNotice(message);
      setAdminLoading(false);
    }
  }

  async function runActionLogRetention() {
    setAdminLoading(true);
    setAdminNotice(null);
    try {
      const result = await cleanupMxStreamDeckActionLogs({
        olderThanDays: retentionDaysFromInput(retentionDays),
        dryRun: retentionDryRun,
      });
      setRetentionResult(result);
      setAdminNotice(retentionSummary(result));
      await refreshAdminReview();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not run action-log retention.';
      setAdminNotice(message);
      setAdminLoading(false);
    }
  }

  function queueCustomAction() {
    const label = customLabel.trim();
    const action = customAction.trim();
    if (!label || !action) return;
    queueAction({
      id: `custom-${Date.now()}`,
      label,
      group: 'custom personal buttons',
      action,
      tone: 'gold',
    });
    setCustomLabel('');
    setCustomAction('');
    setDispatchStatus('Saving custom button to backend...');
    void saveMxStreamDeckButton({
      role: activeRole,
      label,
      group: 'custom personal buttons',
      action,
      tone: 'gold',
    })
      .then(() => setDispatchStatus('Custom button saved for this role.'))
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Backend save is offline.';
        setDispatchStatus(`Local custom button only: ${message}`);
      });
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
      <View style={panelStyle('#d4af37')}>
        <Text style={{ color: '#d4af37', fontSize: 12, fontWeight: '900' }}>Shared Command System</Text>
        <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 4 }}>MX Stream Deck</Text>
        <Text style={{ color: '#bbb', marginTop: 8 }}>
          Interactive game buttons, quick responses, live prompts, wallet and PPV asks, booking shortcuts, admin checks, and personal command buttons in one role-aware plugin.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
        {ROLE_OPTIONS.map((option) => {
          const active = option === activeRole;
          return (
            <Pressable
              key={option}
              onPress={() => {
                setActiveRole(option);
                setSetupSession(null);
                setSetupError(null);
              }}
              style={{
                backgroundColor: active ? '#d4af37' : '#161616',
                borderColor: active ? '#d4af37' : '#333',
                borderWidth: 1,
                borderRadius: 999,
                paddingVertical: 9,
                paddingHorizontal: 12,
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: active ? '#000' : '#fff', fontWeight: '900', fontSize: 12 }}>{option}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={panelStyle()}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{activeRole} Deck</Text>
        <Text style={smallText('#aaa')}>Tap a button to queue it locally and record the command through the backend audit/dispatch handoff.</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
          {deck.map((button) => (
            <Pressable
              key={button.id}
              onPress={() => queueAction(button)}
              style={{
                width: '48%',
                minHeight: 76,
                backgroundColor: '#15151b',
                borderColor: toneColor[button.tone],
                borderWidth: 1,
                borderRadius: 12,
                padding: 10,
                marginRight: '2%',
                marginBottom: 10,
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '900' }}>{button.label}</Text>
              <Text style={smallText(toneColor[button.tone])}>{button.group}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={panelStyle('#d4af37')}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>QR Easy Setup</Text>
        <Text style={smallText('#aaa')}>
          Generate a signed backend setup session, show its QR image, and scan it from a trusted phone or second device.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', marginTop: 12 }}>
          {activeSetupSession ? (
            <Image
              source={{ uri: activeSetupSession.qrSvgDataUri }}
              resizeMode="contain"
              style={{ width: 168, height: 168, backgroundColor: '#fff', borderRadius: 12 }}
            />
          ) : (
            <QrPayloadPreview payload={payload} />
          )}
          <View style={{ flex: 1, minWidth: 180, marginLeft: 12 }}>
            <Text style={{ color: '#d4af37', fontWeight: '900' }}>
              {activeSetupSession ? 'Signed setup session' : 'Setup route'}
            </Text>
            <Text style={smallText('#ddd')}>
              {activeSetupSession ? activeSetupSession.qrImageUrl : 'mistressx://plugins/mx-stream-deck/setup'}
            </Text>
            <Text style={{ color: '#d4af37', fontWeight: '900', marginTop: 10 }}>Required claims</Text>
            <Text style={smallText('#ddd')}>
              {activeSetupSession ? activeSetupSession.requiredClaims.join(' / ') : 'userId / role / deviceId / nonce / expiry'}
            </Text>
            {activeSetupSession ? (
              <Text style={smallText('#bbb')}>Expires {activeSetupSession.expiresAt}</Text>
            ) : null}
            {setupError ? <Text style={smallText('#ff7777')}>{setupError}</Text> : null}
            <Pressable
              onPress={generateSetupSession}
              disabled={setupLoading}
              style={{ backgroundColor: '#d4af37', borderRadius: 10, padding: 10, marginTop: 12, alignSelf: 'flex-start' }}
            >
              {setupLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={{ color: '#000', fontWeight: '900' }}>
                  {activeSetupSession ? 'Regenerate QR' : 'Generate Setup QR'}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>

      {canUseAdminDeck ? (
        <View style={panelStyle('#5bbcff')}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Headmistress Review</Text>
          <Text style={smallText('#aaa')}>
            Review paired devices, setup rows, saved buttons, direct handoff evidence, and Stream Deck retention cleanup from one admin surface.
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
            <Pressable
              onPress={refreshAdminReview}
              disabled={adminLoading}
              style={{ backgroundColor: '#5bbcff', borderRadius: 10, padding: 10, marginRight: 8, marginBottom: 8 }}
            >
              {adminLoading ? <ActivityIndicator color="#000" /> : <Text style={{ color: '#000', fontWeight: '900' }}>Refresh Review</Text>}
            </Pressable>
            <Pressable
              onPress={runSetupRetention}
              disabled={adminLoading}
              style={{ backgroundColor: '#161616', borderColor: '#5bbcff', borderWidth: 1, borderRadius: 10, padding: 10, marginRight: 8, marginBottom: 8 }}
            >
              <Text style={{ color: '#5bbcff', fontWeight: '900' }}>Expire Old Setup Rows</Text>
            </Pressable>
          </View>
          {adminNotice ? <Text style={smallText(adminNotice.includes('Could not') ? '#ff7777' : '#d4af37')}>{adminNotice}</Text> : null}
          {adminReview ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
              {[
                ['Setup', adminReview.summary.setupSessions],
                ['Devices', adminReview.summary.devices],
                ['Buttons', adminReview.summary.buttons],
                ['Actions', adminReview.summary.actionLogs],
              ].map(([label, value]) => (
                <View key={String(label)} style={{ backgroundColor: '#050505', borderColor: '#30303a', borderWidth: 1, borderRadius: 10, padding: 10, marginRight: 8, marginBottom: 8, minWidth: 82 }}>
                  <Text style={{ color: '#5bbcff', fontSize: 11, fontWeight: '900' }}>{label}</Text>
                  <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900' }}>{value}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={{ backgroundColor: '#050505', borderColor: '#30303a', borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 8 }}>
            <Text style={{ color: '#fff', fontWeight: '900' }}>Action Log Retention</Text>
            <Text style={smallText('#aaa')}>Dry-run first, then remove old terminal completed, rejected, failed, or local rows when ready.</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 8 }}>
              <TextInput
                value={retentionDays}
                onChangeText={setRetentionDays}
                keyboardType="numeric"
                placeholder="90"
                placeholderTextColor="#777"
                style={{ width: 80, backgroundColor: '#111', borderColor: '#333', borderWidth: 1, borderRadius: 10, color: '#fff', padding: 10, marginRight: 8, marginBottom: 8 }}
              />
              <Pressable
                onPress={() => setRetentionDryRun((current) => !current)}
                style={{ backgroundColor: retentionDryRun ? '#d4af37' : '#161616', borderColor: '#d4af37', borderWidth: 1, borderRadius: 10, padding: 10, marginRight: 8, marginBottom: 8 }}
              >
                <Text style={{ color: retentionDryRun ? '#000' : '#d4af37', fontWeight: '900' }}>{retentionDryRun ? 'Dry Run' : 'Delete Mode'}</Text>
              </Pressable>
              <Pressable
                onPress={runActionLogRetention}
                disabled={adminLoading}
                style={{ backgroundColor: '#d4af37', borderRadius: 10, padding: 10, marginRight: 8, marginBottom: 8 }}
              >
                <Text style={{ color: '#000', fontWeight: '900' }}>Run Retention</Text>
              </Pressable>
            </View>
            {retentionResult ? (
              <Text style={smallText('#d4af37')}>
                {retentionSummary(retentionResult)} Cutoff {retentionResult.cutoff}.
              </Text>
            ) : null}
          </View>

          <View style={{ marginTop: 10 }}>
            <Text style={{ color: '#fff', fontWeight: '900' }}>Direct Handoff Evidence</Text>
            {adminReview && directHandoffLogs.length === 0 ? (
              <Text style={smallText('#777')}>No direct service handoff rows are in the latest review set.</Text>
            ) : null}
            {directHandoffLogs.map((log) => {
              const evidence = directHandoffEvidence(log) || {};
              const service = String(evidence.service || log.contractKey || 'contract');
              const downstreamId = String(evidence.downstreamId || evidence.error || 'pending evidence');
              const downstreamStatus = String(evidence.downstreamStatus || log.executionStatus);
              return (
                <View key={log.id} style={{ borderColor: '#282830', borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 8 }}>
                  <Text style={{ color: '#fff', fontWeight: '900' }}>{log.label}</Text>
                  <Text style={smallText('#5bbcff')}>{service} / {downstreamStatus}</Text>
                  <Text style={smallText('#bbb')}>{downstreamId}</Text>
                  <Text style={smallText('#777')}>{log.createdAt}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      <View style={panelStyle()}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Custom Personal Button</Text>
        <Text style={smallText('#aaa')}>Draft one-off buttons for personal routines, route shortcuts, chat lines, or admin review tasks.</Text>
        <TextInput
          value={customLabel}
          onChangeText={setCustomLabel}
          placeholder="Button label"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', borderColor: '#333', borderWidth: 1, borderRadius: 10, color: '#fff', padding: 10, marginTop: 10 }}
        />
        <TextInput
          value={customAction}
          onChangeText={setCustomAction}
          placeholder="Action key, e.g. chat.savedReply"
          placeholderTextColor="#777"
          style={{ backgroundColor: '#050505', borderColor: '#333', borderWidth: 1, borderRadius: 10, color: '#fff', padding: 10, marginTop: 8 }}
        />
        <Pressable onPress={queueCustomAction} style={{ backgroundColor: '#ff0055', borderRadius: 10, padding: 10, marginTop: 10 }}>
          <Text style={{ color: '#fff', fontWeight: '900', textAlign: 'center' }}>Add To Recent Queue</Text>
        </Pressable>
      </View>

      <View style={panelStyle()}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Cool Uses</Text>
        {USE_CASES.map((item) => (
          <View key={item.title} style={{ backgroundColor: '#15151b', borderRadius: 10, padding: 10, marginTop: 8 }}>
            <Text style={{ color: '#fff', fontWeight: '900' }}>{item.title}</Text>
            <Text style={smallText('#d4af37')}>{item.owner}</Text>
            <Text style={smallText('#bbb')}>{item.uses.join(' / ')}</Text>
          </View>
        ))}
      </View>

      <View style={panelStyle()}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Recent Queued Actions</Text>
        {dispatchStatus ? <Text style={smallText('#d4af37')}>{dispatchStatus}</Text> : null}
        {queuedActions.length === 0 ? <Text style={smallText('#777')}>No local actions queued yet.</Text> : null}
        {queuedActions.map((action) => (
          <View key={`${action.id}-${action.queuedAt}`} style={{ borderColor: '#282830', borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 8 }}>
            <Text style={{ color: '#fff', fontWeight: '900' }}>{action.label}</Text>
            <Text style={smallText(toneColor[action.tone])}>{queueLabel(action)}</Text>
            <Text style={smallText('#777')}>{action.queuedAt}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
