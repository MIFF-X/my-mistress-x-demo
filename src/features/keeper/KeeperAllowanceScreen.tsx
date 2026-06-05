import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View, type DimensionValue } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';
import {
  ALLOWANCE_LEDGER_ROWS,
  KEEPER_AGREEMENTS,
  KEEPER_AUDIT_EVENTS,
  KEEPER_GOAL_ROLES,
  KEEPER_RECURRING_SUPPORT,
  formatKeeperCredits,
  getAllowanceRemaining,
  getKeeperAgreementStatusLabel,
  type AllowanceLedgerRow,
  type KeeperAgreement,
  type KeeperAuditEvent,
  type KeeperGoalRole,
  type KeeperRecurringSupport,
} from './keeperWalletModel';

type KeeperMode = 'overview' | 'agreements' | 'allowance' | 'goals' | 'audit';

const KEEPER_MODES: Array<{ id: KeeperMode; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'agreements', label: 'Agreements' },
  { id: 'allowance', label: 'Allowance' },
  { id: 'goals', label: 'Goal Roles' },
  { id: 'audit', label: 'Audit' },
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

function statusTone(status: KeeperAgreement['status']) {
  if (status === 'active') return mxTheme.colors.success;
  if (status === 'renewal-review') return mxTheme.colors.warning;
  if (status === 'paused') return '#60a5fa';
  return '#c084fc';
}

function allowanceStatusTone(status: AllowanceLedgerRow['status']) {
  if (status === 'available') return mxTheme.colors.success;
  if (status === 'watch') return mxTheme.colors.warning;
  return '#60a5fa';
}

function auditStatusTone(status: KeeperAuditEvent['status']) {
  if (status === 'recorded') return mxTheme.colors.success;
  if (status === 'needs-review') return mxTheme.colors.warning;
  return '#60a5fa';
}

function ProgressBar({ value, tone }: { value: number; tone: string }) {
  const width = `${Math.max(5, Math.min(100, value))}%` as DimensionValue;

  return (
    <View style={{ height: 8, backgroundColor: '#1b1b24', borderRadius: 999, overflow: 'hidden' }}>
      <View style={{ width, height: 8, borderRadius: 999, backgroundColor: tone }} />
    </View>
  );
}

function ModeChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: active ? '#8b5cf6' : '#15151d',
        borderColor: active ? '#c084fc' : '#2a2a33',
        borderWidth: 1,
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 12,
      }}
    >
      <Text style={{ color: active ? '#fff' : '#d6d6dc', fontSize: 12, fontWeight: '900' }}>{label}</Text>
    </Pressable>
  );
}

function MetricCard({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: string }) {
  return (
    <View style={{ ...panelStyle(`${tone}66`), flex: 1, minWidth: 190, gap: 6 }}>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '900' }}>{label}</Text>
      <Text style={{ color: mxTheme.colors.text, fontSize: 24, fontWeight: '900' }}>{value}</Text>
      <Text style={{ color: tone, fontSize: 12, fontWeight: '800' }}>{detail}</Text>
    </View>
  );
}

