import { esc } from './dom.js';
import { formatCurrency, formatDateTime, getTransactionSignAndLabel } from './banking.js';
import { icons } from './icons.js';

export function renderReceiptModal(tx, account) {
  if (!tx || !account) return '';
  const { sign, label, isCredit } = getTransactionSignAndLabel(tx.type, tx.adjustmentDirection);

  return `
    <div class="modal-backdrop modal-backdrop-receipt" role="dialog" aria-modal="true" aria-labelledby="receipt-title" data-modal-backdrop="receipt">
      <div class="modal-dialog modal-dialog-narrow" id="receipt-printable">
        <div class="modal-header">
          <div>
            <h2 id="receipt-title" style="font-size:1.05rem;font-weight:700;color:#fff;">ASFC Bank Official Receipt</h2>
            <p class="font-mono tabular-nums" style="font-size:0.75rem;color:var(--accent-red-light);margin-top:0.15rem;">
              ${esc(tx.referenceCode)}
            </p>
          </div>
          <button type="button" class="btn-icon" data-action="close-receipt" aria-label="Close receipt">
            ${icons.x()}
          </button>
        </div>
        <div class="modal-body">
          <div style="text-align:center;border-bottom:1px solid var(--border-subtle);padding-bottom:1rem;margin-bottom:1rem;">
            <p style="font-size:0.75rem;color:var(--text-secondary);">${esc(label)} · ${esc(tx.channel)}</p>
            <p class="font-mono tabular-nums" style="font-size:1.75rem;font-weight:700;margin-top:0.25rem;color:${isCredit ? 'var(--accent-emerald)' : 'var(--accent-red-light)'};">
              ${sign}${esc(formatCurrency(tx.amount))}
            </p>
            <p class="font-mono tabular-nums" style="font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem;">
              ${esc(formatDateTime(tx.timestamp))}
            </p>
          </div>

          <dl style="display:flex;flex-direction:column;gap:0.65rem;font-size:0.8125rem;">
            <div style="display:flex;justify-content:space-between;gap:1rem;">
              <dt style="color:var(--text-secondary);">Account Holder</dt>
              <dd style="font-weight:600;color:#fff;">${esc(account.holderName)}</dd>
            </div>
            <div style="display:flex;justify-content:space-between;gap:1rem;">
              <dt style="color:var(--text-secondary);">Account Number</dt>
              <dd class="font-mono tabular-nums" style="color:#e4e4e7;">${esc(account.accountNumber)}</dd>
            </div>
            <div style="display:flex;justify-content:space-between;gap:1rem;">
              <dt style="color:var(--text-secondary);">Description</dt>
              <dd style="color:#e4e4e7;text-align:right;">${esc(tx.description)}</dd>
            </div>
            ${
              tx.counterpartyAccount
                ? `<div style="display:flex;justify-content:space-between;gap:1rem;">
                    <dt style="color:var(--text-secondary);">Counterparty</dt>
                    <dd class="font-mono tabular-nums" style="color:#e4e4e7;">${esc(tx.counterpartyAccount)}</dd>
                  </div>`
                : ''
            }
            <div style="display:flex;justify-content:space-between;gap:1rem;border-top:1px solid var(--border-subtle);padding-top:0.65rem;">
              <dt style="color:var(--text-secondary);">Balance After</dt>
              <dd class="font-mono tabular-nums" style="font-weight:700;color:#fff;">${esc(formatCurrency(tx.balanceAfter))}</dd>
            </div>
          </dl>

          ${
            Array.isArray(tx.billBreakdown) && tx.billBreakdown.length > 0
              ? `<div style="margin-top:1rem;border-top:1px solid var(--border-subtle);padding-top:0.85rem;">
                  <p style="font-size:0.75rem;color:var(--text-secondary);">Dispensed INR Cash Notes</p>
                  <div class="bill-grid">
                    ${tx.billBreakdown
                      .map(
                        (b) => `<div class="bill-chip"><span>₹${b.denomination}</span><span style="color:var(--accent-red-light);">×${b.count}</span></div>`
                      )
                      .join('')}
                  </div>
                </div>`
              : ''
          }

          <div class="modal-footer" style="margin-top:1.25rem;justify-content:flex-end;">
            <button type="button" class="btn btn-secondary" data-action="print-receipt">
              ${icons.printer()} Print Receipt
            </button>
            <button type="button" class="btn btn-primary" data-action="close-receipt">Done</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
