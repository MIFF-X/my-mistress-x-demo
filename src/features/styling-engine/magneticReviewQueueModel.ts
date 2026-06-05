import type { MXGeneratedAdapterBundleSummary } from './mxMagneticAdapterTypes';

export type MXMagneticReviewQueueLane = 'blocked' | 'internal-review' | 'marketplace-review';

export type MXMagneticReviewStatus =
  | 'draft'
  | 'blocked'
  | 'needs-review'
  | 'ready-for-marketplace'
  | 'approved'
  | 'rejected'
  | 'published';

export type MXMagneticReviewRecord = {
  id: string;
  packId: string;
  packName: string;
  adapterContractId: string;
  lane: MXMagneticReviewQueueLane;
  status: MXMagneticReviewStatus;
  readiness: number;
  readyCount: number;
  totalCount: number;
  reviewOwner: 'Generator Owner' | 'Headmistress Assistant' | 'Headmistress';
  submittedBy: 'mistress-x-styling-engine';
  submittedAt: string;
  lastUpdatedAt: string;
  manifestPath?: string;
  frontCardPath?: string;
  expandedInfoCardPath?: string;
  downloadManifestPath?: string;
  marketplaceListingId?: string;
  downloadableBundleId?: string;
  rejectionReason?: string;
  notes: string[];
  nextAction: string;
};

export type MXMagneticReviewAuditRecord = {
  id: string;
  reviewRecordId: string;
  action: string;
  actorUserId: string;
  fromLane?: string;
  toLane?: string;
  fromStatus?: string;
  toStatus?: string;
  fromReviewOwner?: string;
  toReviewOwner?: string;
  rejectionReason?: string;
  marketplaceListingId?: string;
  downloadableBundleId?: string;
  note?: string;
  metadata?: unknown;
  createdAt: string;
};

export type MXMagneticDownloadableBundleStatus = 'scaffolded' | 'generating' | 'ready' | 'failed' | 'revoked';

export type MXMagneticDownloadableBundle = {
  id: string;
  reviewRecordId: string;
  packId: string;
  packName: string;
  adapterContractId: string;
  status: MXMagneticDownloadableBundleStatus;
  outputFormat: 'zip' | string;
  requestedFileName: string;
  storagePath?: string;
  downloadUrl?: string;
  fileSizeBytes?: number;
  checksumSha256?: string;
  failureReason?: string;
  includeManifest: boolean;
  includeCards: boolean;
  includeComponents: boolean;
  includeTokens: boolean;
  includeAuditSummary: boolean;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  notes: string[];
  metadata?: unknown;
};

export type MXMagneticReviewQueueSummary = {
  blocked: number;
  internalReview: number;
  marketplaceReview: number;
  approved: number;
  published: number;
  total: number;
};

function nowIso() {
  return new Date().toISOString();
}