function AgreementCard({ agreement, onAction }: { agreement: KeeperAgreement; onAction: (label: string) => void }) {
  const usedPercent = Math.round(((agreement.spendingLimitCredits - agreement.remainingCredits) / Math.max(agreement.spendingLimitCredits, 1)) * 100);
  const tone = statusTone(agreement.status);

  return (
    <View style={{ ...panelStyle(agreement.tone), flex: 1, minWidth: 280, gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 180 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>{agreement.title}</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 12, marginTop: 4 }}>
            {agreement.supporterName} to {agreement.creatorName}
          </Text>
        </View>
        <View style={{ backgroundColor: `${tone}1f`, borderColor: tone, borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 9 }}>
          <Text style={{ color: tone, fontSize: 10, fontWeight: '900' }}>{getKeeperAgreementStatusLabel(agreement.status).toUpperCase()}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Text style={{ color: agreement.tone, fontWeight: '900' }}>{formatKeeperCredits(agreement.amountCredits)}</Text>
        <Text style={{ color: '#777' }}>{agreement.renewal}</Text>
        <Text style={{ color: '#777' }}>Visibility: {agreement.visibility}</Text>
      </View>

      <View style={{ gap: 7 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '800' }}>Allowance used</Text>
          <Text style={{ color: agreement.tone, fontSize: 11, fontWeight: '900' }}>{usedPercent}%</Text>
        </View>
        <ProgressBar value={usedPercent} tone={agreement.tone} />
      </View>

      <Text style={{ color: '#d6d6dc', fontSize: 12 }}>{agreement.consentStamp}</Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 12 }}>{agreement.cancelPolicy}</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {agreement.allowedCategories.map((category) => (
          <View key={category} style={{ backgroundColor: '#181820', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 8 }}>
            <Text style={{ color: '#d6d6dc', fontSize: 10, fontWeight: '800' }}>{category}</Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Pressable onPress={() => onAction(`${agreement.title} consent review`)} style={{ backgroundColor: agreement.tone, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12 }}>
          <Text style={{ color: '#050505', fontWeight: '900' }}>Review Consent</Text>
        </Pressable>
        <Pressable onPress={() => onAction(`${agreement.title} renewal`)} style={{ backgroundColor: '#181820', borderColor: agreement.tone, borderWidth: 1, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12 }}>
          <Text style={{ color: agreement.tone, fontWeight: '900' }}>Renewal Notes</Text>
        </Pressable>
      </View>
    </View>
  );
}

function AllowanceRow({ row, onAction }: { row: AllowanceLedgerRow; onAction: (label: string) => void }) {
  const remaining = getAllowanceRemaining(row);
  const usedPercent = Math.round((row.usedCredits / Math.max(row.capCredits, 1)) * 100);
  const tone = allowanceStatusTone(row.status);

  return (
    <View style={{ borderTopColor: '#282833', borderTopWidth: 1, paddingTop: 10, gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 180 }}>
          <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>{row.label}</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, marginTop: 3 }}>{row.category} - expires {row.expiresAt}</Text>
        </View>
        <Text style={{ color: tone, fontSize: 11, fontWeight: '900' }}>{row.status.toUpperCase()}</Text>
      </View>
      <ProgressBar value={usedPercent} tone={row.tone} />
      <Text style={{ color: '#d6d6dc', fontSize: 12 }}>
        {formatKeeperCredits(row.usedCredits)} used / {formatKeeperCredits(remaining)} remaining from {formatKeeperCredits(row.capCredits)}
      </Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 12 }}>{row.note}</Text>
      <Pressable onPress={() => onAction(`${row.label} cap review`)} style={{ backgroundColor: '#181820', borderColor: row.tone, borderWidth: 1, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 10, alignSelf: 'flex-start' }}>
        <Text style={{ color: row.tone, fontSize: 11, fontWeight: '900' }}>Review Cap</Text>
      </Pressable>
    </View>
  );
}

function GoalRoleCard({ goal }: { goal: KeeperGoalRole }) {
  const progress = Math.round((goal.currentCredits / Math.max(goal.targetCredits, 1)) * 100);

  return (
    <View style={{ ...panelStyle(goal.tone), flex: 1, minWidth: 220, gap: 8 }}>
      <Text style={{ color: mxTheme.colors.text, fontSize: 16, fontWeight: '900' }}>{goal.title}</Text>
      <Text style={{ color: goal.tone, fontSize: 12, fontWeight: '900' }}>{goal.keeperRole}</Text>
      <ProgressBar value={progress} tone={goal.tone} />
      <Text style={{ color: '#d6d6dc', fontSize: 12 }}>
        {formatKeeperCredits(goal.currentCredits)} / {formatKeeperCredits(goal.targetCredits)}
      </Text>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11, lineHeight: 16 }}>{goal.taxNote}</Text>
    </View>
  );
}

