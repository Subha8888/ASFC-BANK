import { Printer, X } from 'lucide-react';
import type { BankAccount, TransactionRecord } from '../types/bank';
import {
  formatCurrency,
  formatDateTime,
  getTransactionSignAndLabel,
  maskAccountNumber,
} from '../utils/banking';

interface ReceiptModalProps {
  transaction: TransactionRecord | null;
  account: BankAccount;
  onClose: () => void;
}

export function ReceiptModal({ transaction, account, onClose }: ReceiptModalProps) {
  if (!transaction) return null;

  const { sign, label, isCredit } = getTransactionSignAndLabel(
    transaction.type,
    transaction.adjustmentDirection
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
    >
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-[#121216] shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div>
            <h2 id="receipt-modal-title" className="text-base font-semibold text-white">
              ASFC Bank Transaction Receipt
            </h2>
            <p className="text-xs text-zinc-400 font-mono tabular-nums mt-0.5">
              {transaction.referenceCode}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close receipt"
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-red-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <div className="rounded-lg border border-dashed border-zinc-700 bg-[#09090B] p-5 font-mono text-xs text-zinc-300">
            <div className="border-b border-dashed border-zinc-800 pb-4 text-center">
              <p className="font-display text-sm font-bold tracking-wide text-white">
                ASFC BANK · ATM &amp; DIGITAL NETWORK
              </p>
              <p className="mt-1 text-zinc-400">{account.branchName}</p>
            </div>

            <dl className="mt-4 space-y-2.5 tabular-nums">
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Account Holder</dt>
                <dd className="text-right font-medium text-white">{account.holderName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Account Number</dt>
                <dd className="text-right text-zinc-200">{maskAccountNumber(account.accountNumber)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Date &amp; Time</dt>
                <dd className="text-right text-zinc-200">{formatDateTime(transaction.timestamp)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Channel</dt>
                <dd className="text-right text-zinc-200">{transaction.channel}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Operation</dt>
                <dd className="text-right text-zinc-200">{label}</dd>
              </div>
              {transaction.counterpartyName && (
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500">Counterparty</dt>
                  <dd className="text-right text-zinc-200">{transaction.counterpartyName}</dd>
                </div>
              )}
              {transaction.counterpartyAccount && (
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500">Target Account</dt>
                  <dd className="text-right text-zinc-200">{transaction.counterpartyAccount}</dd>
                </div>
              )}
              {transaction.method && (
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500">Deposit Method</dt>
                  <dd className="text-right text-zinc-200">{transaction.method}</dd>
                </div>
              )}
            </dl>

            <div className="mt-4 border-t border-dashed border-zinc-800 pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-zinc-400">Amount</span>
                <span
                  className={`text-lg font-bold tabular-nums ${
                    isCredit ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {sign}
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-zinc-400">Available Balance</span>
                <span className="text-sm font-semibold text-white tabular-nums">
                  {formatCurrency(transaction.balanceAfter)}
                </span>
              </div>
            </div>

            {transaction.billBreakdown && transaction.billBreakdown.length > 0 && (
              <div className="mt-4 border-t border-dashed border-zinc-800 pt-3">
                <p className="text-zinc-400 mb-1.5">Cash Dispensed Breakdown</p>
                <div className="flex flex-wrap gap-3 text-zinc-200">
                  {transaction.billBreakdown.map((bill) => (
                    <span key={bill.denomination}>
                      ₹{bill.denomination} × {bill.count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              <Printer className="h-4 w-4" />
              Print Receipt
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors whitespace-nowrap shrink-0"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
