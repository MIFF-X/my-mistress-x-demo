import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native';
import {
  createPayoutRequest,
  getEarningsVaultOptions,
  getEarningsVaultStatementCsv,
  getEarningsVaultSummary,
  listPayoutAccounts,
  listPayoutRequests,
  listReserveHolds,
  savePayoutAccount,
  type EarningsVaultOption,
  type EarningsVaultSummary,
  type PayoutAccount,
  type PayoutRequest,
  type ReserveHold,
} from '../../api/moneyApi';
import { getCurrentUser } from '../../state/authStore';
import { mxTheme } from '../../theme/mxTheme';
import { ActionPillButton } from '../buttons/ActionPillButton';

const PAYOUT_PROVIDERS = [
  { id: 'bank_account', label: 'Bank Account' },
  { id: 'payid', label: 'PayID' },
  { id: 'manual_bank_payout', label: 'Manual Bank Payout' },
  { id: 'stripe_connect', label: 'Stripe Connect' },
  { id: 'specialist_processor', label: 'Specialist Processor' },
];

function canUseEarningsVault(role?: string) {
  return role === 'MISTRESS' || role === 'HEADMISTRESS' || role === 'ADMIN';
}

function asNumber(value?: number | string | null) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function moneyLabel(value?: number | string | null, currency = 'AUD') {
  return `${asNumber(value).toFixed(2)} ${currency}`;
}

