import React, { useMemo, useState } from 'react';
import { ScrollView, Share, Text, TextInput, View } from 'react-native';
import {
  exportMyGoalFundReceiptsCsv,
  GoalContributionReceipt,
  listMyGoalFundReceipts,
} from '../../api/goalsApi';
import { ActionPillButton } from '../buttons/ActionPillButton';

type ReceiptRow = GoalContributionReceipt & {
  fundTitle?: string;
  fundCategory?: string;
};

const CSV_FILE_NAME = 'goal-fund-receipts.csv';

function money(value: number | string | null | undefined) {
  return Number(value || 0).toFixed(2);
}

function csvEscape(value: unknown) {
  const normalized = String(value ?? '');
  return `"${normalized.replace(/"/g, '""')}"`;
}

function fundLabel(receipt: ReceiptRow) {
  return receipt.fundTitle || receipt.goalFund?.title || receipt.goalFundId || 'Goal fund';
}

function categoryLabel(receipt: ReceiptRow) {
  return receipt.fundCategory || receipt.goalFund?.category || '';
}

function browserExportApi() {
  const scope = globalThis as any;

  return {
    BlobRef: scope.Blob,
    documentRef: scope.document,
    urlRef: scope.URL || scope.webkitURL,
    clipboard: scope.navigator?.clipboard,
  };
}

function downloadCsvStatement(csvText: string) {
  if (!csvText.trim()) {
    return 'Load history before exporting.';
  }

  const { BlobRef, documentRef, urlRef } = browserExportApi();
  if (!BlobRef || !documentRef?.createElement || !urlRef?.createObjectURL) {
    return 'CSV statement is ready below for manual save or share.';
  }

  const blob = new BlobRef([csvText], { type: 'text/csv;charset=utf-8' });
  const url = urlRef.createObjectURL(blob);
  const link = documentRef.createElement('a');
  link.href = url;
  link.download = CSV_FILE_NAME;
  link.style.display = 'none';
  documentRef.body?.appendChild(link);
  link.click();
  link.remove?.();
  urlRef.revokeObjectURL?.(url);

  return `${CSV_FILE_NAME} download started.`;
}

async function copyCsvStatement(csvText: string) {
  const { clipboard } = browserExportApi();
  if (!csvText.trim() || !clipboard?.writeText) {
    return false;
  }

  await clipboard.writeText(csvText);
  return true;
}

async function shareCsvStatement(csvText: string) {
  if (!csvText.trim()) {
    return 'Load history before sharing.';
  }

  const share = (Share as any)?.share;
  if (!share) {
    return 'CSV statement is ready below for manual share.';
  }

  await share({
    title: CSV_FILE_NAME,
    message: csvText,
  });

  return 'CSV statement share sheet opened.';
}