function createId(packId: string, adapterContractId: string) {
  return `mx-review-${packId}-${adapterContractId}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function resolveMagneticReviewStatus(readiness: number, readyCount: number, totalCount: number): Pick<MXMagneticReviewRecord, 'lane' | 'status' | 'reviewOwner' | 'nextAction'> {
  if (readiness >= 86 && readyCount >= totalCount - 1) {
    return {
      lane: 'marketplace-review',
      status: 'ready-for-marketplace',
      reviewOwner: 'Headmistress',
      nextAction: 'Queue for Marketplace Review',
    };
  }

  if (readiness >= 60) {
    return {
      lane: 'internal-review',
      status: 'needs-review',
      reviewOwner: 'Headmistress Assistant',
      nextAction: 'Send to Review Queue',
    };
  }

  return {
    lane: 'blocked',
    status: 'blocked',
    reviewOwner: 'Generator Owner',
    nextAction: 'Resolve Missing Outputs',
  };
}

export function createMagneticReviewRecord(summary: MXGeneratedAdapterBundleSummary, readyCount: number, totalCount: number): MXMagneticReviewRecord {
  const readiness = totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0;
  const status = resolveMagneticReviewStatus(readiness, readyCount, totalCount);
  const timestamp = nowIso();

  return {
    id: createId(summary.packId, summary.adapterContractId),
    packId: summary.packId,
    packName: summary.packName,
    adapterContractId: summary.adapterContractId,
    lane: status.lane,
    status: status.status,
    readiness,
    readyCount,
    totalCount,
    reviewOwner: status.reviewOwner,
    submittedBy: 'mistress-x-styling-engine',
    submittedAt: timestamp,
    lastUpdatedAt: timestamp,
    manifestPath: summary.downloadManifestPath,
    frontCardPath: summary.frontCardPath,
    expandedInfoCardPath: summary.expandedInfoCardPath,
    downloadManifestPath: summary.downloadManifestPath,
    notes: [
      `Generated from adapter contract ${summary.adapterContractId}.`,
      `${readyCount}/${totalCount} checklist outputs ready.`,
    ],
    nextAction: status.nextAction,
  };
}

export function summarizeMagneticReviewQueue(records: MXMagneticReviewRecord[]): MXMagneticReviewQueueSummary {
  return {
    blocked: records.filter((record) => record.lane === 'blocked').length,
    internalReview: records.filter((record) => record.lane === 'internal-review').length,
    marketplaceReview: records.filter((record) => record.lane === 'marketplace-review').length,
    approved: records.filter((record) => record.status === 'approved').length,
    published: records.filter((record) => record.status === 'published').length,
    total: records.length,
  };
}

export function formatMagneticReviewRecord(record: MXMagneticReviewRecord) {
  return [
    `Review Record: ${record.packName}`,
    `Record ID: ${record.id}`,
    `Pack ID: ${record.packId}`,
    `Adapter: ${record.adapterContractId}`,
    `Lane: ${record.lane}`,
    `Status: ${record.status}`,
    `Readiness: ${record.readiness}% (${record.readyCount}/${record.totalCount})`,
    `Review owner: ${record.reviewOwner}`,
    `Next action: ${record.nextAction}`,
    record.manifestPath ? `Manifest: ${record.manifestPath}` : null,
    record.frontCardPath ? `Front card: ${record.frontCardPath}` : null,
    record.expandedInfoCardPath ? `Expanded card: ${record.expandedInfoCardPath}` : null,
  ].filter(Boolean).join('\n');
}

export function formatMagneticReviewAuditRecord(record: MXMagneticReviewAuditRecord) {
  return [
    `Audit Action: ${record.action}`,
    `Audit ID: ${record.id}`,
    `Review Record: ${record.reviewRecordId}`,
    `Actor: ${record.actorUserId}`,
    record.fromStatus || record.toStatus ? `Status: ${record.fromStatus || 'new'} → ${record.toStatus || 'unknown'}` : null,
    record.fromLane || record.toLane ? `Lane: ${record.fromLane || 'new'} → ${record.toLane || 'unknown'}` : null,
    record.fromReviewOwner || record.toReviewOwner ? `Owner: ${record.fromReviewOwner || 'none'} → ${record.toReviewOwner || 'none'}` : null,
    record.rejectionReason ? `Rejection reason: ${record.rejectionReason}` : null,
    record.note ? `Note: ${record.note}` : null,
    `Created: ${record.createdAt}`,
  ].filter(Boolean).join('\n');
}

export function formatMagneticDownloadableBundle(bundle: MXMagneticDownloadableBundle) {
  return [
    `Downloadable Bundle: ${bundle.requestedFileName}`,
    `Bundle ID: ${bundle.id}`,
    `Review Record: ${bundle.reviewRecordId}`,
    `Pack: ${bundle.packName}`,
    `Adapter: ${bundle.adapterContractId}`,
    `Status: ${bundle.status}`,
    `Format: ${bundle.outputFormat}`,
    bundle.storagePath ? `Storage path: ${bundle.storagePath}` : null,
    bundle.downloadUrl ? `Download URL: ${bundle.downloadUrl}` : null,
    bundle.fileSizeBytes ? `File size: ${bundle.fileSizeBytes}` : null,
    bundle.checksumSha256 ? `Checksum: ${bundle.checksumSha256}` : null,
    `Includes: manifest=${bundle.includeManifest}, cards=${bundle.includeCards}, components=${bundle.includeComponents}, tokens=${bundle.includeTokens}, audit=${bundle.includeAuditSummary}`,
  ].filter(Boolean).join('\n');
}
