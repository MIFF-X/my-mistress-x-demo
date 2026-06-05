export function normalizeAfterLiveCancellationResult(result = {}) {
  const decision = result.cancellationDecision || result.decision || null;
  const booking = result.booking || result.raw?.booking || result;
  const messages = result.messages || {};

  return {
    booking,
    decision,
    refundApplied: Boolean(result.refundApplied || decision?.shouldRefund),
    refundTransactionId: result.refundTransactionId || null,
    refundAmountCredits: Number(decision?.refundAmountCredits || 0),
    cancelledBy: decision?.cancelledBy || null,
    cancelReason: decision?.reason || messages.requesterMessage || booking?.mistressNote || null,
    requesterMessage: messages.requesterMessage || null,
    hostMessage: messages.hostMessage || null,
    walletReason: decision?.walletReason || null,
    metadata: decision?.metadata || null,
  };
}

export function cancellationStatusText(result = {}) {
  const normalized = normalizeAfterLiveCancellationResult(result);

  if (!normalized.decision) {
    return 'Cancellation completed. Backend metadata was not returned yet.';
  }

  if (normalized.refundApplied) {
    return `Cancelled by ${normalized.cancelledBy || 'user'} with ${normalized.refundAmountCredits} credits refunded.`;
  }

  if (normalized.decision?.shouldRefund && !normalized.refundTransactionId) {
    return `Cancelled by ${normalized.cancelledBy || 'user'}; refund was requested but no refund transaction was returned.`;
  }

  return `Cancelled by ${normalized.cancelledBy || 'user'} without automatic refund.`;
}

export function applyCancellationMetadataToLocalBooking(booking, result = {}) {
  const normalized = normalizeAfterLiveCancellationResult(result);

  return {
    ...booking,
    status: 'declined',
    refundedAt: normalized.refundApplied ? Date.now() : booking?.refundedAt || null,
    refundAmountCredits: normalized.refundAmountCredits,
    refundTransactionId: normalized.refundTransactionId,
    cancelledBy: normalized.cancelledBy,
    cancellationReason: normalized.cancelReason,
    walletReason: normalized.walletReason,
    cancellationMetadata: normalized.metadata,
    mistressNote: normalized.cancelReason || booking?.mistressNote || 'Booking cancelled.',
    updatedAt: Date.now(),
  };
}