function RecurringSupportRow({ support, onAction }: { support: KeeperRecurringSupport; onAction: (label: string) => void }) {
  const tone = support.receiptStatus === 'ready' ? mxTheme.colors.success : support.receiptStatus === 'review' ? mxTheme.colors.warning : '#60a5fa';

  return (
    <View style={{ borderTopColor: '#282833', borderTopWidth: 1, paddingTop: 10, gap: 5 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>{support.label}</Text>
          <Text style={{ color: mxTheme.colors.muted, fontSize: 11, marginTop: 3 }}>{support.cadence} - next reminder {support.nextReminder}</Text>
        </View>
        <Text style={{ color: tone, fontSize: 11, fontWeight: '900' }}>{support.receiptStatus.toUpperCase()}</Text>
      </View>
      <Text style={{ color: '#d6d6dc', fontSize: 12 }}>{formatKeeperCredits(support.amountCredits)}</Text>
      <Pressable onPress={() => onAction(`${support.label} receipt`)} style={{ alignSelf: 'flex-start' }}>
        <Text style={{ color: tone, fontSize: 11, fontWeight: '900' }}>Receipt / Reminder</Text>
      </Pressable>
    </View>
  );
}

function AuditRow({ event }: { event: KeeperAuditEvent }) {
  const tone = auditStatusTone(event.status);

  return (
    <View style={{ borderTopColor: '#282833', borderTopWidth: 1, paddingTop: 10, gap: 5 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <Text style={{ color: mxTheme.colors.text, fontWeight: '900', flex: 1 }}>{event.label}</Text>
        <Text style={{ color: tone, fontSize: 11, fontWeight: '900' }}>{event.status.toUpperCase()}</Text>
      </View>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11 }}>{event.area} - {event.actor}</Text>
      <Text style={{ color: '#777', fontSize: 11 }}>{event.createdAt}</Text>
    </View>
  );
}

export function KeeperAllowanceScreen() {
  const [activeMode, setActiveMode] = useState<KeeperMode>('overview');
  const [notice, setNotice] = useState('Keeper and Allowance Wallet scaffold is active. No allowance spend moves until backend consent, sub-ledgers, and receipts are wired.');

  const activeAgreements = useMemo(() => KEEPER_AGREEMENTS.filter((agreement) => agreement.status === 'active').length, []);
  const totalMonthlyCredits = useMemo(() => KEEPER_AGREEMENTS.reduce((sum, agreement) => sum + agreement.amountCredits, 0), []);
  const remainingAllowance = useMemo(() => ALLOWANCE_LEDGER_ROWS.reduce((sum, row) => sum + getAllowanceRemaining(row), 0), []);
  const reviewCount = useMemo(
    () => KEEPER_AGREEMENTS.filter((agreement) => agreement.status !== 'active').length + ALLOWANCE_LEDGER_ROWS.filter((row) => row.status !== 'available').length,
    [],
  );

  function handleAction(label: string) {
    setNotice(`${label} queued locally. Production needs timestamped consent, wallet sub-ledger writes, receipts, and admin audit routes.`);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: mxTheme.colors.background }} contentContainerStyle={{ padding: mxTheme.spacing.lg, gap: mxTheme.spacing.md }}>
      <View>
        <Text style={{ color: mxTheme.colors.text, fontSize: 26, fontWeight: '900' }}>Keeper & Allowance Wallet</Text>
        <Text style={{ color: '#d4af37', marginTop: 6 }}>Agreements, renewal terms, spending caps, goal roles, receipts, and audit-ready consent.</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {KEEPER_MODES.map((mode) => (
          <ModeChip key={mode.id} label={mode.label} active={activeMode === mode.id} onPress={() => setActiveMode(mode.id)} />
        ))}
      </View>

      <View style={{ ...panelStyle('#3b2b12'), gap: 6 }}>
        <Text style={{ color: '#d4af37', fontSize: 11, fontWeight: '900' }}>{activeMode.toUpperCase()}</Text>
        <Text style={{ color: '#d6d6dc', fontSize: 13 }}>{notice}</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <MetricCard label="Active Agreements" value={String(activeAgreements)} detail={`${KEEPER_AGREEMENTS.length} total agreements`} tone="#8b5cf6" />
        <MetricCard label="Recurring Support" value={formatKeeperCredits(totalMonthlyCredits)} detail="Draft monthly-equivalent support" tone="#d4af37" />
        <MetricCard label="Remaining Allowance" value={formatKeeperCredits(remainingAllowance)} detail="Across open sub-ledgers" tone="#2dd4bf" />
        <MetricCard label="Needs Review" value={String(reviewCount)} detail="Renewals, locks, and cap warnings" tone="#f5c542" />
      </View>

      {(activeMode === 'overview' || activeMode === 'agreements') ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {KEEPER_AGREEMENTS.map((agreement) => (
            <AgreementCard key={agreement.id} agreement={agreement} onAction={handleAction} />
          ))}
        </View>
      ) : null}

      {(activeMode === 'overview' || activeMode === 'allowance') ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <View style={{ ...panelStyle('#2d2248'), flex: 2, minWidth: 320, gap: 12 }}>
            <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Allowance Sub-Ledgers</Text>
            {ALLOWANCE_LEDGER_ROWS.map((row) => (
              <AllowanceRow key={row.id} row={row} onAction={handleAction} />
            ))}
          </View>
          <View style={{ ...panelStyle('#2d2248'), flex: 1, minWidth: 260, gap: 12 }}>
            <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Pin Money & Reminders</Text>
            {KEEPER_RECURRING_SUPPORT.map((support) => (
              <RecurringSupportRow key={support.id} support={support} onAction={handleAction} />
            ))}
          </View>
        </View>
      ) : null}

      {(activeMode === 'overview' || activeMode === 'goals') ? (
        <View style={{ ...panelStyle('#2d2248'), gap: 12 }}>
          <View>
            <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Goal-Specific Keeper Roles</Text>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 12, marginTop: 4 }}>Car, house, personal care, creator growth, live show, and custom roles stay explicit and reviewable.</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {KEEPER_GOAL_ROLES.map((goal) => (
              <GoalRoleCard key={goal.id} goal={goal} />
            ))}
          </View>
        </View>
      ) : null}

      {(activeMode === 'overview' || activeMode === 'audit') ? (
        <View style={{ ...panelStyle('#2d2248'), gap: 12 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Consent, Receipt & Audit Trail</Text>
          {KEEPER_AUDIT_EVENTS.map((event) => (
            <AuditRow key={event.id} event={event} />
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}
