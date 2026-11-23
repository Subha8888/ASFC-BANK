import { useState, type FormEvent } from 'react';
import { CheckCircle2, PlusCircle, Printer } from 'lucide-react';
import type { BankAccount, DepositMethod, TransactionRecord } from '../types/bank';
import { formatCurrency } from '../utils/banking';

interface DepositViewProps {
  account: BankAccount;
  onDeposit: (
    amount: number,
    method: DepositMethod,
    note?: string
  ) => { ok: boolean; error?: string; transaction?: TransactionRecord };
  onOpenReceipt: (tx: TransactionRecord) => void;
}

const DEPOSIT_PRESETS = [1000, 2500, 5000, 10000, 25000] as const;

export function DepositView({ account, onDeposit, onOpenReceipt }: DepositViewProps) {
  const [amountStr, setAmountStr] = useState('5000');
  const [method, setMethod] = useState<DepositMethod>('Cash');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [completedTx, setCompletedTx] = useState<TransactionRecord | null>(null);

  const parsedAmount = Number(amountStr);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = onDeposit(parsedAmount, method, note || `${method} Deposit`);
    if (!res.ok) {
      setError(res.error ?? 'Deposit failed.');
      return;
    }
    setCompletedTx(res.transaction ?? null);
    setNote('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Deposit Funds</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Add cash or checks to {account.accountNumber} · Instant ledger settlement
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs text-zinc-400">Current Balance</p>
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
            <p className="text-xs font-medium text-zinc-300 mb-2">Deposit Channel</p>
            <div className="inline-flex rounded-lg border border-zinc-800 bg-[#09090B] p-1">
              {(['Cash', 'Check'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMethod(item)}
                  className={`rounded-md px-4 py-2 text-xs font-semibold transition-colors ${
                    method === item ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {item} Deposit
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-zinc-400 mb-3">Quick Amounts</p>
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
              {DEPOSIT_PRESETS.map((preset) => (
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
            <label htmlFor="deposit-amount" className="block text-xs font-medium text-zinc-300">
              Deposit Amount (INR)
            </label>
            <div className="mt-1.5 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-lg font-bold text-emerald-400">
                ₹
              </span>
              <input
                id="deposit-amount"
                type="number"
                min={1}
                max={250000}
                step="0.01"
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
            <label htmlFor="deposit-note" className="block text-xs font-medium text-zinc-300">
              Source or Reference Note (Optional)
            </label>
            <input
              id="deposit-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Salary check, Cash envelope"
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
            <PlusCircle className="h-4 w-4" />
            Deposit{' '}
            {Number.isFinite(parsedAmount) && parsedAmount > 0
              ? formatCurrency(parsedAmount)
              : 'Funds'}
          </button>
        </form>

        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-[#121216] p-6 space-y-3">
            <h2 className="text-base font-semibold text-white">Deposit Summary</h2>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-400">Crediting Account</dt>
                <dd className="font-mono text-white tabular-nums">{account.accountNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-400">Deposit Method</dt>
                <dd className="text-white">{method}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-400">Projected Balance</dt>
                <dd className="font-mono font-semibold text-emerald-400 tabular-nums">
                  {formatCurrency(
                    account.balance +
                      (Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : 0)
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {completedTx && (
            <div className="rounded-xl border border-emerald-900/70 bg-emerald-950/20 p-6 space-y-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-white">Deposit Credited</h3>
                  <p className="text-xs font-mono text-zinc-400">{completedTx.referenceCode}</p>
                </div>
              </div>
              <p className="text-sm text-zinc-200 font-mono tabular-nums">
                Deposited {formatCurrency(completedTx.amount)} · New balance{' '}
                {formatCurrency(completedTx.balanceAfter)}
              </p>
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
