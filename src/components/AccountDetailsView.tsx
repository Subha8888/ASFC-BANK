import { useState } from 'react';
import { CreditCard, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import type { BankAccount } from '../types/bank';
import { formatAadhaarNumber, formatCardNumber, formatCurrency } from '../utils/banking';

interface AccountDetailsViewProps {
  account: BankAccount;
  onToggleCardFreeze: () => void;
}

export function AccountDetailsView({ account, onToggleCardFreeze }: AccountDetailsViewProps) {
  const [revealCard, setRevealCard] = useState(false);
  const [revealAadhaar, setRevealAadhaar] = useState(true);

  const dailyPct = Math.min(
    100,
    Math.round((account.withdrawnToday / account.dailyWithdrawalLimit) * 100)
  );
  const remainingDaily = Math.max(0, account.dailyWithdrawalLimit - account.withdrawnToday);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Account Holder Details</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {account.accountType} · {account.branchName} · Status: {account.status}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs text-zinc-400">Current Available Balance</p>
          <p className="text-2xl font-bold text-white font-mono tabular-nums">
            {formatCurrency(account.balance)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Physical ASFC Red-Black Metal Debit Card Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-red-900/50 bg-gradient-to-br from-[#1B0A0C] via-[#101014] to-[#09090B] p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-base font-bold tracking-wide text-white">
                  ASFC BANK
                </p>
                <p className="text-xs text-red-400 mt-0.5">{account.accountType} Debit</p>
              </div>
              <span className="text-xs font-medium text-zinc-300 font-mono">
                {account.status === 'Active' ? 'ACTIVE' : 'FROZEN'}
              </span>
            </div>

            {/* EMV Chip */}
            <div className="mt-7 flex items-center gap-3">
              <div className="h-8 w-11 rounded-md border border-amber-400/40 bg-gradient-to-br from-amber-300/30 to-amber-600/20" />
              <CreditCard className="h-5 w-5 text-zinc-500" />
            </div>

            <p className="mt-6 font-mono text-lg sm:text-xl font-semibold tracking-wider text-white tabular-nums">
              {formatCardNumber(account.cardNumber, revealCard)}
            </p>

            <div className="mt-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] text-zinc-400">Account Holder</p>
                <p className="mt-0.5 text-sm font-semibold text-white">{account.holderName}</p>
              </div>
              <div className="flex gap-5 text-right font-mono tabular-nums">
                <div>
                  <p className="text-[11px] text-zinc-400 font-sans">Expires</p>
                  <p className="mt-0.5 text-xs font-medium text-zinc-200">{account.cardExpiry}</p>
                </div>
                <div>
                  <p className="text-[11px] text-zinc-400 font-sans">CVV</p>
                  <p className="mt-0.5 text-xs font-medium text-zinc-200">
                    {revealCard ? account.cardCvv : '•••'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setRevealCard((prev) => !prev)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-[#121216] px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors whitespace-nowrap"
            >
              {revealCard ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {revealCard ? 'Mask Card Details' : 'Reveal Card & CVV'}
            </button>
            <button
              type="button"
              onClick={onToggleCardFreeze}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                account.status === 'Active'
                  ? 'border border-red-900/70 bg-red-950/40 text-red-300 hover:bg-red-900/50'
                  : 'bg-red-600 text-white hover:bg-red-500'
              }`}
            >
              {account.status === 'Active' ? (
                <>
                  <Lock className="h-4 w-4" />
                  Freeze ATM Card
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4" />
                  Unfreeze ATM Card
                </>
              )}
            </button>
          </div>
        </div>

        {/* Account Metadata & Daily Limit */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-[#121216] p-6">
            <h2 className="text-base font-semibold text-white">Holder &amp; Routing Profile</h2>
            <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <div className="border-b border-zinc-800/80 pb-3">
                <dt className="text-xs text-zinc-400">Account Holder Name</dt>
                <dd className="mt-1 text-sm font-semibold text-white">{account.holderName}</dd>
              </div>
              <div className="border-b border-zinc-800/80 pb-3">
                <dt className="text-xs text-zinc-400">Account Number</dt>
                <dd className="mt-1 text-sm font-semibold text-white font-mono tabular-nums">
                  {account.accountNumber}
                </dd>
              </div>
              <div className="border-b border-zinc-800/80 pb-3">
                <dt className="text-xs text-zinc-400">IFSC / Routing Code</dt>
                <dd className="mt-1 text-sm font-medium text-zinc-200 font-mono tabular-nums">
                  {account.ifscCode}
                </dd>
              </div>
              <div className="border-b border-zinc-800/80 pb-3">
                <dt className="text-xs text-zinc-400">Account Tier</dt>
                <dd className="mt-1 text-sm font-medium text-zinc-200">{account.accountType}</dd>
              </div>
              <div className="border-b border-zinc-800/80 pb-3">
                <dt className="text-xs text-zinc-400">Email Address</dt>
                <dd className="mt-1 text-sm font-medium text-zinc-200 truncate">{account.email}</dd>
              </div>
              <div className="border-b border-zinc-800/80 pb-3">
                <dt className="text-xs text-zinc-400">Registered Phone</dt>
                <dd className="mt-1 text-sm font-medium text-zinc-200 font-mono tabular-nums">
                  {account.phone}
                </dd>
              </div>
              <div className="border-b border-zinc-800/80 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-xs text-zinc-400">Aadhaar No. (12-Digit KYC)</dt>
                  <button
                    type="button"
                    onClick={() => setRevealAadhaar((prev) => !prev)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-red-400 hover:text-red-300"
                  >
                    {revealAadhaar ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    {revealAadhaar ? 'Mask' : 'Show'}
                  </button>
                </div>
                <dd className="mt-1 text-sm font-semibold text-white font-mono tabular-nums">
                  {formatAadhaarNumber(account.aadhaarNumber, revealAadhaar)}
                </dd>
              </div>
              <div className="border-b border-zinc-800/80 pb-3">
                <dt className="text-xs text-zinc-400">PAN No.</dt>
                <dd className="mt-1 text-sm font-semibold text-white font-mono uppercase tabular-nums">
                  {account.panNumber || 'Not Provided'}
                </dd>
              </div>
              <div className="border-b border-zinc-800/80 pb-3">
                <dt className="text-xs text-zinc-400">Account Opened Date</dt>
                <dd className="mt-1 text-sm font-medium text-zinc-200 font-mono tabular-nums">
                  {account.openedDate}
                </dd>
              </div>
              <div className="border-b border-zinc-800/80 pb-3">
                <dt className="text-xs text-zinc-400">Home Branch</dt>
                <dd className="mt-1 text-sm font-medium text-zinc-200">{account.branchName}</dd>
              </div>
              <div className="sm:col-span-2 pt-1">
                <dt className="text-xs text-zinc-400">Address (Vill, Dist, State, Country)</dt>
                <dd className="mt-2 grid grid-cols-2 gap-3 rounded-lg border border-zinc-800/80 bg-[#09090B] p-3.5 sm:grid-cols-4">
                  <div>
                    <span className="block text-[11px] text-zinc-500">Vill</span>
                    <span className="mt-0.5 block text-xs font-medium text-zinc-100">
                      {account.address?.village || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-zinc-500">Dist</span>
                    <span className="mt-0.5 block text-xs font-medium text-zinc-100">
                      {account.address?.district || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-zinc-500">State</span>
                    <span className="mt-0.5 block text-xs font-medium text-zinc-100">
                      {account.address?.state || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-zinc-500">Country</span>
                    <span className="mt-0.5 block text-xs font-medium text-zinc-100">
                      {account.address?.country || '—'}
                    </span>
                  </div>
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-[#121216] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-white">Daily ATM Withdrawal Limit</h2>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Remaining today: {formatCurrency(remainingDaily)}
                </p>
              </div>
              <p className="text-sm font-semibold text-white font-mono tabular-nums">
                {formatCurrency(account.withdrawnToday)} / {formatCurrency(account.dailyWithdrawalLimit)}
              </p>
            </div>

            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-zinc-900">
              <div
                className="h-full rounded-full bg-red-600 transition-all duration-200"
                style={{ width: `${dailyPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
