import type { HostedQuizAdminDiagnosticsResponse, HostedQuizDiagnosticsFilterState } from '../../api/gameHubApi';
import type { GameHubBrowserSmokeTarget, GameHubHostedQuizRecord } from './gameHubModel';

export type HostedQuizDiagnosticsPresentation = {
  entriesSummary: string;
  receiptsSummary: string;
  filterSummary: string;
  entryRows: string[];
  receiptRows: string[];
  emptyEntryText: string;
  emptyReceiptText: string;
};

export function formatGameHubDashboardTimestamp(value?: string) {
  if (!value) return 'none yet';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function formatHostedQuizEntryLabel(quiz: Pick<GameHubHostedQuizRecord, 'questionCount' | 'answerCount' | 'entryFee'>) {
  const entryLabel = Number(quiz.entryFee || 0) > 0 ? `${quiz.entryFee} credits entry` : 'free entry';
  return `${quiz.questionCount} questions / ${quiz.answerCount} answers / ${entryLabel}`;
}

export function hostedQuizDiagnosticsActionLabel(input: { loading: boolean; hasDiagnostics: boolean }) {
  if (input.loading) return 'Loading';
  return input.hasDiagnostics ? 'Refresh' : 'Diagnostics';
}

export function overlayDispatchActionLabel(dispatching: boolean) {
  return dispatching ? 'Dispatching' : 'Dispatch';
}

export function formatGameHubSmokeTargetEvidence(target: Pick<GameHubBrowserSmokeTarget, 'route' | 'checkpoint' | 'evidence'>) {
  return `${target.route} / ${target.checkpoint} / evidence: ${target.evidence.join(' + ')}`;
}

export function formatHostedQuizDiagnosticsFilterSummary(filters?: HostedQuizDiagnosticsFilterState) {
  if (!filters) return 'All receipts / latest 100 rows';

  const parts = [
    filters.eventName ? `event ${filters.eventName}` : 'all events',
    filters.channel ? `channel ${filters.channel}` : 'all channels',
  ];
  if (filters.roomId) parts.push(`room ${filters.roomId}`);
  parts.push(`latest ${filters.receiptLimit} receipts`);
  return parts.join(' / ');
}

export function buildHostedQuizDiagnosticsPresentation(
  diagnostics: HostedQuizAdminDiagnosticsResponse,
): HostedQuizDiagnosticsPresentation {
  const latestEntries = diagnostics.entries.items.slice(0, 3);
  const latestReceipts = diagnostics.receipts.items.slice(0, 3);

  return {
    entriesSummary: `${diagnostics.entries.count} rows / ${diagnostics.entries.totalEntryFees} credits`,
    receiptsSummary: `${diagnostics.receipts.count} rows / ${formatGameHubDashboardTimestamp(diagnostics.receipts.lastEmittedAt)}`,
    filterSummary: formatHostedQuizDiagnosticsFilterSummary(diagnostics.filters),
    entryRows: latestEntries.map((entry) =>
      `Entry ${entry.playerId}: ${entry.entryFeePaid} ${entry.currency} / ${formatGameHubDashboardTimestamp(entry.createdAt)}`),
    receiptRows: latestReceipts.map((receipt) =>
      `${receipt.eventName} via ${receipt.channel} to ${receipt.socketRoom} / ${receipt.status}`),
    emptyEntryText: 'No paid entry entitlements recorded.',
    emptyReceiptText: 'No overlay receipt rows recorded.',
  };
}
