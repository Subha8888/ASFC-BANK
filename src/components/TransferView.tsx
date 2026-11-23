import { useState, type FormEvent } from 'react';
import { ArrowLeftRight, CheckCircle2, Printer, Users } from 'lucide-react';
import type { BankAccount, TransactionRecord } from '../types/bank';
import { formatCurrency } from '../utils/banking';

interface TransferViewProps {
  account: BankAccount;
  otherAccounts: BankAccount[];
  onTransfer: (
    toAccountNumber: string,
    amount: number,
    recipientName?: string,
    note?: string
  ) => { ok: boolean; error?: string; transaction?: TransactionRecord };
  onOpenReceipt: (tx: TransactionRecord) => void;
}

export function TransferView({
  account,
  otherAccounts,
  onTransfer,
  onOpenReceipt,
}: TransferViewProps) {
  const [targetAccount, setTargetAccount] = useState(otherAccounts[0]?.accountNumber ?? '');
  const [recipientName, setRecipientName] = useState(otherAccounts[0]?.holderName ?? '');
  const [amountStr, setAmountStr] = useState('2500');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [completedTx, setCompletedTx] = useState<TransactionRecord | null>(null);

  const parsedAmount = Number(amountStr);
  const matchedInternal = otherAccounts.find(
    (a) => a.accountNumber.toUpperCase() === targetAccount.trim().toUpperCase()
  );

  const handleSelectDirectoryRecipient = (recipient: BankAccount) => {
    setTargetAccount(recipient.accountNumber);
    setRecipientName(recipient.holderName);
    setError(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = onTransfer(
      targetAccount,
      parsedAmount,
      matchedInternal?.holderName ?? recipientName,
      note
    );
    if (!res.ok) {
      setError(res.error ?? 'Transfer failed.');
      return;
    }
    setCompletedTx(res.transaction ?? null);
    setNote('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Fund Transfer</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Transfer money instantaneously to another ASFC Bank account or external beneficiary
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
          className="lg:col-span-7 rounded-xl border border-zinc-800 bg-[#121216] p-6 space-y-5"
        >
          <div>
            <label htmlFor="transfer-account" className="block text-xs font-medium text-zinc-300">
              Recipient Account Number
            </label>
            <input
              id="transfer-account"
              type="text"
              required
              value={targetAccount}
              onChange={(e) => {
                const nextVal = e.target.value;
                setTargetAccount(nextVal);
                const internal = otherAccounts.find(
                  (a) => a.accountNumber.toUpperCase() === nextVal.trim().toUpperCase()
                );
                if (internal) {
                  setRecipientName(internal.holderName);
                }
                setError(null);
              }}
              placeholder="ASFC-2091441002"
              className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-2.5 text-sm text-white font-mono placeholder:text-zinc-600 focus:border-red-600 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="transfer-name" className="block text-xs font-medium text-zinc-300">
              Recipient Name
            </label>
            <input
              id="transfer-name"
              type="text"
              value={matchedInternal ? matchedInternal.holderName : recipientName}
              readOnly={Boolean(matchedInternal)}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Beneficiary full name"
              className={`mt-1.5 w-full rounded-lg border border-zinc-800 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-red-600 focus:outline-none ${
                matchedInternal ? 'bg-zinc-900/70 text-zinc-300' : 'bg-[#09090B]'
              }`}
            />
          </div>

          <div>
            <label htmlFor="transfer-amount" className="block text-xs font-medium text-zinc-300">
              Transfer Amount (INR)
            </label>
            <div className="mt-1.5 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-lg font-bold text-red-500">
                ₹
              </span>
              <input
                id="transfer-amount"
                type="number"
                min={1}
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
            <label htmlFor="transfer-note" className="block text-xs font-medium text-zinc-300">
              Payment Memo (Optional)
            </label>
            <input
              id="transfer-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Invoice #402, Rent share"
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
            <ArrowLeftRight className="h-4 w-4" />
            Send{' '}
            {Number.isFinite(parsedAmount) && parsedAmount > 0
              ? formatCurrency(parsedAmount)
              : 'Transfer'}
          </button>
        </form>

        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-[#121216] p-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-red-500" />
              <h2 className="text-base font-semibold text-white">ASFC Bank Directory</h2>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Select a verified ASFC account to credit both ledgers immediately.
            </p>
            <div className="mt-4 space-y-2.5">
              {otherAccounts.map((acct) => {
                const isSelected =
                  acct.accountNumber.toUpperCase() === targetAccount.trim().toUpperCase();
                return (
                  <button
                    key={acct.accountNumber}
                    type="button"
                    onClick={() => handleSelectDirectoryRecipient(acct)}
                    className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                      isSelected
                        ? 'border-red-600 bg-red-950/25'
                        : 'border-zinc-800 bg-[#09090B] hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {acct.holderName}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-400 font-mono tabular-nums">
                          {acct.accountNumber} · {acct.accountType}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-red-400 shrink-0">
                        {isSelected ? 'Selected' : 'Select'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {completedTx && (
            <div className="rounded-xl border border-emerald-900/70 bg-emerald-950/20 p-6 space-y-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-white">Transfer Executed</h3>
                  <p className="text-xs font-mono text-zinc-400">{completedTx.referenceCode}</p>
                </div>
              </div>
              <p className="text-sm text-zinc-200 font-mono tabular-nums">
                Sent {formatCurrency(completedTx.amount)} to {completedTx.counterpartyName} ·
                Remaining {formatCurrency(completedTx.balanceAfter)}
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