function dateLabel(value?: string | null) {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function providerLabel(provider?: string | null, options: EarningsVaultOption[] = []) {
  const option = options.find((item) => item.id === provider);
  if (option?.label) return option.label;
  return String(provider || 'Manual payout').replace(/_/g, ' ');
}

function statusTone(status?: string | null) {
  const normalized = String(status || '').toUpperCase();
  if (['PAID', 'APPROVED', 'VERIFIED', 'RELEASED'].includes(normalized)) return mxTheme.colors.success;
  if (['REJECTED', 'FAILED', 'HELD'].includes(normalized)) return '#ff6b6b';
  if (['BATCHED', 'PROCESSING', 'REQUESTED', 'REVIEW'].includes(normalized)) return mxTheme.colors.warning;
  return mxTheme.colors.muted;
}

function panelStyle(tone = mxTheme.colors.border) {
  return {
    backgroundColor: mxTheme.colors.surface,
    borderColor: tone,
    borderRadius: mxTheme.radius.md,
    borderWidth: 1,
    marginBottom: mxTheme.spacing.sm,
    padding: mxTheme.spacing.md,
  };
}

function metricPanel(label: string, value: string, tone = mxTheme.colors.accentSoft) {
  return (
    <View style={{ backgroundColor: mxTheme.colors.surface, borderColor: tone, borderRadius: mxTheme.radius.md, borderWidth: 1, flex: 1, marginBottom: 8, marginRight: 8, minWidth: 145, padding: 12 }}>
      <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' }}>{label}</Text>
      <Text style={{ color: mxTheme.colors.text, fontSize: 20, fontWeight: '900', marginTop: 4 }}>{value}</Text>
    </View>
  );
}

function smallLine(label: string, value: string | number, tone = mxTheme.colors.muted) {
  return (
    <Text style={{ color: tone, fontSize: 12, marginTop: 4 }}>
      {label}: {value}
    </Text>
  );
}

function fieldStyle() {
  return {
    backgroundColor: mxTheme.colors.surfaceSoft,
    borderColor: mxTheme.colors.border,
    borderRadius: mxTheme.radius.sm,
    borderWidth: 1,
    color: mxTheme.colors.text,
    marginBottom: 8,
    minHeight: 40,
    paddingHorizontal: 10,
    paddingVertical: 8,
  };
}

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function statementFileName(userId?: string) {
  const safeId = String(userId || 'creator').replace(/[^a-z0-9_-]+/gi, '-').slice(0, 80);
  return `earnings-vault-${safeId}.csv`;
}

function browserExportApi() {
  const scope = globalThis as any;
  return {
    BlobRef: scope.Blob,
    clipboard: scope.navigator?.clipboard,
    documentRef: scope.document,
    urlRef: scope.URL || scope.webkitURL,
  };
}

function downloadStatement(csvText: string, fileName: string) {
  if (!csvText.trim()) return 'Statement is empty.';

  const { BlobRef, documentRef, urlRef } = browserExportApi();
  if (!BlobRef || !documentRef?.createElement || !urlRef?.createObjectURL) {
    return 'Statement text is ready below for manual save or share.';
  }

  const blob = new BlobRef([csvText], { type: 'text/csv;charset=utf-8' });
  const url = urlRef.createObjectURL(blob);
  const link = documentRef.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  documentRef.body?.appendChild(link);
  link.click();
  link.remove?.();
  urlRef.revokeObjectURL?.(url);

  return `${fileName} download started.`;
}

async function copyStatement(csvText: string) {
  const { clipboard } = browserExportApi();
  if (!csvText.trim() || !clipboard?.writeText) return false;
  await clipboard.writeText(csvText);
  return true;
}

async function shareStatement(csvText: string, fileName: string) {
  if (!csvText.trim()) return 'Statement is empty.';

  const share = (Share as any)?.share;
  if (!share) return 'Statement text is ready below for manual share.';

  await share({
    title: fileName,
    message: csvText,
  });

  return 'Earnings Vault statement share sheet opened.';
}

function buildStatementCsv({
  accounts,
  currency,
  reserveHolds,
  requests,
  summary,
}: {
  accounts: PayoutAccount[];
  currency: string;
  reserveHolds: ReserveHold[];
  requests: PayoutRequest[];
  summary: EarningsVaultSummary | null;
}) {
  const rows = [
    ['section', 'date', 'id', 'status', 'amount', 'currency', 'provider', 'reference', 'note'],
    ['summary', new Date().toISOString(), 'available_balance', '', asNumber(summary?.availableBalance).toFixed(2), currency, '', '', ''],
    ['summary', new Date().toISOString(), 'lifetime_earnings', '', asNumber(summary?.lifetimeEarnings).toFixed(2), currency, '', '', ''],
    ['summary', new Date().toISOString(), 'reserve_balance', '', asNumber(summary?.reserveBalance).toFixed(2), currency, '', '', ''],
    ...accounts.map((account) => [
      'payout_method',
      account.createdAt || '',
      account.id,
      account.isVerified ? 'VERIFIED' : 'PENDING_REVIEW',
      '',
      currency,
      account.provider || '',
      account.maskedDestination || account.accountLabel || '',
      account.accountLabel || '',
    ]),
    ...requests.map((request) => [
      'payout_request',
      request.requestedAt || request.createdAt || '',
      request.id,
      String(request.status || ''),
      asNumber(request.amount).toFixed(2),
      request.currency || currency,
      request.provider || '',
      request.batchId || request.payoutAccountId || '',
      request.note || request.reason || '',
    ]),
    ...reserveHolds.map((hold) => [
      'reserve_hold',
      hold.heldAt || hold.createdAt || '',
      hold.id,
      String(hold.status || ''),
      asNumber(hold.amount).toFixed(2),
      hold.currency || currency,
      hold.sourceType || '',
      hold.sourceId || hold.payoutRequestId || '',
      hold.reason || '',
    ]),
  ];

  return rows.map((row) => row.map((cell) => csvEscape(String(cell))).join(',')).join('\n');
}

export function EarningsVaultScreen() {
  const currentUser = getCurrentUser();
  const canUse = canUseEarningsVault(currentUser?.role);
  const [summary, setSummary] = useState<EarningsVaultSummary | null>(null);
  const [options, setOptions] = useState<EarningsVaultOption[]>([]);
  const [accounts, setAccounts] = useState<PayoutAccount[]>([]);
  const [requests, setRequests] = useState<PayoutRequest[]>([]);
  const [reserveHolds, setReserveHolds] = useState<ReserveHold[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [requestingPayout, setRequestingPayout] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [provider, setProvider] = useState('payid');
  const [accountLabel, setAccountLabel] = useState('PayID cashout');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bsb, setBsb] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [payIdType, setPayIdType] = useState('email');
  const [payIdValue, setPayIdValue] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('50');
  const [payoutNote, setPayoutNote] = useState('');
  const [showStatement, setShowStatement] = useState(false);
  const [statementNotice, setStatementNotice] = useState('');
  const [serverStatementCsv, setServerStatementCsv] = useState('');

  const loadVault = useCallback(async () => {
    if (!canUse) return;

    setLoading(true);
    setError('');

    try {
      const [nextSummary, nextOptions, nextAccounts, nextRequests, nextReserveHolds, nextStatementCsv] = await Promise.all([
        getEarningsVaultSummary(),
        getEarningsVaultOptions(),
        listPayoutAccounts(),
        listPayoutRequests(),
        listReserveHolds(),
        getEarningsVaultStatementCsv().catch(() => ''),
      ]);

      setSummary(nextSummary);
      setOptions(nextOptions.items || []);
      setAccounts(nextAccounts.items || []);
      setRequests(nextRequests.items || []);
      setReserveHolds(nextReserveHolds.items || []);
      setServerStatementCsv(nextStatementCsv || '');
      setSelectedAccountId((current) => current || nextAccounts.items?.[0]?.id || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Earnings Vault failed to load.');
    } finally {
      setLoading(false);
    }
  }, [canUse]);

  useEffect(() => {
    void loadVault();
  }, [loadVault]);

  const currency = summary?.currency || 'AUD';

  const requestSummary = useMemo(() => {
    const pendingStatuses = new Set(['REQUESTED', 'REVIEW', 'APPROVED', 'BATCHED', 'PROCESSING']);
    const pending = requests.filter((request) => pendingStatuses.has(String(request.status || '').toUpperCase()));
    return {
      pendingCount: pending.length,
      pendingTotal: pending.reduce((sum, request) => sum + asNumber(request.amount), 0),
      paidCount: requests.filter((request) => String(request.status || '').toUpperCase() === 'PAID').length,
      rejectedCount: requests.filter((request) => String(request.status || '').toUpperCase() === 'REJECTED').length,
    };
  }, [requests]);

  const heldReserveTotal = useMemo(
    () => reserveHolds
      .filter((hold) => String(hold.status || '').toUpperCase() === 'HELD')
      .reduce((sum, hold) => sum + asNumber(hold.amount), 0),
    [reserveHolds],
  );

  const fallbackStatementCsv = useMemo(
    () => buildStatementCsv({ accounts, currency, reserveHolds, requests, summary }),
    [accounts, currency, reserveHolds, requests, summary],
  );

  const statementCsv = serverStatementCsv.trim() ? serverStatementCsv : fallbackStatementCsv;
  const statementSource = serverStatementCsv.trim() ? 'Server statement endpoint' : 'Local fallback statement';

  const statementName = useMemo(() => statementFileName(currentUser?.id), [currentUser?.id]);

  async function handleStatementAction(action: 'copy' | 'download' | 'share' | 'toggle') {
    try {
      setStatementNotice('');

      if (action === 'toggle') {
        setShowStatement((current) => !current);
        return;
      }

      if (action === 'download') {
        setStatementNotice(downloadStatement(statementCsv, statementName));
        return;
      }

      if (action === 'copy') {
        const copied = await copyStatement(statementCsv);
        setStatementNotice(copied ? 'Earnings Vault statement copied.' : 'Statement text is ready below for manual copy.');
        setShowStatement(true);
        return;
      }

      setStatementNotice(await shareStatement(statementCsv, statementName));
    } catch (err) {
      setStatementNotice(err instanceof Error ? err.message : 'Statement action failed.');
    }
  }

  async function handleSaveAccount() {
    const selectedOption = options.find((item) => item.id === provider);

    if (selectedOption?.enabled === false) {
      setError(`${selectedOption.label || providerLabel(provider, options)} is not enabled for payouts yet.`);
      return;
    }

    setSavingAccount(true);
    setError('');
    setNotice('');

    try {
      const created = await savePayoutAccount({
        provider,
        accountLabel: accountLabel.trim() || providerLabel(provider, options),
        bankAccountName: bankAccountName.trim() || undefined,
        bsb: bsb.trim() || undefined,
        accountNumber: accountNumber.trim() || undefined,
        payIdType: payIdType.trim() || undefined,
        payIdValue: payIdValue.trim() || undefined,
        metadata: {
          source: 'earnings_vault_screen',
          creatorRole: currentUser?.role,
        },
      });

      setNotice(`Payout method ${created.accountLabel || created.id} saved for Headmistress review.`);
      setSelectedAccountId(created.id);
      await loadVault();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payout method could not be saved.');
    } finally {
      setSavingAccount(false);
    }
  }

  async function handleRequestPayout() {
    const amount = Number(payoutAmount);
    const minimum = asNumber(summary?.minimumCashout || 50);

    if (!selectedAccountId) {
      setError('Save or select a payout method before requesting cashout.');
      return;
    }

    if (!Number.isFinite(amount) || amount < minimum) {
      setError(`Minimum cashout is ${moneyLabel(minimum, currency)}.`);
      return;
    }

    setRequestingPayout(true);
    setError('');
    setNotice('');

    try {
      const request = await createPayoutRequest({
        amount,
        currency,
        payoutAccountId: selectedAccountId,
        note: payoutNote.trim() || undefined,
      });

      setNotice(`Cashout request ${request.id} sent to the Headmistress payout queue.`);
      setPayoutNote('');
      await loadVault();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cashout request failed.');
    } finally {
      setRequestingPayout(false);
    }
  }

  if (!canUse) {
    return (
      <View style={{ flex: 1, backgroundColor: mxTheme.colors.background, padding: mxTheme.spacing.md }}>
        <Text style={{ color: '#ff6b6b', fontSize: 18, fontWeight: '900' }}>Earnings Vault is restricted.</Text>
        <Text style={{ color: mxTheme.colors.muted, marginTop: 8 }}>This panel is available to Mistress, Headmistress, and Admin roles.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: mxTheme.colors.background }} contentContainerStyle={{ padding: mxTheme.spacing.md }}>
      <View style={{ marginBottom: mxTheme.spacing.md }}>
        <Text style={{ color: mxTheme.colors.text, fontSize: 24, fontWeight: '900' }}>Earnings Vault</Text>
        <Text style={{ color: mxTheme.colors.muted, marginTop: 6 }}>
          Creator cashout, payout method setup, reserve visibility, and Headmistress approval tracking.
        </Text>
      </View>

      <View style={{ backgroundColor: '#211015', borderColor: '#7f1d3c', borderRadius: mxTheme.radius.md, borderWidth: 1, marginBottom: mxTheme.spacing.md, padding: mxTheme.spacing.md }}>
        <Text style={{ color: '#ff9abf', fontWeight: '900' }}>Recordkeeping Note</Text>
        <Text style={{ color: mxTheme.colors.text, marginTop: 6 }}>
          This panel tracks gross earnings, reserves, payout requests, and method references. It is not tax advice and should stay exportable for accountant review.
        </Text>
      </View>

      {notice ? <Text style={{ color: mxTheme.colors.success, marginBottom: mxTheme.spacing.sm }}>{notice}</Text> : null}
      {error ? <Text style={{ color: '#ff6b6b', marginBottom: mxTheme.spacing.sm }}>{error}</Text> : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: mxTheme.spacing.sm }}>
        {metricPanel('Available', moneyLabel(summary?.availableBalance, currency), mxTheme.colors.success)}
        {metricPanel('Lifetime', moneyLabel(summary?.lifetimeEarnings, currency), mxTheme.colors.accentSoft)}
        {metricPanel('Pending', moneyLabel(requestSummary.pendingTotal, currency), mxTheme.colors.warning)}
        {metricPanel('Reserve Holds', moneyLabel(heldReserveTotal || summary?.reserveBalance, currency), heldReserveTotal ? '#ff6b6b' : mxTheme.colors.muted)}
        {metricPanel('Minimum Cashout', moneyLabel(summary?.minimumCashout || 50, currency), mxTheme.colors.border)}
      </View>

      <View style={panelStyle(mxTheme.colors.accentSoft)}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Payout Method</Text>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 12, marginTop: 4 }}>Save PayID, bank, or provider references before requesting cashout.</Text>
          </View>
          <ActionPillButton actionKey="refreshListings" disabled={loading} label={loading ? 'Loading' : 'Refresh'} onPress={() => { void loadVault(); }} />
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {PAYOUT_PROVIDERS.map((item) => {
            const option = options.find((row) => row.id === item.id);
            const enabled = option?.enabled !== false;
            return (
              <Pressable
                key={item.id}
                disabled={!enabled}
                onPress={() => setProvider(item.id)}
                style={{
                  backgroundColor: provider === item.id ? mxTheme.colors.accentSoft : mxTheme.colors.surfaceSoft,
                  borderColor: provider === item.id ? mxTheme.colors.text : mxTheme.colors.border,
                  borderRadius: mxTheme.radius.sm,
                  borderWidth: 1,
                  marginBottom: 8,
                  marginRight: 8,
                  opacity: enabled ? 1 : 0.45,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                }}
              >
                <Text style={{ color: provider === item.id ? '#000' : mxTheme.colors.text, fontWeight: '900' }}>{option?.label || item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <TextInput placeholder="Method label" placeholderTextColor={mxTheme.colors.muted} value={accountLabel} onChangeText={setAccountLabel} style={fieldStyle()} />
        <TextInput placeholder="Account name" placeholderTextColor={mxTheme.colors.muted} value={bankAccountName} onChangeText={setBankAccountName} style={fieldStyle()} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput placeholder="BSB" placeholderTextColor={mxTheme.colors.muted} value={bsb} onChangeText={setBsb} style={{ ...fieldStyle(), flex: 1 }} />
          <TextInput placeholder="Account number" placeholderTextColor={mxTheme.colors.muted} value={accountNumber} onChangeText={setAccountNumber} style={{ ...fieldStyle(), flex: 1 }} />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput placeholder="PayID type" placeholderTextColor={mxTheme.colors.muted} value={payIdType} onChangeText={setPayIdType} style={{ ...fieldStyle(), flex: 1 }} />
          <TextInput placeholder="PayID value" placeholderTextColor={mxTheme.colors.muted} value={payIdValue} onChangeText={setPayIdValue} style={{ ...fieldStyle(), flex: 1 }} />
        </View>
        <ActionPillButton actionKey="saveAction" disabled={savingAccount} label={savingAccount ? 'Saving Method' : 'Save Payout Method'} onPress={() => { void handleSaveAccount(); }} />
      </View>

      <View style={panelStyle(mxTheme.colors.warning)}>
        <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Request Cashout</Text>
        <Text style={{ color: mxTheme.colors.muted, fontSize: 12, marginTop: 4, marginBottom: 8 }}>
          Requests go to the Headmistress payout queue for approve, reject, batch, and paid-state controls.
        </Text>
        <TextInput
          keyboardType="numeric"
          placeholder="Amount"
          placeholderTextColor={mxTheme.colors.muted}
          value={payoutAmount}
          onChangeText={setPayoutAmount}
          style={fieldStyle()}
        />
        <TextInput
          multiline
          placeholder="Cashout note"
          placeholderTextColor={mxTheme.colors.muted}
          value={payoutNote}
          onChangeText={setPayoutNote}
          style={{ ...fieldStyle(), minHeight: 72, textAlignVertical: 'top' }}
        />
        <Text style={{ color: mxTheme.colors.muted, fontSize: 12, marginBottom: 8 }}>
          Selected method: {selectedAccountId || 'No payout method selected'}
        </Text>
        <ActionPillButton actionKey="requestApproval" disabled={requestingPayout || !selectedAccountId} label={requestingPayout ? 'Requesting' : 'Request Cashout'} onPress={() => { void handleRequestPayout(); }} />
      </View>

      <View style={panelStyle(mxTheme.colors.accentSoft)}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900' }}>Payout Statement Export</Text>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 12, marginTop: 4 }}>
              CSV-ready payout methods, cashout requests, reserve holds, and balance summary for creator records.
            </Text>
            <Text style={{ color: mxTheme.colors.accentSoft, fontSize: 11, fontWeight: '800', marginTop: 4 }}>{statementSource}</Text>
          </View>
        </View>
        {statementNotice ? <Text style={{ color: mxTheme.colors.success, marginBottom: 8 }}>{statementNotice}</Text> : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          <ActionPillButton actionKey={showStatement ? 'hideExport' : 'showExport'} label={showStatement ? 'Hide Statement' : 'Show Statement'} onPress={() => { void handleStatementAction('toggle'); }} />
          <ActionPillButton actionKey="copyCsv" label="Copy Statement" onPress={() => { void handleStatementAction('copy'); }} />
          <ActionPillButton actionKey="downloadCsv" label="Download CSV" onPress={() => { void handleStatementAction('download'); }} />
          <ActionPillButton actionKey="shareCsv" label="Share CSV" onPress={() => { void handleStatementAction('share'); }} />
        </View>
        {showStatement ? (
          <TextInput
            editable={false}
            multiline
            selectTextOnFocus
            value={statementCsv}
            style={{
              backgroundColor: '#050505',
              borderColor: mxTheme.colors.border,
              borderRadius: mxTheme.radius.sm,
              borderWidth: 1,
              color: mxTheme.colors.text,
              minHeight: 180,
              padding: 10,
              textAlignVertical: 'top',
            }}
          />
        ) : null}
      </View>

      <View style={panelStyle(mxTheme.colors.border)}>
        <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', marginBottom: 8 }}>Saved Payout Methods</Text>
        {accounts.length === 0 ? <Text style={{ color: mxTheme.colors.muted }}>No payout methods saved yet.</Text> : null}
        {accounts.map((account) => {
          const active = selectedAccountId === account.id;
          return (
            <Pressable
              key={account.id}
              onPress={() => setSelectedAccountId(account.id)}
              style={{
                backgroundColor: active ? '#1b2a24' : mxTheme.colors.surfaceSoft,
                borderColor: active ? mxTheme.colors.success : mxTheme.colors.border,
                borderRadius: mxTheme.radius.sm,
                borderWidth: 1,
                marginBottom: 8,
                padding: 10,
              }}
            >
              <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>{account.accountLabel || providerLabel(account.provider, options)}</Text>
              {smallLine('Provider', providerLabel(account.provider, options))}
              {smallLine('Destination', account.maskedDestination || 'Tokenised reference')}
              {smallLine('Verified', account.isVerified ? 'Yes' : 'Pending review', account.isVerified ? mxTheme.colors.success : mxTheme.colors.warning)}
            </Pressable>
          );
        })}
      </View>

      <View style={panelStyle(mxTheme.colors.border)}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {metricPanel('Open Requests', String(requestSummary.pendingCount), mxTheme.colors.warning)}
          {metricPanel('Paid Requests', String(requestSummary.paidCount), mxTheme.colors.success)}
          {metricPanel('Rejected', String(requestSummary.rejectedCount), requestSummary.rejectedCount ? '#ff6b6b' : mxTheme.colors.muted)}
        </View>
        <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', marginBottom: 8 }}>Cashout Requests</Text>
        {requests.length === 0 ? <Text style={{ color: mxTheme.colors.muted }}>No cashout requests yet.</Text> : null}
        {requests.slice(0, 8).map((request) => (
          <View key={request.id} style={{ backgroundColor: mxTheme.colors.surfaceSoft, borderColor: statusTone(request.status), borderRadius: mxTheme.radius.sm, borderWidth: 1, marginBottom: 8, padding: 10 }}>
            <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>{moneyLabel(request.amount, request.currency || currency)}</Text>
            {smallLine('Status', String(request.status || 'REQUESTED').toUpperCase(), statusTone(request.status))}
            {smallLine('Provider', providerLabel(request.provider, options))}
            {smallLine('Requested', dateLabel(request.requestedAt || request.createdAt))}
            {request.note || request.reason ? <Text style={{ color: mxTheme.colors.muted, marginTop: 6 }}>{request.note || request.reason}</Text> : null}
          </View>
        ))}
      </View>

      <View style={panelStyle(mxTheme.colors.border)}>
        <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', marginBottom: 8 }}>Reserve Holds</Text>
        {reserveHolds.length === 0 ? <Text style={{ color: mxTheme.colors.muted }}>No reserve holds currently visible.</Text> : null}
        {reserveHolds.slice(0, 6).map((hold) => (
          <View key={hold.id} style={{ backgroundColor: mxTheme.colors.surfaceSoft, borderColor: statusTone(hold.status), borderRadius: mxTheme.radius.sm, borderWidth: 1, marginBottom: 8, padding: 10 }}>
            <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>{moneyLabel(hold.amount, hold.currency || currency)}</Text>
            {smallLine('Status', String(hold.status || 'HELD').toUpperCase(), statusTone(hold.status))}
            {smallLine('Source', `${hold.sourceType || 'manual'} / ${hold.sourceId || hold.payoutRequestId || 'unlinked'}`)}
            {smallLine('Held', dateLabel(hold.heldAt || hold.createdAt))}
            {hold.reason ? <Text style={{ color: mxTheme.colors.muted, marginTop: 6 }}>{hold.reason}</Text> : null}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
