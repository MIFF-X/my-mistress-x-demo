export function normalizeAfterLiveReceipt(result = {}) {
  const receipt = result.receipt || result.document?.receipt || result.receipts?.[0] || result;
  const document = result.document || null;
  const signature = document?.signature || result.signature || null;

  return {
    id: receipt.id || result.receiptId || null,
    bookingId: receipt.bookingId || result.bookingId || document?.evidenceRefs?.bookingId || null,
    amountCredits: Number(receipt.amountCredits || document?.summary?.amountCredits || 0),
    durationMinutes: Number(receipt.durationMinutes || document?.summary?.durationMinutes || 0),
    status: receipt.status || document?.summary?.status || 'unknown',
    purpose: receipt.purpose || null,
    receiptUrl: receipt.receiptUrl || result.receiptUrl || document?.downloadUrl || null,
    downloadUrl: document?.downloadUrl || null,
    walletTransactionId: receipt.walletTransactionId || document?.evidenceRefs?.walletTransactionId || null,
    signatureDigest: signature?.digest || null,
    signatureValid: typeof result.valid === 'boolean' ? result.valid : null,
    deliveredToUserId: result.delivery?.deliveredToUserId || null,
    deliveryStatus: result.delivery?.status || null,
    deliveryId: result.delivery?.id || null,
    createdAt: receipt.createdAt || null,
    raw: result,
  };
}

export function receiptSummaryText(result = {}) {
  const receipt = normalizeAfterLiveReceipt(result);
  if (!receipt.id) return 'No receipt loaded yet.';

  const amount = receipt.amountCredits ? `${receipt.amountCredits} credits` : 'amount pending';
  const duration = receipt.durationMinutes ? `${receipt.durationMinutes} min` : 'duration pending';
  const verification = receipt.signatureValid === true ? ' · verified' : receipt.signatureValid === false ? ' · not verified' : '';

  return `Receipt ${receipt.id}: ${amount} · ${duration} · ${receipt.status}${verification}`;
}

export function createAfterLiveReceiptSummary(result = {}) {
  const receipt = normalizeAfterLiveReceipt(result);
  if (!receipt.id) return null;

  const summary = document.createElement('div');
  summary.className = receipt.signatureValid === true
    ? 'after-live-receipt-summary is-verified'
    : 'after-live-receipt-summary';

  const title = document.createElement('strong');
  title.innerText = 'Receipt summary';

  const text = document.createElement('p');
  text.innerText = receiptSummaryText(result);

  const meta = document.createElement('small');
  meta.innerText = [
    receipt.bookingId ? `Booking: ${receipt.bookingId}` : null,
    receipt.walletTransactionId ? `Wallet TX: ${receipt.walletTransactionId}` : null,
    receipt.signatureDigest ? `Signature: ${receipt.signatureDigest.slice(0, 12)}...` : null,
    receipt.deliveryId ? `Delivery: ${receipt.deliveryId}` : null,
    receipt.deliveryStatus ? `Delivery status: ${receipt.deliveryStatus}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  summary.appendChild(title);
  summary.appendChild(text);
  if (meta.innerText) summary.appendChild(meta);

  return summary;
}

export function ensureAfterLiveReceiptSummaryStyles() {
  if (document.getElementById('after-live-receipt-summary-styles')) return;

  const style = document.createElement('style');
  style.id = 'after-live-receipt-summary-styles';
  style.textContent = `
    .after-live-receipt-summary {
      border: 1px solid rgba(212, 175, 55, 0.35);
      border-radius: 14px;
      padding: 10px;
      background: rgba(212, 175, 55, 0.08);
      margin: 10px 0;
    }

    .after-live-receipt-summary.is-verified {
      border-color: rgba(29, 158, 117, 0.35);
      background: rgba(29, 158, 117, 0.1);
    }

    .after-live-receipt-summary p {
      margin: 6px 0;
      color: rgba(255, 255, 255, 0.76);
      font-size: 13px;
    }

    .after-live-receipt-summary small {
      display: block;
      color: rgba(255, 255, 255, 0.56);
      font-size: 11px;
    }
  `;
  document.head.appendChild(style);
}
