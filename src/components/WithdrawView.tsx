import { useState, type FormEvent } from 'react';
import { Banknote, CheckCircle2, Printer } from 'lucide-react';
import type { BankAccount, BillCount, TransactionRecord } from '../types/bank';
import { calculateBillBreakdown, formatCurrency } from '../utils/banking';

interface WithdrawViewProps {
  account: BankAccount;
  onWithdraw: (
    amount: number,
    note?: string
  ) => { ok: boolean; error?: string; transaction?: TransactionRecord; bills?: BillCount[] };
  onOpenReceipt: (tx: TransactionRecord) => void;
}

const PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000] as const;

export function WithdrawView({ account, onWithdraw, onOpenReceipt }: WithdrawViewProps) {
  const [amountStr, setAmountStr] = useState('1000');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [completedTx, setCompletedTx] = useState<TransactionRecord | null>(null);
  const [bills, setBills] = useState<BillCount[] | null>(null);

  const parsedAmount = Number(amountStr);
  const billPreview = calculateBillBreakdown(parsedAmount);
  const remainingDaily = Math.max(0, account.dailyWithdrawalLimit - account.withdrawnToday);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = onWithdraw(parsedAmount, note || 'Cash Withdrawal');
    if (!res.ok) {
      setError(res.error ?? 'Withdrawal failed.');
      return;
    }
    setCompletedTx(res.transaction ?? null);
    setBills(res.bills ?? null);
    setNote('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Money Withdraw</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Instant ATM cash withdrawal · Multiples of ₹10 · Daily remaining{' '}
            {formatCurrency(remainingDaily)}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs text-zinc-400">Available Balance</p>
          <p className="text-2xl font-bold text-white font-mono tabular-nums">
            {formatCurrency(account.balance)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 rounded-xl border border-zinc-800 bg-[#121216] p-6 space-y-6"
        >
          <div>
            <p className="text-xs font-medium text-zinc-400 mb-3">Quick Cash Presets</p>
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setAmountStr(String(preset));
                    setError(null);
                  }}
                  className={`rounded-lg border py-2.5 font-mono text-xs sm:text-sm font-semibold tabular-nums transition-colors ${
                    Number(amountStr) === preset
                      ? 'border-red-600 bg-red-600 text-white'
                      : 'border-zinc-800 bg-[#09090B] text-zinc-200 hover:border-red-600/60'
                  }`}
                >
                  ₹{preset.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="withdraw-amount" className="block text-xs font-medium text-zinc-300">
              Withdrawal Amount (INR)
            </label>
            <div className="mt-1.5 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-lg font-bold text-red-500">
                ₹
              </span>
              <input
                id="withdraw-amount"
                type="number"
                min={10}
                step={10}
                required
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  setError(null);
                }}
                className="w-full rounded-lg border border-zinc-800 bg-[#09090B] py-3 pl-9 pr-4 font-mono text-xl font-bold text-white tabular-nums focus:border-red-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="withdraw-note" className="block text-xs font-medium text-zinc-300">
              Withdrawal Memo (Optional)
            </label>
            <input
              id="withdraw-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Travel cash, Branch ATM"
              className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-red-600 focus:outline-none"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-900/80 bg-red-950/40 px-4 py-2.5 text-xs font-medium text-red-300"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
          >
            <Banknote className="h-4 w-4" />
            Withdraw{' '}
            {Number.isFinite(parsedAmount) && parsedAmount > 0
              ? formatCurrency(parsedAmount)
              : 'Cash'}
          </button>
        </form>

        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-[#121216] p-6">
            <h2 className="text-base font-semibold text-white">Estimated INR Denomination</h2>
            <p className="mt-1 text-xs text-zinc-400">
              ATM dispenses optimal ₹500, ₹200, ₹100, ₹50, ₹20, and ₹10 notes.
            </p>
            {billPreview ? (
              <div className="mt-4 space-y-2.5">
                {billPreview.map((item) => (
                  <div
                    key={item.denomination}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#09090B] px-4 py-2.5 font-mono text-sm tabular-nums"
                  >
                    <span className="text-zinc-300">₹{item.denomination} Notes</span>
                    <span className="font-semibold text-white">
                      × {item.count} ({formatCurrency(item.denomination * item.count)})
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-lg border border-zinc-800 bg-[#09090B] px-4 py-3 text-xs text-zinc-400">
                Enter a positive integer multiple of ₹10 to preview dispensed cash notes.
              </p>
            )}
          </div>

          {completedTx && (
            <div className="rounded-xl border border-emerald-900/70 bg-emerald-950/20 p-6 space-y-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-white">Cash Dispensed</h3>
                  <p className="text-xs font-mono text-zinc-400">{completedTx.referenceCode}</p>
                </div>
              </div>
              <p className="text-sm text-zinc-200 font-mono tabular-nums">
                Withdrew {formatCurrency(completedTx.amount)} · New balance{' '}
                {formatCurrency(completedTx.balanceAfter)}
              </p>
              {bills && (
                <p className="text-xs text-zinc-400 font-mono">
                  Notes: {bills.map((b) => `₹${b.denomination}×${b.count}`).join(' · ')}
                </p>
              )}
              <button
                type="button"
                onClick={() => onOpenReceipt(completedTx)}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-[#09090B] px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
                View Receipt
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