export function GoalContributionHistoryPanel() {
  const [receipts, setReceipts] = useState<ReceiptRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [serverCsvText, setServerCsvText] = useState('');

  const totals = useMemo(
    () =>
      receipts.reduce(
        (acc, receipt) => ({
          gross: acc.gross + Number(receipt.amount || 0),
          mistress: acc.mistress + Number(receipt.mistressAmount || 0),
          platform: acc.platform + Number(receipt.platformAmount || 0),
        }),
        { gross: 0, mistress: 0, platform: 0 },
      ),
    [receipts],
  );

  const csvText = useMemo(() => {
    const header = [
      'receipt_number',
      'created_at',
      'goal_fund',
      'category',
      'gross_amount',
      'mistress_amount',
      'platform_amount',
      'message',
    ];

    const rows = receipts.map((receipt) => [
      receipt.receiptNumber,
      receipt.createdAt || '',
      fundLabel(receipt),
      categoryLabel(receipt),
      money(receipt.amount),
      money(receipt.mistressAmount),
      money(receipt.platformAmount),
      receipt.message || '',
    ]);

    return [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
  }, [receipts]);

  const exportText = serverCsvText || csvText;

  async function loadHistory() {
    try {
      setLoading(true);
      setError(null);
      const [receiptRows, csvStatement] = await Promise.all([
        listMyGoalFundReceipts(),
        exportMyGoalFundReceiptsCsv().catch(() => ''),
      ]);
      const allReceipts = receiptRows
        .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
      setReceipts(allReceipts);
      setServerCsvText(csvStatement);
      setExportNotice(csvStatement ? 'Server CSV statement loaded.' : 'Receipt history loaded. CSV text prepared locally.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Contribution history failed to load');
      setExportNotice(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyExport() {
    try {
      const copied = await copyCsvStatement(exportText);
      setExportOpen(true);
      setExportNotice(copied ? 'CSV statement copied.' : 'CSV statement is ready below for manual copy.');
    } catch (err) {
      setExportNotice(err instanceof Error ? err.message : 'CSV copy failed.');
    }
  }

  function handleDownloadExport() {
    setExportOpen(true);
    setExportNotice(downloadCsvStatement(exportText));
  }

  async function handleShareExport() {
    try {
      setExportOpen(true);
      setExportNotice(await shareCsvStatement(exportText));
    } catch (err) {
      setExportNotice(err instanceof Error ? err.message : 'CSV share failed.');
    }
  }

  return (
    <View style={{ backgroundColor: '#111', padding: 12, borderRadius: 14, marginBottom: 10 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>Contribution History & Export</Text>
      <Text style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>
        Loads contribution and owned-fund receipts from the dedicated records endpoint and shows the server-generated CSV statement.
      </Text>

      {error ? <Text style={{ color: '#ff6b6b', marginTop: 8 }}>{error}</Text> : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
        <ActionPillButton
          actionKey="loadHistory"
          onPress={loadHistory}
          disabled={loading}
          label={loading ? 'Loading...' : undefined}
        />
        <ActionPillButton
          actionKey={exportOpen ? 'hideExport' : 'showExport'}
          onPress={() => setExportOpen((current) => !current)}
          disabled={receipts.length === 0}
        />
        <ActionPillButton
          actionKey="downloadCsv"
          onPress={handleDownloadExport}
          disabled={receipts.length === 0}
        />
        <ActionPillButton
          actionKey="copyCsv"
          onPress={handleCopyExport}
          disabled={receipts.length === 0}
        />
        <ActionPillButton
          actionKey="shareCsv"
          onPress={handleShareExport}
          disabled={receipts.length === 0}
        />
      </View>

      {exportNotice ? <Text style={{ color: '#d4af37', fontSize: 11, marginTop: 2 }}>{exportNotice}</Text> : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
        <Text style={{ color: '#aaa', fontSize: 11, marginRight: 12 }}>Receipts: {receipts.length}</Text>
        <Text style={{ color: '#aaa', fontSize: 11, marginRight: 12 }}>Gross: {money(totals.gross)}</Text>
        <Text style={{ color: '#aaa', fontSize: 11, marginRight: 12 }}>Mistress: {money(totals.mistress)}</Text>
        <Text style={{ color: '#aaa', fontSize: 11 }}>Platform: {money(totals.platform)}</Text>
      </View>

      {receipts.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {receipts.slice(0, 12).map((receipt) => (
            <View key={receipt.id || receipt.receiptNumber} style={{ backgroundColor: '#1b1b1b', borderRadius: 10, marginRight: 8, minWidth: 220, padding: 10 }}>
              <Text style={{ color: '#fff', fontWeight: '900' }}>{receipt.receiptNumber}</Text>
              <Text style={{ color: '#ff9abf', fontSize: 11, marginTop: 4 }}>{fundLabel(receipt)}</Text>
              <Text style={{ color: '#aaa', fontSize: 11, marginTop: 4 }}>
                {money(receipt.amount)} credits | Mistress {money(receipt.mistressAmount)} | Platform {money(receipt.platformAmount)}
              </Text>
              {receipt.message ? <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>{receipt.message}</Text> : null}
            </View>
          ))}
        </ScrollView>
      ) : null}

      {exportOpen ? (
        <TextInput
          value={exportText}
          editable={false}
          multiline
          selectTextOnFocus
          style={{
            backgroundColor: '#050505',
            borderColor: '#333',
            borderRadius: 10,
            borderWidth: 1,
            color: '#ddd',
            fontSize: 11,
            marginTop: 10,
            minHeight: 120,
            padding: 10,
          }}
        />
      ) : null}
    </View>
  );
}
