import { cancellationStatusText, normalizeAfterLiveCancellationResult } from "./after-live-cancellation-metadata.js";

export function createAfterLiveCancellationSummary(booking) {
  const hasCancellation =
    booking?.status === "declined" ||
    booking?.cancellationDecision ||
    booking?.refundApplied ||
    booking?.refundTransactionId ||
    booking?.cancellationReason;

  if (!hasCancellation) return null;

  const summary = document.createElement("div");
  summary.className = booking?.refundApplied
    ? "after-live-cancellation-summary has-refund"
    : "after-live-cancellation-summary";

  const normalized = normalizeAfterLiveCancellationResult({
    booking,
    cancellationDecision: booking?.cancellationDecision,
    refundApplied: booking?.refundApplied,
    refundTransactionId: booking?.refundTransactionId,
    messages: booking?.cancellationMessages || null,
  });

  const title = document.createElement("strong");
  title.innerText = booking?.refundApplied ? "Cancellation + refund" : "Cancellation status";

  const text = document.createElement("p");
  text.innerText = booking?.cancellationDecision
    ? cancellationStatusText({
        booking,
        cancellationDecision: booking.cancellationDecision,
        refundApplied: booking.refundApplied,
        refundTransactionId: booking.refundTransactionId,
      })
    : booking?.cancellationReason || "Booking cancellation has been recorded.";

  const metadata = document.createElement("small");
  metadata.innerText = [
    normalized.cancelledBy ? `Cancelled by: ${normalized.cancelledBy}` : null,
    normalized.refundAmountCredits ? `Refund: ${normalized.refundAmountCredits} credits` : null,
    normalized.refundTransactionId ? `Refund TX: ${normalized.refundTransactionId}` : null,
    normalized.walletReason ? `Wallet reason: ${normalized.walletReason}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  summary.appendChild(title);
  summary.appendChild(text);
  if (metadata.innerText) summary.appendChild(metadata);

  return summary;
}

export function ensureAfterLiveCancellationSummaryStyles() {
  if (document.getElementById("after-live-cancellation-summary-styles")) return;

  const style = document.createElement("style");
  style.id = "after-live-cancellation-summary-styles";
  style.textContent = `
    .after-live-cancellation-summary {
      border: 1px solid rgba(255, 0, 85, 0.3);
      border-radius: 14px;
      padding: 10px;
      background: rgba(255, 0, 85, 0.08);
      margin: 10px 0;
    }

    .after-live-cancellation-summary.has-refund {
      border-color: rgba(29, 158, 117, 0.35);
      background: rgba(29, 158, 117, 0.1);
    }

    .after-live-cancellation-summary p {
      margin: 6px 0;
      color: rgba(255, 255, 255, 0.76);
      font-size: 13px;
    }

    .after-live-cancellation-summary small {
      display: block;
      color: rgba(255, 255, 255, 0.56);
      font-size: 11px;
    }
  `;
  document.head.appendChild(style);
}
